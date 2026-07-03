export function getDisplayLocationName(locationName: string, fallback = "내 위치 주변") {
  const trimmed = locationName.trim();
  if (!trimmed || isGenericCurrentLocationName(trimmed)) return fallback;
  return trimmed;
}

export function isGenericCurrentLocationName(locationName: string) {
  const normalized = locationName.trim();
  return normalized === "현재 위치" || normalized === "내 위치" || normalized === "current location";
}
