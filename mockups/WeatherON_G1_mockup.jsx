import { useState, useEffect } from "react";
import { getWeatherONTheme } from "./WeatherON_theme_tokens.js";
import { DestinationIcon } from "./WeatherON_destination_icons.jsx";

/* ── WeatherON G1 · 출발 메인 (목적지 목록, 하이브리드 크롬) ───────────
   와이어프레임 G1 기준: 출발 탭 메인
   - 목적지 검색 필드 / 목적지 카드 (회사-판교, 학교-신촌)
   - 출발지 날씨 → 목적지 날씨 비교 (기온·날씨 요약)
   - + 목적지 추가 / 여행 플래너(프리미엄) 배너 / 카드 탭 → G2 비교 상세
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let SKY       = '#4A8FD4';
let CLEAR     = '#3ABFA0';
const WARM      = '#E8854A';
const PREMIUM   = '#AB8EDD';
let MIST      = '#869EBC';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(168,196,224,${a})`;

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

/* ── 장소/날씨/이동 아이콘 — brand/WeatherON_아이콘_시스템.md 기준 ── */
function BuildingSVG({ size = 18, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21V7l7-4 7 4v14"/>
      <line x1="3" y1="21" x2="21" y2="21"/>
      <line x1="9" y1="9" x2="10" y2="9"/><line x1="9" y1="13" x2="10" y2="13"/><line x1="9" y1="17" x2="10" y2="17"/>
      <line x1="14" y1="9" x2="15" y2="9"/><line x1="14" y1="13" x2="15" y2="13"/><line x1="14" y1="17" x2="15" y2="17"/>
    </svg>
  );
}
function PlaneSVG({ size = 18, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
function SunSVG({ size = 13, color = GOLD }) {
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
function CloudSVG({ size = 13, color = MISTLITE(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <path d="M6 16a4 4 0 014-4h6a3 3 0 010 6H7a3 3 0 01-3-3 3 3 0 013-3"/>
    </svg>
  );
}

const baseDestinations = [
  { icon: <BuildingSVG/>, name: "회사", location: "판교", fromTemp: "21°", fromIcon: <SunSVG/>, toTemp: "19°", toIcon: <CloudSVG/>, diff: "−2°", depart: "08:30", arrive: "09:00", alert: "바람 강함 주의", alertColor: WARM, warn: true },
  { icon: <BuildingSVG/>, name: "학교", location: "신촌", fromTemp: "21°", fromIcon: <SunSVG/>, toTemp: "21°", toIcon: <SunSVG/>, diff: "±0°", depart: "09:00", arrive: "09:45", alert: "날씨 차이 없음", alertColor: CLEAR, warn: false },
];

function toCareDestination(dest) {
  if (dest.from && dest.to) return dest;
  return {
    name: `${dest.name} — ${dest.location}`,
    icon: "pin",
    from: { label: "현재 위치", temp: dest.fromTemp, weather: dest.warn ? "맑음" : "맑음", rain: "0%" },
    to: { label: dest.location, temp: dest.toTemp, weather: dest.warn ? "흐림" : "맑음", rain: dest.warn ? "30%" : "0%" },
    departTime: dest.depart,
  };
}

function toDisplayDestination(dest) {
  const careDestination = toCareDestination(dest);
  const fromTemp = dest.from?.temp || dest.fromTemp;
  const toTemp = dest.to?.temp || dest.toTemp;
  return {
    careDestination,
    icon: dest.icon && typeof dest.icon === "string" ? <DestinationIcon type={dest.icon} size={18}/> : dest.icon,
    title: dest.location ? dest.name : dest.name,
    location: dest.location || dest.to?.label || dest.cat,
    fromTemp,
    toTemp,
    fromIcon: dest.fromIcon || <SunSVG/>,
    toIcon: dest.toIcon || <CloudSVG/>,
    diff: dest.diff || "",
    depart: dest.depart || dest.departTime || "08:10",
    arrive: dest.arrive || "자동",
    alert: dest.alert || dest.tip || "목적지 알림 추가됨",
    alertColor: dest.alertColor || dest.color || CLEAR,
    warn: Boolean(dest.warn || dest.color === WARM),
  };
}

export default function WeatherON_G1({ navigate, routeState = {}, careState = {}, savedDestinations = [] } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState.themeMode);
  const [activeTab, setActiveTab] = useState("출발");
  const [query, setQuery] = useState("");
  const addBtn = usePressTint();
  const addDest = usePressTint();
  const premiumBanner = usePressTint();
  const displayDestinations = [
    ...savedDestinations.map(toDisplayDestination),
    ...baseDestinations.map(toDisplayDestination),
  ];
  const activeCareCount = displayDestinations.filter((dest) => careState[dest.careDestination.name]).length;

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
        G1 · 출발 메인 (목적지 목록) · 하이브리드 크롬
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0" }}>
            <span style={{ color: INK(0.94), fontSize: 20, fontWeight: 800 }}>출발</span>
            <button {...addBtn.handlers} onClick={() => navigate?.("P1")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: INK(0.94), fontSize: 18, fontWeight: 700, position:'relative', overflow:'hidden' }}>
              <PressTintOverlay pressed={addBtn.pressed} tint={GOLD}/>
              ＋
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 148px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 118 }}>

            {/* Search Field */}
            <BrandCard onClick={() => navigate?.("P1")} style={{ borderRadius: 16, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.70)} strokeWidth={1.8} strokeLinecap="round"><circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2={16.65} y2={16.65} /></svg>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="목적지 검색 · 추가"
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: query  ? INK(0.94) : MISTLITE(0.65), fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }} />
            </BrandCard>

            <BrandCard accent={CLEAR} style={{ borderRadius: 18, padding: "14px 16px 14px 19px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ color: CLEAR, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace" }}>오늘 준비</div>
                  <div style={{ color: INK(0.94), fontSize: 14.5, fontWeight: 800, marginTop: 2 }}>알아서 챙기는 중</div>
                </div>
                <span style={{ background: NAVY_DARK, color: activeCareCount ? CLEAR : GOLD, borderRadius: 12, padding: "5px 9px", fontSize: 10.5, fontWeight: 800 }}>
                  알림 {activeCareCount}/{displayDestinations.length}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                {["날씨 비교", activeCareCount ? "알림 켜짐" : "출발 08:10", "신발·우산"].map((item, index) => (
                  <div key={item} style={{
                    background: NAVY_DARK,
                    borderRadius: 12,
                    padding: "8px 6px",
                    color: index === 1 ? (activeCareCount ? CLEAR : GOLD) : INK(0.72),
                    fontSize: 10.5,
                    fontWeight: 800,
                    textAlign: "center",
                  }}>{item}</div>
                ))}
              </div>
              <div style={{ marginTop: 9, color: INK(0.68), fontSize: 10.8, lineHeight: 1.45 }}>
                목적지를 누르면 날씨와 출발 준비를 자세히 볼 수 있어요
              </div>
            </BrandCard>

            {/* Destination Cards */}
            {displayDestinations.map((dest, idx) => {
              const careDestination = dest.careDestination;
              const careOn = Boolean(careState[careDestination.name]);
              return (
              <BrandCard key={idx} accent={careOn ? CLEAR : dest.warn ? WARM : CLEAR} onClick={() => navigate?.("G2", { destination: careDestination, returnTo: "G1" })} style={{ borderRadius: 18, padding: "14px 16px 14px 19px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {dest.icon}
                    <div>
                      <span style={{ color: INK(0.94), fontSize: 15, fontWeight: 700 }}>{dest.title}</span>
                      <span style={{ color: INK(0.68), fontSize: 12, marginLeft: 6 }}>— {dest.location}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ height: 24, borderRadius: 12, padding: "0 8px", background: NAVY_DARK, color: careOn ? CLEAR : GOLD, fontSize: 10, fontWeight: 900, display: "inline-flex", alignItems: "center", fontFamily: "'DM Mono',monospace" }}>{careOn ? "켜짐" : "준비"}</span>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.40)} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {dest.fromIcon}
                    <span style={{ color: INK(0.82), fontSize: 14, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{dest.fromTemp}</span>
                  </div>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.40)} strokeWidth={2} strokeLinecap="round"><line x1={5} y1={12} x2={19} y2={12} /><polyline points="12 5 19 12 12 19" /></svg>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {dest.toIcon}
                    <span style={{ color: INK(0.82), fontSize: 14, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{dest.toTemp}</span>
                  </div>
                  <span style={{ color: INK(0.72), fontSize: 12, fontFamily: "'DM Mono', monospace", marginLeft: 4, fontWeight: 800 }}>{dest.diff}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ color: INK(0.68), fontSize: 11 }}>출발 <span style={{ color: INK(0.85), fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{dest.depart}</span></span>
                    <span style={{ color: INK(0.68), fontSize: 11 }}>도착 <span style={{ color: INK(0.85), fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{dest.arrive}</span></span>
                  </div>
                  <span style={{ color: INK(0.72), fontSize: 11, fontWeight: 800 }}>{dest.alert}</span>
                </div>
              </BrandCard>
            );
            })}

            {/* + 목적지 추가 */}
            <button {...addDest.handlers} onClick={() => navigate?.("P1")} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "13px 16px", background: NAVY_DARK,
              border: `1.5px dashed ${MISTLITE(0.30)}`, borderRadius: 16,
              color: INK(0.72), fontSize: 13, fontWeight: 600, cursor: "pointer",
              position:'relative', overflow:'hidden', flexShrink: 0,
            }}>
              <PressTintOverlay pressed={addDest.pressed} tint={GOLD}/>
              <span style={{ fontSize: 16, lineHeight: 1 }}>＋</span>
              목적지 추가
            </button>

            {/* 여행 플래너 프리미엄 배너 */}
            <div {...premiumBanner.handlers} onClick={() => navigate?.("G3")} style={{
              background: PANEL, borderRadius: 16, position: "relative", overflow: "hidden", flexShrink: 0,
              border: `1.5px dashed rgba(171,142,221,0.40)`, cursor:'pointer',
            }}>
              <PressTintOverlay pressed={premiumBanner.pressed} tint={PREMIUM}/>
              <div style={{ padding: "14px 16px", display:'flex', alignItems: "center", gap: 10 }}>
                <PlaneSVG size={20}/>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: INK(0.85), fontSize: 13, fontWeight: 700 }}>여행 플래너</span>
                    <span style={{ background: "rgba(171,142,221,0.18)", color: INK(0.78), fontSize: 10, fontWeight: 900, borderRadius: 5, padding: "2px 6px", border: "1px solid rgba(171,142,221,0.32)" }}>프리미엄</span>
                  </div>
                  <div style={{ color: INK(0.68), fontSize: 11, marginTop: 2 }}>여행지 일정별 날씨 + 짐 추천</div>
                </div>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.35)} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
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
            <TabItem key={tab.id} tab={tab} active={tab.id === activeTab} onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "홈") navigate?.("H1");
              if (tab.id === "코디") navigate?.("C1");
              if (tab.id === "MY") navigate?.("M1");
              if (tab.id === "소셜") navigate?.("S0");
            }} />
          ))}
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · G1 출발 메인
      </div>
    </div>
  );
}
