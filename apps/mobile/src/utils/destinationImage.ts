import { destinationFallbackImageAsset, destinationImageAssets, destinationVisualAssets, placeImageAssets } from "../assets";
import {
  getDestinationVisualKind,
  getDestinationVisualRegion,
  getKnownDestinationAssetId,
  type DestinationVisualInput,
} from "./destination-visual-resolver";

/**
 * 목적지 대표 이미지 해석 체인(모든 화면 공용):
 * 1. 장소 id 전용 에셋 → 2. 알려진 장소 별칭 에셋 → 3. 지역×비주얼 종류 에셋
 * → 4. 레거시 카테고리 이미지 → 5. 공통 폴백.
 */
export function getDestinationImageAsset(place: DestinationVisualInput): number {
  const exactAsset = destinationImageAssets[place.id];
  if (exactAsset) return exactAsset;
  const knownPlaceAssetId = getKnownDestinationAssetId(place);
  if (knownPlaceAssetId && destinationImageAssets[knownPlaceAssetId]) return destinationImageAssets[knownPlaceAssetId];
  const visualKind = getDestinationVisualKind(place);
  const region = getDestinationVisualRegion(place.countryCode);
  const regionalAsset = destinationVisualAssets[`${region}:${visualKind}`];
  if (regionalAsset) return regionalAsset;
  if (place.category === "beach") return placeImageAssets.beach;
  if (place.category === "sports") return placeImageAssets.baseball;
  if (place.category === "mountain") return placeImageAssets.mountain;
  if (place.category === "airport") return placeImageAssets.airport;
  if (place.category === "hotel") return placeImageAssets.hotel;
  return destinationFallbackImageAsset;
}
