import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON R1 · 설정 메뉴 — 정책 페이지 진입점 (하이브리드 크롬) ───
   와이어프레임 R1 기준: AdMob 심사가 요구하는 모든 정책 문서를
   설정 탭에서 인앱 접근. 동일 문서를 weatheron.kr 웹에도 게시.
   M1 마이 메인의 전역 설정(M3)에서 진입하는 정책 페이지 허브.
   - 알림설정/계정관리/광고및맞춤설정
   - 구분선
   - 개인정보처리방침(R2)/이용약관(R5)/위치기반서비스이용약관(R6)/오픈소스라이선스(R7)/문의하기
   - 앱 정보 v1.0.0
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
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
function BrandCard({ children, style = {} }) {
  return (
    <div style={{
      background: PANEL, borderRadius: 18, overflow: "hidden",
      boxShadow: "0 6px 16px rgba(0,0,0,0.30)", ...style,
    }}>{children}</div>
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
  const label = tab.id === "MY" ? "마이" : tab.id;
  return (
    <button type="button" onClick={onClick} {...handlers} aria-label={label} aria-current={active ? "page" : undefined} style={{
      appearance:"none", border:"none", background:"transparent", font:"inherit",
      flex:1, minHeight:52, position:"relative", overflow:"hidden", flexShrink: 0, borderRadius:14,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4,
      cursor:"pointer", userSelect:"none",
      color: active ? GOLD : INK(0.66), transition:"color 0.15s ease",
    }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      <div style={{ width:5, height:5, borderRadius:"50%", background: active ? GOLD : "transparent", marginBottom:1 }}/>
      {tab.icon}
      <span style={{ fontSize:10.5, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{label}</span>
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
function ChevronRightSVG({ color = MISTLITE(0.35) }) {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;
}
function BellSVG() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.85)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
}
function PersonSVG() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.85)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function MegaphoneSVG() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.85)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>;
}
function ShieldSVG() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.80)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function DocSVG() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.80)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function PinSVG() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.80)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function PackageSVG() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.80)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
function MailSVG() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.80)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/><polyline points="22 6 12 13 2 6"/></svg>;
}

function MenuRow({ icon, label, sub, isLast, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <button {...handlers} onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12,
      padding: "14px 16px", background: "none", border: "none", cursor: "pointer",
      borderBottom: !isLast ? `1px solid ${INK(0.06)}` : "none",
      position:'relative', overflow:'hidden', flexShrink: 0,
    }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      {icon}
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{ color: INK(0.88), fontSize: 14, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ color: MISTLITE(0.64), fontSize: 11, marginTop: 1 }}>{sub}</div>}
      </div>
      <ChevronRightSVG/>
    </button>
  );
}

export default function WeatherON_R1({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab, setActiveTab] = useState("MY");
  const [selectedPolicy, setSelectedPolicy] = useState("정책 허브 대기");
  const routeTab = (id) => {
    setActiveTab(id);
    if (id === "홈") navigate?.("H1");
    if (id === "코디") navigate?.("C1");
    if (id === "출발") navigate?.("G1");
    if (id === "MY") navigate?.("M1");
    if (id === "소셜") navigate?.("S0");
  };
  const openRow = (label, target) => {
    setSelectedPolicy(label);
    if (target) navigate?.(target);
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
        R1 · 설정 메뉴 · 하이브리드 크롬
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
            <button onClick={() => navigate?.("M3")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.94), fontSize: 17, fontWeight: 700 }}>설정</span>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 12, height: "calc(852px - 130px)", overflowY: "auto", paddingBottom: 90 }}>

            <BrandCard>
              <MenuRow icon={<BellSVG/>} label="알림 설정" onClick={() => openRow("알림 설정", "M2")}/>
              <MenuRow icon={<PersonSVG/>} label="계정 관리" onClick={() => openRow("계정 관리", "A4")}/>
              <MenuRow icon={<MegaphoneSVG/>} label="광고 및 맞춤 설정" isLast onClick={() => openRow("광고 및 맞춤 설정", "R3")}/>
            </BrandCard>

            <BrandCard>
              <MenuRow icon={<ShieldSVG/>} label="개인정보처리방침" onClick={() => openRow("개인정보처리방침", "R2")}/>
              <MenuRow icon={<DocSVG/>} label="이용약관" onClick={() => openRow("이용약관", "R5")}/>
              <MenuRow icon={<PinSVG/>} label="위치기반서비스 이용약관" onClick={() => openRow("위치기반서비스 이용약관", "R6")}/>
              <MenuRow icon={<PackageSVG/>} label="오픈소스 라이선스" onClick={() => openRow("오픈소스 라이선스", "R7")}/>
              <MenuRow icon={<MailSVG/>} label="문의하기" isLast onClick={() => openRow("문의하기")}/>
            </BrandCard>

            <BrandCard style={{ padding: "12px 14px", border: `1px solid ${GOLD}33` }}>
              <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>정책</div>
              <div style={{ color: INK(0.78), fontSize: 12, lineHeight: 1.55 }}>
                정책 문서와 광고 설정을 한곳에서 확인해요 · 최근 선택 {selectedPolicy}
              </div>
            </BrandCard>

            <div style={{ textAlign: "center", color: INK(0.74), fontSize: 11, padding: "8px 0" }}>
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
        WeatherON · R1 설정 메뉴
      </div>
    </div>
  );
}
