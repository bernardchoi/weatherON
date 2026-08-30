const WARDROBE_ANALYSIS_ROUTE = "/wardrobe/analyze";
const WARDROBE_VISION_MODEL = "@cf/moondream/moondream3.1-9B-A2B";
const MAX_REQUEST_BYTES = 1_600_000;
const MAX_IMAGE_BASE64_LENGTH = 1_500_000;

const CATEGORY_VALUES = ["outer", "top", "bottom", "shoes", "accessory"];
const SEASON_VALUES = ["spring", "summer", "fall", "winter"];
const PURPOSE_VALUES = ["commute", "school", "travel", "outdoor", "formal", "daily"];
const WEATHER_TAG_VALUES = ["rain", "wind", "cold", "heat", "dry"];

export function isWardrobeRoute(pathname) {
  return pathname === WARDROBE_ANALYSIS_ROUTE;
}

export async function handleWardrobeRoute(request, env = {}, { requireSession, verifyAppIntegrityRequest } = {}) {
  try {
    const routeKey = `${request.method.toUpperCase()} ${new URL(request.url).pathname}`;
    if (routeKey !== `POST ${WARDROBE_ANALYSIS_ROUTE}`) {
      throw new WardrobeHttpError(405, "method_not_allowed", "지원하지 않는 요청입니다.");
    }
    if (!env.WEATHERON_DB || typeof requireSession !== "function") {
      throw new WardrobeHttpError(503, "account_storage_unavailable", "계정 저장소가 아직 연결되지 않았습니다.");
    }
    const session = await requireSession(request, env.WEATHERON_DB);
    if (typeof verifyAppIntegrityRequest === "function") {
      await verifyAppIntegrityRequest(request, env.WEATHERON_DB, env, { session, routeKey });
    }
    if (!env.AI || typeof env.AI.run !== "function") {
      throw new WardrobeHttpError(503, "wardrobe_ai_unavailable", "옷 사진 분석 기능을 준비 중입니다.");
    }

    const body = await readJsonObject(request);
    const imageBase64 = readImageBase64(body.imageBase64);
    const mimeType = readMimeType(body.mimeType);
    const response = await env.AI.run(WARDROBE_VISION_MODEL, {
      task: "query",
      image: `data:${mimeType};base64,${imageBase64}`,
      question: buildAnalysisQuestion(),
      reasoning: false,
      max_tokens: 400,
      temperature: 0.1,
    });
    return { status: 200, payload: { analysis: normalizeAnalysis(response?.answer) } };
  } catch (error) {
    if (error instanceof WardrobeHttpError) {
      return { status: error.status, payload: { error: error.code, message: error.message } };
    }
    return {
      status: Number(error?.status) || 502,
      payload: {
        error: typeof error?.code === "string" ? error.code : "wardrobe_analysis_failed",
        message: "옷 사진을 분석하지 못했습니다. 사진을 확인하거나 직접 입력해 주세요.",
      },
    };
  }
}

async function readJsonObject(request) {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_REQUEST_BYTES) {
    throw new WardrobeHttpError(413, "request_too_large", "사진 용량이 너무 큽니다. 다른 사진을 선택해 주세요.");
  }
  try {
    const value = text ? JSON.parse(text) : {};
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("object required");
    return value;
  } catch {
    throw new WardrobeHttpError(400, "invalid_json", "요청 JSON 형식이 올바르지 않습니다.");
  }
}

function readImageBase64(value) {
  if (typeof value !== "string" || value.length < 32 || value.length > MAX_IMAGE_BASE64_LENGTH || !/^[A-Za-z0-9+/=]+$/u.test(value)) {
    throw new WardrobeHttpError(400, "invalid_image", "분석할 옷 사진을 확인할 수 없습니다.");
  }
  return value;
}

function readMimeType(value) {
  return value === "image/png" || value === "image/webp" ? value : "image/jpeg";
}

function normalizeAnalysis(value) {
  const record = typeof value === "string" ? parseJson(value) : value;
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new WardrobeHttpError(502, "invalid_ai_response", "AI 분석 결과를 확인할 수 없습니다.");
  }
  const category = CATEGORY_VALUES.includes(record.category) ? record.category : null;
  const seasons = filterEnumArray(record.seasons, SEASON_VALUES);
  const purposes = filterEnumArray(record.purposes, PURPOSE_VALUES);
  const weatherTags = filterEnumArray(record.weatherTags, WEATHER_TAG_VALUES);
  if (!category || seasons.length === 0 || purposes.length === 0 || weatherTags.length === 0) {
    throw new WardrobeHttpError(502, "invalid_ai_response", "AI 분석 결과를 확인할 수 없습니다.");
  }
  return {
    name: cleanText(record.name, 30) || "내 옷",
    category,
    seasons,
    purposes,
    weatherTags,
    confidence: clampNumber(record.confidence, 0, 1, 0.5),
    quality: record.quality === "good" || record.quality === "retake" ? record.quality : "review",
    issues: Array.isArray(record.issues) ? record.issues.map((item) => cleanText(item, 60)).filter(Boolean).slice(0, 3) : [],
    reason: cleanText(record.reason, 100) || "사진을 기준으로 제안함",
  };
}

function filterEnumArray(value, allowed) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => allowed.includes(item)))];
}

function parseJson(value) {
  const candidate = value
    .trim()
    .replace(/^```(?:json)?\s*/iu, "")
    .replace(/\s*```$/u, "");
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function buildAnalysisQuestion() {
  return [
    "Analyze exactly one clothing item for a weather outfit app.",
    "Do not identify, describe, or infer any person.",
    "Return only one valid JSON object without markdown or commentary.",
    'Required keys: {"name":string,"category":string,"seasons":string[],"purposes":string[],"weatherTags":string[],"confidence":number,"quality":string,"issues":string[],"reason":string}.',
    `category must be one of: ${CATEGORY_VALUES.join(", ")}.`,
    `seasons may contain only: ${SEASON_VALUES.join(", ")}.`,
    `purposes may contain only: ${PURPOSE_VALUES.join(", ")}.`,
    `weatherTags may contain only: ${WEATHER_TAG_VALUES.join(", ")}.`,
    "quality must be good, review, or retake; confidence must be 0 to 1.",
    "Write name, issues, and reason in concise Korean.",
    "If the photo is blurry, cropped, contains multiple items, or cannot be identified reliably, lower confidence and use review or retake.",
    "Infer material or weather protection only when visually clear.",
  ].join(" ");
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function clampNumber(value, min, max, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

class WardrobeHttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
