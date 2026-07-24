const fs = require("fs");
const path = require("path");
const {
  AndroidConfig,
  withAndroidColorsNight,
  withDangerousMod,
} = require("@expo/config-plugins");
const { setIconAsync, dpiValues } = require("@expo/prebuild-config/build/plugins/icons/withAndroidIcons");

const RES_PATH = "android/app/src/main/res";
const DARK_BACKGROUND = "#0C1F3F";

function adaptiveIconXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/iconBackground"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>
</adaptive-icon>`;
}

async function copyDarkLauncherResources(projectRoot) {
  const mobileRoot = projectRoot;
  const scratchRoot = path.join(mobileRoot, ".expo/weatheron-dark-icon");
  const scratchRes = path.join(scratchRoot, RES_PATH);
  const outputRes = path.join(mobileRoot, RES_PATH);
  const iconRoot = path.resolve(projectRoot, "../../assets/icon");

  await fs.promises.rm(scratchRoot, { recursive: true, force: true });
  await setIconAsync(scratchRoot, {
    icon: path.join(iconRoot, "icon-dark-1024.png"),
    foregroundImage: path.join(iconRoot, "android/icon-adaptive-foreground-1024.png"),
    backgroundColor: DARK_BACKGROUND,
    backgroundImage: null,
    monochromeImage: path.join(iconRoot, "icon-mono-1024.png"),
    isAdaptive: true,
  });

  await Promise.all(
    Object.values(dpiValues).map(async ({ folderName }) => {
      const source = path.join(scratchRes, folderName);
      const target = path.join(outputRes, folderName.replace("mipmap-", "mipmap-night-"));
      await fs.promises.mkdir(target, { recursive: true });
      await Promise.all(
        ["ic_launcher.webp", "ic_launcher_round.webp", "ic_launcher_foreground.webp", "ic_launcher_monochrome.webp"].map((file) =>
          fs.promises.copyFile(path.join(source, file), path.join(target, file)),
        ),
      );
    }),
  );

  const nightValues = path.join(outputRes, "values-night");
  const nightAdaptive = path.join(outputRes, "mipmap-night-anydpi-v26");
  await fs.promises.mkdir(nightValues, { recursive: true });
  await fs.promises.mkdir(nightAdaptive, { recursive: true });
  const nightColorsPath = path.join(nightValues, "colors.xml");
  const existingNightColors = await fs.promises.readFile(nightColorsPath, "utf8").catch(() => "<resources/>\n");
  const darkIconColor = `  <color name="iconBackground">${DARK_BACKGROUND}</color>`;
  const nextNightColors = /<color name="iconBackground">[^<]*<\/color>/.test(existingNightColors)
    ? existingNightColors.replace(/<color name="iconBackground">[^<]*<\/color>/, darkIconColor.trim())
    : existingNightColors.replace("</resources>", `${darkIconColor}\n</resources>`);
  await fs.promises.writeFile(nightColorsPath, nextNightColors);
  await Promise.all(
    ["ic_launcher.xml", "ic_launcher_round.xml"].map((file) =>
      fs.promises.writeFile(path.join(nightAdaptive, file), adaptiveIconXml()),
    ),
  );
}

module.exports = function withWeatheronAndroidDarkIcon(config) {
  config = withAndroidColorsNight(config, (modConfig) => {
    modConfig.modResults = AndroidConfig.Colors.setColorItem(
      AndroidConfig.Resources.buildResourceItem({
        name: "iconBackground",
        value: DARK_BACKGROUND,
      }),
      modConfig.modResults,
    );
    return modConfig;
  });

  return withDangerousMod(config, ["android", async (modConfig) => {
    await copyDarkLauncherResources(modConfig.modRequest.projectRoot);
    return modConfig;
  }]);
};
