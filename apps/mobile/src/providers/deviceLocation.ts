import * as Location from "expo-location";
import { createKmaWeatherLocationFromCoordinate, seongsuWeatherLocation, type KmaWeatherLocationPreset } from "./weatherLocations";

export type DeviceLocationStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable" | "error";

export type DeviceLocationState = {
  status: DeviceLocationStatus;
  message: string;
  location?: KmaWeatherLocationPreset;
};

export const initialDeviceLocationState: DeviceLocationState = {
  status: "idle",
  message: "위치 권한 대기",
};

export async function requestDeviceWeatherLocation(): Promise<DeviceLocationState> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return {
        status: "unavailable",
        message: "위치 서비스 꺼짐",
        location: seongsuWeatherLocation,
      };
    }

    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return {
        status: "denied",
        message: "위치 권한 거부됨",
        location: seongsuWeatherLocation,
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      status: "granted",
      message: "현재 위치 반영",
      location: createKmaWeatherLocationFromCoordinate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
    };
  } catch {
    return {
      status: "error",
      message: "위치 확인 실패",
      location: seongsuWeatherLocation,
    };
  }
}
