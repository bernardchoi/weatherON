import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON H5 · 강수 타임라인 (하이브리드 크롬) ────────────────────
   와이어프레임 H5 기준: 비 예보 푸시 알림에서 진입
   - 18:00 비 시작 → 21:00 그침
   - 30분 단위 강수량 바 차트 (17시~21:30)
   - 외출 가이드 (지금 나가면 비 전 도착 가능)
   - "그치면 알려줘" 토글
   - 비 알림 설정 → M2c
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

/* ── 우산/체크/시계/설정 아이콘 — brand/WeatherON_아이콘_시스템.md 기준 ── */
function RainCloudSVG({ size = 26, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 16.4A5 5 0 0017 7h-1.26A8 8 0 104 15.25" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
      <line x1="8" y1="19" x2="8" y2="21" stroke={SKY} strokeWidth={1.8} strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke={SKY} strokeWidth={1.8} strokeLinecap="round"/>
      <line x1="16" y1="19" x2="16" y2="21" stroke={SKY} strokeWidth={1.8} strokeLinecap="round"/>
    </svg>
  );
}
function CheckSVG({ size = 14, color = CLEAR }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function UmbrellaSVG({ size = 14, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12a10 10 0 10-20 0z"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M9 21a2 2 0 004 0"/>
    </svg>
  );
}
function ClockSVG({ size = 14, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 7 12 12 16 14"/>
    </svg>
  );
}
function SettingsSVG({ size = 14, color = MISTLITE(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005 14.6a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

const rainData = [
  { time: "17:00", mm: 0.2 }, { time: "17:30", mm: 0.5 }, { time: "18:00", mm: 1.8 },
  { time: "18:30", mm: 3.5 }, { time: "19:00", mm: 4.2 }, { time: "19:30", mm: 3.8 },
  { time: "20:00", mm: 2.5 }, { time: "20:30", mm: 1.0 }, { time: "21:00", mm: 0.3 },
];
const maxMm = Math.max(...rainData.map(d => d.mm));

export default function WeatherON_H5({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const isLight = weatherTheme.mode === "light";
  const [alertToggle, setAlertToggle] = useState(Boolean(routeState.rainAlertReady || routeState.alertToggle));
  const [activeTab, setActiveTab] = useState("홈");
  const backBtn = usePressTint();
  const settingsBtn = usePressTint();
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
        H5 · 강수 타임라인 · 하이브리드 크롬
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
            <button {...backBtn.handlers} onClick={() => navigate?.("H1")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position:"relative", overflow:"hidden" }}>
              <PressTintOverlay pressed={backBtn.pressed} tint={GOLD}/>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span style={{ color: INK(0.94), fontSize: 18, fontWeight: 700 }}>강수 타임라인</span>
          </div>

          {/* Content */}
          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 130px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 184 }}>

            {/* 요약 카드 */}
            <BrandCard accent={SKY} style={{ borderRadius: 20, padding: "18px 20px 18px 23px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom: 6 }}><RainCloudSVG size={30}/></div>
                <div style={{ color: INK(0.94), fontSize: 17, fontWeight: 800 }}>18:00 비 시작 → 21:00 그침</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 8 }}>
                  <span style={{ color: INK(0.78), fontSize: 12 }}>시간당 최대 4mm</span>
                  <span style={{ color: INK(0.82), fontSize: 12 }}>·</span>
                  <span style={{ color: INK(0.78), fontSize: 12 }}>보통 강도</span>
                </div>
              </div>
            </BrandCard>

            {/* 30분 단위 바 차트 */}
            <BrandCard style={{ borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 12, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                30분 단위 강수량
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 92, marginBottom: 6 }}>
                {rainData.map((d, i) => {
                  const heightPct = (d.mm / maxMm) * 100;
                  const isRaining = d.mm >= 1.0;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                      <div style={{ marginBottom: 4, color: INK(0.72), fontSize: 10, fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>
                        {isRaining ? d.mm : ""}
                      </div>
                      <div style={{
                        width: "100%", height: `${Math.max(heightPct, 4)}%`,
                        background: isRaining ? `rgba(74,143,212,${0.35 + (d.mm / maxMm) * 0.55})` : "rgba(74,143,212,0.15)",
                        borderRadius: "3px 3px 1px 1px",
                      }} />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {["17:00", "", "18:00", "", "19:00", "", "20:00", "", "21:00"].map((t, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", color: INK(0.68), fontSize: 10, fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>
                    {t}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 10, justifyContent: "center" }}>
                {[
                  { color: "rgba(74,143,212,0.25)", label: "약함" },
                  { color: "rgba(74,143,212,0.55)", label: "보통" },
                  { color: SKY, label: "강함" },
                ].map(leg => (
                  <div key={leg.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: leg.color }} />
                    <span style={{ color: INK(0.68), fontSize: 10, fontWeight: 700 }}>{leg.label}</span>
                  </div>
                ))}
              </div>
            </BrandCard>

            {/* 외출 가이드 */}
            <BrandCard accent={CLEAR} style={{ borderRadius: 16, padding: "14px 16px 14px 19px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>외출 가이드</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckSVG size={14}/>
                  <span style={{ color: INK(0.85), fontSize: 13 }}>지금 나가면 비 전 도착 가능</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <UmbrellaSVG size={14} color={INK(0.75)}/>
                  <span style={{ color: INK(0.75), fontSize: 13 }}>18시 이후 외출 시 우산 필수</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ClockSVG size={14} color={INK(0.70)}/>
                  <span style={{ color: INK(0.70), fontSize: 13 }}>21시 이후는 비가 그칩니다</span>
                </div>
              </div>
            </BrandCard>

            {/* "그치면 알려줘" 토글 */}
            <BrandCard style={{ borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: INK(0.85), fontSize: 14, fontWeight: 600 }}>비 그치면 알려줘</div>
                  <div style={{ color: INK(0.68), fontSize: 11, marginTop: 2 }}>비가 그칠 때 알림을 보내드려요</div>
                </div>
                {/* Toggle — 공유 글리프(토글+태양노브) 모티프, Gold 노브 */}
                <button
                  onClick={() => setAlertToggle(!alertToggle)}
                  style={{
                    width: 48, height: 28, borderRadius: 14,
                    background: alertToggle ? GOLD : NAVY_DARK,
                    border: alertToggle ? "none" : `1px solid ${INK(0.14)}`,
                    position: "relative", cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 3, width: 22, height: 22, borderRadius: "50%",
                    background: alertToggle ? NAVY : "rgba(232,237,246,0.55)", transition: "all 0.2s",
                    left: alertToggle ? "calc(100% - 25px)" : 3,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.30)",
                  }} />
                </button>
              </div>
            </BrandCard>

            <BrandCard style={{ borderRadius: 16, padding: "12px 14px", border: `1px solid ${SKY}33` }}>
              <div style={{ color: INK(0.86), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>강수</div>
              <div style={{ color: INK(0.78), fontSize: 12, lineHeight: 1.55 }}>
                18:00 시작 · 21:00 종료 · {alertToggle ? "그침 알림 켬" : "그침 알림 끔"}
              </div>
            </BrandCard>

          </div>

          <div style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 82,
            zIndex: 22,
            padding: "14px 20px 10px",
            background: isLight
              ? "linear-gradient(180deg, rgba(245,249,252,0), rgba(245,249,252,0.94) 34%, rgba(215,234,247,1) 100%)"
              : "linear-gradient(180deg, rgba(16,36,63,0), rgba(16,36,63,0.94) 34%, rgba(31,78,121,1) 100%)",
            pointerEvents: "none",
          }}>
            <button {...settingsBtn.handlers} onClick={() => navigate?.("M2", {
              returnTo: "H5",
              originReturnTo: "H5",
              alertFocus: "rain",
              resumeAlertSettings: true,
              rainAlertReady: true,
              alertToggle: true,
            })} style={{
              width: "100%",
              height: 48,
              borderRadius: 16,
              background: PANEL,
              border: `1px solid ${isLight ? "rgba(31,78,121,0.14)" : INK(0.10)}`,
              color: INK(0.88),
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "'Noto Sans KR', sans-serif",
              position: "relative",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: isLight ? "0 10px 22px rgba(31,78,121,0.14)" : "0 10px 22px rgba(0,0,0,0.30)",
              pointerEvents: "auto",
            }}>
              <PressTintOverlay pressed={settingsBtn.pressed} tint={GOLD}/>
              <span style={{ display:"inline-flex", alignItems:"center", gap:7 }}>
                <SettingsSVG size={14} color={INK(0.85)}/> 비 알림 설정
              </span>
            </button>
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
        WeatherON · H5 강수 타임라인
      </div>
    </div>
  );
}
