import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON A4 · 마이페이지 · 계정 관리 (하이브리드 크롬) ───────────
   와이어프레임 A4 기준: M1(마이 메인) 프로필 카드의 "편집" → 진입하는
   전체 계정 관리 화면.
   - 프로필 행(소셜 계정 표시)
   - 구독 관리 / 연결된 계정 관리 / 데이터 내보내기 /
     로그아웃 / 회원 탈퇴(danger, 강조)
   - 회원 탈퇴 시 즉시 전체 데이터 삭제 (GDPR·개인정보보호법 준수)
   - M1과 동일하게 탭바 유지(MY 활성) — 앱 내 서브페이지는 항상 탭바 노출
     (H2/H4/H5와 동일 패턴)
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#1D5A86';
let NAVY_DARK = '#276A96';
let PANEL     = '#2B719D';
let PANEL_L1  = '#3D87B5';
let GOLD      = '#F0A020';
let ON_GOLD  = '#123858';
const PREMIUM   = '#AB8EDD';
const RAIN_RED  = '#E97F77';
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
function ChevronRightSVG({ color = MISTLITE(0.40) }) {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;
}
function PersonSVG({ size = 24, color = GOLD }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function BellSVG({ size = 18, color = MISTLITE(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}
function ShirtSVG({ size = 18, color = MISTLITE(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4L4 7l3 3 2-1.5V20h6V8.5L17 10l3-3-5-3-1.5 1a3 3 0 01-3 0L9 4z"/>
    </svg>
  );
}
function StarSVG({ size = 18, color = MISTLITE(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
function LinkSVG({ size = 18, color = MISTLITE(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.07 0l1.92-1.92a5 5 0 00-7.07-7.07L10.5 5.43"/>
      <path d="M14 11a5 5 0 00-7.07 0l-1.92 1.92a5 5 0 007.07 7.07L13.5 18.57"/>
    </svg>
  );
}
function ExportSVG({ size = 18, color = MISTLITE(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function MenuRow({ icon, label, isLast, danger, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <button {...handlers} onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12,
      padding: "14px 16px", background: "none", border: "none", cursor: "pointer",
      borderBottom: !isLast ? `1px solid ${INK(0.06)}` : "none",
      position:'relative', overflow:'hidden', flexShrink: 0,
    }}>
      <PressTintOverlay pressed={pressed} tint={danger ? RAIN_RED : GOLD}/>
      {icon}
      <span style={{ flex: 1, textAlign: "left", color: danger ? RAIN_RED : INK(0.88), fontSize: 14, fontWeight: danger ? 700 : 500, fontFamily: "'Noto Sans KR',sans-serif" }}>{label}</span>
      <ChevronRightSVG color={danger ? "rgba(233,127,119,0.55)" : MISTLITE(0.35)}/>
    </button>
  );
}

export default function WeatherON_A4({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab, setActiveTab] = useState("MY");
  const accountLinked = Boolean(routeState.accountLinked);
  const premiumActive = accountLinked && Boolean(routeState.premiumActive);
  const [accountState, setAccountState] = useState(accountLinked ? (premiumActive ? "프리미엄 구독 활성" : "연결 계정 확인") : "게스트 상태");
  const confirmLogout = accountState === "로그아웃 확인";
  const confirmDelete = accountState === "회원 탈퇴 확인 대기";
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
    if (routeState.accountLinked === false) setAccountState("게스트 상태");
    if (premiumActive) setAccountState("프리미엄 구독 활성");
  }, [routeState.accountLinked, premiumActive]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        A4 · 마이페이지 · 계정 관리 · 하이브리드 크롬
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

        <div style={{ paddingTop: 54 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 0" }}>
            <button onClick={() => navigate?.("M1")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.94), fontSize: 18, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}>마이페이지</span>
          </div>

          {/* Content */}
          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 130px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 118 }}>

            {/* Profile */}
            <BrandCard style={{ borderRadius: 18, padding: "16px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(240,160,32,0.18)", border: "2px solid rgba(240,160,32,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <PersonSVG size={22}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: INK(0.94), fontSize: 14.5, fontWeight: 700 }}>{accountLinked ? "카카오 계정으로 로그인됨" : "게스트 모드"}</div>
                  <div style={{ color: INK(0.76), fontSize: 12, marginTop: 2, fontFamily: "'DM Mono',monospace" }}>{accountLinked ? "da***@kakao.com" : "저장·동기화는 계정 연결 필요"}</div>
                </div>
              </div>
            </BrandCard>

            {/* Menu list */}
            <BrandCard style={{ borderRadius: 18, overflow: "hidden", padding: 0 }}>
              <MenuRow icon={<StarSVG/>}  label="구독 관리" onClick={() => navigate?.("G6", { returnTo: "A4", premiumActive })}/>
              <MenuRow icon={<LinkSVG/>}  label="연결된 계정 관리" onClick={() => setAccountState("연결 계정 관리 열림")}/>
              <MenuRow icon={<ExportSVG/>} label="데이터 내보내기" isLast onClick={() => setAccountState("데이터 내보내기 준비")}/>
            </BrandCard>

            <BrandCard style={{ borderRadius: 16, padding: "12px 14px", border: `1px solid ${premiumActive ? PREMIUM : GOLD}33` }}>
              <div style={{ color: premiumActive ? PREMIUM : GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>계정</div>
              <div style={{ color: INK(0.78), fontSize: 12, lineHeight: 1.55 }}>
                {accountLinked ? "카카오 계정 연결됨" : "게스트 모드"} · {accountState}
              </div>
              {(confirmLogout || confirmDelete) && (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => setAccountState(premiumActive ? "프리미엄 구독 활성" : accountLinked ? "연결 계정 확인" : "게스트 상태")} style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 12,
                    border: `1px solid ${INK(0.10)}`,
                    background: NAVY_DARK,
                    color: INK(0.78),
                    fontSize: 11.5,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}>취소</button>
                  <button onClick={() => navigate?.("H1", {
                    accountLinked: false,
                    premiumActive: false,
                    clearAccountData: true,
                    accountSignedOut: true,
                  })} style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 12,
                    border: 0,
                    background: confirmDelete ? RAIN_RED : GOLD,
                    color: confirmDelete ? "#fff" : NAVY,
                    fontSize: 11.5,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}>{confirmDelete ? "탈퇴 확정" : "로그아웃"}</button>
                </div>
              )}
            </BrandCard>

            {/* Account actions */}
            <BrandCard style={{ borderRadius: 18, overflow: "hidden", padding: 0 }}>
              <MenuRow icon={<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.85)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>} label={accountLinked ? "로그아웃" : "계정 연결"} isLast={!accountLinked} onClick={() => accountLinked ? setAccountState("로그아웃 확인") : navigate?.("A2", { returnTo: "A4" })}/>
              {accountLinked && (
                <MenuRow icon={<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={RAIN_RED} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>} label="회원 탈퇴" isLast danger onClick={() => setAccountState("회원 탈퇴 확인 대기")}/>
              )}
            </BrandCard>

            {accountLinked && (
              <div style={{ textAlign: "center", color: MISTLITE(0.62), fontSize: 10.5, lineHeight: 1.6, padding: "4px 12px" }}>
                회원 탈퇴 시 모든 데이터가 즉시 삭제되며 복구할 수 없어요
              </div>
            )}
          </div>
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
        WeatherON · A4 마이페이지 · 계정 관리
      </div>
    </div>
  );
}
