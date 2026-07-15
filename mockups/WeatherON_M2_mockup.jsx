import { useEffect, useRef, useState } from "react";
import { getWeatherONTheme } from "./WeatherON_theme_tokens.js";

/* ── WeatherON M2 · 스마트 알림 설정 (하이브리드 크롬) ─────────────────
   기본 화면은 알아서 챙기기 상태 확인에 집중한다.
   세부 토글은 "고급 설정" 안에 숨겨 설정 피로를 줄인다.
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#1D5A86';
let NAVY_DARK = '#276A96';
let PANEL     = '#2B719D';
let PANEL_L1  = '#3D87B5';
let GOLD      = "#F4B63F";
let ON_GOLD  = '#123858';
let SKY       = "#4AA3DF";
let CLEAR     = "#2FC6A3";
const WARM = "#E8854A";
let MIST      = "#B9CBE0";
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(228,242,255,${a})`;

function applyWeatherONTheme(mode) {
  const theme = getWeatherONTheme(mode);
  NAVY = theme.NAVY;
  NAVY_DARK = theme.NAVY_DARK;
  PANEL = theme.PANEL;
  PANEL_L1 = theme.PANEL_L1;
  GOLD = theme.GOLD;
  ON_GOLD = theme.onGold || ON_GOLD;
  SKY = theme.SKY;
  CLEAR = theme.CLEAR;
  MIST = theme.MIST;
  INK = (a) => `rgba(${theme.inkRgb},${a})`;
  MISTLITE = (a) => `rgba(${theme.mistRgb},${a})`;
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
  return <div style={{ position: "absolute", inset: 0, background: tint, opacity: pressed ? 0.12 : 0, transition: "opacity 0.12s ease", pointerEvents: "none" }}/>;
}

function BackArrowSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function BellSVG({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

function RainSVG({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 16.4A5 5 0 0017 7h-1.2A8 8 0 104 15.3"/>
      <path d="M8 19v2M13 18v2M18 19v2"/>
    </svg>
  );
}

function SunSVG({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
    </svg>
  );
}

function MoonSVG({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A8.5 8.5 0 1111.2 3a6.5 6.5 0 009.8 9.8z"/>
    </svg>
  );
}

function RouteSVG({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="18" r="2"/>
      <circle cx="18" cy="6" r="2"/>
      <path d="M8 18h4a4 4 0 000-8H9a3 3 0 010-6h7"/>
    </svg>
  );
}

function ChevronRightSVG({ open = false }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={INK(0.68)} strokeWidth={2} strokeLinecap="round" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.16s" }}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function Toggle({ on, onChange, disabled = false }) {
  return (
    <button onClick={disabled ? undefined : onChange} aria-disabled={disabled} style={{
      width: 48,
      height: 28,
      borderRadius: 14,
      background: disabled ? PANEL_L1 : on ? GOLD : NAVY_DARK,
      border: on && !disabled ? "none" : `1px solid ${INK(disabled ? 0.08 : 0.14)}`,
      position: "relative",
      cursor: disabled ? "default" : "pointer",
      transition: "all 0.2s",
      flexShrink: 0,
      opacity: disabled ? 0.52 : 1,
    }}>
      <div style={{
        position: "absolute",
        top: 3,
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: disabled ? "rgba(232,237,246,0.30)" : on ? NAVY : "rgba(232,237,246,0.55)",
        transition: "all 0.2s",
        left: on ? "calc(100% - 25px)" : 3,
        boxShadow: "0 2px 4px rgba(0,0,0,0.30)",
      }}/>
    </button>
  );
}

function IconBadge({ children, color = GOLD }) {
  return (
    <div style={{
      width: 38,
      height: 38,
      borderRadius: 13,
      background: PANEL_L1,
      border: `1px solid ${INK(0.08)}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color,
      flexShrink: 0,
    }}>
      {children}
    </div>
  );
}

function StatusPill({ children, tone = "gold" }) {
  const color = tone === "clear" ? CLEAR : tone === "warm" ? WARM : GOLD;
  return (
    <span style={{
      height: 24,
      borderRadius: 12,
      padding: "0 9px",
      background: NAVY_DARK,
      color: INK(0.78),
      fontSize: 10.5,
      fontWeight: 900,
      display: "inline-flex",
      alignItems: "center",
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

function ShortcutContextCard({ focus, origin }) {
  if (!focus) return null;
  const copy = {
    umbrella: { label: "우산 알림", title: "우산 알림 시간 조정", desc: "우산 추천에서 들어온 설정. 강수 시작 전 알림을 고급 설정에서 바로 조정함.", tone: SKY },
    rain: { label: "강수 알림", title: "비 시작·그침 알림 조정", desc: "강수 타임라인에서 들어온 설정. 강수 상세 알림을 켜고 필요한 경우만 조정함.", tone: SKY },
    destination: { label: "목적지 알림", title: "목적지 알림 조정", desc: "출발·신발·우산 알림을 목적지 기준으로 묶어 관리함.", tone: CLEAR },
  }[focus];
  if (!copy) return null;
  return (
    <div style={{
      borderRadius: 16,
      padding: "12px 14px",
      background: NAVY_DARK,
      border: `1px solid ${INK(0.10)}`,
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <IconBadge color={copy.tone}><BellSVG size={17}/></IconBadge>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: INK(0.78), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace" }}>{copy.label}</div>
        <div style={{ color: INK(0.94), fontSize: 12.8, fontWeight: 900, marginTop: 3 }}>{copy.title}</div>
        <div style={{ color: INK(0.70), fontSize: 10.7, lineHeight: 1.45, marginTop: 2 }}>{copy.desc}</div>
      </div>
      {origin && <StatusPill tone="clear">{origin}</StatusPill>}
    </div>
  );
}

function SummaryCard({ icon, title, desc, status, tone, muted = false }) {
  return (
    <div style={{
      borderRadius: 18,
      padding: "14px 14px",
      background: PANEL,
      border: `1px solid ${INK(0.08)}`,
      display: "flex",
      gap: 12,
      alignItems: "center",
      boxShadow: "0 6px 16px rgba(0,0,0,0.22)",
      opacity: muted ? 0.62 : 1,
    }}>
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ color: INK(0.94), fontSize: 14, fontWeight: 900, lineHeight: 1.25 }}>{title}</div>
          <StatusPill tone={tone}>{status}</StatusPill>
        </div>
        <div style={{ color: INK(0.72), fontSize: 11.2, lineHeight: 1.45, marginTop: 4 }}>{desc}</div>
      </div>
    </div>
  );
}

function AdvancedRow({ title, desc, on, onChange, locked, disabled = false }) {
  return (
    <div style={{
      minHeight: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "10px 0",
      borderBottom: `1px solid ${INK(0.07)}`,
    }}>
      <div style={{ opacity: disabled ? 0.58 : 1 }}>
        <div style={{ color: INK(0.88), fontSize: 12.7, fontWeight: 800 }}>{title}</div>
        <div style={{ color: INK(0.68), fontSize: 10.7, lineHeight: 1.35, marginTop: 2 }}>{desc}</div>
      </div>
      {locked ? <span style={{ color: CLEAR, fontSize: 11, fontWeight: 900 }}>필수</span> : <Toggle on={on} onChange={onChange} disabled={disabled}/>}
    </div>
  );
}

const tabDefs = [
  { id: "홈", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: "코디", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg> },
  { id: "출발", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg> },
  { id: "MY", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { id: "소셜", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
];

function TabItem({ tab, active, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <button type="button" {...handlers} onClick={onClick} aria-label={tab.id === "MY" ? "마이" : tab.id} aria-current={active ? "page" : undefined} style={{
      flex: 1,
      height: 52,
      position: "relative",
      overflow: "hidden", flexShrink: 0,
      borderRadius: 14,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      cursor: "pointer",
      color: active ? GOLD : INK(0.66),
      border: 0,
      background: "transparent",
      fontFamily: "'Noto Sans KR',sans-serif",
    }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: active ? GOLD : "transparent", marginBottom: 1 }}/>
      {tab.icon}
      <span style={{ fontSize: 10.5, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{tab.id === "MY" ? "마이" : tab.id}</span>
    </button>
  );
}

export default function WeatherON_M2({ navigate, routeState = {}, updateSettingsState } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState.themeMode);
  const [autoCare, setAutoCare] = useState(routeState.smartCareEnabled ?? true);
  const [advancedOpen, setAdvancedOpen] = useState(Boolean(routeState.alertAdvancedOpen));
  const [systemPermission, setSystemPermission] = useState(Boolean(routeState.permissionReady));
  const [accountLinked, setAccountLinked] = useState(Boolean(routeState.accountLinked));
  const [rainDetail, setRainDetail] = useState(routeState.rainDetail ?? true);
  const [routine, setRoutine] = useState(routeState.routineAlert ?? true);
  const [bedtime, setBedtime] = useState(routeState.bedtimeAlert ?? true);
  const [destination, setDestination] = useState(routeState.destinationAlert ?? true);
  const [quiet, setQuiet] = useState(routeState.quietHours ?? true);
  const contentRef = useRef(null);
  const originReturnTo = routeState.originReturnTo || (routeState.returnTo && routeState.returnTo !== "M2" ? routeState.returnTo : null);
  const alertFocus = routeState.alertFocus;
  const returnState = {
    ...routeState,
    returnTo: originReturnTo === "G2" ? (routeState.parentReturnTo || "G1") : routeState.returnTo,
    resumeAlertSettings: true,
    alertReady: alertFocus === "umbrella" || routeState.alertReady,
    rainAlertReady: alertFocus === "rain" || routeState.rainAlertReady,
    careOn: alertFocus === "destination" || routeState.careOn,
  };
  const goBack = () => navigate?.(originReturnTo || "M1", returnState);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (routeState.accountLinked) setAccountLinked(true);
    if (routeState.resumeAlertSettings || routeState.alertFocus) {
      setAdvancedOpen(true);
      updateSettingsState?.({ alertAdvancedOpen: true });
    }
    if (routeState.permissionReady) setSystemPermission(true);
    if (routeState.resumePermissionSettings) {
      setAdvancedOpen(true);
      updateSettingsState?.({ alertAdvancedOpen: true });
    }
  }, [
    routeState.accountLinked,
    routeState.resumeAlertSettings,
    routeState.alertFocus,
    routeState.permissionReady,
    routeState.resumePermissionSettings,
    updateSettingsState,
  ]);

  useEffect(() => {
    if (advancedOpen && contentRef.current) {
      requestAnimationFrame(() => {
        contentRef.current.scrollTo({ top: 220, behavior: "smooth" });
      });
    }
  }, [advancedOpen]);

  const smartPaused = !autoCare;
  const permissionBlocked = autoCare && !systemPermission;
  const careAvailable = autoCare && systemPermission;
  const mutedSummaries = smartPaused || permissionBlocked;
  const destinationReady = careAvailable && accountLinked;
  const heroTitle = smartPaused ? "스마트 알림 일시 중지" : permissionBlocked ? "알림 권한 확인 필요" : "스마트 알림 켜짐";
  const heroDesc = smartPaused
    ? "긴급 날씨만 남기고 루틴 알림은 잠시 멈춤"
    : permissionBlocked
      ? "기기 알림 권한을 켜면 준비 알림이 자동 적용됨"
      : "날씨·위치·목적지 기준으로 필요한 알림만 자동 보정";
  const heroTone = smartPaused ? "warm" : permissionBlocked ? "gold" : "clear";
  const routineDesc = smartPaused
    ? "스마트 알림을 켜면 다시 자동 적용"
    : permissionBlocked
      ? "권한 확인 후 출근·외출 준비 알림 적용"
      : "출근·외출 준비와 자기 전 내일 체크를 자동으로 묶음";
  const destinationDesc = smartPaused
    ? "스마트 알림 일시 중지 중"
    : permissionBlocked
      ? "권한 확인 후 목적지 알림 적용"
      : accountLinked
        ? "목적지 등록 시 출발·신발·여행 날씨를 연결"
        : "목적지 조회 가능, 알림 저장은 계정 연결 후 적용";
  const enabledAdvancedCount = [rainDetail, routine, bedtime, destination, quiet].filter(Boolean).length;
  const persistSetting = (nextState) => updateSettingsState?.(nextState);
  const toggleSmartCare = () => {
    setAutoCare((value) => {
      const next = !value;
      persistSetting({ smartCareEnabled: next });
      return next;
    });
  };
  const toggleAdvancedOpen = () => {
    setAdvancedOpen((value) => {
      const next = !value;
      persistSetting({ alertAdvancedOpen: next });
      return next;
    });
  };
  const closeAdvanced = () => {
    setAdvancedOpen(false);
    persistSetting({ alertAdvancedOpen: false });
  };
  const routeTab = (id) => {
    if (id === "홈") navigate?.("H1");
    if (id === "코디") navigate?.("C1");
    if (id === "출발") navigate?.("G1");
    if (id === "MY") navigate?.("M1");
    if (id === "소셜") navigate?.("S0");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: weatherTheme.shellBg,
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>
        M2 · 스마트 알림 설정 · 하이브리드 크롬
      </div>

      <div style={{
        width: 393,
        height: 852,
        borderRadius: 40,
        overflow: "hidden",
        position: "relative", flexShrink: 0,
        boxShadow: weatherTheme.phoneShadow,
        background: weatherTheme.gradient,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 28px 10px", height: 54, position: "absolute", top: 0, left: 0, right: 0, color: INK(0.94), fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
          <span>9:41</span>
          <span style={{ fontSize: 13, color: INK(0.70) }}>●●● 5G</span>
        </div>

        <div style={{ paddingTop: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 0" }}>
            <button onClick={goBack} aria-label="뒤로" style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <div>
              <div style={{ color: INK(0.94), fontSize: 17, fontWeight: 900 }}>스마트 알림 설정</div>
              <div style={{ color: INK(0.68), fontSize: 10.8, marginTop: 2 }}>기본은 자동, 필요한 경우만 세부 조정</div>
            </div>
          </div>

          <div ref={contentRef} style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 176px)", overflowY: "auto", paddingBottom: 146, scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <ShortcutContextCard focus={alertFocus} origin={originReturnTo}/>

            <div style={{
              borderRadius: 22,
              padding: 17,
              background: NAVY_DARK,
              border: `1px solid ${INK(0.10)}`,
              boxShadow: "0 8px 18px rgba(0,0,0,0.24)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <IconBadge color={GOLD}><BellSVG/></IconBadge>
                <div style={{ flex: 1 }}>
                  <div style={{ color: INK(0.78), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace" }}>알아서 챙기기</div>
                  <div style={{ color: INK(0.94), fontSize: 17, fontWeight: 900, lineHeight: 1.25, marginTop: 2 }}>{heroTitle}</div>
                  <div style={{ color: INK(0.74), fontSize: 11.2, lineHeight: 1.45, marginTop: 4 }}>
                    {heroDesc}
                  </div>
                </div>
                <Toggle on={autoCare} onChange={toggleSmartCare}/>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 13, flexWrap: "wrap" }}>
                <StatusPill tone={heroTone}>{careAvailable ? "자동 챙김 켜짐" : permissionBlocked ? "권한 필요" : "일시 중지"}</StatusPill>
                <StatusPill>{careAvailable ? "생활 루틴" : permissionBlocked ? "대기 중" : "루틴 중지"}</StatusPill>
                <StatusPill tone="warm">하루 최대 3건</StatusPill>
              </div>
            </div>

            <div style={{
              borderRadius: 16,
              padding: "12px 14px",
              background: systemPermission ? "rgba(58,191,160,0.11)" : "rgba(232,133,74,0.12)",
              border: `1px solid ${systemPermission ? "rgba(58,191,160,0.26)" : "rgba(232,133,74,0.28)"}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <IconBadge color={systemPermission ? CLEAR : WARM}><BellSVG size={17}/></IconBadge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: INK(0.94), fontSize: 12.8, fontWeight: 900 }}>{systemPermission ? "알림 권한 정상" : "알림 권한 확인 필요"}</div>
                <div style={{ color: INK(0.72), fontSize: 10.7, lineHeight: 1.45, marginTop: 2 }}>
                  {systemPermission ? "현재 기기에서 WeatherON 알림을 받을 수 있음" : "권한이 꺼지면 모든 알림이 중단됨"}
                </div>
              </div>
              <button onClick={() => navigate?.("O3", {
                pendingAction: "알림 추가",
                returnTo: "M2",
                originReturnTo,
                parentReturnTo: routeState.parentReturnTo,
                alertFocus,
                resumePermissionSettings: true,
                resumeAlertSettings: advancedOpen,
                accountLinked,
                destination: routeState.destination,
                alertReady: returnState.alertReady,
                rainAlertReady: returnState.rainAlertReady,
                careOn: returnState.careOn,
              })} style={{
                height: 30,
                borderRadius: 15,
                padding: "0 11px",
                border: `1px solid ${INK(0.10)}`,
                background: NAVY_DARK,
                color: INK(0.82),
                fontSize: 11,
                fontWeight: 900,
                cursor: "pointer",
              }}>권한 관리</button>
            </div>

            <div style={{
              borderRadius: 16,
              padding: "12px 14px",
              background: !systemPermission ? "rgba(232,133,74,0.12)" : accountLinked ? "rgba(58,191,160,0.11)" : "rgba(240,160,32,0.10)",
              border: `1px solid ${!systemPermission ? "rgba(232,133,74,0.28)" : accountLinked ? "rgba(58,191,160,0.24)" : "rgba(240,160,32,0.24)"}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <IconBadge color={!systemPermission ? WARM : accountLinked ? CLEAR : GOLD}><RouteSVG size={17}/></IconBadge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: INK(0.94), fontSize: 12.8, fontWeight: 900 }}>목적지 알림 조건</div>
                <div style={{ color: INK(0.72), fontSize: 10.7, lineHeight: 1.45, marginTop: 2 }}>
                  {!systemPermission ? "알림 권한이 꺼지면 목적지 알림을 받을 수 없음" : accountLinked ? "계정/권한 준비 · 저장 목적지 알림 가능" : "게스트는 조회 가능 · 목적지 알림 저장은 계정 연결 필요"}
                </div>
              </div>
              <button onClick={() => {
                if (accountLinked) {
                  setAccountLinked(false);
                  return;
                }
                navigate?.("A2", {
                  pendingAction: "알림 추가",
                  returnTo: "M2",
                  originReturnTo,
                  parentReturnTo: routeState.parentReturnTo,
                  alertFocus,
                  resumeAlertSettings: true,
                  destination: routeState.destination,
                  alertReady: returnState.alertReady,
                  rainAlertReady: returnState.rainAlertReady,
                  careOn: returnState.careOn,
                });
              }} style={{
                height: 30,
                borderRadius: 15,
                padding: "0 11px",
                border: `1px solid ${INK(0.10)}`,
                background: accountLinked ? "rgba(58,191,160,0.16)" : NAVY_DARK,
                color: accountLinked ? CLEAR : INK(0.82),
                fontSize: 11,
                fontWeight: 900,
                cursor: "pointer",
              }}>{accountLinked ? "계정 연결됨" : "계정 연결"}</button>
            </div>

            <div style={{ color: INK(0.72), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginTop: 4 }}>
              적용 중인 알림
            </div>

              <SummaryCard
                icon={<IconBadge color={SKY}><RainSVG/></IconBadge>}
                title="필수 날씨"
              desc={careAvailable ? "강수 임박, 폭염·한파·강풍 특보는 자동 발송" : permissionBlocked ? "권한 확인 전까지 앱 안에서만 확인" : "긴급성 높은 강수·특보만 유지"}
              status={careAvailable ? "항상" : permissionBlocked ? "권한 필요" : "긴급만"}
              tone="clear"
              muted={false}
            />
            <SummaryCard
              icon={<IconBadge color={GOLD}><SunSVG/></IconBadge>}
              title="생활 루틴"
              desc={routineDesc}
              status={careAvailable ? "자동" : permissionBlocked ? "권한 필요" : "중지"}
              muted={mutedSummaries}
            />
            <SummaryCard
              icon={<IconBadge color={CLEAR}><RouteSVG/></IconBadge>}
              title="목적지·여행"
              desc={destinationDesc}
              status={careAvailable ? (accountLinked ? "등록 시" : "계정 필요") : permissionBlocked ? "권한 필요" : "중지"}
              tone="clear"
              muted={mutedSummaries || !accountLinked}
            />

            <button onClick={toggleAdvancedOpen} style={{
              minHeight: 48,
              borderRadius: 16,
              border: `1px solid ${INK(0.10)}`,
              background: NAVY_DARK,
              color: INK(0.84),
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              cursor: "pointer",
              fontSize: 12.8,
              fontWeight: 800,
              fontFamily: "'Noto Sans KR',sans-serif",
            }}>
              고급 설정
              <ChevronRightSVG open={advancedOpen}/>
            </button>

            <div style={{
              borderRadius: 13,
              padding: "10px 14px",
              background: PANEL_L1,
              border: `1px solid ${INK(0.08)}`,
            }}>
              <div style={{ color: INK(0.86), fontSize: 11.4, lineHeight: 1.5 }}>
                알아서 챙기기 {autoCare ? "켬" : "끔"}{permissionBlocked ? " · 권한 확인 필요" : ""} · 세부 조정 {enabledAdvancedCount}/5 적용
              </div>
            </div>

            {advancedOpen && (
              <div style={{
                borderRadius: 18,
                background: PANEL,
                border: `1px solid ${INK(0.08)}`,
                padding: "0 14px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.22)",
              }}>
                <AdvancedRow title="강수 상세" desc="비 시작 전·그칠 시각 알림" on={rainDetail} onChange={() => setRainDetail((v) => { const next = !v; persistSetting({ rainDetail: next }); return next; })} disabled={!systemPermission}/>
                <AdvancedRow title="출근·외출 준비" desc="날씨·코디·우산·신발 통합 알림" on={routine} onChange={() => setRoutine((v) => { const next = !v; persistSetting({ routineAlert: next }); return next; })} disabled={!careAvailable}/>
                <AdvancedRow title="자기 전 체크" desc="내일 날씨·코디 미확인 시 1회" on={bedtime} onChange={() => setBedtime((v) => { const next = !v; persistSetting({ bedtimeAlert: next }); return next; })} disabled={!careAvailable}/>
                <AdvancedRow title="목적지·여행" desc="출발·신발·여행 D-1 알림" on={destination} onChange={() => setDestination((v) => { const next = !v; persistSetting({ destinationAlert: next }); return next; })} disabled={!destinationReady}/>
                <AdvancedRow title="방해 줄이기" desc="하루 최대 3건, 수면시간 제한" on={quiet} onChange={() => setQuiet((v) => { const next = !v; persistSetting({ quietHours: next }); return next; })} disabled={!careAvailable}/>
                <div style={{ display: "flex", gap: 8, padding: "12px 0 14px" }}>
                  <button onClick={() => setSystemPermission((v) => !v)} style={{
                    flex: 1,
                    height: 38,
                    borderRadius: 13,
                    border: `1px solid ${INK(0.10)}`,
                    background: NAVY_DARK,
                    color: INK(0.78),
                    fontSize: 11.5,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}>권한 확인</button>
                  <button onClick={closeAdvanced} style={{
                    flex: 1,
                    height: 38,
                    borderRadius: 13,
                    border: 0,
                    background: GOLD,
                    color: NAVY_DARK,
                    fontSize: 11.5,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}>완료</button>
                </div>
              </div>
            )}

          </div>
        </div>

        <div style={{
          position: "absolute",
          bottom: 18,
          left: 16,
          right: 16,
          height: 64,
          background: NAVY_DARK,
          borderRadius: 24,
          border: `1px solid ${INK(0.08)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 4px",
          boxShadow: "0 10px 24px rgba(0,0,0,0.45)",
          zIndex: 20,
        }}>
          {tabDefs.map((tab) => (
            <TabItem key={tab.id} tab={tab} active={tab.id === "MY"} onClick={() => routeTab(tab.id)}/>
          ))}
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · M2 스마트 알림 설정
      </div>
    </div>
  );
}
