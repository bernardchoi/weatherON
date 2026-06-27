import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON R4 · 홈 화면 광고 배치 (하이브리드 크롬) ────────────────
   와이어프레임 R4 기준: 02·HOME(H1) 레이아웃에 AD 슬롯 추가 반영
   - 네이티브 광고는 AI 추천 카드 아래 1개, "AD" 라벨로 콘텐츠와 명확히 구분
   - 버튼·인터랙티브 요소 인접 배치 금지(AD 카드 위아래 구분선 + 여백)
   - H1 홈 메인과 동일 레이아웃, AD 슬롯만 추가된 변형
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#2A5D8F';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let SKY       = '#4A8FD4';
let CLEAR     = '#3ABFA0';
let MIST      = '#869EBC';
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
function BrandCard({ accent, children, style = {}, onClick }) {
  const { pressed, handlers } = usePressTint();
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} {...(onClick ? handlers : {})} {...(onClick ? { type: "button" } : {})} style={{
      ...(onClick ? { appearance:"none", border:"none", font:"inherit", color:"inherit", textAlign:"left", width:"100%" } : {}),
      background: PANEL, borderRadius: 20, position: "relative", overflow: "hidden", flexShrink: 0,
      boxShadow: "0 6px 16px rgba(0,0,0,0.30)", cursor: onClick ? "pointer" : "default", ...style,
    }}>
      {accent && <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:accent }}/>}
      {onClick && <PressTintOverlay pressed={pressed} tint={accent || GOLD}/>}
      {children}
    </Tag>
  );
}

const tabDefs = [
  { id: "홈", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { id: "코디", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" /></svg> },
  { id: "출발", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg> },
  { id: "MY", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  { id: "소셜", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg> },
];
function TabItem({ tab, active, onClick }) {
  const { pressed, handlers } = usePressTint();
  const _tabLabel = tab.id === "MY" ? "마이" : tab.id;
  return (
    <button type="button" onClick={onClick} {...handlers} aria-label={_tabLabel} aria-current={active ? "page" : undefined} style={{
      appearance:"none", border:"none", background:"transparent", font:"inherit",
      flex:1, minHeight:52, position:"relative", overflow:"hidden", flexShrink: 0, borderRadius:14,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4,
      cursor:"pointer", userSelect:"none",
      color: active ? GOLD : INK(0.66), transition:"color 0.15s ease",
    }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      <div style={{ width:5, height:5, borderRadius:"50%", background: active ? GOLD : "transparent", marginBottom:1 }}/>
      {tab.icon}
      <span style={{ fontSize:10.5, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{_tabLabel}</span>
    </button>
  );
}
function SunSVG({ size = 56 }) {
  const rays = [[28,4,28,10],[28,46,28,52],[4,28,10,28],[46,28,52,28],[13.3,13.3,17.7,17.7],[38.3,38.3,42.7,42.7],[42.7,13.3,38.3,17.7],[17.7,38.3,13.3,42.7]];
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx={28} cy={28} r={13} fill={GOLD}/>
      {rays.map(([x1,y1,x2,y2],i)=>(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD} strokeWidth={2.4} strokeLinecap="round"/>))}
    </svg>
  );
}
function BellSVG() {
  return <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
}

export default function WeatherON_R4({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab, setActiveTab] = useState("홈");
  const [adState, setAdState] = useState("노출 대기");
  const routeTab = (id) => {
    setActiveTab(id);
    if (id === "홈") navigate?.("H1");
    if (id === "코디") navigate?.("C1");
    if (id === "출발") navigate?.("G1");
    if (id === "MY") navigate?.("M1");
    if (id === "소셜") navigate?.("S0");
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        R4 · 홈 화면 광고 배치 · 하이브리드 크롬
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 50, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 18, padding: "7px 14px" }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: INK(0.92) }}>서울 마포구 합정동</span>
              <span style={{ fontSize: 10, color: INK(0.82), marginLeft: 2 }}>▾</span>
            </div>
            <div style={{ position: "absolute", right: 20, width: 40, height: 40, background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BellSVG/>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0 20px" }}>
            <SunSVG/>
            <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 500, fontSize: 64, color: INK(0.94), marginTop: 6, lineHeight: 1 }}>22°</div>
            <div style={{ fontSize: 16, color: MIST, marginTop: 6 }}>맑음</div>
          </div>

          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 320px)", overflowY: "auto", paddingBottom: 90 }}>

            <BrandCard accent={SKY} onClick={() => navigate?.("P3")} style={{ padding: "14px 16px 14px 18px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: MIST, marginBottom: 6 }}>AI 장소 추천</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: INK(0.94), marginBottom: 4 }}>오늘 이 날씨엔 합정동 카페 어때요?</div>
              <div style={{ fontSize: 11.5, color: INK(0.82) }}>맑음 · 기온 22°C · 탭해서 더보기 →</div>
            </BrandCard>

            {/* AD 슬롯 — 콘텐츠 카드와 구분선/여백으로 명확히 분리, 인접 인터랙티브 요소 없음 */}
            <div style={{ margin: "2px 0" }}>
              <div style={{ height: 1, background: INK(0.08), marginBottom: 10 }}/>
              <div onClick={() => setAdState("광고 슬롯 탭됨")} style={{
                background: "rgba(232,237,246,0.04)", border: `1px dashed ${INK(0.14)}`, borderRadius: 18,
                padding: "16px 16px 14px", textAlign: "center",
                cursor: "pointer",
              }}>
                <div style={{ color: INK(0.76), fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 6, fontFamily: "'DM Mono',monospace" }}>광고 · 네이티브 광고</div>
                <div style={{ color: INK(0.76), fontSize: 12, lineHeight: 1.5 }}>콘텐츠와 동일한 톤이지만 "광고" 라벨로 명확히 구분</div>
              </div>
              <div style={{ height: 1, background: INK(0.08), marginTop: 10 }}/>
            </div>

            <BrandCard accent={CLEAR} style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: MIST, marginBottom: 6 }}>코디 · 우산 · 신발</div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: INK(0.94), marginBottom: 4 }}>트렌치코트 + 슬랙스</div>
              <div style={{ fontSize: 11.5, color: INK(0.82) }}>우산 불필요 · 로우컷 스니커즈</div>
            </BrandCard>

            <BrandCard style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: MIST, marginBottom: 6 }}>출발 시각</div>
              <div style={{ fontSize: 13, color: INK(0.82) }}>목적지 등록 시 10:50 출발 안내</div>
            </BrandCard>

            <BrandCard style={{ padding: "12px 14px", border: `1px solid ${GOLD}33` }}>
              <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>광고 상태</div>
              <div style={{ color: INK(0.78), fontSize: 12, lineHeight: 1.55 }}>
                네이티브 광고 1개 · 광고 라벨 표시 · {adState}
              </div>
            </BrandCard>
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: 18, left: 16, right: 16, height: 64,
          background: NAVY_DARK, borderRadius: 24, border: `1px solid ${INK(0.08)}`,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          padding: "0 4px", boxShadow: "0 10px 24px rgba(0,0,0,0.45)", zIndex: 20,
        }}>
          {tabDefs.map(tab => (
            <TabItem key={tab.id} tab={tab} active={tab.id === activeTab} onClick={() => routeTab(tab.id)} />
          ))}
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · R4 홈 화면 광고 배치
      </div>
    </div>
  );
}
