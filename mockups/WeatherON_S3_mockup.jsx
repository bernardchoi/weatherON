import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON S3 · 날씨 리액션 (익명 연대) (하이브리드 크롬) ──────────
   와이어프레임 S3 기준:
   - 현재 날씨 기반 리액션 자동 생성
   - 1탭 공감 → 익명 집계 표시(개인 식별 없음)
   - 동일 날씨 유저 도시별 현황
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#2A5D8F';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let SKY       = '#4A8FD4';
const PREMIUM   = '#AB8EDD';
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
function BrandCard({ accent, children, style = {} }) {
  return (
    <div style={{ background: PANEL, borderRadius: 18, position: "relative", overflow: "hidden", flexShrink: 0, ...style }}>
      {accent && <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:accent }}/>}
      {children}
    </div>
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
function UmbrellaSVG({ size = 32, color = SKY }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12a10 10 0 10-20 0z"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M9 21a2 2 0 004 0"/>
    </svg>
  );
}

const cities = [
  { name: "서울", count: 1247, active: true },
  { name: "부산", count: 532, active: false },
  { name: "대구", count: 188, active: false },
];
const anonymousColors = ["#86BCEC", "#79E0C8", "#CDB6F0", "#F0A020", "#8FD0E0"];

export default function WeatherON_S3({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab, setActiveTab] = useState("소셜");
  const [selectedCity, setSelectedCity] = useState("서울");
  const [cityStats, setCityStats] = useState(cities);
  const [reactedCities, setReactedCities] = useState([]);
  const reactBtn = usePressTint();
  const otherBtn = usePressTint();
  const selected = cityStats.find((city) => city.name === selectedCity) || cityStats[0];
  const reacted = reactedCities.includes(selectedCity);
  const routeTab = (id) => {
    setActiveTab(id);
    if (id === "홈") navigate?.("H1");
    if (id === "코디") navigate?.("C1");
    if (id === "출발") navigate?.("G1");
    if (id === "MY") navigate?.("M1");
    if (id === "소셜") navigate?.("S1");
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  const handleReact = () => {
    if (reacted) return;
    setReactedCities((prev) => [...prev, selectedCity]);
    setCityStats((prev) => prev.map((city) => (
      city.name === selectedCity ? { ...city, count: city.count + 1 } : city
    )));
  };
  const showNextCity = () => {
    const currentIndex = cityStats.findIndex((city) => city.name === selectedCity);
    const next = cityStats[(currentIndex + 1) % cityStats.length];
    setSelectedCity(next.name);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        S3 · 날씨 리액션(익명 연대) · 하이브리드 크롬
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
          <div style={{ padding: "16px 20px 0" }}>
            <span style={{ color: INK(0.94), fontSize: 18, fontWeight: 700 }}>날씨 리액션</span>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 130px)", overflowY: "auto", paddingBottom: 90 }}>

            <BrandCard accent={SKY} style={{ padding: "20px 18px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><UmbrellaSVG/></div>
              <div style={{ color: INK(0.72), fontSize: 10.5, fontWeight: 700, marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>현재 날씨 · {selectedCity} — 폭우</div>
              <div style={{ color: INK(0.94), fontSize: 15, fontWeight: 700 }}>"다들 고생중"</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginTop:10 }}>
                {anonymousColors.map((color, index) => (
                  <div key={color} style={{
                    width:24, height:24, borderRadius:"50%", background:color,
                    border:`2px solid ${PANEL}`, marginLeft:index === 0 ? 0 : -7,
                    boxShadow:"0 4px 10px rgba(0,0,0,0.18)",
                  }}/>
                ))}
                <span style={{ color: INK(0.74), fontSize: 11.5, marginLeft:8 }}>같은 날씨 동행 중</span>
              </div>
            </BrandCard>

            <BrandCard style={{ padding: "16px", textAlign: "center" }}>
              <div style={{ color: INK(0.85), fontSize: 14 }}>
                이 도시 <b style={{ color: INK(0.94), fontSize: 18, fontFamily: "'DM Mono',monospace" }}>{selected.count.toLocaleString()}명</b>이 같은 날씨 중
              </div>
            </BrandCard>

            <div style={{ display: "flex", gap: 8 }}>
              <button {...reactBtn.handlers} onClick={handleReact} style={{
                flex: 1, height: 48, borderRadius: 16,
                background: reacted ? "rgba(74,143,212,0.18)" : SKY,
                border: reacted ? "1px solid rgba(74,143,212,0.40)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                cursor: reacted ? "default" : "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
              }}>
                {!reacted && <PressTintOverlay pressed={reactBtn.pressed} tint={NAVY}/>}
                <span style={{ fontSize: 14, fontWeight: 700, color: reacted ? INK(0.90) : ON_GOLD, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {reacted ? "공감했어요" : "공감하기"}
                </span>
              </button>
              <button {...otherBtn.handlers} onClick={showNextCity} style={{
                flex: 1, height: 48, borderRadius: 16, background: PANEL, border: `1px solid ${INK(0.10)}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
              }}>
                <PressTintOverlay pressed={otherBtn.pressed} tint={GOLD}/>
                <span style={{ color: INK(0.85), fontSize: 13, fontWeight: 600 }}>다른 도시 보기</span>
              </button>
            </div>

            <BrandCard style={{ overflow: "hidden", padding: 0 }}>
              <div style={{ padding: "12px 16px 8px", color: INK(0.72), fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>도시별 현황</div>
              {cities.map((c, i) => (
                <div key={c.name} onClick={() => setSelectedCity(c.name)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: `1px solid ${INK(0.06)}`, background: c.name === selectedCity ? "rgba(74,143,212,0.08)" : "transparent", cursor: "pointer" }}>
                  <span style={{ color: c.name === selectedCity ? INK(0.86) : INK(0.70), fontSize: 13, fontWeight: c.name === selectedCity ? 700 : 500 }}>{c.name}</span>
                  <span style={{ color: c.name === selectedCity ? INK(0.78) : INK(0.66), fontSize: 12, fontFamily: "'DM Mono',monospace" }}>{(cityStats.find(city => city.name === c.name)?.count || c.count).toLocaleString()}명</span>
                </div>
              ))}
            </BrandCard>

            <div style={{ background: NAVY_DARK, borderRadius: 14, padding: "10px 14px" }}>
              <div style={{ color: INK(0.66), fontSize: 11, textAlign: "center", lineHeight: 1.6 }}>
                익명 집계 · 공감 1탭 → 개인 식별 없이 집계만 표시돼요
              </div>
            </div>

            {reacted && (
              <BrandCard accent={SKY} style={{ padding: "12px 14px" }}>
                <div style={{ color: INK(0.92), fontSize: 13, fontWeight: 800, marginBottom: 5 }}>비 컴패니언 반응</div>
                <div style={{ color: INK(0.76), fontSize: 12, lineHeight: 1.55 }}>
                  공감이 광장에 반영됐어요 · 포인트 +2 · 비 오는 날 배지 조각 1개
                </div>
              </BrandCard>
            )}

            <BrandCard style={{ padding: "12px 14px", border: `1px solid ${SKY}33` }}>
              <div style={{ color: INK(0.74), fontSize: 10.5, fontWeight: 800, marginBottom: 5, fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em" }}>리액션</div>
              <div style={{ color: INK(0.84), fontSize: 12, lineHeight: 1.55 }}>
                {selectedCity} 선택 · {reacted ? "공감 완료 · 보상 반영" : "공감 전"} · 익명 집계만 표시
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
        WeatherON · S3 날씨 리액션
      </div>
    </div>
  );
}
