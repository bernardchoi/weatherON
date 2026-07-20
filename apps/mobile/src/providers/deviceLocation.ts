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

    const position = await Location.getCurrentPositionAsync();
    const coordinate = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    const address = await resolveDeviceAddress(coordinate);
    const locationName = formatDeviceLocationName(address) ?? "내 위치 주변";
    const kmaLocation = createKmaWeatherLocationFromCoordinate(coordinate, locationName);
    return {
      status: "granted",
      message: "현재 위치 반영",
      // 한국 밖에서는 KMA 격자·서울 시간대가 맞지 않으므로 역지오코딩 국가 기준으로 보정한다.
      // 국가를 확인하지 못하면 기존과 동일하게 KR로 둔다.
      location:
        address?.isoCountryCode && address.isoCountryCode !== "KR"
          ? {
              ...kmaLocation,
              countryCode: address.isoCountryCode === "JP" ? "JP" : "GLOBAL",
              timezone: getDeviceTimezone(),
            }
          : kmaLocation,
    };
  } catch {
    return {
      status: "error",
      message: "위치 확인 실패",
    };
  }
}

async function resolveDeviceAddress(coordinate: { latitude: number; longitude: number }) {
  try {
    const [address] = await Location.reverseGeocodeAsync(coordinate);
    return address ?? null;
  } catch {
    return null;
  }
}

function getDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}

function formatDeviceLocationName(address?: Location.LocationGeocodedAddress | null) {
  if (!address) return null;
  const majorArea = address.city ?? address.region;
  const middleArea = address.district ?? address.subregion;
  const localArea = address.name && !isGenericAddressName(address.name) ? address.name : null;
  const streetArea = address.street && !isGenericAddressName(address.street) ? address.street : null;
  return compactLocationParts([majorArea, middleArea, localArea, streetArea]).slice(0, 3).join(" ") || null;
}

function compactLocationParts(parts: Array<string | null>) {
  const seen = new Set<string>();
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .filter((part) => {
      if (seen.has(part)) return false;
      seen.add(part);
      return true;
    });
}

function isGenericAddressName(value: string) {
  return /^\d+(-\d+)?$/.test(value.trim());
}
