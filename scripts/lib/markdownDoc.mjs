// Android 릴리스 파이프라인 scripts/*.mjs가 서로의 생성 문서(마크다운 표)를 읽어들일 때
// 공통으로 쓰는 파서. 예전에는 각 스크립트가 이 로직을 복붙해서 백틱 제거 여부 등이
// 스크립트마다 미묘하게 달라졌다(같은 표 셀을 스크립트에 따라 다르게 파싱).
export function tableValue(markdown, label, { required = false, stripBackticks = false } = {}) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown?.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`));
  if (required) {
    if (!match) throw new Error(`missing table row: ${label}`);
    return match[1].trim();
  }
  const raw = match?.[1]?.trim() ?? "";
  return stripBackticks ? normalizeTableValue(raw) : raw;
}

export function normalizeTableValue(value) {
  return value.replace(/^`|`$/g, "").trim();
}

export function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
