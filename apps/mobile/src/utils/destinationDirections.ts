import type { CountryCode, DestinationTransportMode, GeoCoordinate } from "@weatheron/shared";
import * as Clipboard from "expo-clipboard";
import { Linking } from "react-native";

type DestinationDirectionsInput = {
  origin?: GeoCoordinate;
  originName?: string;
  destination: GeoCoordinate;
  destinationAddress: string;
  destinationName: string;
  destinationCountryCode: CountryCode;
  transportMode: DestinationTransportMode;
};

export type DestinationDirectionsResult = "opened" | "copied";

export function getDestinationDirectionsUrl(input: DestinationDirectionsInput): string {
  if (input.destinationCountryCode === "KR") return getKakaoWebDirectionsUrl(input);
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  if (input.origin) url.searchParams.set("origin", formatCoordinate(input.origin));
  url.searchParams.set("destination", formatCoordinate(input.destination));
  const travelMode = getGoogleTravelMode(input.transportMode);
  if (travelMode) url.searchParams.set("travelmode", travelMode);
  return url.toString();
}

export async function openDestinationDirections(input: DestinationDirectionsInput): Promise<DestinationDirectionsResult> {
  const urls = input.destinationCountryCode === "KR"
    ? [getKakaoAppDirectionsUrl(input), getKakaoWebDirectionsUrl(input)].filter((url): url is string => Boolean(url))
    : [getDestinationDirectionsUrl(input)];
  for (const url of urls) {
    try {
      await Linking.openURL(url);
      return "opened";
    } catch {
      // 다음 공식 웹 연결을 시도함.
    }
  }
  await Clipboard.setStringAsync(input.destinationAddress);
  return "copied";
}

function getKakaoAppDirectionsUrl(input: DestinationDirectionsInput): string | undefined {
  if (!input.origin) return undefined;
  const travelMode = getKakaoAppTravelMode(input.transportMode);
  if (!travelMode) return undefined;
  const url = new URL("kakaomap://route");
  url.searchParams.set("sp", formatCoordinate(input.origin));
  url.searchParams.set("ep", formatCoordinate(input.destination));
  url.searchParams.set("by", travelMode);
  return url.toString();
}

function getKakaoWebDirectionsUrl(input: DestinationDirectionsInput): string {
  const destination = formatKakaoPlace(input.destinationName, input.destination);
  if (!input.origin) return `https://map.kakao.com/link/to/${destination}`;
  const origin = formatKakaoPlace(input.originName ?? "출발지", input.origin);
  const travelMode = getKakaoWebTravelMode(input.transportMode);
  if (travelMode) return `https://map.kakao.com/link/by/${travelMode}/${origin}/${destination}`;
  return `https://map.kakao.com/link/from/${origin}/to/${destination}`;
}

function getGoogleTravelMode(mode: DestinationTransportMode): "walking" | "driving" | "transit" | undefined {
  if (mode === "walk") return "walking";
  if (mode === "drive") return "driving";
  if (mode === "transit") return "transit";
  return undefined;
}

function getKakaoAppTravelMode(mode: DestinationTransportMode): "foot" | "car" | "publictransit" | undefined {
  if (mode === "walk") return "foot";
  if (mode === "drive") return "car";
  if (mode === "transit") return "publictransit";
  return undefined;
}

function getKakaoWebTravelMode(mode: DestinationTransportMode): "walk" | "car" | "traffic" | undefined {
  if (mode === "walk") return "walk";
  if (mode === "drive") return "car";
  if (mode === "transit") return "traffic";
  return undefined;
}

function formatKakaoPlace(name: string, coordinate: GeoCoordinate): string {
  return `${encodeURIComponent(name)},${coordinate.latitude},${coordinate.longitude}`;
}

function formatCoordinate(coordinate: GeoCoordinate): string {
  return `${coordinate.latitude},${coordinate.longitude}`;
}
