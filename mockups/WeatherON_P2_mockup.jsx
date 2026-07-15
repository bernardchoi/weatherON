import { useState, useEffect } from "react";
import { DestinationIcon } from "./WeatherON_destination_icons.jsx";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

const BASEBALL_ILLUSTRATION = new URL("../assets/place-categories/weatheron-place-baseball-v1.png", import.meta.url).href;
const BASEBALL_ILLUSTRATION_LIGHT = new URL("../assets/place-categories/weatheron-place-baseball-light-v2.png", import.meta.url).href;

const DEFAULT_목적지 = {
  name: "잠실종합운동장",
  icon: "baseball",
  image: BASEBALL_ILLUSTRATION,
  image라이트: BASEBALL_ILLUSTRATION_LIGHT,
  cat: "스포츠",
  from: { label: "서울 삼성동", temp: "23°", weather: "맑음", rain: "0%" },
  to: { label: "잠실 야구장", temp: "21°", weather: "구름조금", rain: "12%" },
  tip: "경기 취소 확률 12% · 쿨링룩 추천",
  risk: "내야 1루석 자외선 지수 9",
  recommendation: "쿨링 티셔츠 + 모자 + SPF50 선크림",
};

/* ── WeatherON P2 · 카테고리 전용 준비 가이드 (하이브리드 크롬) ────────
   와이어프레임 P2 기준: 야구장 인식 시 경기 취소 확률 + 좌석 자외선 +
   코디를 한 카드로 안내. 카테고리별 협찬 광고 슬롯 연결.
   - 집 vs 목적지 날씨 2단 비교
   - 오늘 경기 준비 가이드(경기 취소 확률·좌석 자외선·추천 코디)
   - AD 슬롯(스포츠 브랜드 협찬 카드)
   - 다른 카테고리(등산·해변 등)도 동일 패턴으로 확장 가능
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

function CategoryVisual({ image }) {
  return (
    <BrandCard style={{ height: 132, borderRadius: 22, padding: 0 }}>
      <img
        src={image}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </BrandCard>
  );
}

function getDestinationImage(destination, theme) {
  return theme.mode === "light" ? destination.image라이트 || destination.image : destination.image;
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
function UvSVG({ size = 18, color = GOLD }) {
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

function GuideStateCard({ destination }) {
  return (
    <BrandCard accent={CLEAR} style={{ borderRadius: 18, padding: "12px 15px 12px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: INK(0.78), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>준비 가이드</div>
          <div style={{ color: INK(0.86), fontSize: 12.2, lineHeight: 1.45 }}>
            {destination.name} 기준 준비 가이드 · 케어 상세와 필터 목록으로 이동 가능
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
        }}>준비</span>
      </div>
    </BrandCard>
  );
}

export default function WeatherON_P2({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab] = useState("출발");
  const destination = routeState?.destination || DEFAULT_목적지;
  const selectedDestination = routeState?.selectedDestination || destination;
  const destinationImage = getDestinationImage(destination, weatherTheme);

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
        P2 · 카테고리 전용 준비 가이드 · 하이브리드 크롬
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
            <button onClick={() => navigate?.("P3")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <div>
              <div style={{ color: INK(0.94), fontSize: 15.5, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                <DestinationIcon type={destination.icon} size={16}/>
                목적지 · {destination.name}
              </div>
              <div style={{ color: INK(0.68), fontSize: 10.8, marginTop: 2 }}>등록 목적지 기반 준비 가이드</div>
            </div>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 130px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 118 }}>

            <CategoryVisual image={destinationImage}/>
            <GuideStateCard destination={destination}/>

            <div style={{ display: "flex", gap: 8 }}>
              <BrandCard style={{ flex: 1, padding: "14px 10px", textAlign: "center" }}>
                <div style={{ color: INK(0.68), fontSize: 10.5, fontWeight: 700, marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
                  <DestinationIcon type="pin" size={12}/>
                  {destination.from.label}
                </div>
                <div style={{ color: INK(0.94), fontSize: 18, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>{destination.from.temp}</div>
                <div style={{ color: INK(0.75), fontSize: 11.5, marginTop: 2 }}>{destination.from.weather} · 강수 {destination.from.rain}</div>
              </BrandCard>
              <BrandCard style={{ flex: 1, padding: "14px 10px", textAlign: "center" }}>
                <div style={{ color: INK(0.68), fontSize: 10.5, fontWeight: 700, marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
                  <DestinationIcon type={destination.icon} size={12}/>
                  {destination.to.label}
                </div>
                <div style={{ color: INK(0.94), fontSize: 18, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>{destination.to.temp}</div>
                <div style={{ color: INK(0.75), fontSize: 11.5, marginTop: 2 }}>{destination.to.weather} · 강수 {destination.to.rain}</div>
              </BrandCard>
            </div>

            <BrandCard accent={CLEAR} style={{ padding: "16px 16px 16px 19px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                <div style={{ color: INK(0.70), fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <DestinationIcon type="baseball" size={13}/>
                  {destination.cat} 준비 가이드
                </div>
                <span style={{ color: INK(0.78), background: NAVY_DARK, borderRadius: 9, padding: "3px 7px", fontSize: 10, fontWeight: 900 }}>목적지 기준</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ background: "rgba(58,191,160,0.16)", color: INK(0.78), fontSize: 11, fontWeight: 700, borderRadius: 8, padding: "5px 10px" }}>{destination.tip?.split(" · ")[0] || "오늘 준비 포인트"}</span>
                <span style={{ color: INK(0.68), fontSize: 11 }}>{destination.tip?.split(" · ")[1] || "목적지 기준"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <UvSVG/>
                <span style={{ color: INK(0.85), fontSize: 12.5 }}>{destination.risk}</span>
              </div>
              <div style={{ background: NAVY_DARK, borderRadius: 14, padding: "10px 14px" }}>
                <span style={{ color: INK(0.74), fontSize: 11.5, fontWeight: 700 }}>추천</span>
                <span style={{ color: INK(0.85), fontSize: 12, marginLeft: 6 }}>{destination.recommendation}</span>
              </div>
            </BrandCard>

            <div style={{ textAlign: "center", background: NAVY_DARK, borderRadius: 16, padding: "16px 14px", border: `1px dashed ${INK(0.14)}` }}>
              <div style={{ color: INK(0.68), fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 4, fontFamily: "'DM Mono',monospace" }}>광고</div>
              <div style={{ color: INK(0.68), fontSize: 11.5 }}>스포츠 브랜드 협찬 카드</div>
            </div>

            <div style={{ textAlign: "center", color: INK(0.78), fontSize: 10.5, padding: "4px 12px" }}>
              등산·해변 등 다른 카테고리도 동일 패턴으로 제공돼요
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <BrandCard onClick={() => navigate?.("G2", {
                ...routeState,
                destination,
                selectedDestination,
                returnTo: "P2",
              })} style={{ borderRadius: 16, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ color: GOLD, fontSize: 11.5, fontWeight: 800 }}>목적지 알림 보기</div>
                <div style={{ color: INK(0.68), fontSize: 10.5, marginTop: 4 }}>출발·신발 알림</div>
              </BrandCard>
              <BrandCard onClick={() => navigate?.("P3")} style={{ borderRadius: 16, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ color: INK(0.78), fontSize: 11.5, fontWeight: 800 }}>다른 목적지 보기</div>
                <div style={{ color: INK(0.68), fontSize: 10.5, marginTop: 4 }}>필터 목록</div>
              </BrandCard>
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
        WeatherON · P2 카테고리 전용 준비 가이드
      </div>
    </div>
  );
}
