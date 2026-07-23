import { convertWgs84ToKmaGrid, type CountryCode, type GeoCoordinate } from "@weatheron/shared";

export type WeatherLocationPreset = {
  locationId: string;
  locationName: string;
  countryCode: CountryCode;
  coordinate: GeoCoordinate;
  timezone: string;
};

export type KmaWeatherLocationPreset = WeatherLocationPreset & {
  grid: {
    nx: number;
    ny: number;
  };
};

export const seongsuWeatherLocation: KmaWeatherLocationPreset = withKmaGrid({
  locationId: "kr-seoul-seongsu",
  locationName: "서울 성수동",
  countryCode: "KR",
  coordinate: {
    latitude: 37.5446,
    longitude: 127.0559,
  },
  timezone: "Asia/Seoul",
});

export const defaultSeoulWeatherLocation: KmaWeatherLocationPreset = withKmaGrid({
  locationId: "kr-default-seoul",
  locationName: "기본 위치 서울",
  countryCode: "KR",
  coordinate: {
    latitude: 37.5665,
    longitude: 126.978,
  },
  timezone: "Asia/Seoul",
});

export const gangneungWeatherLocation: KmaWeatherLocationPreset = withKmaGrid({
  locationId: "kr-gangneung-beach",
  locationName: "강릉 안목해변",
  countryCode: "KR",
  coordinate: {
    latitude: 37.7715,
    longitude: 128.9483,
  },
  timezone: "Asia/Seoul",
});

export const defaultGangneungWeatherLocation: WeatherLocationPreset = {
  ...gangneungWeatherLocation,
  locationId: "kr-default-gangneung",
  locationName: "기본 목적지 강릉",
};

export function createKmaWeatherLocationFromCoordinate(
  coordinate: GeoCoordinate,
  locationName = "내 위치 주변",
  // 좌표를 반영한 id를 기본값으로 써야, 기기 위치가 실제로 이동했을 때
  // 날씨 조회 캐시(useWeatherOnAppState)가 이를 다른 위치로 인식해 재요청한다.
  locationId = `kr-device-${coordinate.latitude.toFixed(2)}-${coordinate.longitude.toFixed(2)}`,
): KmaWeatherLocationPreset {
  return withKmaGrid({
    locationId,
    locationName,
    countryCode: "KR",
    coordinate,
    timezone: "Asia/Seoul",
  });
}

function withKmaGrid(location: WeatherLocationPreset): KmaWeatherLocationPreset {
  return {
    ...location,
    grid: convertWgs84ToKmaGrid(location.coordinate),
  };
}
