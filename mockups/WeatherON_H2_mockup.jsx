import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON H2 · 위치 검색·변경 (하이브리드 크롬) ───────────────────
   와이어프레임 H2 기준: 위치 변경 전체화면
   - ← 위치 변경 헤더
   - 동/읍/면 검색 필드
   - ◎ 현재 위치(GPS) 버튼
   - 저장한 위치 섹션 (강남구 / 해운대구)
   - + 위치 추가
   - 선택 즉시 H1으로 복귀
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

/* ── Brand / Functional Color Tokens ── */
let NAVY      = '#1D5A86';
let NAVY_DARK = '#276A96';
let PANEL     = '#2B719D';
let PANEL_L1  = '#3D87B5';
let GOLD      = '#F0A020';
let ON_GOLD  = '#123858';
let CLEAR     = '#3ABFA0';
let WARM      = '#E8854A';
let MIST      = '#E4F2FF';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(228,242,255,${a})`;

/* ── 상태 레이어 프레스 피드백 ── */

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
  return (
    <div style={{
      position:"absolute", inset:0, background: tint,
      opacity: pressed ? 0.12 : 0, transition:"opacity 0.12s ease",
      pointerEvents:"none",
    }}/>
  );
}

/* ── Brand Card — squircle 코너(20/18) + 상태 레이어 프레스 ── */
function BrandCard({ accent, children, style = {}, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <div
      onClick={onClick}
      {...(onClick ? handlers : {})}
      style={{
        background: PANEL,
        borderRadius: 20,
        position: "relative",
        overflow: "hidden", flexShrink: 0,
        boxShadow: "0 6px 16px rgba(0,0,0,0.30)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}>
      {accent && (
        <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:accent }}/>
      )}
      {onClick && <PressTintOverlay pressed={pressed} tint={accent || GOLD}/>}
      {children}
    </div>
  );
}

function BackArrowSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function SearchSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke={MISTLITE(0.70)} strokeWidth={2} strokeLinecap="round">
      <circle cx={11} cy={11} r={8} />
      <line x1={21} y1={21} x2={16.65} y2={16.65} />
    </svg>
  );
}

function ChevronRightSVG() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke={MISTLITE(0.45)} strokeWidth={2} strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* Tab Definitions */
const tabDefs = [
  { id: "홈", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { id: "코디", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" /></svg> },
  { id: "출발", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg> },
  { id: "MY", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  { id: "소셜", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg> },
];

/* ── Tab Bar Item — 상태 레이어 프레스 + dot indicator ── */
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

function SunSVG({ size = 16, color = GOLD }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth={1.8}/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line key={i}
            x1={12 + 7.5 * Math.cos(rad)} y1={12 + 7.5 * Math.sin(rad)}
            x2={12 + 10 * Math.cos(rad)} y2={12 + 10 * Math.sin(rad)}
            stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
        );
      })}
    </svg>
  );
}
function CloudSVG({ size = 16, color = MISTLITE(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <path d="M6 16a4 4 0 014-4h6a3 3 0 010 6H7a3 3 0 01-3-3 3 3 0 013-3"/>
    </svg>
  );
}

const savedLocations = [
  { name: "서울 강남구", temp: "21°", condition: "맑음", icon: <SunSVG/>, active: true },
  { name: "부산 해운대구", temp: "23°", condition: "흐림", icon: <CloudSVG/>, active: false },
];

export default function WeatherON_H2({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [query, setQuery] = useState(routeState.query || "");
  const [activeTab, setActiveTab] = useState("홈");
  const [selectedLocation, setSelectedLocation] = useState(routeState.selectedLocation || "서울 강남구");
  const [accountLinked, setAccountLinked] = useState(Boolean(routeState.accountLinked));
  const [locationState, setLocationState] = useState(
    routeState.locationSaved
      ? `${routeState.selectedLocation || "성수동"} 저장 완료 · 홈 복귀 시 날씨 갱신`
      : "저장 위치 2곳 · 게스트는 임시 검색 가능"
  );
  const gps = usePressTint();
  const addLoc = usePressTint();
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
    if (routeState.selectedLocation) setSelectedLocation(routeState.selectedLocation);
    if (routeState.query) setQuery(routeState.query);
    if (routeState.accountLinked) setAccountLinked(true);
    if (routeState.resumeLocationSave || routeState.locationSaved) {
      const savedLocation = routeState.selectedLocation || "성수동";
      setSelectedLocation(savedLocation);
      setQuery(savedLocation);
      setLocationState(`${savedLocation} 저장 완료 · 홈 복귀 시 날씨 갱신`);
    }
  }, [
    routeState.selectedLocation,
    routeState.query,
    routeState.accountLinked,
    routeState.resumeLocationSave,
    routeState.locationSaved,
  ]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      {/* Screen label */}
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        H2 · 위치 검색·변경 · 하이브리드 크롬
      </div>

      {/* Phone Frame */}
      <div style={{
        width: 393, height: 852, borderRadius: 40, overflow: "hidden",
        position: "relative", flexShrink: 0,
        boxShadow: weatherTheme.phoneShadow,
        background: weatherTheme.gradient,
      }}>
        {/* Status Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 28px 10px", height:54, position:'absolute', top:0, left:0, right:0, color: INK(0.94), fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
          <span>9:41</span>
          <span style={{ fontSize: 13, color: INK(0.70) }}>●●● 5G</span>
        </div>

        <div style={{ paddingTop: 54 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 0" }}>
            <button onClick={() => navigate?.(routeState.parentReturnTo || routeState.returnTo || "H1", routeState.parentReturnTo || routeState.returnTo ? {
              ...routeState,
              locationManaged: true,
              selectedLocation,
            } : {})} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG />
            </button>
            <span style={{ color: INK(0.94), fontSize: 18, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}>위치 변경</span>
          </div>

          {/* Search Field */}
          <div style={{ padding: "16px 20px 0" }}>
            <BrandCard style={{ borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <SearchSVG />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="동/읍/면 검색"
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: query ? "#fff" : MISTLITE(0.65),
                  fontSize: 15, fontFamily: "'Noto Sans KR', sans-serif",
                }}
              />
            </BrandCard>
          </div>

          {/* GPS Current Location */}
          <div style={{ padding: "12px 20px 0" }}>
            <BrandCard accent={CLEAR} onClick={() => setSelectedLocation("현재 위치")} style={{ borderRadius: 16 }}>
              <button {...gps.handlers} onClick={() => setSelectedLocation("현재 위치")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px 14px 19px", background: "none", border: "none", cursor: "pointer", position:'relative' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(58,191,160,0.16)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(58,191,160,0.35)" }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={CLEAR} strokeWidth={2} strokeLinecap="round">
                    <circle cx={12} cy={12} r={3} />
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ color: INK(0.94), fontSize: 15, fontWeight: 600 }}>현재 위치 사용</div>
                  <div style={{ color: INK(0.78), fontSize: 12, marginTop: 2 }}>GPS로 자동 감지</div>
                </div>
                <ChevronRightSVG />
              </button>
            </BrandCard>
          </div>

          {/* Saved Locations Section */}
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.10em", marginBottom: 10, paddingLeft: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              저장한 위치
            </div>

            <BrandCard style={{ borderRadius: 18, overflow: "hidden", padding:0 }}>
              {savedLocations.map((loc, idx) => (
                <button key={loc.name} onClick={() => setSelectedLocation(loc.name)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "none", border: "none", cursor: "pointer",
                  borderBottom: idx < savedLocations.length - 1 ? `1px solid ${INK(0.07)}` : "none",
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: loc.active ? "rgba(240,160,32,0.16)" : "rgba(232,237,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: `1px solid ${loc.active ? "rgba(240,160,32,0.35)" : INK(0.10)}` }}>
                    {loc.icon}
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: INK(0.94), fontSize: 15, fontWeight: loc.active ? 700 : 500 }}>{loc.name}</span>
                      {selectedLocation === loc.name && (
                        <span style={{ background: "rgba(58,191,160,0.18)", color: INK(0.92), fontSize: 10, fontWeight: 800, borderRadius: 5, padding: "2px 6px", border: "1px solid rgba(58,191,160,0.32)" }}>현재</span>
                      )}
                    </div>
                    <div style={{ color: INK(0.78), fontSize: 12, marginTop: 2 }}>
                      {loc.temp} {loc.condition}
                    </div>
                  </div>
                  <ChevronRightSVG />
                </button>
              ))}
            </BrandCard>
          </div>

          {/* Add Location */}
          <div style={{ padding: "10px 20px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 9 }}>
              {[
                { label: "게스트", value: false },
                { label: "계정 연결됨", value: true },
              ].map((option) => {
                const on = accountLinked === option.value;
                return (
                  <button key={option.label} onClick={() => {
                    setAccountLinked(option.value);
                    setLocationState(option.value ? "계정 연결됨 · 새 위치 저장 가능" : "저장 위치 2곳 · 게스트는 임시 검색 가능");
                  }} style={{
                    height: 34,
                    borderRadius: 13,
                    border: on ? "none" : `1px solid ${INK(0.10)}`,
                    background: on ? GOLD : NAVY_DARK,
                    color: on ? NAVY : INK(0.78),
                    fontSize: 11.5,
                    fontWeight: 900,
                    cursor: "pointer",
                    fontFamily: "'Noto Sans KR',sans-serif",
                  }}>{option.label}</button>
                );
              })}
            </div>
            <button
              {...addLoc.handlers}
              onClick={() => {
                if (!accountLinked) {
                  setLocationState("새 위치 저장은 계정 연결 필요 · A2 이동");
                  navigate?.("A2", {
                    pendingAction: "장소 저장",
                    returnTo: "H2",
                    parentReturnTo: routeState.parentReturnTo || routeState.returnTo,
                    resumeLocationSave: true,
                    selectedLocation: query || "성수동",
                    query: query || "성수동",
                  });
                  return;
                }
                setQuery("성수동");
                setSelectedLocation("성수동");
                setLocationState("성수동 저장 후보 · 홈 복귀 시 날씨 갱신");
              }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "14px 16px", background: accountLinked ? "rgba(240,160,32,0.14)" : NAVY_DARK,
                border: `1.5px dashed ${accountLinked ? "rgba(240,160,32,0.42)" : MISTLITE(0.30)}`, borderRadius: 16,
                color: accountLinked ? GOLD : MISTLITE(0.70), fontSize: 14, fontWeight: 600, cursor: "pointer",
                position:'relative', overflow:'hidden', flexShrink: 0,
              }}>
              <PressTintOverlay pressed={addLoc.pressed} tint={GOLD}/>
              <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span>
              {accountLinked ? "위치 추가" : "계정 연결하고 위치 저장"}
            </button>
          </div>

          {/* Bottom hint */}
          <div style={{ padding: "16px 20px 0" }}>
            <div style={{ background: PANEL, borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ color: INK(0.86), fontSize: 10.5, fontWeight: 800, marginBottom: 4, textAlign: "center", fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em" }}>
                위치
              </div>
              <div style={{ color: INK(0.78), fontSize: 11, textAlign: "center", lineHeight: 1.6 }}>
                {selectedLocation} 선택 · {locationState} · 검색어 {query || "없음"}
              </div>
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

      {/* Caption */}
      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · H2 위치 검색·변경
      </div>
    </div>
  );
}
