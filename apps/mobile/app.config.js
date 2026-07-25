const developmentProfiles = new Set(["development"]);
const easProfile = process.env.EAS_BUILD_PROFILE;
const isXcodeCloud = process.env.CI_XCODE_CLOUD === "TRUE";
const buildVariant = process.env.WEATHERON_BUILD_VARIANT ?? easProfile ?? (isXcodeCloud ? "production" : "platform");
const isDevelopmentBuild = developmentProfiles.has(easProfile) || process.env.WEATHERON_BUILD_VARIANT === "development";
const isNotificationQaBuild = buildVariant === "qa";

module.exports = ({ config }) => {
  const expo = config;

  expo.extra = {
    ...expo.extra,
    weatheronBuildVariant: buildVariant,
    enableNotificationQaTools: isNotificationQaBuild,
  };
  expo.plugins = [
    ...new Set([
      ...(expo.plugins ?? []),
      "expo-font",
      "expo-sqlite",
      "expo-status-bar",
    ]),
  ];

  if (isDevelopmentBuild) {
    expo.name = "WeatherON Dev";
    expo.scheme = "weatheron-dev";
    expo.ios = {
      ...expo.ios,
      bundleIdentifier: "com.weatheron.mobile.dev",
    };
    expo.android = {
      ...expo.android,
      package: "com.weatheron.mobile.dev",
    };
  }

  return expo;
};
