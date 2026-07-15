import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON G3 · 여행 플래너 (프리미엄) (하이브리드 크롬) ───────────
   와이어프레임 G3 기준: 일정별 날씨 + 짐 추천 + 공유
   - 여정 요약(제주 2박 3일)
   - Day별 리스트(날씨+장소, 탭 → 상세)
   - 코디·짐 추천 박스
   - 일정 추가 / 여정 공유
   - 무료 사용자 → 페이월(G6) 노출
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
const PREMIUM   = '#AB8EDD';
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
function BackArrowSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRightSVG() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.40)} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;
}
function ShareSVG() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={18} cy={5} r={3} /><circle cx={6} cy={12} r={3} /><circle cx={18} cy={19} r={3} />
      <line x1={8.59} y1={13.51} x2={15.42} y2={17.49} /><line x1={15.41} y1={6.51} x2={8.59} y2={10.49} />
    </svg>
  );
}

const days = [
  { day: "1일차", date: "6/20", weather: "맑음", temp: "27°", place: "성산일출봉" },
  { day: "2일차", date: "6/21", weather: "비", temp: "24°", place: "우도 (우천 대비)" },
  { day: "3일차", date: "6/22", weather: "흐림", temp: "26°", place: "시내 · 귀가" },
];

function TripStateCard({ premiumReady, shared, onPaywall }) {
  const premiumText = INK(0.78);
  return (
    <BrandCard accent={premiumReady ? PREMIUM : GOLD} style={{ borderRadius: 18, padding: "12px 15px 12px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: premiumReady ? premiumText : GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>여행</div>
          <div style={{ color: INK(0.86), fontSize: 12.2, lineHeight: 1.45 }}>
            {premiumReady ? (shared ? "여정 공유 준비 완료 · 일정/짐 추천 유지" : "프리미엄 여행 플래너 열람 중 · 공유/일정 추가 가능") : "무료 사용자는 구독 후 전체 플래너 저장 가능"}
          </div>
        </div>
        <button onClick={onPaywall} style={{
          height: 30,
          borderRadius: 15,
          padding: "0 10px",
          border: 0,
          background: premiumReady ? NAVY_DARK : GOLD,
          color: premiumReady ? premiumText : NAVY,
          fontSize: 11,
          fontWeight: 900,
          cursor: "pointer",
          fontFamily: "'Noto Sans KR',sans-serif",
          flexShrink: 0,
        }}>{premiumReady ? "열기" : "구독"}</button>
      </div>
    </BrandCard>
  );
}

export default function WeatherON_G3({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab] = useState("출발");
  const [premiumReady, set프리미엄Ready] = useState(Boolean(routeState.premiumActive));
  const [shared, setShared] = useState(Boolean(routeState.shared || (routeState.premiumActive && routeState.resumeTripAction === "share")));
  const [selectedDay, setSelectedDay] = useState(routeState.selectedDay || "1일차");
  const addBtn = usePressTint();
  const shareBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (routeState.selectedDay) setSelectedDay(routeState.selectedDay);
    if (routeState.premiumActive) set프리미엄Ready(true);
    if (routeState.shared || (routeState.premiumActive && routeState.resumeTripAction === "share")) setShared(true);
    if (routeState.premiumActive && routeState.resumeTripAction === "add") {
      navigate?.("G4", { premiumActive: true, accountLinked: true, selectedDay: routeState.selectedDay || selectedDay });
    }
  }, [
    navigate,
    routeState.selectedDay,
    routeState.premiumActive,
    routeState.resumeTripAction,
    routeState.shared,
    selectedDay,
  ]);

  const openPaywall = (resumeTripAction) => {
    navigate?.("G6", {
      returnTo: "G3",
      resumeTripAction,
      selectedDay,
      shared,
    });
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        G3 · 여행 플래너(프리미엄) · 하이브리드 크롬
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 0" }}>
            <button onClick={() => navigate?.("G1")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.94), fontSize: 16, fontWeight: 700, flex: 1 }}>여행 플래너</span>
            <span style={{ background: "rgba(171,142,221,0.18)", color: INK(0.78), fontSize: 10, fontWeight: 900, borderRadius: 6, padding: "3px 8px", border: "1px solid rgba(171,142,221,0.35)" }}>프리미엄</span>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 130px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 118 }}>

            <BrandCard accent={PREMIUM} style={{ borderRadius: 16, padding: "12px 16px" }}>
              <span style={{ color: INK(0.94), fontSize: 14, fontWeight: 700 }}>제주 2박 3일</span>
              <span style={{ color: INK(0.68), fontSize: 11.5, marginLeft: 8, fontFamily: "'DM Mono',monospace", fontWeight: 800 }}>6/20 – 6/22</span>
            </BrandCard>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={() => set프리미엄Ready(false)} style={{
                height: 34, borderRadius: 14, border: `1px solid ${INK(0.10)}`,
                background: !premiumReady ? GOLD : NAVY_DARK,
                color: !premiumReady ? NAVY : INK(0.72),
                fontSize: 11.5, fontWeight: 900, cursor: "pointer",
                fontFamily: "'Noto Sans KR',sans-serif",
              }}>무료 상태</button>
              <button onClick={() => set프리미엄Ready(true)} style={{
                height: 34, borderRadius: 14, border: `1px solid ${INK(0.10)}`,
                background: premiumReady ? GOLD : NAVY_DARK,
                color: premiumReady ? NAVY : INK(0.72),
                fontSize: 11.5, fontWeight: 900, cursor: "pointer",
                fontFamily: "'Noto Sans KR',sans-serif",
              }}>프리미엄 활성</button>
            </div>
            <TripStateCard premiumReady={premiumReady} shared={shared} onPaywall={() => premiumReady ? navigate?.("G5") : openPaywall("upgrade")}/>

            <BrandCard style={{ borderRadius: 18, overflow: "hidden", padding: 0 }}>
              {days.map((d, i) => (
                <div key={d.day} onClick={() => setSelectedDay(d.day)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", cursor: "pointer",
                  borderTop: i === 0 ? "none" : `1px solid ${INK(0.06)}`,
                  background: selectedDay === d.day ? "rgba(240,160,32,0.10)" : "transparent",
                }}>
                  <span style={{ color: selectedDay === d.day ? INK(0.94) : INK(0.82), fontSize: 13, fontWeight: 800, width: 50 }}>{d.day}</span>
                  <span style={{ color: INK(0.68), fontSize: 11, fontWeight: 800, fontFamily: "'DM Mono',monospace", width: 38 }}>{d.date}</span>
                  <span style={{ color: INK(0.76), fontSize: 11.5, fontWeight: 900, minWidth: 26 }}>{d.weather}</span>
                  <span style={{ color: INK(0.85), fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono',monospace", width: 30 }}>{d.temp}</span>
                  <span style={{ flex: 1, color: INK(0.70), fontSize: 12, fontWeight: 700 }}>{d.place}</span>
                  <ChevronRightSVG/>
                </div>
              ))}
            </BrandCard>

            <BrandCard style={{ borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>코디 · 짐 추천</div>
              <div style={{ color: INK(0.82), fontSize: 12.5, lineHeight: 1.7 }}>
                {selectedDay} 기준 · 반팔 3 · 긴팔 1 · 우비/3단 우산 · 방수 신발 · 선크림
              </div>
            </BrandCard>

            <div style={{ display: "flex", gap: 8 }}>
              <button {...addBtn.handlers} onClick={() => premiumReady ? navigate?.("G4", { premiumActive: true, accountLinked: true, selectedDay }) : openPaywall("add")} style={{
                flex: 1, height: 46, borderRadius: 16, background: GOLD, border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
              }}>
                <PressTintOverlay pressed={addBtn.pressed} tint={NAVY}/>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: ON_GOLD, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>일정 추가</span>
              </button>
              <button {...shareBtn.handlers} onClick={() => premiumReady ? setShared(true) : openPaywall("share")} style={{
                flex: 1, height: 46, borderRadius: 16, background: PANEL, border: `1px solid ${INK(0.10)}`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
              }}>
                <PressTintOverlay pressed={shareBtn.pressed} tint={GOLD}/>
                <ShareSVG/>
                <span style={{ fontSize: 13, fontWeight: 600, color: INK(0.85), fontFamily: "'Noto Sans KR', sans-serif" }}>{premiumReady ? (shared ? "공유 준비됨" : "여정 공유") : "구독 후 공유"}</span>
              </button>
            </div>

            <div onClick={() => openPaywall("upgrade")} style={{ background: NAVY_DARK, borderRadius: 14, padding: "10px 14px", border: `1px dashed rgba(171,142,221,0.35)`, textAlign: "center", cursor: "pointer" }}>
              <span style={{ color: INK(0.74), fontSize: 11, fontWeight: 800, fontFamily: "'Noto Sans KR',sans-serif" }}>무료 사용자는 여기서 구독 안내가 노출돼요</span>
            </div>
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: 18, left: 16, right: 16, height: 64,
          background: NAVY_DARK, borderRadius: 24, border: `1px solid ${INK(0.08)}`,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          padding: "0 4px", boxShadow: "0 10px 24px rgba(0,0,0,0.45)", zIndex: 20,
        }}>
          {tabDefs.map(tab => (
            <TabItem key={tab.id} tab={tab} active={tab.id === activeTab} onClick={() => {
              if (tab.id === "홈") navigate?.("H1");
              if (tab.id === "코디") navigate?.("C1");
              if (tab.id === "출발") navigate?.("G1");
              if (tab.id === "MY") navigate?.("M1");
              if (tab.id === "소셜") navigate?.("S0");
            }} />
          ))}
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · G3 여행 플래너(프리미엄)
      </div>
    </div>
  );
}
