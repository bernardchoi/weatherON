import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON O3 · 권한 요청 (하이브리드 크롬) ────────────────────────
   와이어프레임 O3 기준: 위치 → 알림 순으로 시스템 권한 다이얼로그 호출
   - 📍 위치 권한 (현재 위치 날씨·출발지 파악) — "위치 허용"
   - 🔔 알림 권한 (강수·특보·외출·여행·자기 전 확인 알림 수신) — "알림 허용"
   - 거부 시에도 다음 단계 진행 가능, 거부 상태는 마이 > 전역 설정에서 재요청
   - 탭바 없음 (온보딩 단계)
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#2A5D8F';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let SKY       = '#4A8FD4';
let CLEAR     = '#3ABFA0';
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
function CheckSVG({ size = 13, color = NAVY }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function PinSVG({ size = 26, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function BellSVG({ size = 26, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

function AlertChip({ label }) {
  return (
    <span style={{
      height: 26,
      borderRadius: 13,
      padding: "0 10px",
      background: NAVY_DARK,
      border: `1px solid ${INK(0.10)}`,
      color: INK(0.72),
      fontSize: 10.8,
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Noto Sans KR',sans-serif",
    }}>
      {label}
    </span>
  );
}

function PermissionCard({ icon, accent, title, desc, label, granted, denied, onGrant }) {
  const btn = usePressTint();
  return (
    <BrandCard accent={accent} style={{ borderRadius: 18, padding: "16px 16px 16px 19px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: PANEL_L1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: accent, opacity: 0.16 }}/>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: INK(0.94), fontSize: 15, fontWeight: 700, marginBottom: 3, fontFamily: "'Noto Sans KR',sans-serif" }}>{title}</div>
          <div style={{ color: INK(0.78), fontSize: 12.5, lineHeight: 1.5, fontFamily: "'Noto Sans KR',sans-serif" }}>{desc}</div>
        </div>
      </div>
      <button {...btn.handlers} onClick={onGrant} disabled={granted || denied} style={{
        width: "100%", height: 42, borderRadius: 14, marginTop: 12,
        background: granted ? "rgba(58,191,160,0.16)" : denied ? "rgba(240,160,32,0.12)" : GOLD,
        border: granted ? "1px solid rgba(58,191,160,0.35)" : denied ? "1px solid rgba(240,160,32,0.32)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        cursor: granted || denied ? "default" : "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
      }}>
        {!granted && !denied && <PressTintOverlay pressed={btn.pressed} tint={NAVY}/>}
        {granted ? (
          <>
            <CheckSVG color={INK(0.78)}/>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: INK(0.78), fontFamily: "'Plus Jakarta Sans',sans-serif" }}>허용됨</span>
          </>
        ) : denied ? (
          <span style={{ fontSize: 13.5, fontWeight: 800, color: INK(0.78), fontFamily: "'Plus Jakarta Sans',sans-serif" }}>거부됨 · 설정에서 복구</span>
        ) : (
          <span style={{ fontSize: 13.5, fontWeight: 700, color: ON_GOLD, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{label}</span>
        )}
      </button>
    </BrandCard>
  );
}

function PermissionStateCard({ locationGranted, notifGranted, denied }) {
  const grantedCount = [locationGranted, notifGranted].filter(Boolean).length;
  const ready = grantedCount > 0;
  return (
    <BrandCard accent={ready ? CLEAR : GOLD} style={{ borderRadius: 16, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ color: INK(0.78), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace" }}>권한 상태</div>
          <div style={{ color: INK(0.84), fontSize: 12, lineHeight: 1.45, marginTop: 4 }}>
            {denied ? "거부해도 홈과 추천은 사용 가능, M3에서 재요청" : ready ? "허용된 권한은 필요한 알림에 반영됨" : "허용하지 않아도 다음 단계 진행 가능"}
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
        }}>{denied ? "거부" : `${grantedCount}/2`}</span>
      </div>
    </BrandCard>
  );
}

export default function WeatherON_O3({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [locationGranted, setLocationGranted] = useState(Boolean(routeState.locationReady));
  const [notifGranted, setNotifGranted] = useState(Boolean(routeState.permissionReady));
  const [permissionScenario, setPermissionScenario] = useState("request");
  const nextBtn = usePressTint();
  const denied = permissionScenario === "denied";
  const showDeniedScenario = () => {
    setLocationGranted(false);
    setNotifGranted(false);
    setPermissionScenario("denied");
  };
  const showRequestScenario = () => {
    setLocationGranted(false);
    setNotifGranted(false);
    setPermissionScenario("request");
  };
  const continueNext = () => {
    const nextState = {
      ...routeState,
      locationReady: locationGranted,
      permissionReady: notifGranted,
    };
    navigate?.(routeState.returnTo || "O4", nextState);
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
        O3 · 권한 요청 · 하이브리드 크롬
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

        <div style={{ padding: "84px 20px 0", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <div style={{ color: INK(0.94), fontSize: 17, fontWeight: 800, marginBottom: 6, fontFamily: "'Noto Sans KR',sans-serif" }}>
              필요한 권한만 먼저 허용해 주세요
            </div>
            <div style={{ color: INK(0.78), fontSize: 13, fontFamily: "'Noto Sans KR',sans-serif" }}>
              나머지 알림 세부 설정은 다음 단계에서 간단히 정해요
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button onClick={showRequestScenario} style={{
              height: 34, borderRadius: 14, border: `1px solid ${INK(0.10)}`,
              background: !denied ? GOLD : NAVY_DARK,
              color: !denied ? ON_GOLD : INK(0.72),
              fontSize: 11.5, fontWeight: 900, cursor: "pointer",
              fontFamily: "'Noto Sans KR',sans-serif",
            }}>권한 요청</button>
            <button onClick={showDeniedScenario} style={{
              height: 34, borderRadius: 14, border: `1px solid ${INK(0.10)}`,
              background: denied ? GOLD : NAVY_DARK,
              color: denied ? ON_GOLD : INK(0.72),
              fontSize: 11.5, fontWeight: 900, cursor: "pointer",
              fontFamily: "'Noto Sans KR',sans-serif",
            }}>거부 상태</button>
          </div>

          <PermissionCard
            icon={<PinSVG/>} accent={SKY}
            title="위치 권한" desc="현재 위치 날씨·출발지 파악에 사용돼요"
            label="위치 허용" granted={locationGranted} denied={denied} onGrant={() => setLocationGranted(true)}
          />
          <PermissionCard
            icon={<BellSVG/>} accent={GOLD}
            title="알림 권한" desc="강수·기상특보·외출 준비·여행·자기 전 확인 알림에 사용돼요"
            label="알림 허용" granted={notifGranted} denied={denied} onGrant={() => setNotifGranted(true)}
          />

          <PermissionStateCard locationGranted={locationGranted} notifGranted={notifGranted} denied={denied}/>

          <div style={{ background: NAVY_DARK, borderRadius: 16, padding: "11px 13px", border: `1px dashed ${INK(0.14)}` }}>
            <div style={{ color: INK(0.68), fontSize: 11, textAlign: "center", lineHeight: 1.55, marginBottom: 8, fontFamily: "'Noto Sans KR',sans-serif" }}>
              {denied ? "권한 거부 시 현재 위치·푸시는 제한되지만, 검색 위치와 앱 내 안내는 계속 작동해요" : "허용해도 모든 알림이 켜지는 건 아니며, 다음 단계에서 필요한 알림만 묶어드려요"}
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
              {denied ? (
                <>
                  <AlertChip label="M3 권한 관리"/>
                  <AlertChip label="시스템 설정 이동"/>
                  <AlertChip label="검색 위치 사용"/>
                </>
              ) : (
                <>
                  <AlertChip label="강수·특보"/>
                  <AlertChip label="출근·외출"/>
                  <AlertChip label="자기 전 체크"/>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 48 }}>
          <button {...nextBtn.handlers} onClick={continueNext} style={{
            width: "100%", height: 54, borderRadius: 18,
            background: locationGranted || notifGranted ? GOLD : NAVY_DARK,
            border: locationGranted || notifGranted ? "none" : `1px solid ${INK(0.12)}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
            boxShadow: locationGranted || notifGranted ? "0 6px 16px rgba(0,0,0,0.30)" : "none",
          }}>
            <PressTintOverlay pressed={nextBtn.pressed} tint={locationGranted || notifGranted ? NAVY : GOLD}/>
            <span style={{ color: locationGranted || notifGranted ? ON_GOLD : INK(0.72), fontSize: 14.5, fontWeight: 800, fontFamily: "'Noto Sans KR',sans-serif" }}>
              {routeState.returnTo ? (locationGranted || notifGranted ? "원래 설정으로 돌아가기" : "권한 없이 돌아가기") : denied ? "제한 상태로 계속" : locationGranted && notifGranted ? "추천 기준 설정하기" : "나중에 설정하고 계속"}
            </span>
          </button>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · O3 권한 요청
      </div>
    </div>
  );
}
