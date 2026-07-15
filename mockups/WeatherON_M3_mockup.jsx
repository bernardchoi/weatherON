import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON M3 · 전역 설정 (하이브리드 크롬) ────────────────────────
   와이어프레임 M3 기준: Z1~Z4 — 단위 / 위치 / 테마 / 권한
   - 단위 설정(Z1): 온도(°C/°F) · 무게(kg/g·lb) · 거리(m/km·mi) 세그먼트
   - 위치 관리(Z2): 저장 위치 개수 표시
   - 테마(Z3): 시스템/라이트/다크 3단 세그먼트
   - 알림 권한 관리(Z4): 시스템 설정으로 이동(↗)
   - 기본값: 섭씨 · kg/g · m/km
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
   ※ 라이트/다크 토큰 스펙: docs/planning/WeatherON_planning_v5.html 20장
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#1D5A86';
let NAVY_DARK = '#276A96';
let PANEL     = '#2B719D';
let PANEL_L1  = '#3D87B5';
let GOLD      = '#F0A020';
let ON_GOLD  = '#123858';
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
function BrandCard({ children, style = {}, onClick }) {
  const { pressed, handlers } = usePressTint();
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} {...(onClick ? handlers : {})} {...(onClick ? { type: "button" } : {})} style={{
      ...(onClick ? { appearance:"none", border:"none", font:"inherit", color:"inherit", textAlign:"left", width:"100%" } : {}),
      background: PANEL, borderRadius: 20, position: "relative", overflow: "hidden", flexShrink: 0,
      boxShadow: "0 6px 16px rgba(0,0,0,0.30)", cursor: onClick ? "pointer" : "default", ...style,
    }}>
      {onClick && <PressTintOverlay pressed={pressed} tint={GOLD}/>}
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
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={INK(0.68)} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;
}
function ExternalSVG() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={INK(0.68)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}
function PinSVG() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={INK(0.74)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function BellSVG() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={INK(0.74)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}
function DocSVG() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={INK(0.74)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="14" y2="17"/>
    </svg>
  );
}

function Segment({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", background: NAVY_DARK, borderRadius: 12, padding: 3, gap: 3 }}>
      {options.map(opt => (
        <div key={opt} onClick={() => onChange(opt)} style={{
          flex: 1, textAlign: "center", padding: "7px 0", borderRadius: 9,
          background: value === opt ? GOLD : "transparent",
          color: value === opt ? ON_GOLD : INK(0.72),
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          fontFamily: "'DM Mono',monospace", transition: "all 0.15s",
        }}>{opt}</div>
      ))}
    </div>
  );
}

export default function WeatherON_M3({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab, setActiveTab] = useState("MY");
  const [temp, setTemp] = useState("°C");
  const [weight, setWeight] = useState("킬로그램");
  const [dist, setDist] = useState("미터");
  const [theme, setTheme] = useState("시스템");
  const [permissionReady, setPermissionReady] = useState(Boolean(routeState.permissionReady));
  const [locationManaged, setLocationManaged] = useState(Boolean(routeState.locationManaged));
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

  useEffect(() => {
    if (routeState.permissionReady) setPermissionReady(true);
    if (routeState.locationManaged) setLocationManaged(true);
  }, [routeState.permissionReady, routeState.locationManaged]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        M3 · 전역 설정 · 하이브리드 크롬
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
            <button onClick={() => navigate?.("M1")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.94), fontSize: 17, fontWeight: 700 }}>전역 설정</span>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 130px)", overflowY: "auto", paddingBottom: 90 }}>

            <BrandCard style={{ padding: "14px 16px" }}>
              <span style={{ color: INK(0.72), fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>단위 설정</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ color: INK(0.80), fontSize: 13 }}>온도</span>
                  <div style={{ width: 110 }}><Segment options={["°C", "°F"]} value={temp} onChange={setTemp}/></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ color: INK(0.80), fontSize: 13 }}>무게</span>
                  <div style={{ width: 110 }}><Segment options={["킬로그램", "파운드"]} value={weight} onChange={setWeight}/></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ color: INK(0.80), fontSize: 13 }}>거리</span>
                  <div style={{ width: 110 }}><Segment options={["미터", "마일"]} value={dist} onChange={setDist}/></div>
                </div>
              </div>
            </BrandCard>

            <BrandCard onClick={() => navigate?.("H2", { returnTo: "M3", parentReturnTo: "M3" })} style={{ padding: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                <PinSVG/>
                <div style={{ flex: 1 }}>
                  <div style={{ color: INK(0.88), fontSize: 14, fontWeight: 600 }}>위치 관리</div>
                  <div style={{ color: INK(0.70), fontSize: 11, marginTop: 1 }}>{locationManaged ? "위치 관리 확인됨" : "2곳 저장됨"}</div>
                </div>
                <ChevronRightSVG/>
              </div>
            </BrandCard>

            <BrandCard style={{ padding: "14px 16px" }}>
              <span style={{ color: INK(0.72), fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>테마</span>
              <div style={{ marginTop: 10 }}>
                <Segment options={["시스템", "라이트", "다크"]} value={theme} onChange={setTheme}/>
              </div>
            </BrandCard>

            <BrandCard onClick={() => navigate?.("O3", {
              returnTo: "M3",
              resumeGlobalPermission: true,
              locationManaged,
            })} style={{ padding: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                <BellSVG/>
                <div style={{ flex: 1 }}>
                  <div style={{ color: INK(0.88), fontSize: 14, fontWeight: 600 }}>알림 권한 관리</div>
                  <div style={{ color: INK(0.70), fontSize: 11, marginTop: 1 }}>{permissionReady ? "알림 권한 정상" : "시스템 설정으로 이동"}</div>
                </div>
                <ExternalSVG/>
              </div>
            </BrandCard>

            <BrandCard onClick={() => navigate?.("R1")} style={{ padding: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                <DocSVG/>
                <div style={{ flex: 1 }}>
                  <div style={{ color: INK(0.88), fontSize: 14, fontWeight: 600 }}>정책 및 법적 고지</div>
                  <div style={{ color: INK(0.70), fontSize: 11, marginTop: 1 }}>개인정보 · 약관 · 오픈소스 라이선스</div>
                </div>
                <ChevronRightSVG/>
              </div>
            </BrandCard>

            <BrandCard style={{ padding: "12px 14px", border: `1px solid ${GOLD}33` }}>
              <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>전역</div>
              <div style={{ color: INK(0.78), fontSize: 12, lineHeight: 1.55 }}>
                {temp} · {weight} · {dist} · 테마 {theme} · 위치 {locationManaged ? "확인" : "관리"} · 권한 {permissionReady ? "정상" : "확인 필요"}
              </div>
            </BrandCard>

            <div style={{ textAlign: "center", color: INK(0.66), fontSize: 10.5, lineHeight: 1.8, padding: "8px 0" }}>
              앱 정보 · v1.0.0
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
        WeatherON · M3 전역 설정
      </div>
    </div>
  );
}
