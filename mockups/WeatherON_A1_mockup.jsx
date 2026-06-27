import { useEffect, useState } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON A1 · 스플래시 → 게스트 홈 진입 (하이브리드 크롬) ─────────
   와이어프레임 A1 기준 (docs/wireframes/WeatherON_wireframe_template.html
   00·AUTH 섹션): 앱 최초 진입 화면
   - 신규 사용자도 가입 선택 없이 스플래시 후 H1 홈(게스트 모드)으로 자동 진입
   - UI 언어는 기기 언어를 자동 적용, 설정에서만 수동 변경 제공
   - 로그인은 저장·동기화·알림 확장·여행 플래너 등 계정 필요 기능에서만 요청
   - 탭바 없음 (앱 런치 단계, 풀스크린 브랜드 모먼트)
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
   토큰·프리미티브 canonical 정의처: WeatherON_design_system.jsx
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let LOGO_NAVY = '#0C1F3F';
let LOGO_CLOUD = '#F4F7FC';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(168,196,224,${a})`;


function applyWeatherONTheme(mode) {
  const theme = getWeatherONTheme(mode);
  if (typeof NAVY !== "undefined") NAVY = theme.NAVY;
  if (typeof NAVY_DARK !== "undefined") NAVY_DARK = theme.NAVY_DARK;
  if (typeof LOGO_NAVY !== "undefined") LOGO_NAVY = theme.logoNavy || "#0C1F3F";
  if (typeof LOGO_CLOUD !== "undefined") LOGO_CLOUD = theme.logoCloud || "#F4F7FC";
  if (typeof PANEL !== "undefined") PANEL = theme.PANEL;
  if (typeof PANEL_L1 !== "undefined") PANEL_L1 = theme.PANEL_L1;
  if (typeof PANEL_L2 !== "undefined") PANEL_L2 = theme.PANEL_L2;
  if (typeof GOLD !== "undefined") GOLD = theme.GOLD;
  if (typeof ON_GOLD !== "undefined") ON_GOLD = theme.onGold || ON_GOLD;
  ON_GOLD = theme.onGold || ON_GOLD;
  if (typeof SKY !== "undefined") SKY = theme.SKY;
  if (typeof SKY_LITE !== "undefined") SKY_LITE = theme.SKY;
  if (typeof CLEAR !== "undefined") CLEAR = theme.CLEAR;
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

/* ── 앱 아이콘(G-1) — brand/weatheron_ci_bi.html #icon-primary 심볼을
   그대로 재현(1:1 path 포팅). 캐노니컬 출처: weatheron_ci_bi.html 02장.
   네이비 스퀴클 + 크림 토글 트랙 + 골드 노브(3레이 — ON 스위치에서 해가
   떠오르는 모티프) + 좌상단 페이퍼 구름. ── */
function AppIconGlyph({ size = 88 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ filter:'drop-shadow(0 10px 24px rgba(0,0,0,0.40))' }}>
      <rect width="120" height="120" rx="21.6" fill={LOGO_NAVY}/>
      <rect x="12" y="45.6" width="96" height="38.4" rx="19.2" fill="#FDF6EB"/>
      <rect x="29.88" y="56.74" width="2.64" height="16.13" rx="1.32" fill={LOGO_NAVY}/>
      <circle cx="88.8" cy="64.8" r="18.05" fill={GOLD}/>
      <line x1="76.04" y1="46.57" x2="69.51" y2="37.23" stroke={GOLD} strokeWidth="2.88" strokeLinecap="round"/>
      <line x1="88.8" y1="42.55" x2="88.8" y2="31.15" stroke={GOLD} strokeWidth="2.88" strokeLinecap="round"/>
      <line x1="101.56" y1="46.57" x2="108.1" y2="37.23" stroke={GOLD} strokeWidth="2.88" strokeLinecap="round"/>
      <rect x="12.6" y="20.64" width="40.8" height="12.73" rx="6.37" fill={LOGO_CLOUD}/>
      <ellipse cx="24.84" cy="21.12" rx="9.76" ry="9.76" fill={LOGO_CLOUD}/>
      <ellipse cx="37.9" cy="19.4" rx="12.31" ry="12.31" fill={LOGO_CLOUD}/>
    </svg>
  );
}

/* ── 워드마크 — brand/weatheron_ci_bi.html #wordmark-h-dark 심볼 재현.
   "weather"(Manrope 300) + O 자리에 토글 글리프(골드 원+3레이) + "N"
   (Manrope 800, 골드). "O"를 글리프로 치환하는 것이 공유 글리프 핵심. ── */
function OGlyph({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink:0 }}>
      <circle cx="20" cy="20" r="14" fill={GOLD}/>
      <line x1="20" y1="6" x2="20" y2="0" stroke={GOLD} strokeWidth="3" strokeLinecap="round"/>
      <line x1="11.7" y1="9.4" x2="6.8" y2="2.5" stroke={GOLD} strokeWidth="3" strokeLinecap="round"/>
      <line x1="28.3" y1="9.4" x2="33.2" y2="2.5" stroke={GOLD} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
function Wordmark({ size = 27 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', fontFamily:"'Manrope',sans-serif" }}>
      <span style={{ fontWeight:300, fontSize:size, color: INK(0.94), letterSpacing:'-0.5px' }}>weather</span>
      <OGlyph size={size*0.82}/>
      <span style={{ fontWeight:800, fontSize:size, color:GOLD }}>N</span>
    </div>
  );
}

export default function WeatherON_A1({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const homeBtn = usePressTint();
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=Manrope:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        A1 · 스플래시 · 게스트 홈 진입
      </div>

      <div style={{
        width: 393, height: 852, borderRadius: 40, overflow: "hidden",
        position: "relative", flexShrink: 0,
        boxShadow: weatherTheme.phoneShadow,
        background: weatherTheme.gradient,
      }}>
        {/* 워밍 글로우 — 브랜드 모먼트 */}
        <div style={{
          position: "absolute", top: 120, left: "50%", transform: "translateX(-50%)",
          width: 260, height: 260,
          background: "radial-gradient(ellipse, rgba(240,160,32,0.16) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>

        {/* Status Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 28px 10px", height:54, position:'absolute', top:0, left:0, right:0, color: INK(0.94), fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
          <span>9:41</span>
          <span style={{ fontSize: 13, color: INK(0.70) }}>●●● 5G</span>
        </div>

        {/* Center brand block */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 230,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
          padding: "0 36px",
        }}>
          <AppIconGlyph size={84}/>
          <Wordmark size={27}/>
          <div style={{ fontSize: 14, color: INK(0.82), textAlign: "center", lineHeight: 1.6, fontFamily: "'Noto Sans KR', sans-serif" }}>
            오늘 입을 옷과 나갈 시간을<br/>빠르게 정해드려요
          </div>
        </div>

        {/* Auto-entry signal */}
        <div style={{
          position: "absolute", left: 36, right: 36, bottom: 62,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 78, height: 3, borderRadius: 999, background: INK(0.16), overflow: "hidden" }}>
            <div style={{ width: "64%", height: "100%", borderRadius: 999, background: GOLD }}/>
          </div>
          <button {...homeBtn.handlers} onClick={() => navigate?.("H1")} style={{
            width: "100%",
            height: 48,
            borderRadius: 18,
            background: GOLD,
            border: "none",
            color: ON_GOLD,
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden", flexShrink: 0,
            fontFamily: "'Noto Sans KR',sans-serif",
          }}>
            <PressTintOverlay pressed={homeBtn.pressed} tint={NAVY}/>
            바로 시작하기
          </button>
          <div style={{ textAlign: "center", color: MISTLITE(0.56), fontSize: 11.5, lineHeight: 1.55, fontFamily: "'Noto Sans KR',sans-serif" }}>
            계정 없이 먼저 확인할 수 있어요<br/>
            언어는 기기 설정을 따릅니다
          </div>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · A1 스플래시
      </div>
    </div>
  );
}
