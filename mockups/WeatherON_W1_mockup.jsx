import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON W1 · 홈 + 제보 버튼 + 주변 제보 카드 (하이브리드 크롬) ──
   와이어프레임 W1 기준 (08·COMMUNITY REPORT 섹션, H1 홈의 CWR 변형):
   - F2: 홈에 "주변 날씨 제보" 카드 항시 표시(미확정=소프트, 확정=강조)
   - 제보 버튼 탭 → W2 제보 화면
   - 주변 제보 카드 탭 → 상세 오버레이(확정 시 홈 날씨 위에 표시)
   - v2.0 출시 · MAU 5만 달성 후 활성화 기능(CWR)
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
   기준 레이아웃: WeatherON_H1_mockup.jsx(홈 메인)에 CWR 카드·제보 CTA만 추가
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
function CloudSVG({ size = 18, color = MISTLITE(0.85) }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round"><path d="M6 16a4 4 0 014-4h6a3 3 0 010 6H7a3 3 0 01-3-3 3 3 0 013-3"/></svg>;
}
function RainDropSVG({ size = 18, color = SKY }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <line x1="8" y1="19" x2="8" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <line x1="16" y1="19" x2="16" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <path d="M20 16.4A5 5 0 0017 7h-1.26A8 8 0 104 15.25" stroke={INK(0.70)} strokeWidth={1.4} strokeLinecap="round"/>
    </svg>
  );
}
function BoltSVG({ size = 16, color = NAVY }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function BellSVG() {
  return <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
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

export default function WeatherON_W1({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab, setActiveTab] = useState("홈");
  const [cwrState, setCwrState] = useState("미확정 주변 제보 확인");
  const reportBtn = usePressTint();
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
        W1 · 홈 + 제보 버튼 + 주변 제보 카드 · 하이브리드 크롬
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
              <span style={{ fontSize: 13.5, fontWeight: 500, color: INK(0.92) }}>서울 마포구</span>
            </div>
            <div style={{ position: "absolute", right: 20, width: 40, height: 40, background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BellSVG/>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0 16px" }}>
            <CloudSVG size={48} color={MISTLITE(0.85)}/>
            <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 500, fontSize: 56, color: INK(0.94), marginTop: 6, lineHeight: 1 }}>18°</div>
            <div style={{ fontSize: 15, color: MIST, marginTop: 6 }}>흐림</div>
          </div>

          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 280px)", overflowY: "auto", paddingBottom: 90 }}>

            <BrandCard accent={CLEAR} style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: MIST, marginBottom: 6 }}>코디 · 우산 · 신발</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: INK(0.94) }}>가디건 + 청바지 · 접이식 우산 권장</div>
            </BrandCard>

            {/* CWR 주변 제보 카드 — 미확정(소프트) 상태 */}
            <BrandCard accent={WARM} onClick={() => { setCwrState("주변 제보 상세 확인"); navigate?.("W3"); }} style={{ padding: "14px 16px 14px 19px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ color: INK(0.92), fontSize: 13 }}>현장</span>
                <span style={{ color: INK(0.92), fontSize: 11.5, fontWeight: 700 }}>주변 날씨 제보</span>
              </div>
              <div style={{ color: INK(0.76), fontSize: 11, marginBottom: 8 }}>반경 1km · 최근 30분</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(232,133,74,0.14)", color: WARM, fontSize: 10.5, fontWeight: 600, borderRadius: 14, padding: "4px 9px" }}><RainDropSVG size={11} color={WARM}/> 비 2명</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(232,133,74,0.14)", color: WARM, fontSize: 10.5, fontWeight: 600, borderRadius: 14, padding: "4px 9px" }}><CloudSVG size={11} color={WARM}/> 흐림 1명</span>
              </div>
              <div style={{ color: INK(0.74), fontSize: 10.5 }}>미확정 (3건 미충족)</div>
            </BrandCard>

            <BrandCard style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: MIST, marginBottom: 6 }}>오늘 이 날씨엔</div>
              <div style={{ fontSize: 13, color: INK(0.82) }}>근처 인도어 카페 추천</div>
            </BrandCard>

            <BrandCard style={{ padding: "12px 14px", border: `1px solid ${WARM}33` }}>
              <div style={{ color: INK(0.86), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>주변 제보</div>
              <div style={{ color: INK(0.78), fontSize: 12, lineHeight: 1.55 }}>
                v2.0 보조 참여 · {cwrState} · 제보 버튼은 W2로 연결
              </div>
            </BrandCard>

            {/* CWR 제보 버튼 — 브랜드 모먼트(Gold) 대신 CWR 전용 Warm 톤 고정 */}
            <button {...reportBtn.handlers} onClick={() => { setCwrState("제보 작성 진입"); navigate?.("W2"); }} style={{
              height: 50, borderRadius: 18, background: WARM, border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
              boxShadow: "0 6px 16px rgba(0,0,0,0.30)",
            }}>
              <PressTintOverlay pressed={reportBtn.pressed} tint={NAVY}/>
              <BoltSVG color={ON_GOLD}/>
              <span style={{ fontSize: 14, fontWeight: 700, color: ON_GOLD, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>지금 날씨 제보하기</span>
            </button>
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
        WeatherON · W1 홈 + 제보 버튼 + 주변 제보 카드
      </div>
    </div>
  );
}
