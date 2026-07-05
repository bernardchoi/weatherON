const baseConfig = require("./app.json");

const developmentProfiles = new Set(["development"]);
const easProfile = process.env.EAS_BUILD_PROFILE;
const isDevelopmentBuild = developmentProfiles.has(easProfile) || process.env.WEATHERON_BUILD_VARIANT === "development";

module.exports = () => {
  const expo = JSON.parse(JSON.stringify(baseConfig.expo));

  if (isDevelopmentBuild) {
    expo.name = "WeatherON Dev";
    expo.scheme = "weatheron-dev";
    expo.ios = {
      ...expo.ios,
      bundleIdentifier: "com.mvp.weatheron.dev",
    };
    expo.android = {
      ...expo.android,
      package: "com.mvp.weatheron.dev",
    };
  }

  return { expo };
};
