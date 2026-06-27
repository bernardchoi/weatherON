import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON H4 · 우산 추천 상세 (하이브리드 크롬) ───────────────────
   와이어프레임 H4 기준: 우산 종류 추천 + 강수 바 차트 + 비교
   - 추천: 3단 우산 (강수량 보통·바람 약함·휴대성 우선)
   - 추천 이유 (18~21시 비 · 4mm/h · 풍속 3m/s)
   - 시간대별 강수확률 바 차트
   - 우산 종류 비교 (1단/2단/3단/장우산)
   - 우산 알림 시간 설정 → M2b
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#10243F';
let NAVY_DARK = '#17365D';
let PANEL     = '#214A78';
let PANEL_L1  = '#2A5D8F';
let GOLD      = '#F4B63F';
let ON_GOLD  = '#10243F';
let SKY       = '#4AA3DF';
let CLEAR     = '#2FC6A3';
let MIST      = '#B9CBE0';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(185,203,224,${a})`;


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
      color: active ? GOLD : INK(0.66), transition:"color 0.15s ease", // 비활성 탭은 라이트모드 대비 보정
    }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      <div style={{ width:5, height:5, borderRadius:"50%", background: active ? GOLD : "transparent", marginBottom:1 }}/>
      {tab.icon}
      <span style={{ fontSize:10.5, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{_tabLabel}</span>
    </button>
  );
}

const rainBars = [
  { time: "15시", prob: 10 }, { time: "16시", prob: 15 }, { time: "17시", prob: 40 },
  { time: "18시", prob: 80 }, { time: "19시", prob: 85 }, { time: "20시", prob: 60 }, { time: "21시", prob: 20 },
];

/* ── 우산/시계/날씨메트릭 아이콘 — brand/WeatherON_아이콘_시스템.md 기준 ── */
function UmbrellaSVG({ size = 16, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12a10 10 0 10-20 0z"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M9 21a2 2 0 004 0"/>
    </svg>
  );
}
function ClockSVG({ size = 14, color = MISTLITE(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 7 12 12 16 14"/>
    </svg>
  );
}
function RainDropSVG({ size = 14, color = SKY }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <line x1="8" y1="19" x2="8" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <line x1="16" y1="19" x2="16" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <path d="M20 16.4A5 5 0 0017 7h-1.26A8 8 0 104 15.25" stroke={MISTLITE(0.70)} strokeWidth={1.4} strokeLinecap="round"/>
    </svg>
  );
}
function WindSVG({ size = 14, color = MISTLITE(0.90) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/>
    </svg>
  );
}

const umbrellaTypes = [
  { type: "1단 장우산", icon: <UmbrellaSVG size={18} color={MISTLITE(0.75)}/>, desc: "강풍·장시간", best: false },
  { type: "2단 우산", icon: <UmbrellaSVG size={18} color={MISTLITE(0.75)}/>, desc: "균형·범용", best: false },
  { type: "3단 우산", icon: <UmbrellaSVG size={18} color="#fff"/>, desc: "휴대성·보통강도", best: true },
  { type: "장우산", icon: <UmbrellaSVG size={18} color={MISTLITE(0.75)}/>, desc: "폭우·전신 커버", best: false },
];

export default function WeatherON_H4({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const isLight = weatherTheme.mode === "light";
  const [activeTab, setActiveTab] = useState("홈");
  const [alertReady, setAlertReady] = useState(Boolean(routeState.alertReady));
  const backBtn = usePressTint();
  const alertBtn = usePressTint();
  const goHome = () => navigate?.("H1", { umbrellaSignalReviewed: true });
  const routeTab = (id) => {
    setActiveTab(id);
    if (id === "홈") goHome();
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
        H4 · 우산 추천 상세 · 하이브리드 크롬
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

        <div style={{ paddingTop:54 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 0" }}>
            <button {...backBtn.handlers} onClick={goHome} aria-label="뒤로" style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position:"relative", overflow:"hidden" }}>
              <PressTintOverlay pressed={backBtn.pressed} tint={GOLD}/>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span style={{ color: INK(0.94), fontSize: 18, fontWeight: 700 }}>우산 추천</span>
          </div>

          {/* Content */}
          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", height: "calc(852px - 250px)", paddingBottom: 18 }}>

            {/* 메인 추천 카드 */}
            <BrandCard accent={SKY} style={{ borderRadius: 20, padding: "20px 20px 20px 23px", textAlign: "center" }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom: 8 }}>
                <UmbrellaSVG size={36} color={isLight ? SKY : "#fff"}/>
              </div>
              <div style={{ color: INK(0.94), fontSize: 20, fontWeight: 800 }}>오늘은 3단 우산</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {["강수량 보통", "바람 약함", "휴대성 우선"].map(tag => (
                  <span key={tag} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.12)}`, borderRadius: 20, padding: "4px 10px", color: INK(0.85), fontSize: 11 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </BrandCard>

            {/* 추천 이유 */}
            <BrandCard style={{ borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>추천 이유</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { icon: <ClockSVG size={14} color={MISTLITE(0.85)}/>, text: "18시~21시 비 예보" },
                  { icon: <RainDropSVG size={14}/>, text: "시간당 4mm · 보통 강도" },
                  { icon: <WindSVG size={14}/>, text: "풍속 초속 3m — 3단 우산으로 충분" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {item.icon}
                    <span style={{ color: INK(0.78), fontSize: 13 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </BrandCard>

            {/* 강수확률 바 차트 */}
            <BrandCard style={{ borderRadius: 16, padding: "12px 14px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>시간대별 강수확률</div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${rainBars.length}, 1fr)`, alignItems: "end", gap: 6, height: 64 }}>
                {rainBars.map((bar, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateRows: "48px 12px", rowGap: 4, alignItems: "end", minWidth: 0 }}>
                    <div style={{ width: "100%", height: 48, display: "flex", alignItems: "flex-end" }}>
                      <div style={{
                        width: "100%", height: `${bar.prob}%`, minHeight: 4,
                        background: bar.prob >= 70 ? SKY : bar.prob >= 40 ? "rgba(74,143,212,0.55)" : "rgba(74,143,212,0.25)",
                        borderRadius: "4px 4px 2px 2px",
                      }} />
                    </div>
                    <span style={{ color: INK(0.72), fontSize: 9.5, fontWeight: 800, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", lineHeight: "12px", textAlign: "center" }}>{bar.prob}%</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ color: INK(0.68), fontSize: 10, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 800 }}>15시</span>
                <span style={{ color: INK(0.68), fontSize: 10, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 800 }}>21시</span>
              </div>
            </BrandCard>

            {/* 우산 종류 비교 */}
            <BrandCard style={{ borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>우산 종류 비교</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {umbrellaTypes.map((u) => (
                  <div key={u.type} style={{
                    minHeight: 46,
                    borderRadius: 13,
                    background: u.best
                      ? isLight ? "rgba(74,163,223,0.18)" : "rgba(74,163,223,0.16)"
                      : isLight ? "rgba(234,243,250,0.92)" : "rgba(23,54,93,0.62)",
                    border: `1px solid ${u.best ? "rgba(74,163,223,0.42)" : isLight ? "rgba(31,78,121,0.14)" : INK(0.07)}`,
                    padding: "7px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 0,
                  }}>
                    <UmbrellaSVG size={18} color={u.best ? (isLight ? SKY : "#fff") : INK(0.82)}/>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: u.best ? isLight ? INK(0.94) : "#fff" : INK(0.82), fontSize: 11.8, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.type}</div>
                      <div style={{ color: INK(0.72), fontSize: 10.5, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {u.best ? "추천 · " : ""}{u.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BrandCard>

          </div>

          {/* 알림 설정 CTA */}
          <button {...alertBtn.handlers} onClick={() => {
            setAlertReady(true);
            navigate?.("M2", {
              returnTo: "H4",
              originReturnTo: "H4",
              alertFocus: "umbrella",
              resumeAlertSettings: true,
              alertReady: true,
              umbrellaSignalReviewed: true,
            });
          }} style={{
            position: "absolute", left: 20, right: 20, bottom: 92, zIndex: 22,
            minHeight: 50, padding: "14px", borderRadius: 16,
            background: alertReady ? "rgba(47,198,163,0.16)" : GOLD,
            border: alertReady ? "1px solid rgba(47,198,163,0.30)" : "none",
            color: alertReady ? CLEAR : NAVY, fontSize: 13, fontWeight: 800, cursor: "pointer",
            fontFamily: "'Noto Sans KR', sans-serif", overflow:'hidden', flexShrink: 0,
            boxShadow: isLight ? "0 10px 20px rgba(31,78,121,0.18)" : "0 10px 22px rgba(0,0,0,0.32)",
          }}>
            <PressTintOverlay pressed={alertBtn.pressed} tint={GOLD}/>
            우산 알림 시간 설정
          </button>
        </div>

        {/* Tab Bar */}
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
        WeatherON · H4 우산 추천 상세
      </div>
    </div>
  );
}
