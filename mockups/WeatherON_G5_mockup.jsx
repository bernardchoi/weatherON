import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON G5 · 국토종주 AI 플래너 (F8 · 프리미엄) (하이브리드 크롬)
   와이어프레임 G5 기준: AI 모델 기반 최대 14일 구간 날씨 종합 분석
   - 여정 설정(출발지/목적지, 출발일/일수)
   - AI 분석 결과: Day별 상태(최적/주의/경고)
   - 짐 체크리스트
   - 예보 업데이트 알림 켬(기상 변화 시 재분석)
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
let WARM      = '#E8854A';
const RAIN_RED  = '#E97F77';
const PREMIUM   = '#AB8EDD';
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
function CheckSVG({ size = 13, color = CLEAR }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function BellSVG({ size = 14, color = SKY }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

const aiDays = [
  { day: "1일차", date: "7/5",  weather: "맑음", temp: "28°", status: "출발 최적",     color: CLEAR },
  { day: "3일차", date: "7/7",  weather: "비", temp: "24°", status: "우비 필수 · 단축 권장", color: WARM },
  { day: "7일차", date: "7/11", weather: "폭우", temp: "22°", status: "일정 조정 권고", color: RAIN_RED },
];

function AiPlanStateCard({ permissionReady, saved, shared }) {
  const stateColor = shared ? CLEAR : saved ? GOLD : permissionReady ? PREMIUM : WARM;
  const readableStateColor = stateColor === PREMIUM ? "#7C3AED" : stateColor;
  const stateText = shared
    ? "공유 준비 완료 · 저장된 프리미엄 플랜 유지"
    : saved
      ? "AI 플랜 저장 완료 · 예보 업데이트 재분석 대기"
      : permissionReady
        ? "프리미엄 활성 · 예보 업데이트 시 재분석 알림 가능"
        : "프리미엄 활성 · 재분석 알림은 권한 확인 필요";
  const stateLabel = shared ? "공유 준비" : saved ? "저장됨" : permissionReady ? "활성" : "권한 필요";
  return (
    <BrandCard accent={stateColor} style={{ borderRadius: 18, padding: "12px 15px 12px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: INK(0.86), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>여정 점검</div>
          <div style={{ color: INK(0.86), fontSize: 12.2, lineHeight: 1.45 }}>
            {stateText}
          </div>
        </div>
        <span style={{
          height: 30,
          borderRadius: 15,
          padding: "0 10px",
          background: NAVY_DARK,
          color: readableStateColor,
          fontSize: 11,
          fontWeight: 900,
          display: "inline-flex",
          alignItems: "center",
          fontFamily: "'DM Mono',monospace",
          flexShrink: 0,
        }}>{stateLabel}</span>
      </div>
    </BrandCard>
  );
}

export default function WeatherON_G5({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const isLight = weatherTheme.mode === "light";
  const premiumText = isLight ? "#5B21B6" : PREMIUM;
  const [activeTab] = useState("출발");
  const [from, setFrom] = useState(routeState.from || "서울");
  const [to, setTo] = useState(routeState.to || "부산");
  const [startDate, setStartDate] = useState(routeState.startDate || "7/5");
  const [days, setDays] = useState(routeState.days || "10일");
  const [permissionReady, setPermissionReady] = useState(Boolean(routeState.permissionReady));
  const [saved, setSaved] = useState(Boolean(routeState.saved || (routeState.resumeAiPlanSave && routeState.permissionReady)));
  const [shared, setShared] = useState(Boolean(routeState.shared));

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (routeState.from) setFrom(routeState.from);
    if (routeState.to) setTo(routeState.to);
    if (routeState.startDate) setStartDate(routeState.startDate);
    if (routeState.days) setDays(routeState.days);
    if (routeState.permissionReady) setPermissionReady(true);
    if (routeState.resumeAiPlanSave && routeState.permissionReady) setSaved(true);
    if (routeState.saved) setSaved(true);
    if (routeState.shared) setShared(true);
  }, [
    routeState.from,
    routeState.to,
    routeState.startDate,
    routeState.days,
    routeState.permissionReady,
    routeState.resumeAiPlanSave,
    routeState.saved,
    routeState.shared,
  ]);

  const requestPermission = (intent) => {
    navigate?.("O3", {
      pendingAction: "알림 추가",
      returnTo: "G5",
      from,
      to,
      startDate,
      days,
      saved,
      shared,
      resumeAiPlanAlert: intent === "alert",
      resumeAiPlanSave: intent === "save",
    });
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        G5 · 국토종주 AI 플래너(프리미엄) · 하이브리드 크롬
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
            <button onClick={() => navigate?.("G3")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.94), fontSize: 15.5, fontWeight: 700, flex: 1 }}>AI 종주 플래너</span>
            <span style={{ background: isLight ? "rgba(91,33,182,0.10)" : "rgba(171,142,221,0.18)", color: premiumText, fontSize: 10, fontWeight: 800, borderRadius: 6, padding: "3px 8px", border: `1px solid ${isLight ? "rgba(91,33,182,0.24)" : "rgba(171,142,221,0.35)"}` }}>프리미엄</span>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 230px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 96 }}>

            <BrandCard style={{ borderRadius: 18, padding: "14px 16px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>여정 설정</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={from} onChange={e => setFrom(e.target.value)} style={{ flex: 1, background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 10, padding: "9px 10px", color: INK(0.94), fontSize: 12.5, outline: "none", fontFamily: "'Noto Sans KR',sans-serif" }}/>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.40)} strokeWidth={2} strokeLinecap="round" style={{ flexShrink: 0, alignSelf: "center" }}><line x1={5} y1={12} x2={19} y2={12}/><polyline points="12 5 19 12 12 19"/></svg>
                <input value={to} onChange={e => setTo(e.target.value)} style={{ flex: 1, background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 10, padding: "9px 10px", color: INK(0.94), fontSize: 12.5, outline: "none", fontFamily: "'Noto Sans KR',sans-serif" }}/>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 88px", gap: 8 }}>
                <input value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="출발일" style={{ width: "100%", minWidth: 0, background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 10, padding: "9px 10px", color: INK(0.94), fontSize: 12.5, outline: "none", fontFamily: "'DM Mono',monospace" }}/>
                <input value={days} onChange={e => setDays(e.target.value)} placeholder="일수" style={{ width: "100%", minWidth: 0, background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 10, padding: "9px 10px", color: INK(0.94), fontSize: 12.5, outline: "none", fontFamily: "'DM Mono',monospace" }}/>
              </div>
            </BrandCard>
            <AiPlanStateCard permissionReady={permissionReady} saved={saved} shared={shared}/>

            <div style={{
              borderRadius: 15,
              background: permissionReady ? "rgba(47,198,163,0.14)" : "rgba(232,133,74,0.14)",
              border: `1px solid ${permissionReady ? "rgba(47,198,163,0.30)" : "rgba(232,133,74,0.30)"}`,
              padding: "11px 13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}>
              <div>
                <div style={{ color: INK(0.90), fontSize: 11, fontWeight: 900 }}>
                  {permissionReady ? "예보 업데이트 알림 가능" : "알림 권한 필요"}
                </div>
                <div style={{ color: INK(0.70), fontSize: 10.8, lineHeight: 1.4, marginTop: 2 }}>
                  {permissionReady ? "기상 변화 시 AI 플랜을 다시 점검함" : "저장·재분석 알림 전 권한 확인 필요"}
                </div>
              </div>
              {!permissionReady && (
                <button onClick={() => requestPermission("alert")} style={{
                  height: 34,
                  borderRadius: 14,
                  border: "none",
                  background: GOLD,
                  color: ON_GOLD,
                  fontSize: 11.5,
                  fontWeight: 900,
                  padding: "0 11px",
                  cursor: "pointer",
                  fontFamily: "'Noto Sans KR',sans-serif",
                  flexShrink: 0,
                }}>권한 확인</button>
              )}
            </div>

            <BrandCard accent={PREMIUM} style={{ borderRadius: 18, padding: "14px 16px 14px 19px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>날씨 기반 일정 점검</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {aiDays.map(d => (
                  <div key={d.day} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: INK(0.94), fontSize: 12.5, fontWeight: 700, width: 44 }}>{d.day}</span>
                    <span style={{ color: INK(0.68), fontSize: 10.5, fontFamily: "'DM Mono',monospace", width: 32, fontWeight: 800 }}>{d.date}</span>
                    <span style={{ color: INK(0.76), fontSize: 11.5, fontWeight: 900, minWidth: 26 }}>{d.weather}</span>
                    <span style={{ color: INK(0.85), fontSize: 12, fontWeight: 600, fontFamily: "'DM Mono',monospace", width: 28 }}>{d.temp}</span>
                    <span style={{ color: INK(0.76), fontSize: 11.5, fontWeight: 800 }}>{d.status}</span>
                  </div>
                ))}
              </div>
            </BrandCard>

            <BrandCard style={{ borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>짐 체크리스트</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["반팔 5벌", "긴팔 2벌", "우비", "방수 등산화"].map((item, i) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckSVG color={CLEAR}/>
                    <span style={{ color: INK(0.85), fontSize: 12.5 }}>{item}</span>
                  </div>
                ))}
                <div style={{
                  marginTop: 2,
                  color: INK(0.70),
                  fontSize: 11,
                  fontWeight: 800,
                }}>선크림·보조배터리·압박 스타킹 추가 추천</div>
              </div>
            </BrandCard>

            <div onClick={() => {
              if (!permissionReady) {
                requestPermission("alert");
                return;
              }
              setPermissionReady(false);
              setSaved(false);
              setShared(false);
            }} style={{ display: "flex", alignItems: "center", gap: 8, background: NAVY_DARK, borderRadius: 14, padding: "10px 14px", border: `1px solid ${INK(0.10)}`, cursor: "pointer" }}>
              <BellSVG/>
              <div>
                <div style={{ color: permissionReady ? SKY : WARM, fontSize: 12, fontWeight: 700 }}>{permissionReady ? "예보 업데이트 알림 켬" : "예보 업데이트 알림 권한 필요"}</div>
                <div style={{ color: INK(0.68), fontSize: 10.5, marginTop: 1 }}>{permissionReady ? "기상 변화 시 재분석 자동 발송" : "탭하면 O3 권한 단계로 이동"}</div>
              </div>
            </div>

            <div style={{ position: "absolute", left: 20, right: 20, bottom: 92, zIndex: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={() => {
                if (!permissionReady) {
                  requestPermission("save");
                  return;
                }
                setSaved(true);
                setShared(false);
              }} style={{
                height: 46,
                borderRadius: 16,
                border: saved ? "1px solid rgba(240,160,32,0.34)" : "none",
                background: saved ? "rgba(240,160,32,0.16)" : GOLD,
                color: saved ? GOLD : NAVY,
                fontSize: 12.5,
                fontWeight: 900,
                cursor: "pointer",
                fontFamily: "'Noto Sans KR',sans-serif",
              }}>{saved ? "플랜 저장됨" : "AI 플랜 저장"}</button>
              <button onClick={() => {
                if (!saved) {
                  setSaved(true);
                  return;
                }
                setShared(true);
              }} style={{
                height: 46,
                borderRadius: 16,
                border: shared ? "1px solid rgba(58,191,160,0.34)" : `1px solid ${INK(0.10)}`,
                background: shared ? "rgba(58,191,160,0.16)" : NAVY_DARK,
                color: shared ? CLEAR : INK(0.82),
                fontSize: 12.5,
                fontWeight: 900,
                cursor: "pointer",
                fontFamily: "'Noto Sans KR',sans-serif",
              }}>{shared ? "공유 준비 완료" : "여정 공유"}</button>
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
        WeatherON · G5 국토종주 AI 플래너(프리미엄)
      </div>
    </div>
  );
}
