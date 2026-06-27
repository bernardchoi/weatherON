import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON M1 · 마이 메인 (하이브리드 크롬) ──────────────────────────
   와이어프레임 M1 기준: MY 탭 메인 (설정 허브)
   - 프로필 카드 (소셜 로그인 계정) / 구독 상태 (무료/프리미엄)
   - 알림 설정 → M2 / 스타일 태그 설정 / 전역 설정 → M3
   - 정책 및 법적 고지 → M3 내 R1 정책 허브 / 앱 정보
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#2A5D8F';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
const PREMIUM   = '#AB8EDD';
const RAIN_RED  = '#E97F77';
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
      color: active ? GOLD : INK(0.66), transition:"color 0.15s ease", // 비활성 탭은 라이트모드 대비 보정
    }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      <div style={{ width:5, height:5, borderRadius:"50%", background: active ? GOLD : "transparent", marginBottom:1 }}/>
      {tab.icon}
      <span style={{ fontSize:10.5, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{_tabLabel}</span>
    </button>
  );
}

function MenuRow({ item, isLast, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <button {...handlers} onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12,
      padding: "14px 16px", background: "none", border: "none", cursor: "pointer",
      borderBottom: !isLast ? `1px solid ${INK(0.06)}` : "none",
      position:'relative', overflow:'hidden', flexShrink: 0,
    }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      <span style={{ fontSize: 18 }}>{item.icon}</span>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{ color: INK(0.85), fontSize: 14 }}>{item.label}</div>
        {item.sub && <div style={{ color: INK(0.68), fontSize: 11, marginTop: 1 }}>{item.sub}</div>}
      </div>
      {item.dest !== "" && <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={INK(0.66)} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>}
    </button>
  );
}

/* ── 메뉴/시스템 아이콘 — brand/WeatherON_아이콘_시스템.md 기준 ── */
function BellSVG({ size = 18, color = INK(0.74) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}
function ShirtSVG({ size = 18, color = INK(0.74) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4L4 7l3 3 2-1.5V20h6V8.5L17 10l3-3-5-3-1.5 1a3 3 0 01-3 0L9 4z"/>
    </svg>
  );
}
function SettingsSVG({ size = 18, color = INK(0.74) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005 14.6a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}
function ShieldSVG({ size = 18, color = INK(0.72) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function InfoSVG({ size = 18, color = INK(0.72) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}
function PersonSVG({ size = 24, color = GOLD }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function StarSVG({ size = 18, color = PREMIUM }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

const menuItems = [
  { icon: <BellSVG/>, label: "알림 설정", sub: "외출 준비·비·출발 알림 시간", dest: "M2", section: "설정" },
  { icon: <ShirtSVG/>, label: "스타일 태그 설정", sub: "캐주얼·미니멀·포멀 외 3종", dest: "O4 재설정", section: "설정" },
  { icon: <SettingsSVG/>, label: "전역 설정", sub: "위치·알림 권한, 온도 단위", dest: "M3", section: "설정" },
  { icon: <ShieldSVG/>, label: "정책 및 법적 고지", sub: "개인정보·약관·오픈소스", dest: "M3 정책", section: "정보" },
  { icon: <InfoSVG/>, label: "앱 정보", sub: "WeatherON v1.0.0", dest: "", section: "정보" },
];

export default function WeatherON_M1({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab, setActiveTab] = useState("MY");
  const [lastAction, setLastAction] = useState("허브 대기");
  const accountLinked = Boolean(routeState.accountLinked);
  const [premiumActive, set프리미엄Active] = useState(accountLinked && Boolean(routeState.premiumActive));
  const editBtn = usePressTint();
  const upgradeBtn = usePressTint();
  const routeTab = (id) => {
    setActiveTab(id);
    if (id === "홈") navigate?.("H1");
    if (id === "코디") navigate?.("C1");
    if (id === "출발") navigate?.("G1");
    if (id === "MY") navigate?.("M1");
    if (id === "소셜") navigate?.("S0");
  };
  const openMenu = (item) => {
    setLastAction(item.label);
    if (item.dest === "M2") navigate?.("M2");
    if (item.dest === "O4 재설정") navigate?.("O4", { returnTo: "M1" });
    if (item.dest === "M3") navigate?.("M3");
    if (item.dest === "M3 정책") navigate?.("M3", { policyHint: true });
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (routeState.styleProfileSaved) setLastAction("스타일 기준 저장 완료");
    if (!accountLinked) {
      set프리미엄Active(false);
      if (routeState.accountSignedOut && !routeState.styleProfileSaved) setLastAction("Guest 전환");
      return;
    }
    if (routeState.premiumActive) {
      set프리미엄Active(true);
      setLastAction("프리미엄 구독 활성");
    }
  }, [accountLinked, routeState.accountSignedOut, routeState.premiumActive, routeState.styleProfileSaved]);

  const sectionItems = (section) => menuItems.filter(m => m.section === section);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        M1 · 마이 메인 · 하이브리드 크롬
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
          <div style={{ padding: "16px 20px 0" }}>
            <span style={{ color: INK(0.94), fontSize: 20, fontWeight: 800 }}>마이</span>
          </div>

          {/* Content */}
          <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 148px)", overflowY: "auto", paddingBottom: 90 }}>

            {/* Profile Card */}
            <BrandCard accent={GOLD} style={{ borderRadius: 20, padding: "16px 16px 16px 19px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(240,160,32,0.18)", border: "2px solid rgba(240,160,32,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <PersonSVG size={24}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: INK(0.94), fontSize: 15, fontWeight: 700 }}>{accountLinked ? "카카오 계정" : "게스트 모드"}</div>
                  <div style={{ color: INK(0.70), fontSize: 12, marginTop: 2 }}>{accountLinked ? "da***@kakao.com" : "저장·동기화는 계정 연결 필요"}</div>
                </div>
                <button {...editBtn.handlers} onClick={() => accountLinked ? navigate?.("A4") : navigate?.("A2", { returnTo: "M1", pendingAction: "계정 연결" })} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 10, padding: "6px 10px", color: INK(0.74), fontSize: 11, cursor: "pointer", position:'relative', overflow:'hidden' }}>
                  <PressTintOverlay pressed={editBtn.pressed} tint={GOLD}/>
                  {accountLinked ? "편집" : "계정 연결"}
                </button>
              </div>
            </BrandCard>

            {/* Subscription Status */}
            <BrandCard style={{ borderRadius: 16, padding: "14px 16px", border: `1px dashed rgba(171,142,221,0.40)` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <StarSVG size={18} color={PREMIUM}/>
                  <div>
                    <div style={{ color: INK(0.85), fontSize: 13, fontWeight: 600 }}>{!accountLinked ? "계정 연결 필요" : premiumActive ? "WeatherON 프리미엄" : "현재 무료 플랜"}</div>
                    <div style={{ color: INK(0.70), fontSize: 11, marginTop: 1 }}>{!accountLinked ? "저장·구독·동기화 기능은 계정 연결 후 사용" : premiumActive ? "코스 저장 한도 확대 · 종주 플래너" : "알림 1개 · 코디 기본 추천"}</div>
                  </div>
                </div>
                <button {...upgradeBtn.handlers} onClick={() => accountLinked ? navigate?.("G6", { returnTo: "M1", premiumActive }) : navigate?.("A2", { returnTo: "M1", pendingAction: "프리미엄 진입" })} style={{ background: "rgba(171,142,221,0.22)", border: "1px solid rgba(171,142,221,0.40)", borderRadius: 10, padding: "6px 12px", color: PREMIUM, fontSize: 11, fontWeight: 700, cursor: "pointer", position:'relative', overflow:'hidden' }}>
                  <PressTintOverlay pressed={upgradeBtn.pressed} tint={PREMIUM}/>
                  {premiumActive ? "관리" : "업그레이드"}
                </button>
              </div>
            </BrandCard>

            {/* Settings Section */}
            <div>
              <div style={{ color: INK(0.72), fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", marginBottom: 8, paddingLeft: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>설정</div>
              <BrandCard style={{ borderRadius: 16, overflow: "hidden", padding: 0 }}>
                {sectionItems("설정").map((item, idx) => (
                  <MenuRow key={item.label} item={item} isLast={idx === sectionItems("설정").length - 1} onClick={() => openMenu(item)} />
                ))}
              </BrandCard>
            </div>

            <BrandCard style={{ borderRadius: 16, padding: "12px 14px", border: `1px solid ${GOLD}33` }}>
              <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>프로필</div>
              <div style={{ color: INK(0.78), fontSize: 12, lineHeight: 1.55 }}>
                {accountLinked ? "계정 연결됨" : "게스트"} · {premiumActive ? "프리미엄" : accountLinked ? "무료 플랜" : "계정 필요"} · 최근 선택 {lastAction}
              </div>
            </BrandCard>

            {/* Info Section */}
            <div>
              <div style={{ color: INK(0.72), fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", marginBottom: 8, paddingLeft: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>정보</div>
              <BrandCard style={{ borderRadius: 16, overflow: "hidden", padding: 0 }}>
                {sectionItems("정보").map((item, idx) => (
                  <MenuRow key={item.label} item={item} isLast={idx === sectionItems("정보").length - 1} onClick={() => openMenu(item)} />
                ))}
              </BrandCard>
            </div>

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
        WeatherON · M1 마이 메인
      </div>
    </div>
  );
}
