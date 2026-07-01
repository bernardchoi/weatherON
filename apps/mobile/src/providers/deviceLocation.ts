import * as Location from "expo-location";
import { createKmaWeatherLocationFromCoordinate, type KmaWeatherLocationPreset } from "./weatherLocations";

export type DeviceLocationStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable" | "error";

export type DeviceLocationState = {
  status: DeviceLocationStatus;
  message: string;
  location?: KmaWeatherLocationPreset;
};

export const initialDeviceLocationState: DeviceLocationState = {
  status: "idle",
  message: "위치 권한 확인 필요",
};

export async function requestDeviceWeatherLocation(): Promise<DeviceLocationState> {
  return resolveDeviceWeatherLocation(true);
}

export async function syncDeviceWeatherLocationPermission(): Promise<DeviceLocationState> {
  return resolveDeviceWeatherLocation(false);
}

async function resolveDeviceWeatherLocation(shouldRequestPermission: boolean): Promise<DeviceLocationState> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return {
        status: "unavailable",
        message: "위치 서비스 꺼짐",
      };
    }

    const permission = shouldRequestPermission
      ? await Location.requestForegroundPermissionsAsync()
      : await Location.getForegroundPermissionsAsync();
    if (!permission.granted) {
      return {
        status: "denied",
        message: shouldRequestPermission ? "위치 권한 거부됨" : "위치 권한 확인 필요",
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
    };
  }
}
