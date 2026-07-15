import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON S0 · 원소 컴패니언 만나보기 (최초 진입) (하이브리드 크롬) ─
   와이어프레임 S0 기준: ON Square(소셜 탭) 최초 진입 시 1회만 노출
   - 대표 마스코트로 시작하고 Solar · Rain · Storm · Wind · Frost · Mist 6종을 미리보기
   - 날씨 체크인으로 해당 원소 컴패니언을 수집하고 XP 자동 적립
   - 기존 유저는 내 ON Square(S1)로 바로 이동
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
   ※ 원소 컬러는 기존 브랜드/기능색 토큰을 재사용(Solar=Gold, Rain=Sky,
     Storm=프리미엄 퍼플, Wind=Clear, Mist=Mist) — Frost만 신규(빙청색).
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
const FROST     = '#8FD0E0';
let MIST      = '#E4F2FF';
const HERO_ART  = new URL("../brand/ON Square 대표마스코트_기본_투명-v1.png", import.meta.url).href;
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
function BrandCard({ children, style = {} }) {
  return <div style={{ background: PANEL, borderRadius: 18, ...style }}>{children}</div>;
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

const companionArt = {
  Solar: new URL("../brand/ON Square Solar_컴패니언_앱-v1.png", import.meta.url).href,
  Rain: new URL("../brand/ON Square Rain_컴패니언_앱-v1.png", import.meta.url).href,
  Storm: new URL("../brand/ON Square Storm_컴패니언_앱-v1.png", import.meta.url).href,
  Wind: new URL("../brand/ON Square Wind_컴패니언_앱-v1.png", import.meta.url).href,
  Frost: new URL("../brand/ON Square Frost_컴패니언_앱-v1.png", import.meta.url).href,
  Mist: new URL("../brand/ON Square Mist_컴패니언_앱-v1.png", import.meta.url).href,
};

const elements = [
  { id: "Solar", label: "태양", color: GOLD, art: companionArt.Solar },
  { id: "Rain", label: "비", color: SKY, art: companionArt.Rain },
  { id: "Storm", label: "폭풍", color: PREMIUM, art: companionArt.Storm },
  { id: "Wind", label: "바람", color: CLEAR, art: companionArt.Wind },
  { id: "Frost", label: "서리", color: FROST, art: companionArt.Frost },
  { id: "Mist", label: "안개", color: MIST, art: companionArt.Mist },
];

function CompanionAvatar({ element, size = 54 }) {
  return <img src={element.art} alt={`${element.id} 컴패니언`} style={{
    width:size, height:size, flex:"0 0 auto", borderRadius:"34%", objectFit:"cover",
    filter:"drop-shadow(0 5px 10px rgba(16,33,64,0.30))",
  }}/>;
}

function ElementChip({ el, selected, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <button onClick={onClick} {...handlers} style={{
      padding: "10px 8px", borderRadius: 16,
      background: selected ? `${el.color}22` : NAVY_DARK,
      border: selected ? `1.5px solid ${el.color}` : `1px solid ${INK(0.12)}`,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      {!selected && <PressTintOverlay pressed={pressed} tint={el.color}/>}
      <CompanionAvatar element={el} size={28}/>
      <span style={{ color: selected ? INK(0.94) : INK(0.78), fontSize: 12, fontWeight: selected ? 700 : 600, fontFamily: "'Noto Sans KR',sans-serif" }}>{el.label}</span>
    </button>
  );
}

export default function WeatherON_S0({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab, setActiveTab] = useState("소셜");
  const [selected, setSelected] = useState("Mist");
  const enterBtn = usePressTint();
  const current = elements.find(e => e.id === selected);
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

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        S0 · 대표 마스코트 시작 · 컴패니언 미리보기 · 하이브리드 크롬
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
            <span style={{ color: INK(0.94), fontSize: 18, fontWeight: 700 }}>온스퀘어 입장</span>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 130px)", overflowY: "auto", paddingBottom: 156 }}>

            <BrandCard style={{ padding: "14px 16px" }}>
              <div style={{ color: INK(0.94), fontSize: 14, fontWeight: 700, marginBottom: 6 }}>원소 컴패니언을 만나보세요</div>
              <div style={{ color: INK(0.78), fontSize: 12, lineHeight: 1.6 }}>
                대표 마스코트와 함께 날씨를 체크인하면 작은 원소 친구를 수집할 수 있어요.
              </div>
            </BrandCard>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {elements.map(el => (
                <ElementChip key={el.id} el={el} selected={selected === el.id} onClick={() => setSelected(el.id)}/>
              ))}
            </div>

            <div style={{
              height: 160, borderRadius: 20, background: NAVY_DARK,
              border: `1px dashed ${current.color}55`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
            }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                <img src={HERO_ART} alt="WeatherON 대표 마스코트" style={{ width:92, height:92, objectFit:"cover", borderRadius:24 }}/>
                <span style={{ color:GOLD, fontSize:11.5, fontWeight:700 }}>대표로 시작</span>
              </div>
              <span aria-hidden="true" style={{ color:INK(0.78), fontSize:18 }}>+</span>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                <CompanionAvatar element={current} size={92}/>
                <span style={{ color: INK(0.92), fontSize:11.5, fontWeight:700 }}>{current.label} 수집 가능</span>
              </div>
            </div>

            <BrandCard style={{ padding: "12px 14px", border: `1px solid ${current.color}33` }}>
              <div style={{ color: INK(0.86), fontSize: 10.5, fontWeight: 800, marginBottom: 5, fontFamily: "'Noto Sans KR',sans-serif", letterSpacing: "0" }}>온스퀘어</div>
              <div style={{ color: INK(0.84), fontSize: 12, lineHeight: 1.55 }}>
                최초 진입 · 대표 마스코트 즉시 부여 · {current.label} 컴패니언 미리보기 선택 중
              </div>
            </BrandCard>
          </div>
        </div>

        <div style={{ position: "absolute", left: 20, right: 20, bottom: 90 }}>
          <button {...enterBtn.handlers} onClick={() => navigate?.("S1")} style={{
            width: "100%", height: 52, borderRadius: 18, background: GOLD, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
            boxShadow: "0 6px 16px rgba(0,0,0,0.30)",
          }}>
            <PressTintOverlay pressed={enterBtn.pressed} tint={NAVY}/>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: ON_GOLD, fontFamily: "'Noto Sans KR',sans-serif" }}>대표 마스코트로 온스퀘어 시작</span>
          </button>
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
        WeatherON · S0 대표 마스코트 시작 · 컴패니언 수집 안내
      </div>
    </div>
  );
}
