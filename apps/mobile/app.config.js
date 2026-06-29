const baseConfig = require("./app.json");

const releaseProfiles = new Set(["preview", "production"]);
const easProfile = process.env.EAS_BUILD_PROFILE;
const isReleaseBuild = releaseProfiles.has(easProfile);

module.exports = () => {
  const expo = JSON.parse(JSON.stringify(baseConfig.expo));

  if (!isReleaseBuild) {
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
