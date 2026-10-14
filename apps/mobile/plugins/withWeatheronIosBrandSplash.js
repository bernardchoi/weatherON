const fs = require("fs");
const path = require("path");
const { withMod, withDangerousMod } = require("@expo/config-plugins");

function applyStoryboard(obj) {
  let imageId = "EXPO-SplashScreen";
  function walk(value, visit) {
    if (!value || typeof value !== "object") return;
    visit(value);
    for (const [key, child] of Object.entries(value)) if (key !== "$") {
      if (Array.isArray(child)) child.forEach(item => walk(item, visit));
      else walk(child, visit);
    }
  }
  walk(obj, node => {
    const a = node.$;
    if (a?.image === "SplashScreenLogo" || a?.image === "SplashCloud02") {
      imageId = a.id; a.image = "SplashCloud02";
    }
    if (a?.name === "SplashScreenLogo") { a.name = "SplashCloud02"; a.width = "180"; a.height = "124"; }
  });
  walk(obj, node => {
    const a = node.$;
    if (a?.firstItem !== imageId) return;
    if (a.firstAttribute === "width") a.constant = "180";
    if (a.firstAttribute === "height") a.constant = "124";
    if (a.firstAttribute === "centerY") a.constant = "-29";
  });
  return obj;
}

// Register BEFORE expo-splash-screen: its image mod runs first, this alignment
// runs next, then its generated storyboard provider writes the result.
module.exports = function withWeatheronIosBrandSplash(config) {
  config = withMod(config, { platform: "ios", mod: "splashScreenStoryboard", action: async c => {
    c.modResults = applyStoryboard(c.modResults); return c;
  } });
  return withDangerousMod(config, ["ios", async c => {
    const source = path.resolve(c.modRequest.projectRoot, "../../assets/splash/ios-brand-02");
    const project = c.modRequest.projectName || "WeatherON";
    const target = path.join(c.modRequest.platformProjectRoot, project, "Images.xcassets/SplashCloud02.imageset");
    await fs.promises.mkdir(target, { recursive: true });
    const contents = JSON.parse(await fs.promises.readFile(path.join(source, "native-imageset.json"), "utf8"));
    for (const image of contents.images) await fs.promises.copyFile(path.join(source, image.filename), path.join(target, image.filename));
    await fs.promises.writeFile(path.join(target, "Contents.json"), JSON.stringify(contents, null, 2) + "\n");
    return c;
  }]);
};
module.exports.applyStoryboard = applyStoryboard;
