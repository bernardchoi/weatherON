import Constants from "expo-constants";

const expoExtra = Constants.expoConfig?.extra;

export const isNotificationQaBuild = expoExtra?.enableNotificationQaTools === true;
export const weatheronBuildVariant = typeof expoExtra?.weatheronBuildVariant === "string" ? expoExtra.weatheronBuildVariant : "platform";
