import { useState, useEffect } from "react";
import { DestinationIcon } from "./WeatherON_destination_icons.jsx";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON G2 · 날씨 비교 · 출발시간 역산 (하이브리드 크롬) ────────
   와이어프레임 G2 기준: G1 목적지 카드 탭 → 진입
   - 날씨 비교(기온/날씨/바람/강수, 출발지→목적지)
   - 출발시간 역산: 도착 희망시각 − 소요시간 − 여유시간 = 출발 시각
   - 목적지 알림 흐름(Mode B): 외출준비 통합 → 신발추천(출발10분전) → 출발시각
   - CTA: 이 목적지 알림 켜기
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
let WARM      = '#E8854A';
let MIST      = '#E4F2FF';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(228,242,255,${a})`;

const DEFAULT_목적지 = {
  name: "회사 — 판교",
  icon: "pin",
  from: { label: "서울 삼성동", temp: "21°", weather: "맑음", rain: "0%" },
  to: { label: "판교", temp: "19°", weather: "흐림", rain: "30%" },
  departTime: "08:10",
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
function BackArrowSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ClockSVG({ size = 18, color = MISTLITE(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 7 12 12 16 14"/>
    </svg>
  );
}
function ShoeSVG({ size = 18, color = MISTLITE(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18c0-2 1-3 3-4l5-2 4-3c1-1 2-1 3 0l3 3c1 1 1 2 1 3v3a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function DepartSVG({ size = 18, color = GOLD }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>
  );
}

function CareStateCard({ destination, on, accountLinked, permissionReady, onBack, onSettings }) {
  const ready = accountLinked && permissionReady;
  const status = on ? "켜짐" : ready ? "준비" : !accountLinked ? "계정 필요" : "권한 필요";
  const tone = on ? CLEAR : ready ? GOLD : !accountLinked ? WARM : SKY;
  const copy = on
    ? `${destination.name} 알림이 오늘 일정에 추가됨`
    : !accountLinked
      ? "알림 저장과 동기화를 위해 계정 연결이 필요함"
      : !permissionReady
        ? "알림 권한 확인 후 출발·신발·우산 알림이 켜짐"
        : "켜면 오늘 출발·신발·우산 알림에 반영됨";
  return (
    <BrandCard accent={tone} style={{ borderRadius: 18, padding: "13px 15px 13px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: INK(0.78), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>알아서 챙기기</div>
          <div style={{ color: INK(0.86), fontSize: 12.2, lineHeight: 1.45 }}>
            {copy}
          </div>
        </div>
        <span style={{
          height: 30,
          borderRadius: 15,
          padding: "0 10px",
          background: NAVY_DARK,
          color: INK(0.78),
          fontSize: 11,
          fontWeight: 900,
          display: "inline-flex",
          alignItems: "center",
          fontFamily: "'DM Mono',monospace",
          flexShrink: 0,
        }}>{status}</span>
      </div>
      {on && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button onClick={onBack} style={{
            height: 38,
            borderRadius: 14,
            border: 0,
            background: GOLD,
            color: ON_GOLD,
            fontSize: 11.8,
            fontWeight: 900,
            cursor: "pointer",
            fontFamily: "'Noto Sans KR',sans-serif",
          }}>G1 목록으로</button>
          <button onClick={onSettings} style={{
            height: 38,
            borderRadius: 14,
            border: `1px solid ${INK(0.10)}`,
            background: NAVY_DARK,
            color: INK(0.84),
            fontSize: 11.8,
            fontWeight: 900,
            cursor: "pointer",
            fontFamily: "'Noto Sans KR',sans-serif",
          }}>알림 설정</button>
        </div>
      )}
    </BrandCard>
  );
}

const notifChain = [
  { time: "07:30", icon: <ClockSVG/>, title: "외출 준비 통합 알림", color: SKY },
  { time: "08:00", icon: <ShoeSVG/>,  title: "신발 추천 — 출발 10분 전", color: CLEAR },
  { time: "08:10", icon: <DepartSVG/>, title: "출발 시각 알림", color: GOLD },
];

export default function WeatherON_G2({ navigate, routeState = {}, careState = {}, setDestinationCare } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab] = useState("출발");
  const ctaBtn = usePressTint();
  const destination = routeState?.destination || DEFAULT_목적지;
  const returnTo = routeState?.returnTo || "G1";
  const accountLinked = Boolean(routeState?.accountLinked);
  const permissionReady = Boolean(routeState?.permissionReady);
  const careOn = Boolean(careState[destination.name] || routeState?.careOn);
  const comparisonRows = [
    { label: "기온", from: destination.from.temp, to: destination.to.temp, diff: "", warn: false },
    { label: "날씨", from: destination.from.weather, to: destination.to.weather, diff: "", warn: false },
    { label: "출발지", from: destination.from.label, to: destination.to.label, diff: "", warn: false },
    { label: "강수", from: destination.from.rain, to: destination.to.rain, diff: "", warn: destination.to.rain !== "0%" },
  ];

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if ((routeState?.careOn || (routeState?.resumeCare && accountLinked && permissionReady)) && destination?.name) {
      setDestinationCare?.(destination, true);
    }
  }, [routeState?.careOn, routeState?.resumeCare, accountLinked, permissionReady, destination, setDestinationCare]);

  const handleCareCta = () => {
    if (careOn) return;
    if (!accountLinked) {
      navigate?.("A2", {
        ...routeState,
        pendingAction: "알림 추가",
        returnTo: "G2",
        resumeCare: true,
        destination,
        parentReturnTo: returnTo,
      });
      return;
    }
    if (!permissionReady) {
      navigate?.("O3", {
        ...routeState,
        pendingAction: "알림 추가",
        returnTo: "G2",
        resumeCare: true,
        destination,
        parentReturnTo: returnTo,
        accountLinked: true,
      });
      return;
    }
    setDestinationCare?.(destination, true);
  };

  const careCtaLabel = careOn
    ? "목적지 알림 켜짐"
    : !accountLinked
      ? "계정 연결하고 케어 켜기"
      : !permissionReady
        ? "알림 권한 확인하고 켜기"
        : "이 목적지 알림 켜기";

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        G2 · 날씨 비교 · 출발시간 역산 · 하이브리드 크롬
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
            <button onClick={() => navigate?.(returnTo, routeState)} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <div>
              <div style={{ color: INK(0.94), fontSize: 16.5, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                <DestinationIcon type={destination.icon} size={16}/>
                {destination.name}
              </div>
              <div style={{ color: INK(0.68), fontSize: 10.8, marginTop: 2 }}>목적지 기준 알림 미리보기</div>
            </div>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 130px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 118 }}>

            <BrandCard accent={CLEAR} style={{ borderRadius: 18, padding: "12px 16px 12px 19px" }}>
              <div style={{ color: INK(0.78), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 5 }}>알아서 챙기기</div>
              <div style={{ color: INK(0.84), fontSize: 12.2, lineHeight: 1.55 }}>
                목적지를 켜면 출발지와 목적지 날씨를 비교해 출발·신발·우산 알림이 자동으로 조정돼요
              </div>
            </BrandCard>

            <CareStateCard
              destination={destination}
              on={careOn}
              accountLinked={accountLinked}
              permissionReady={permissionReady}
              onBack={() => navigate?.("G1")}
              onSettings={() => navigate?.("M2", {
                returnTo: "G2",
                originReturnTo: "G2",
                parentReturnTo: returnTo,
                alertFocus: "destination",
                resumeAlertSettings: true,
                destination,
                careOn: true,
                accountLinked: true,
                permissionReady: true,
              })}
            />

            {/* 날씨 비교 */}
            <BrandCard style={{ borderRadius: 18, padding: "14px 16px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>날씨 비교</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {comparisonRows.map(row => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 32, color: INK(0.68), fontSize: 12, fontWeight: 800, fontFamily: "'Noto Sans KR',sans-serif" }}>{row.label}</span>
                    <span style={{ color: INK(0.85), fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>{row.from}</span>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.40)} strokeWidth={2} strokeLinecap="round"><line x1={5} y1={12} x2={19} y2={12}/><polyline points="12 5 19 12 12 19"/></svg>
                    <span style={{ color: INK(0.85), fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{row.to}</span>
                    {row.diff && <span style={{ color: INK(0.72), fontSize: 12, fontWeight: 800 }}>{row.diff}</span>}
                  </div>
                ))}
              </div>
            </BrandCard>

            {/* 출발시간 역산 */}
            <BrandCard accent={GOLD} style={{ borderRadius: 18, padding: "16px 18px 16px 21px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>출발시간 역산</div>
              <div style={{ color: INK(0.78), fontSize: 12.5, lineHeight: 1.8 }}>
                도착 희망 <b style={{ color: INK(0.94) }}>09:00</b><br/>
                − 소요시간 40분 − 여유 10분
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: GOLD, fontFamily: "'DM Mono',monospace" }}>{destination.departTime || "08:10"}</span>
                <span style={{ color: INK(0.78), fontSize: 13, fontWeight: 600 }}>출발</span>
              </div>
            </BrandCard>

            {/* 목적지 알림 흐름 */}
            <BrandCard style={{ borderRadius: 18, padding: "14px 16px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>목적지 알림 흐름</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {notifChain.map((n, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: NAVY_DARK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {n.icon}
                    </div>
                    <span style={{ color: INK(0.74), fontSize: 12, fontWeight: 800, fontFamily: "'DM Mono',monospace", minWidth: 44 }}>{n.time}</span>
                    <span style={{ color: INK(0.82), fontSize: 12.5 }}>{n.title}</span>
                  </div>
                ))}
              </div>
            </BrandCard>
          </div>
        </div>

        <div style={{ position: "absolute", left: 20, right: 20, bottom: 90 }}>
          <button {...ctaBtn.handlers} onClick={handleCareCta} style={{
            width: "100%", height: 52, borderRadius: 18,
            background: careOn ? "rgba(58,191,160,0.16)" : GOLD,
            border: careOn ? "1px solid rgba(58,191,160,0.35)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: careOn ? "default" : "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
            boxShadow: careOn ? "none" : "0 6px 16px rgba(0,0,0,0.30)",
          }}>
            {!careOn && <PressTintOverlay pressed={ctaBtn.pressed} tint={NAVY}/>}
            <span style={{ fontSize: 15, fontWeight: 700, color: careOn ? INK(0.78) : ON_GOLD, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              {careCtaLabel}
            </span>
          </button>
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
        WeatherON · G2 날씨 비교 · 출발시간 역산
      </div>
    </div>
  );
}
