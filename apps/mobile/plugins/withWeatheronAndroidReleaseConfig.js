const fs = require("fs");
const path = require("path");
const {
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  withGradleProperties,
} = require("@expo/config-plugins");

const SIGNING_DEFINITIONS_MARKER = "// WeatherON release signing environment";
const SIGNING_CONFIG_MARKER = "// WeatherON release signing config";
const PROGUARD_MARKER = "# WeatherON release keep rules";
const FIREBASE_PROVIDER = "com.google.firebase.provider.FirebaseInitProvider";

const releaseProperties = [
  ["android.compileSdkVersion", "36"],
  ["android.targetSdkVersion", "36"],
  ["android.enableProguardInReleaseBuilds", "true"],
  ["android.enableShrinkResourcesInReleaseBuilds", "true"],
];

const signingDefinitions = `${SIGNING_DEFINITIONS_MARKER}
def uploadKeystorePath = System.getenv("WEATHERON_UPLOAD_KEYSTORE_PATH")
def uploadKeystorePassword = System.getenv("WEATHERON_UPLOAD_KEYSTORE_PASSWORD")
def uploadKeyAlias = System.getenv("WEATHERON_UPLOAD_KEY_ALIAS")
def uploadKeyPassword = System.getenv("WEATHERON_UPLOAD_KEY_PASSWORD")
def hasUploadSigning = [uploadKeystorePath, uploadKeystorePassword, uploadKeyAlias, uploadKeyPassword].every { it }
`;

const signingConfig = `    ${SIGNING_CONFIG_MARKER}
    signingConfigs {
        if (hasUploadSigning) {
            release {
                storeFile file(uploadKeystorePath)
                storePassword uploadKeystorePassword
                keyAlias uploadKeyAlias
                keyPassword uploadKeyPassword
            }
        }
    }
`;

const proguardRules = `${PROGUARD_MARKER}

# expo-location maps JavaScript option objects to Kotlin Record classes at runtime.
# Keep their constructors, fields, and annotations in R8 release builds.
-keepattributes RuntimeVisibleAnnotations,RuntimeInvisibleAnnotations,RuntimeVisibleParameterAnnotations,RuntimeInvisibleParameterAnnotations,AnnotationDefault,Signature,InnerClasses,EnclosingMethod
-keep class expo.modules.location.records.** { *; }
-keep class expo.modules.kotlin.records.** { *; }

# expo-notifications persists scheduled requests through Java serialization.
# R8 must retain the private serialization hooks that convert JSONObject payloads.
-keepclassmembers class expo.modules.notifications.** implements java.io.Serializable {
    private static final long serialVersionUID;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    private void readObjectNoData();
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
`;

function configureAppBuildGradle(contents) {
  let next = contents;

  if (!next.includes(SIGNING_DEFINITIONS_MARKER)) {
    const definitionAnchor =
      /def enableProguardInReleaseBuilds = \(findProperty\('android\.enableProguardInReleaseBuilds'\) \?: false\)\.toBoolean\(\)\n/;
    if (!definitionAnchor.test(next)) {
      throw new Error("WeatherON Android release config: Proguard definition anchor not found");
    }
    next = next.replace(definitionAnchor, (match) => `${match}${signingDefinitions}`);
  }

  if (!next.includes(SIGNING_CONFIG_MARKER)) {
    const buildTypesAnchor = "    buildTypes {\n";
    if (!next.includes(buildTypesAnchor)) {
      throw new Error("WeatherON Android release config: buildTypes anchor not found");
    }
    next = next.replace(buildTypesAnchor, `${signingConfig}\n${buildTypesAnchor}`);
  }

  next = next.replace(
    /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)(signingConfig signingConfigs\.debug)/,
    "$1signingConfig hasUploadSigning ? signingConfigs.release : signingConfigs.debug",
  );
  next = next.replace(
    'getDefaultProguardFile("proguard-android.txt")',
    'getDefaultProguardFile("proguard-android-optimize.txt")',
  );

  return next;
}

function withWeatheronAppBuildGradle(config) {
  return withAppBuildGradle(config, (modConfig) => {
    modConfig.modResults.contents = configureAppBuildGradle(modConfig.modResults.contents);
    return modConfig;
  });
}

function withWeatheronGradleProperties(config) {
  return withGradleProperties(config, (modConfig) => {
    const managedKeys = new Set(releaseProperties.map(([key]) => key));
    modConfig.modResults = modConfig.modResults.filter(
      (entry) => entry.type !== "property" || !managedKeys.has(entry.key),
    );
    modConfig.modResults.push(
      { type: "empty" },
      {
        type: "comment",
        value: "WeatherON Android release configuration. Managed by withWeatheronAndroidReleaseConfig.",
      },
      ...releaseProperties.map(([key, value]) => ({ type: "property", key, value })),
    );
    return modConfig;
  });
}

function withWeatheronFirebaseAutoInitDisabled(config) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;
    manifest.$ = {
      ...(manifest.$ ?? {}),
      "xmlns:tools": "http://schemas.android.com/tools",
    };

    const application = manifest.application?.[0];
    if (!application) {
      throw new Error("WeatherON Android release config: application manifest node not found");
    }

    application.provider = (application.provider ?? []).filter(
      (provider) => provider.$?.["android:name"] !== FIREBASE_PROVIDER,
    );
    application.provider.push({
      $: {
        "android:name": FIREBASE_PROVIDER,
        "android:authorities": "${applicationId}.firebaseinitprovider",
        "tools:node": "remove",
      },
    });
    return modConfig;
  });
}

function withWeatheronProguardRules(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const proguardPath = path.join(
        modConfig.modRequest.platformProjectRoot,
        "app",
        "proguard-rules.pro",
      );
      const existing = await fs.promises.readFile(proguardPath, "utf8");
      if (!existing.includes(PROGUARD_MARKER)) {
        await fs.promises.writeFile(
          proguardPath,
          `${existing.trimEnd()}\n\n${proguardRules.trimEnd()}\n`,
        );
      }
      return modConfig;
    },
  ]);
}

module.exports = function withWeatheronAndroidReleaseConfig(config) {
  config = withWeatheronAppBuildGradle(config);
  config = withWeatheronGradleProperties(config);
  config = withWeatheronFirebaseAutoInitDisabled(config);
  config = withWeatheronProguardRules(config);
  return config;
};
