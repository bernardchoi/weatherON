export function getOutfitVariantLabel(variant: string) {
  if (variant === "rain") return "비 대비";
  if (variant === "cold") return "보온";
  if (variant === "heat") return "더위 대비";
  if (variant === "wind") return "바람 대비";
  if (variant === "formal") return "단정한 코디";
  return "기본";
}

export function getWardrobeCategoryLabel(category: string) {
  if (category === "outer") return "겉옷";
  if (category === "top") return "상의";
  if (category === "bottom") return "하의";
  if (category === "shoes") return "신발";
  if (category === "accessory") return "소품";
  if (category === "all") return "전체";
  return "옷장 항목";
}

export function getOutfitSlotLabel(slot: string) {
  return getWardrobeCategoryLabel(slot);
}

export function formatOutfitTags(values: readonly string[]) {
  return values.map(getOutfitTagLabel).join(" · ");
}

export function getOutfitTagLabel(value: string) {
  if (value === "spring") return "봄";
  if (value === "summer") return "여름";
  if (value === "fall") return "가을";
  if (value === "winter") return "겨울";
  if (value === "commute") return "출근";
  if (value === "school") return "등교";
  if (value === "travel") return "여행";
  if (value === "outdoor") return "야외";
  if (value === "daily") return "일상";
  if (value === "formal") return "단정";
  if (value === "rain") return "비";
  if (value === "wind") return "바람";
  if (value === "dry") return "건조";
  if (value === "heat") return "더위";
  if (value === "cold") return "추위";
  return value;
}
