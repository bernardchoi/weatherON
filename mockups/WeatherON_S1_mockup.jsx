import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON S1 · 내 ON Square (대표 + 동행 컴패니언) ──────────────
   와이어프레임 S1 기준:
   - 대표 마스코트가 메인 캐릭터로 상시 노출
   - 오늘의 동행 컴패니언 · 레벨 · XP 바 · 날씨 무드 자동 반영
   - 오늘 날씨 체크인 완료 시 XP 적립 피드백
   - 희귀 기상 이벤트 시 레어 배지 드랍
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#1D5A86';
let NAVY_DARK = '#276A96';
let PANEL     = '#2B719D';
let PANEL_L1  = '#3D87B5';
let GOLD      = '#F0A020';
let ON_GOLD  = '#123858';
let SKY       = '#4A8FD4';
let MIST      = '#E4F2FF';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(228,242,255,${a})`;
const HERO_ART  = new URL("../brand/ON Square 대표마스코트_기본_투명-v1.png", import.meta.url).href;

const COMPANION_ART = {
  Solar: new URL("../brand/ON Square Solar_컴패니언_앱-v1.png", import.meta.url).href,
  Rain: new URL("../brand/ON Square Rain_컴패니언_앱-v1.png", import.meta.url).href,
  Storm: new URL("../brand/ON Square Storm_컴패니언_앱-v1.png", import.meta.url).href,
  Wind: new URL("../brand/ON Square Wind_컴패니언_앱-v1.png", import.meta.url).href,
  Frost: new URL("../brand/ON Square Frost_컴패니언_앱-v1.png", import.meta.url).href,
  Mist: new URL("../brand/ON Square Mist_컴패니언_앱-v1.png", import.meta.url).href,
};

const COMPANIONS = {
  Solar: { label:'태양', color:'#F0A020', dark:'#C77A12', mood:'맑음' },
  Rain:  { label:'비', color:'#86BCEC', dark:'#4A8FD4', mood:'비옴' },
  Storm: { label:'폭풍', color:'#CDB6F0', dark:'#7E5FC0', mood:'폭풍' },
  Wind:  { label:'바람', color:'#79E0C8', dark:'#3ABFA0', mood:'바람' },
  Frost: { label:'서리', color:'#C2EAF2', dark:'#8FD0E0', mood:'서리' },
  Mist:  { label:'안개', color:'#C5BCE8', dark:'#869EBC', mood:'안개' },
};


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
function CompanionAvatar({ id, size = 126 }) {
  return <img src={COMPANION_ART[id] || COMPANION_ART.Mist} alt={`${id} 컴패니언`} style={{
    width:size, height:size, borderRadius:"24%", flex:"0 0 auto", objectFit:"cover",
    filter:"drop-shadow(0 10px 18px rgba(16,33,64,0.38))",
  }}/>;
}

function HeroMascot({ size = 142 }) {
  return <img src={HERO_ART} alt="WeatherON 대표 마스코트" style={{
    width:size, height:size, borderRadius:"26%", objectFit:"cover",
    filter:"drop-shadow(0 12px 22px rgba(16,33,64,0.42))",
  }}/>;
}

export default function WeatherON_S1({ elementId = "Mist", navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const isLight = weatherTheme.mode === "light";
  const [activeTab, setActiveTab] = useState("소셜");
  const [checkedIn, setCheckedIn] = useState(Boolean(routeState.squareCheckedIn));
  const [xp, setXp] = useState(routeState.squareCheckedIn ? 370 : 340);
  const [cp, setCp] = useState(routeState.squareCheckedIn ? 352 : 340);
  const [missionMessage, setMissionMessage] = useState("비 오는 동네에 우산 제보가 필요해요");
  const checkInBtn = usePressTint();
  const companion = COMPANIONS[elementId] || COMPANIONS.Mist;
  const companionId = COMPANIONS[elementId] ? elementId : "Mist";
  const companionLabel = companion.label;
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

  const xpMax = 500;
  const handleCheckIn = () => {
    if (checkedIn) return;
    setCheckedIn(true);
    setXp((value) => Math.min(value + 30, xpMax));
    setCp((value) => value + 12);
    setMissionMessage(`${companionLabel} 컴패니언이 오늘 날씨를 기억했어요`);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        S1 · 내 온스퀘어 · 대표 + 동행 컴패니언 · 하이브리드 크롬
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
            <span style={{ color: INK(0.94), fontSize: 18, fontWeight: 700 }}>내 온스퀘어</span>
            <span style={{ background: "rgba(240,160,32,0.16)", color: INK(0.78), fontSize: 11, fontWeight: 700, borderRadius: 12, padding: "5px 10px", border: "1px solid rgba(240,160,32,0.35)" }}>{cp} 포인트</span>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 130px)", overflowY: "auto", paddingBottom: 90 }}>

            <BrandCard accent={checkedIn ? companion.color : GOLD} style={{ padding: "14px 16px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ color: INK(0.72), fontSize: 10.5, fontWeight: 800, letterSpacing:"0.08em", marginBottom:5 }}>오늘의 날씨 미션</div>
                  <div style={{ color: INK(0.94), fontSize: 14.5, fontWeight: 800, lineHeight:1.35 }}>{missionMessage}</div>
                  <div style={{ color: INK(0.70), fontSize: 11, marginTop:5 }}>{checkedIn ? "보상 반영 완료 · 다음 미션 열림" : "체크인하면 경험치와 포인트를 받아요"}</div>
                </div>
                <button {...checkInBtn.handlers} onClick={handleCheckIn} style={{
                  width:94, height:42, borderRadius:14, border:"none",
                  background: checkedIn ? NAVY_DARK : GOLD,
                  color: checkedIn ? INK(0.82) : ON_GOLD,
                  fontSize:12.5, fontWeight:800, cursor: checkedIn ? "default" : "pointer",
                  position:"relative", overflow:"hidden", flexShrink:0,
                }}>
                  {!checkedIn && <PressTintOverlay pressed={checkInBtn.pressed} tint={NAVY}/>}
                  {checkedIn ? "완료" : "체크인"}
                </button>
              </div>
            </BrandCard>

            <BrandCard accent={GOLD} style={{
              height: 142, display: "flex", alignItems: "center", justifyContent: "center", gap:14,
              background: isLight
                ? `radial-gradient(circle at 42% 34%, rgba(194,65,12,0.12), transparent 46%), linear-gradient(160deg, #FFFFFF 0%, #EAF3FA 100%)`
                : `radial-gradient(circle at 50% 38%, rgba(240,160,32,0.20), transparent 48%), linear-gradient(160deg, ${PANEL} 0%, #3D87B5 100%)`,
              border: isLight ? "1px solid rgba(31,78,121,0.12)" : "none",
              boxShadow: isLight ? "0 12px 26px rgba(31,78,121,0.12)" : "none",
            }}>
              <HeroMascot size={104}/>
              <div style={{ maxWidth:118 }}>
                <div style={{ color: INK(0.84), fontSize:11, fontWeight:800, marginBottom:6 }}>내 대표</div>
                <div style={{ color: INK(0.94), fontSize:14, fontWeight:800, lineHeight:1.4 }}>{checkedIn ? "오늘 날씨를 기록했어요" : "WeatherON 대표 마스코트"}</div>
                <div style={{ color: INK(0.78), fontSize:10.5, lineHeight:1.5, marginTop:5 }}>{checkedIn ? "젬이 켜지고 동네 광장 상태가 갱신됐어요" : "모든 날씨를 함께 경험하는 기본 캐릭터"}</div>
              </div>
            </BrandCard>

            <BrandCard accent={companion.color} style={{ padding: "14px 16px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <CompanionAvatar id={companionId} size={70}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ color: INK(0.94), fontSize:14, fontWeight:800 }}>오늘의 동행 · {companionLabel} 레벨 7</span>
                    <span style={{ background:`${companion.color}29`, color:INK(0.78), fontSize:10, fontWeight:700, borderRadius:10, padding:"3px 7px" }}>{companion.mood}</span>
                  </div>
                  <div style={{ height:8, borderRadius:4, background:NAVY_DARK, overflow:"hidden", marginBottom:6 }}>
                    <div style={{ width:`${(xp/xpMax)*100}%`, height:"100%", background:`linear-gradient(90deg, ${companion.dark}, ${companion.color})`, borderRadius:4 }}/>
                  </div>
                  <div style={{ color:INK(0.70), fontSize:11, fontFamily:"'Noto Sans KR',sans-serif" }}>경험치 {xp} / {xpMax}</div>
                </div>
              </div>
            </BrandCard>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8 }}>
              {[
                ["제보", "6건"],
                ["공감", checkedIn ? "1,248" : "1,247"],
                ["도움", checkedIn ? "13" : "12"],
              ].map(([label, value]) => (
                <BrandCard key={label} style={{ padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ color:INK(0.94), fontSize:16, fontWeight:900, fontFamily:"'DM Mono',monospace" }}>{value}</div>
                  <div style={{ color:INK(0.68), fontSize:10.5, marginTop:2 }}>{label}</div>
                </BrandCard>
              ))}
            </div>

            <BrandCard style={{ padding: "12px 14px", border: `1px solid ${companion.color}33` }}>
              <div style={{ color: INK(0.78), fontSize: 10.5, fontWeight: 800, marginBottom: 5, fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em" }}>광장 상태</div>
              <div style={{ color: INK(0.84), fontSize: 12, lineHeight: 1.55 }}>
                {checkedIn ? `체크인 완료 · ${companionLabel} 동행 강화 · 다음 미션 대기` : `${companionLabel} 동행 활성 · 체크인 전 · 노트와 리액션 참여 가능`}
              </div>
            </BrandCard>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={() => navigate?.("S2", { squareCheckedIn: checkedIn })} style={{
                minHeight: 56, borderRadius: 16, background: NAVY_DARK, border: `1px solid ${INK(0.10)}`,
                color: INK(0.86), fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              }}>날씨 노트</button>
              <button onClick={() => navigate?.("S3", { squareCheckedIn: checkedIn })} style={{
                minHeight: 56, borderRadius: 16, background: NAVY_DARK, border: `1px solid ${INK(0.10)}`,
                color: INK(0.86), fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              }}>날씨 리액션</button>
            </div>

            <div style={{
              borderRadius: 18, background: PANEL, border: `1px dashed ${INK(0.16)}`,
              padding: "14px 16px", textAlign: "center",
            }}>
              <div style={{ color: INK(0.86), fontSize: 13, fontWeight:800, marginBottom: 5 }}>오늘의 보상</div>
              <div style={{ color: INK(0.70), fontSize: 12 }}>{checkedIn ? "비 오는 날 배지 조각 1개 획득" : "체크인하면 날씨 배지 조각을 받을 수 있어요"}</div>
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
            <TabItem key={tab.id} tab={tab} active={tab.id === activeTab} onClick={() => routeTab(tab.id)} />
          ))}
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · S1 내 온스퀘어 · 대표 + 컴패니언
      </div>
    </div>
  );
}
