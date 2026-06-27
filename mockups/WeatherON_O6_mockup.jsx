import { useState, useEffect } from "react";
import { DestinationIcon } from "./WeatherON_destination_icons.jsx";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

const O6_ILLUSTRATION = new URL("../assets/onboarding/weatheron-onboarding-o6-destination-care-v1.png", import.meta.url).href;

/* ── WeatherON O6 · 목적지 등록 (선택) (하이브리드 크롬) ───────────────
   와이어프레임 O6 기준: 온보딩 3/3 — 자주 가는 곳 등록(선택)
   - 목적지 등록 혜택 3개: 목적지 날씨 비교 · 출발 시각 · 신발/우산 알림
   - 추천 라벨 칩: 회사 · 학교 · 공항 · 숙소 전용 라인 아이콘
   - 검색 입력 시 샘플 결과와 선택된 목적지 미리보기 표시
   - 등록 시 → 출발 탭(G1) 목적지 알림 확장 / 건너뛰기 시 → Mode A 통합 알림
   - 건너뛰기 → H1 홈 진입
   - 탭바 없음 (온보딩 단계, 진행 표시 "3 / 3")
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#2A5D8F';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let CLEAR     = '#3ABFA0';
let SKY       = '#4A8FD4';
let WARM      = '#E8854A';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(168,196,224,${a})`;


function applyWeatherONTheme(mode) {
  const theme = getWeatherONTheme(mode);
  if (typeof NAVY !== "undefined") NAVY = theme.NAVY;
  if (typeof NAVY_DARK !== "undefined") NAVY_DARK = theme.NAVY_DARK;
  if (typeof PANEL !== "undefined") PANEL = theme.PANEL;
  if (typeof PANEL_L1 !== "undefined") PANEL_L1 = theme.PANEL_L1;
  if (typeof PANEL_L2 !== "undefined") PANEL_L2 = theme.PANEL_L2;
  if (typeof GOLD !== "undefined") GOLD = theme.GOLD;
  if (typeof ON_GOLD !== "undefined") ON_GOLD = theme.onGold || ON_GOLD;
  ON_GOLD = theme.onGold || ON_GOLD;
  if (typeof SKY !== "undefined") SKY = theme.SKY;
  if (typeof SKY_LITE !== "undefined") SKY_LITE = theme.SKY;
  if (typeof CLEAR !== "undefined") CLEAR = theme.CLEAR;
  if (typeof WARM !== "undefined") WARM = theme.WARM || WARM;
  WARM = theme.WARM || WARM;
  if (typeof MIST !== "undefined") MIST = theme.MIST;
  if (typeof INK !== "undefined") INK = (a) => ink(theme, a);
  if (typeof MISTLITE !== "undefined") MISTLITE = (a) => mist(theme, a);
  if (typeof MISTL !== "undefined") MISTL = (a) => mist(theme, a);
  return theme;
}
function usePressTint() {
  const [pressed, setPressed] = useState(false);
  return {
    pressed,
    handlers: {
      onMouseDown: () => setPressed(true),
      onMouseUp: () => setPressed(false),
      onMouseLeave: () => setPressed(false),
      onTouchStart: () => setPressed(true),
      onTouchEnd: () => setPressed(false),
    },
  };
}
function PressTintOverlay({ pressed, tint }) {
  return <div style={{ position:"absolute", inset:0, background: tint, opacity: pressed ? 0.12 : 0, transition:"opacity 0.12s ease", pointerEvents:"none" }}/>;
}
function BackArrowSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function SearchSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.72)} strokeWidth={2} strokeLinecap="round">
      <circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2={16.65} y2={16.65} />
    </svg>
  );
}

function DestinationHero() {
  return (
    <div style={{
      height: 118,
      borderRadius: 22,
      overflow: "hidden",
      background: NAVY_DARK,
      border: `1px solid ${INK(0.10)}`,
      boxShadow: "0 12px 24px rgba(0,0,0,0.22)",
    }}>
      <img
        src={O6_ILLUSTRATION}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

const recommended = [
  { label: "회사", icon: "company" },
  { label: "학교", icon: "school" },
  { label: "공항", icon: "airport" },
  { label: "숙소", icon: "hotel" },
];
const benefits = [
  { label: "목적지 날씨 비교", color: SKY },
  { label: "출발 시각", color: GOLD },
  { label: "신발·우산 알림", color: CLEAR },
];
const sampleDestinations = [
  { label: "회사", icon: "company", name: "판교 알파돔타워", meta: "평일 출근 · 08:10 출발 알림" },
  { label: "학교", icon: "school", name: "신촌 캠퍼스", meta: "등교 전 날씨·신발 알림" },
  { label: "공항", icon: "airport", name: "김포국제공항", meta: "항공편 전 비·바람 체크" },
  { label: "숙소", icon: "hotel", name: "부산 해운대 숙소", meta: "여행 D-1 짐·코디 체크" },
];

function RecChip({ item, selected, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <button onClick={onClick} {...handlers} style={{
      padding: "8px 14px", borderRadius: 20,
      background: selected ? "rgba(58,191,160,0.16)" : NAVY_DARK,
      border: selected ? `1px solid rgba(58,191,160,0.40)` : `1px solid ${INK(0.12)}`,
      color: selected ? INK(0.82) : INK(0.82),
      fontSize: 12.5, fontWeight: 600, cursor: "pointer",
      position: "relative", overflow: "hidden", flexShrink: 0,
      fontFamily: "'Noto Sans KR',sans-serif",
    }}>
      {!selected && <PressTintOverlay pressed={pressed} tint={GOLD}/>}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <DestinationIcon type={item.icon} size={14}/>
        {item.label}
      </span>
    </button>
  );
}

function BenefitPill({ item }) {
  return (
    <div style={{
      borderRadius: 13,
      background: NAVY_DARK,
      border: `1px solid ${INK(0.09)}`,
      padding: "9px 10px",
      color: INK(0.78),
      fontSize: 11,
      fontWeight: 800,
      textAlign: "center",
      lineHeight: 1.35,
    }}>
      {item.label}
    </div>
  );
}

function ResultRow({ item, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%",
      minHeight: 50,
      border: "none",
      borderTop: `1px solid ${INK(0.06)}`,
      background: selected ? "rgba(240,160,32,0.08)" : "transparent",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      cursor: "pointer",
      textAlign: "left",
      fontFamily: "'Noto Sans KR',sans-serif",
    }}>
      <span style={{ color: SKY, width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <DestinationIcon type={item.icon} size={18}/>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", color: INK(0.94), fontSize: 12.8, fontWeight: 800 }}>{item.name}</span>
        <span style={{ display: "block", color: INK(0.68), fontSize: 10.7, marginTop: 2 }}>{item.meta}</span>
      </span>
      <span style={{ color: selected ? INK(0.78) : INK(0.66), fontSize: 11, fontWeight: 900 }}>{selected ? "선택" : "추가"}</span>
    </button>
  );
}

export default function WeatherON_O6({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState("");
  const registerBtn = usePressTint();
  const skipBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  const toggle = (label) => setPicked(prev => prev === label ? "" : label);
  const hasQuery = query.trim().length > 0;
  const matchedSamples = hasQuery
    ? sampleDestinations.filter((item) => item.name.includes(query.trim()) || item.label.includes(query.trim()))
    : [];
  const visibleSamples = hasQuery ? (matchedSamples.length > 0 ? matchedSamples : sampleDestinations.slice(0, 2)) : sampleDestinations.filter((item) => item.label === picked);
  const inferredSample = matchedSamples[0] ?? null;
  const selectedSample = sampleDestinations.find((item) => item.label === picked) ?? inferredSample;
  const hasTarget = hasQuery || !!picked;
  const selectedLabel = picked || inferredSample?.label || "목적지";
  const selectedName = hasQuery ? query.trim() : selectedSample?.name;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        O6 · 목적지 등록(선택) · 하이브리드 크롬
      </div>

      <div style={{
        width: 393, height: 852, borderRadius: 40, overflow: "hidden",
        position: "relative", flexShrink: 0,
        boxShadow: weatherTheme.phoneShadow,
        background: weatherTheme.gradient,
      }}>
        {/* Status Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 28px 10px", height:54, position:'absolute', top:0, left:0, right:0, color: INK(0.94), fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
          <span>9:41</span>
          <span style={{ fontSize: 13, color: INK(0.70) }}>●●● 5G</span>
        </div>

        <div style={{ paddingTop: 54 }}>
          {/* Header w/ progress */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
            <button onClick={() => navigate?.("O5")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.68), fontSize: 12, fontFamily: "'DM Mono',monospace" }}>3 / 3</span>
          </div>
          <div style={{ padding: "12px 20px 0" }}>
            <div style={{ height: 4, borderRadius: 2, background: INK(0.08), overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", background: GOLD, borderRadius: 2 }}/>
            </div>
          </div>

          <div style={{ padding: "22px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ color: INK(0.94), fontSize: 16.5, fontWeight: 800, marginBottom: 6, fontFamily: "'Noto Sans KR',sans-serif" }}>
                자주 가는 곳을 등록하면 목적지에 맞춰 챙겨드려요
              </div>
              <div style={{ color: INK(0.75), fontSize: 13, lineHeight: 1.5, fontFamily: "'Noto Sans KR',sans-serif" }}>
                목적지는 선택이에요. 등록하면 날씨·출발·신발 알림을 이동 상황에 맞춰 받아볼 수 있어요
              </div>
            </div>

            <DestinationHero/>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
              {benefits.map((item) => <BenefitPill key={item.label} item={item}/>)}
            </div>

            {/* Search field */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: PANEL, borderRadius: 16, padding: "13px 14px",
            }}>
              <SearchSVG/>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="회사, 학교, 공항, 숙소 검색"
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: INK(0.94), fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }} />
            </div>

            {(hasQuery || picked) && (
              <div style={{ background: PANEL, borderRadius: 16, overflow: "hidden", border: `1px solid ${INK(0.08)}` }}>
                {visibleSamples.map((item) => (
                  <ResultRow
                    key={item.name}
                    item={item}
                    selected={picked === item.label || query.trim() === item.name}
                    onClick={() => {
                      setPicked(item.label);
                      setQuery(item.name);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Recommended chips */}
            <div style={{ background: PANEL, borderRadius: 16, padding: "12px 14px" }}>
              <div style={{ color: INK(0.70), fontSize: 11, fontWeight: 700, marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>추천 라벨</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {recommended.map(item => (
                  <RecChip key={item.label} item={item} selected={picked === item.label} onClick={() => toggle(item.label)}/>
                ))}
              </div>
            </div>

            <div style={{
              background: hasTarget ? "rgba(58,191,160,0.13)" : NAVY_DARK,
              borderRadius: 14,
              padding: "10px 14px",
              border: hasTarget ? `1px solid rgba(58,191,160,0.30)` : `1px dashed ${INK(0.20)}`,
            }}>
              <div style={{ color: hasTarget ? INK(0.84) : INK(0.68), fontSize: 11, textAlign: "center", lineHeight: 1.6, fontWeight: hasTarget ? 600 : 700, fontFamily: "'Noto Sans KR',sans-serif" }}>
                {hasTarget ? `${selectedName || selectedLabel} 기준으로 알림을 맞춰드려요` : "목적지를 선택하면 더 정확하게 시작할 수 있어요"}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 48, display: "flex", flexDirection: "column", gap: 10 }}>
          <button {...registerBtn.handlers} onClick={() => hasTarget && navigate?.("G1")} disabled={!hasTarget} style={{
            width: "100%", height: 54, borderRadius: 18,
            background: hasTarget ? GOLD : "rgba(134,158,188,0.16)",
            border: hasTarget ? "none" : `1px solid ${INK(0.22)}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: hasTarget ? "pointer" : "not-allowed",
            position: "relative", overflow: "hidden", flexShrink: 0,
            opacity: 1,
            boxShadow: hasTarget ? "0 6px 16px rgba(0,0,0,0.30)" : "none",
          }}>
            {hasTarget && <PressTintOverlay pressed={registerBtn.pressed} tint={NAVY}/>}
            <span style={{ fontSize: 15, fontWeight: 800, color: hasTarget ? ON_GOLD : INK(0.70), fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              {hasTarget ? `${selectedLabel} 등록하고 시작` : "목적지 등록하고 시작"}
            </span>
          </button>
          <button {...skipBtn.handlers} onClick={() => navigate?.("H1")} style={{
            width: "100%", height: 44, borderRadius: 16,
            background: "none", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
          }}>
            <PressTintOverlay pressed={skipBtn.pressed} tint={GOLD}/>
            <span style={{ color: INK(0.70), fontSize: 13, fontWeight: 600, fontFamily: "'Noto Sans KR',sans-serif" }}>나중에 할게요</span>
          </button>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · O6 목적지 등록(선택)
      </div>
    </div>
  );
}
