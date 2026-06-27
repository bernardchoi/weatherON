import { useState, useEffect, useRef } from "react";
import { getWeatherONTheme } from "./WeatherON_theme_tokens.js";

/* ── WeatherON G4 · 도보여행 코스 날씨 (Scenario 2 · 무료) (하이브리드 크롬)
   와이어프레임 G4 기준 + 도보여행_PRD.md F3(WCI):
   - 코스 검색 + 추천 코스 리스트(거리·소요시간)
   - 코스 상세: 구간 타임라인 + WCI(도보 컨디션 지수) 5단계
   - 최적 출발 시점 3개 후보
   - CTA: 출발 전 알림 받기
   WCI 5단계: 최적(85-100,초록) 양호(70-84,연초록) 보통(55-69,노랑)
              주의(35-54,주황) 위험(34이하,빨강) — PRD F3 기준
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#10243F';
let NAVY_DARK = '#17365D';
let PANEL     = '#214A78';
let GOLD      = '#F4B63F';
let ON_GOLD  = '#10243F';
let SKY       = '#4AA3DF';
let CLEAR     = '#2FC6A3';
const WARM      = '#E8854A';
const PREMIUM   = '#AB8EDD';
let MIST      = '#B9CBE0';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(185,203,224,${a})`;

function applyWeatherONTheme(mode) {
  const theme = getWeatherONTheme(mode);
  NAVY = theme.NAVY;
  NAVY_DARK = theme.NAVY_DARK;
  PANEL = theme.PANEL;
  GOLD = theme.GOLD;
  ON_GOLD = theme.onGold || ON_GOLD;
  SKY = theme.SKY;
  CLEAR = theme.CLEAR;
  MIST = theme.MIST;
  INK = (a) => `rgba(${theme.inkRgb},${a})`;
  MISTLITE = (a) => `rgba(${theme.mistRgb},${a})`;
  return theme;
}

/* WCI 5단계 — PRD F3 기준 색상(빨강/주황/노랑/연초록/초록) */
const WCI_TIERS = [
  { label: "위험", min: 0,  color: "#E85A5A" },
  { label: "주의", min: 35, color: "#E8854A" },
  { label: "보통", min: 55, color: "#E8C84A" },
  { label: "양호", min: 70, color: "#7ED9A0" },
  { label: "최적", min: 85, color: "#2FC6A3" },
];
function wciTier(score) {
  return [...WCI_TIERS].reverse().find(t => score >= t.min) || WCI_TIERS[0];
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
function SearchSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.70)} strokeWidth={1.8} strokeLinecap="round">
      <circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2={16.65} y2={16.65} />
    </svg>
  );
}
function ChevronRightSVG() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.40)} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;
}

function WciBadge({ score }) {
  const tier = wciTier(score);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: `${tier.color}22`, border: `1px solid ${tier.color}55`,
      borderRadius: 20, padding: "4px 10px",
      color: tier.color, fontSize: 11.5, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: tier.color }}/>
      도보지수 {score} · {tier.label}
    </span>
  );
}

const courses = [
  { name: "제주 올레 1코스", kind: "올레", dist: "15km", time: "5시간" },
  { name: "북한산 둘레길 7코스", kind: "숲길", dist: "8km", time: "3시간" },
  { name: "해파랑길 1코스", kind: "해안", dist: "19km", time: "6시간" },
];
const timeline = [
  { time: "08:00", place: "시흥", weather: "맑음", temp: "22°" },
  { time: "10:00", place: "광치기", weather: "흐림", temp: "21°" },
  { time: "12:00", place: "성산", weather: "비", temp: "20°" },
];
const departOptions = [
  { label: "① 06:30", note: "전 구간 쾌청 예상", best: true },
  { label: "② 14:30", note: "오후 구간 흐림", best: false },
  { label: "③ 내일 08:00", note: "대체 일정", best: false },
];

function CourseStateCard({ alertOn, accountLinked, permissionReady, savedCount, premiumActive }) {
  const limitReached = savedCount >= 2 && !premiumActive && !alertOn;
  const ready = accountLinked && permissionReady && !limitReached;
  const color = alertOn ? CLEAR : premiumActive ? PREMIUM : !accountLinked ? WARM : !permissionReady ? GOLD : limitReached ? PREMIUM : GOLD;
  const labelColor = INK(0.78);
  const copy = alertOn
    ? "출발 전 알림 등록 · 도보지수 변화 시 재확인"
    : !accountLinked
      ? "코스 날씨는 무료 확인 · 저장/알림은 계정 연결 필요"
      : !permissionReady
        ? premiumActive
          ? "프리미엄 활성 · 알림 권한 확인 후 더 많이 저장 가능"
          : "계정 연결됨 · 출발 전 알림은 권한 확인 필요"
        : limitReached
          ? "무료 저장 2개 사용 중 · 추가 저장/모니터링은 프리미엄"
          : premiumActive
            ? "프리미엄 활성 · 코스 저장 한도 확대"
            : "무료 코스 날씨 확인 · 알림 등록 전";
  return (
    <BrandCard accent={color} style={{ borderRadius: 18, padding: "12px 15px 12px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: labelColor, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>코스 알림</div>
          <div style={{ color: INK(0.86), fontSize: 12.2, lineHeight: 1.45 }}>
            {copy}
          </div>
        </div>
        <span style={{
          height: 30,
          borderRadius: 15,
          padding: "0 10px",
          background: NAVY_DARK,
          color: alertOn ? CLEAR : premiumActive ? PREMIUM : GOLD,
          fontSize: 11,
          fontWeight: 900,
          display: "inline-flex",
          alignItems: "center",
          fontFamily: "'DM Mono',monospace",
          flexShrink: 0,
        }}>{alertOn ? "켜짐" : premiumActive && !permissionReady ? "권한 필요" : premiumActive && ready ? "프리미엄" : ready ? "준비" : !accountLinked ? "계정 필요" : !permissionReady ? "권한 필요" : "한도 초과"}</span>
      </div>
    </BrandCard>
  );
}

export default function WeatherON_G4({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState.themeMode);
  const isLight = weatherTheme.mode === "light";
  const [activeTab] = useState("출발");
  const [query, setQuery] = useState("");
  const [alertOn, setAlertOn] = useState(Boolean(routeState.alertOn || (routeState.resumeCourseAlert && routeState.accountLinked && routeState.permissionReady)));
  const [selectedCourse, setSelectedCourse] = useState(routeState.selectedCourse || courses[0].name);
  const [accountLinked, setAccountLinked] = useState(Boolean(routeState.accountLinked));
  const [permissionReady, setPermissionReady] = useState(Boolean(routeState.permissionReady));
  const [premiumActive, set프리미엄Active] = useState(Boolean(routeState.premiumActive));
  const [savedCount, setSavedCount] = useState(routeState.savedCount || 1);
  const resumeCourseKeyRef = useRef("");
  const alertBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (routeState.selectedCourse) setSelectedCourse(routeState.selectedCourse);
    if (routeState.accountLinked) setAccountLinked(true);
    if (routeState.permissionReady) setPermissionReady(true);
    if (routeState.premiumActive) set프리미엄Active(true);
    if (routeState.savedCount) setSavedCount(routeState.savedCount);
    if (routeState.alertOn || (routeState.resumeCourseAlert && routeState.accountLinked && routeState.permissionReady && (routeState.premiumActive || (routeState.savedCount || 1) < 2))) {
      const resumeKey = `${routeState.selectedCourse || selectedCourse}:course-alert:${routeState.premiumActive ? "premium" : "free"}`;
      if (resumeCourseKeyRef.current === resumeKey) return;
      resumeCourseKeyRef.current = resumeKey;
      setAlertOn(true);
      setSavedCount((count) => Math.min(2, Math.max(count, 2)));
    }
  }, [
    routeState.selectedCourse,
    routeState.accountLinked,
    routeState.permissionReady,
    routeState.premiumActive,
    routeState.savedCount,
    routeState.alertOn,
    routeState.resumeCourseAlert,
    selectedCourse,
  ]);

  const limitReached = savedCount >= 2 && !premiumActive && !alertOn;
  const alertCtaLabel = alertOn
    ? "알림 등록됨"
    : !accountLinked
      ? "계정 연결하고 코스 저장"
      : !permissionReady
        ? "알림 권한 확인"
        : limitReached
          ? "프리미엄으로 더 저장"
          : "출발 전 알림 받기";
  const handleCourseAlert = () => {
    if (alertOn) return;
    if (!accountLinked) {
      navigate?.("A2", {
        pendingAction: "알림 추가",
        returnTo: "G4",
        resumeCourseAlert: true,
        selectedCourse,
        permissionReady,
        savedCount,
      });
      return;
    }
    if (!permissionReady) {
      navigate?.("O3", {
        pendingAction: "알림 추가",
        returnTo: "G4",
        resumeCourseAlert: true,
        selectedCourse,
        accountLinked,
        savedCount,
      });
      return;
    }
    if (limitReached) {
      navigate?.("G6", {
        pendingAction: "프리미엄 진입",
        returnTo: "G4",
        resumeCourseAlert: true,
        selectedCourse,
        accountLinked,
        permissionReady,
        premiumActive,
        savedCount,
      });
      return;
    }
    setAlertOn(true);
    setSavedCount((count) => Math.min(2, count + 1));
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        G4 · 도보여행 코스 날씨(무료) · 하이브리드 크롬
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
            <button onClick={() => navigate?.("G1")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.94), fontSize: 17, fontWeight: 700 }}>도보여행</span>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 230px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 96 }}>

            <div style={{ display: "flex", alignItems: "center", gap: 10, background: PANEL, borderRadius: 16, padding: "12px 14px" }}>
              <SearchSVG/>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="코스 검색 (제주 올레길, 북한산 둘레길...)"
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: query  ? INK(0.94) : MISTLITE(0.60), fontSize: 13, fontFamily: "'Noto Sans KR', sans-serif" }} />
            </div>
            <CourseStateCard alertOn={alertOn} accountLinked={accountLinked} permissionReady={permissionReady} savedCount={savedCount} premiumActive={premiumActive}/>

            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {[
                accountLinked ? "계정 연결됨" : "게스트 조회",
                permissionReady ? "알림 가능" : "권한 필요",
                premiumActive ? "저장 한도 확대" : `무료 ${savedCount}/2`,
              ].map((label) => (
                <span key={label} style={{
                  height: 30,
                  borderRadius: 15,
                  padding: "0 10px",
                  background: NAVY_DARK,
                  border: `1px solid ${INK(0.10)}`,
                  color: label.includes("필요") ? GOLD : label.includes("한도") ? PREMIUM : INK(0.82),
                  fontSize: 11,
                  fontWeight: 900,
                  display: "inline-flex",
                  alignItems: "center",
                  fontFamily: "'Noto Sans KR',sans-serif",
                }}>{label}</span>
              ))}
            </div>

            <BrandCard style={{ borderRadius: 18, overflow: "hidden", padding: 0 }}>
              {courses.map((c, i) => (
                <div key={c.name} onClick={() => setSelectedCourse(c.name)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", cursor: "pointer",
                  borderTop: i === 0 ? "none" : `1px solid ${INK(0.06)}`,
                  background: selectedCourse === c.name ? "rgba(240,160,32,0.10)" : "transparent",
                }}>
                  <span style={{ minWidth: 36, textAlign: "center", color: INK(0.72), fontSize: 11, fontWeight: 900 }}>{c.kind}</span>
                  <span style={{ flex: 1, color: selectedCourse === c.name ? INK(0.94) : INK(0.88), fontSize: 13.5, fontWeight: 700 }}>{c.name}</span>
                  <span style={{ color: INK(0.68), fontSize: 11.5, fontFamily: "'DM Mono',monospace" }}>{c.dist} · {c.time}</span>
                  <ChevronRightSVG/>
                </div>
              ))}
            </BrandCard>

            <BrandCard accent={CLEAR} style={{ borderRadius: 18, padding: "14px 16px 14px 19px" }}>
              <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>코스 상세 — {selectedCourse}</div>
              <div style={{ color: INK(0.68), fontSize: 11, marginBottom: 10 }}>08:00 출발 기준 구간 날씨 타임라인</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                {timeline.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: INK(0.68), fontSize: 10, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>{t.time}</div>
                      <div style={{ color: INK(0.78), fontSize: 12, fontWeight: 900, margin: "3px 0" }}>{t.weather}</div>
                      <div style={{ color: INK(0.85), fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>{t.temp}</div>
                      <div style={{ color: INK(0.70), fontSize: 10, fontWeight: 800 }}>{t.place}</div>
                    </div>
                    {i < timeline.length - 1 && (
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={isLight ? INK(0.42) : MISTLITE(0.55)} strokeWidth={2} strokeLinecap="round"><line x1={5} y1={12} x2={19} y2={12}/><polyline points="12 5 19 12 12 19"/></svg>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                <WciBadge score={78}/>
              </div>
              <div style={{
                marginTop: 10,
                borderRadius: 12,
                background: "rgba(47,198,163,0.12)",
                border: "1px solid rgba(47,198,163,0.28)",
                padding: "9px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}>
                <span style={{ color: INK(0.94), fontSize: 12.5, fontWeight: 900 }}>06:30 출발 추천</span>
                <span style={{ color: INK(0.76), fontSize: 10.8, fontWeight: 900 }}>전 구간 쾌청 예상</span>
              </div>
            </BrandCard>

            <button {...alertBtn.handlers} onClick={handleCourseAlert} style={{
              position: "absolute", left: 20, right: 20, bottom: 92, zIndex: 22,
              height: 50, borderRadius: 16, background: GOLD, border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", overflow: "hidden", flexShrink: 0,
              boxShadow: "0 6px 16px rgba(0,0,0,0.30)",
            }}>
              <PressTintOverlay pressed={alertBtn.pressed} tint={NAVY}/>
              <span style={{ fontSize: 14, fontWeight: 700, color: ON_GOLD, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{alertCtaLabel}</span>
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
        WeatherON · G4 도보여행 코스 날씨(무료)
      </div>
    </div>
  );
}
