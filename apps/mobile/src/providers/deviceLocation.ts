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

    // 날씨용 위치는 내비게이션 수준의 연속 정밀도가 필요하지 않다. 앱 복귀 때마다
    // GPS를 새로 깨우지 않도록 최근 15분 내 캐시를 우선 사용하고, 없을 때만
    // 배터리 균형 정확도로 한 번 조회한다.
    const position = (
      !shouldRequestPermission
        ? await Location.getLastKnownPositionAsync({ maxAge: 15 * 60_000, requiredAccuracy: 3_000 })
        : null
    ) ?? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const coordinate = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    const address = await resolveDeviceAddress(coordinate);
    const locationName = formatDeviceLocationName(address) ?? "내 위치 주변";
    const kmaLocation = createKmaWeatherLocationFromCoordinate(coordinate, locationName);
    const countryCode = getDeviceCountryCode(address?.isoCountryCode, coordinate);
    return {
      status: "granted",
      message: "현재 위치 반영",
      // 한국 밖에서는 KMA 격자·서울 시간대가 맞지 않으므로 국가와 좌표를 함께 본다.
      // 역지오코딩이 여행지 네트워크에서 실패해도 해외 좌표를 한국으로 오판하지 않는다.
      location:
        countryCode !== "KR"
          ? {
              ...kmaLocation,
              countryCode,
              timezone: countryCode === "JP" ? "Asia/Tokyo" : getDeviceTimezone(),
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

function getDeviceCountryCode(
  isoCountryCode: string | null | undefined,
  coordinate: { latitude: number; longitude: number },
): "KR" | "JP" | "GLOBAL" {
  const normalized = isoCountryCode?.trim().toUpperCase();
  if (normalized === "KR" || normalized === "KOR") return "KR";
  if (normalized === "JP" || normalized === "JPN") return "JP";
  if (normalized) return "GLOBAL";
  if (isCoordinateInKorea(coordinate)) return "KR";
  if (isCoordinateInJapan(coordinate)) return "JP";
  return "GLOBAL";
}

function isCoordinateInKorea(coordinate: { latitude: number; longitude: number }) {
  const { latitude, longitude } = coordinate;
  const mainland = latitude >= 34.3 && latitude <= 38.8 && longitude >= 125.8 && longitude <= 129.8;
  const jeju = latitude >= 33 && latitude <= 33.7 && longitude >= 126 && longitude <= 127;
  const ulleungdo = latitude >= 37.3 && latitude <= 37.7 && longitude >= 130.7 && longitude <= 131;
  const dokdo = latitude >= 37.1 && latitude <= 37.4 && longitude >= 131.7 && longitude <= 132;
  return mainland || jeju || ulleungdo || dokdo;
}

function isCoordinateInJapan(coordinate: { latitude: number; longitude: number }) {
  return coordinate.latitude >= 24 && coordinate.latitude <= 46
    && coordinate.longitude >= 122 && coordinate.longitude <= 154;
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
