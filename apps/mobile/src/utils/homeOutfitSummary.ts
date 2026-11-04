// Shorten known commentary clauses without reinterpreting weather or dropping warnings.
const shortClauses: Record<string, string> = {
  "영하의 추위라 두툼한 보온 겉옷과 목도리를 챙겨요": "두툼한 겉옷에 목도리도 챙겨요",
  "더운 날씨라 통풍이 잘되는 가벼운 차림에 물도 챙겨요": "시원한 옷에 물도 챙겨요",
  "더운 시간에는 겉옷을 벗고 물을 챙겨요": "더울 땐 겉옷 벗고 물 챙겨요",
  "우박 신호가 있어 실외 이동을 잠시 피하고 확인해요": "우박 주의, 실내에서 잠시 기다려요",
  "눈과 바람에 대비해 미끄럼 적은 신발을 챙겨요": "눈·바람엔 미끄럼 적은 신발이 좋아요",
  "눈에 대비해 미끄럼 적은 신발을 챙겨요": "눈 오는 날엔 미끄럼 적은 신발이 좋아요",
  "얼음·혼합 강수에 대비해 방수와 미끄럼을 확인해요": "얼음·혼합 강수엔 방수와 미끄럼을 살펴요",
  "강수와 강한 바람에 대비해 방수 겉옷을 챙겨요": "강수·강풍엔 방수 겉옷을 챙겨요",
  "강한 강수에 대비해 방수 겉옷과 신발을 챙겨요": "강한 강수엔 방수 겉옷과 신발이 좋아요",
  "비에 대비해 우산을 챙겨요": "비에 대비해 우산을 챙겨요",
  "강수 가능성에 대비해 젖지 않을 겉옷을 챙겨요": "강수에 대비해 방수 겉옷을 챙겨요",
  "바람에 체온을 빼앗기지 않게 겉옷을 여며요": "바람을 막도록 겉옷을 여며요",
  "먼지에 대비해 마스크를 챙겨요": "먼지에 대비해 마스크를 챙겨요",
  "강한 햇빛에 대비해 모자나 선크림을 챙겨요": "햇빛이 강해 모자나 선크림을 챙겨요",
  "확인된 기온 차가 커서 겉옷을 벗고 입으며 조절해요": "기온 차가 커요, 겉옷으로 조절해요",
  "예보를 확인한 뒤 오늘 코디를 준비해요": "일부 예보는 더 확인해 주세요",
};

const thermalPhrases: Record<string, readonly string[]> = {
  "추운 날씨라 보온 겉옷과 따뜻한 상의가 좋아요": [
    "따뜻한 상의와 겉옷을 챙겨요",
    "포근한 상의에 따뜻한 겉옷이 좋아요",
    "상의도 겉옷도 따뜻하게 입어요",
  ],
  "더운 날씨라 통풍이 잘되는 가벼운 차림이 좋아요": [
    "통풍 좋은 옷으로 가볍게 입어요",
    "바람 잘 통하는 가벼운 옷이 좋아요",
    "가볍고 통기성 좋은 옷을 골라요",
  ],
  "서늘함에 대비해 가볍게 걸칠 한 겹이 좋아요": [
    "가벼운 겉옷을 걸쳐요",
    "얇은 겉옷 한 벌을 챙겨요",
    "가볍게 걸칠 겉옷이 있으면 좋아요",
  ],
  "온화한 기온에 맞춰 편한 차림으로 나가요": [
    "가볍고 편하게 입어요",
    "움직이기 편한 차림이 좋아요",
    "편안한 옷으로 가볍게 나가요",
  ],
};

export function summarizeHomeOutfit(decisionText: string, now = 0, timeZone = "UTC"): string {
  let variant = 0;
  try {
    // Keep wording stable within the location's calendar day; weather warnings never rotate.
    variant = (Number(new Intl.DateTimeFormat("en", { day: "numeric", timeZone }).format(now)) - 1) % 3;
  } catch { /* Unknown date/zone keeps the first phrase. */ }
  const clauses = decisionText.split(" · ");
  const swingIndex = clauses.indexOf("확인된 기온 차가 커서 겉옷을 벗고 입으며 조절해요");
  // Merge repeated layering advice; keep every separate weather warning.
  if (swingIndex > 0 && ["추운 날씨라 보온 겉옷과 따뜻한 상의가 좋아요", "서늘함에 대비해 가볍게 걸칠 한 겹이 좋아요"].includes(clauses[0])) {
    clauses[0] = clauses[0] === "추운 날씨라 보온 겉옷과 따뜻한 상의가 좋아요"
      ? "따뜻하게 겹쳐 입고, 겉옷으로 조절해요" : "기온 차엔 겉옷을 더하고 빼요";
    clauses.splice(swingIndex, 1);
  }
  return clauses.map(clause => thermalPhrases[clause]?.[variant] ?? shortClauses[clause] ?? clause).join(" · ");
}
