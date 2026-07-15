import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON W2 · 탭 제보 화면 (F1) (하이브리드 크롬) ────────────────
   와이어프레임 W2 기준: 운전 중에도 쓸 수 있는 최소 UI — 텍스트 입력 없음
   - 6가지 날씨 아이콘 그리드 — 탭 1회 선택 → "제보하기" 탭 1회
   - GPS 자동 위치 표시, 3초 이내 완료 목표
   - 유효시간 기본 60분 자동 만료(강설 120분)
   - 모달형 풀스크린(✕ 닫기) — 탭바 없음
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#1D5A86';
let NAVY_DARK = '#276A96';
let PANEL     = '#2B719D';
let PANEL_L1  = '#3D87B5';
let GOLD      = '#F0A020';
let ON_GOLD  = '#123858';
let SKY       = '#4A8FD4';
let CLEAR     = '#3ABFA0';
let WARM      = '#E8854A';
let MIST      = '#E4F2FF';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(228,242,255,${a})`;


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
function CloseSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
    </svg>
  );
}
function SunSVG({ size = 30, color = GOLD }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth={1.8}/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return <line key={i} x1={12 + 7.5 * Math.cos(rad)} y1={12 + 7.5 * Math.sin(rad)} x2={12 + 10 * Math.cos(rad)} y2={12 + 10 * Math.sin(rad)} stroke={color} strokeWidth={1.8} strokeLinecap="round"/>;
      })}
    </svg>
  );
}
function CloudSVG({ size = 30, color = MISTLITE(0.85) }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round"><path d="M6 16a4 4 0 014-4h6a3 3 0 010 6H7a3 3 0 01-3-3 3 3 0 013-3"/></svg>;
}
function RainSVG({ size = 30, color = SKY }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <line x1="8" y1="19" x2="8" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <line x1="16" y1="19" x2="16" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <path d="M20 16.4A5 5 0 0017 7h-1.26A8 8 0 104 15.25" stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
    </svg>
  );
}
function SnowSVG({ size = 30, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="22"/><line x1="4.5" y1="6" x2="19.5" y2="18"/><line x1="19.5" y1="6" x2="4.5" y2="18"/>
    </svg>
  );
}
function WindSVG({ size = 30, color = MISTLITE(0.90) }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/></svg>;
}
function StormSVG({ size = 30, color = WARM }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 16.4A5 5 0 0017 7h-1.26A8 8 0 104 15.25" stroke={MISTLITE(0.85)} strokeWidth={1.4} strokeLinecap="round"/>
      <polygon points="13 12 9 19 12 19 11 23 16 16 13 16 14 12" fill={color}/>
    </svg>
  );
}

const options = [
  { id: "맑음", icon: SunSVG },
  { id: "흐림", icon: CloudSVG },
  { id: "비", icon: RainSVG },
  { id: "눈", icon: SnowSVG },
  { id: "강풍", icon: WindSVG },
  { id: "천둥", icon: StormSVG },
];

function WeatherTile({ opt, selected, onClick }) {
  const { pressed, handlers } = usePressTint();
  const Icon = opt.icon;
  return (
    <button onClick={onClick} {...handlers} style={{
      aspectRatio: "1", borderRadius: 18,
      background: selected ? "rgba(74,143,212,0.16)" : PANEL,
      border: selected ? `2px solid ${SKY}` : `1px solid ${INK(0.06)}`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
      cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      {!selected && <PressTintOverlay pressed={pressed} tint={GOLD}/>}
      <Icon/>
      <span style={{ color: selected ? SKY : INK(0.78), fontSize: 12.5, fontWeight: selected ? 700 : 500, fontFamily: "'Noto Sans KR',sans-serif" }}>
        {opt.id}{selected ? " ← 선택" : ""}
      </span>
    </button>
  );
}

export default function WeatherON_W2({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [selected, setSelected] = useState(routeState.selectedWeather || "비");
  const [reportState, setReportState] = useState(
    routeState.resumeWeatherReport && (routeState.locationReady || routeState.permissionReady)
      ? `${routeState.selectedWeather || "비"} 제보 준비 완료 · GPS 확인됨`
      : routeState.resumeReportAccount && routeState.accountLinked
        ? "계정 연결됨 · 배지/이력 반영"
      : "선택 대기"
  );
  const [locationReady, setLocationReady] = useState(Boolean(routeState.locationReady || routeState.permissionReady));
  const [accountLinked, setAccountLinked] = useState(Boolean(routeState.accountLinked));
  const reportBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (routeState.selectedWeather) setSelected(routeState.selectedWeather);
    if (routeState.locationReady || routeState.permissionReady) setLocationReady(true);
    if (routeState.accountLinked) setAccountLinked(true);
    if (routeState.resumeWeatherReport && (routeState.locationReady || routeState.permissionReady)) {
      setReportState(`${routeState.selectedWeather || selected} 제보 준비 완료 · GPS 확인됨`);
    }
    if (routeState.resumeReportAccount && routeState.accountLinked) {
      setReportState("계정 연결됨 · 배지/이력 반영");
    }
  }, [
    routeState.selectedWeather,
    routeState.locationReady,
    routeState.permissionReady,
    routeState.accountLinked,
    routeState.resumeWeatherReport,
    routeState.resumeReportAccount,
    selected,
  ]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        W2 · 탭 제보 화면(F1) · 하이브리드 크롬
      </div>

      <div style={{
        width: 393, height: 852, borderRadius: 40, overflow: "hidden",
        position: "relative", flexShrink: 0,
        boxShadow: weatherTheme.phoneShadow,
        background: weatherTheme.gradient,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 28px 10px", height:54, position:'absolute', top:0, left:0, right:0, color: INK(0.94), fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
          <span>9:41</span>
          <span style={{ fontSize: 13, color: INK(0.70) }}>●●● 5G</span>
        </div>

        <div style={{ paddingTop: 54 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0" }}>
            <button onClick={() => navigate?.("W1")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <CloseSVG/>
            </button>
            <span style={{ color: INK(0.94), fontSize: 16, fontWeight: 700 }}>지금 날씨 어때요?</span>
            <div style={{ width: 40 }}/>
          </div>

          <div style={{ textAlign: "center", color: locationReady ? INK(0.76) : INK(0.88), fontSize: 12, padding: "16px 20px 0", fontFamily: "'Noto Sans KR',sans-serif" }}>
            {locationReady ? "서울 마포구 합정동 (GPS 자동)" : "위치 권한 필요 · O3에서 허용"}
          </div>

          <div style={{ padding: "12px 20px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button onClick={() => {
              setLocationReady((v) => !v);
              setReportState(locationReady ? "위치 권한 전" : "GPS 준비 완료");
            }} style={{
              height: 36,
              borderRadius: 14,
              border: locationReady ? "none" : `1px solid ${INK(0.10)}`,
              background: locationReady ? CLEAR : NAVY_DARK,
              color: locationReady ? NAVY : INK(0.78),
              fontSize: 11.5,
              fontWeight: 900,
              cursor: "pointer",
              fontFamily: "'Noto Sans KR',sans-serif",
            }}>{locationReady ? "위치 권한 정상" : "위치 권한 전"}</button>
            <button onClick={() => {
              if (accountLinked) {
                setAccountLinked(false);
                setReportState("게스트 제보 상태");
                return;
              }
              setReportState("배지/이력 저장은 계정 연결 필요 · A2 이동");
              navigate?.("A2", {
                pendingAction: "날씨 제보 저장",
                returnTo: "W2",
                resumeReportAccount: true,
                selectedWeather: selected,
                locationReady,
              });
            }} style={{
              height: 36,
              borderRadius: 14,
              border: accountLinked ? "none" : `1px solid ${INK(0.10)}`,
              background: accountLinked ? GOLD : NAVY_DARK,
              color: accountLinked ? NAVY : INK(0.78),
              fontSize: 11.5,
              fontWeight: 900,
              cursor: "pointer",
              fontFamily: "'Noto Sans KR',sans-serif",
            }}>{accountLinked ? "계정 연결됨" : "게스트 제보"}</button>
          </div>

          <div style={{ padding: "16px 20px 0", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {options.map(opt => (
              <WeatherTile key={opt.id} opt={opt} selected={selected === opt.id} onClick={() => { setSelected(opt.id); setReportState(`${opt.id} 선택`); }}/>
            ))}
          </div>

          <div style={{ padding: "20px 20px 0" }}>
            <button {...reportBtn.handlers} disabled={!selected} onClick={() => {
              if (!locationReady) {
                setReportState("위치 권한 필요 · O3 이동");
                navigate?.("O3", {
                  pendingAction: "날씨 제보 저장",
                  returnTo: "W2",
                  resumeWeatherReport: true,
                  selectedWeather: selected,
                  accountLinked,
                });
                return;
              }
              setReportState(accountLinked ? "제보 완료 · 배지/이력 반영" : "제보 완료 · 익명 처리");
              navigate?.("W3");
            }} style={{
              width: "100%", height: 52, borderRadius: 18,
              background: selected ? GOLD : NAVY_DARK,
              border: selected ? "none" : `1px solid ${INK(0.10)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: selected ? "pointer" : "not-allowed",
              position: "relative", overflow: "hidden", flexShrink: 0,
              opacity: selected ? 1 : 0.55,
              boxShadow: selected ? "0 6px 16px rgba(0,0,0,0.30)" : "none",
            }}>
              {selected && <PressTintOverlay pressed={reportBtn.pressed} tint={NAVY}/>}
              <span style={{ fontSize: 15, fontWeight: 700, color: selected ? NAVY : INK(0.74), fontFamily: "'Plus Jakarta Sans',sans-serif" }}>제보하기</span>
            </button>
            <div style={{ textAlign: "center", color: INK(0.74), fontSize: 10.5, marginTop: 10, lineHeight: 1.6 }}>
              60분 후 자동 만료 · 언제든 취소 가능
            </div>
            <div style={{ marginTop: 12, background: PANEL, borderRadius: 18, padding: "12px 14px", border: `1px solid ${WARM}33` }}>
              <div style={{ color: INK(0.86), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>제보</div>
              <div style={{ color: INK(0.78), fontSize: 12, lineHeight: 1.55 }}>
                {reportState} · {locationReady ? "GPS 자동" : "위치 권한 전"} · {accountLinked ? "배지/이력 반영" : "익명 제보 가능"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · W2 탭 제보 화면
      </div>
    </div>
  );
}
