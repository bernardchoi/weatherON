const baseConfig = require("./app.json");

const developmentProfiles = new Set(["development"]);
const easProfile = process.env.EAS_BUILD_PROFILE;
const buildVariant = process.env.WEATHERON_BUILD_VARIANT ?? easProfile ?? "platform";
const isDevelopmentBuild = developmentProfiles.has(easProfile) || process.env.WEATHERON_BUILD_VARIANT === "development";
const isNotificationQaBuild = buildVariant === "qa";

module.exports = () => {
  const expo = JSON.parse(JSON.stringify(baseConfig.expo));

  expo.extra = {
    ...expo.extra,
    weatheronBuildVariant: buildVariant,
    enableNotificationQaTools: isNotificationQaBuild,
  };
  expo.plugins = [...new Set([...(expo.plugins ?? []), "expo-sqlite"])];

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

  return { expo };
};
