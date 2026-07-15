import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON · 날씨 상세 (하이브리드 크롬) ───────────────────────────
   시간별/7일 예보, 상세 기상정보 2x3 그리드, 일출·일몰 아크
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

/* ── Tab Icons ──────────────────────────────────────────────────────── */
const tabDefs = [
  { id: '홈', icon: (
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )},
  { id: '코디', icon: (
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
    </svg>
  )},
  { id: '출발', icon: (
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  )},
  { id: 'MY', icon: (
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx={12} cy={7} r={4} />
    </svg>
  )},
  { id: '소셜', icon: (
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )},
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

/* ── Weather Icon Components ────────────────────────────────────────── */
function SunIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx={12} cy={12} r={5} stroke={GOLD} strokeWidth={1.8} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line key={i}
            x1={12 + 7.5 * Math.cos(rad)} y1={12 + 7.5 * Math.sin(rad)}
            x2={12 + 10 * Math.cos(rad)} y2={12 + 10 * Math.sin(rad)}
            stroke={GOLD} strokeWidth={1.8} strokeLinecap="round" />
        );
      })}
    </svg>
  );
}
function CloudSunIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx={15} cy={7} r={3} stroke={GOLD} strokeWidth={1.5} />
      <path d="M18 7a4 4 0 00-4-4" stroke={GOLD} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M6 16a4 4 0 014-4h6a3 3 0 010 6H7a3 3 0 01-3-3 3 3 0 013-3" stroke={MISTLITE(1)} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}
function RainIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 16.4A5 5 0 0017 7h-1.26A8 8 0 104 15.25" stroke={MISTLITE(1)} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={8} y1={19} x2={8} y2={21} stroke={CLEAR} strokeWidth={1.8} strokeLinecap="round" />
      <line x1={12} y1={17} x2={12} y2={21} stroke={CLEAR} strokeWidth={1.8} strokeLinecap="round" />
      <line x1={16} y1={19} x2={16} y2={21} stroke={CLEAR} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}
function MoonIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={MISTLITE(1)} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}
function SunriseSVG({ size = 22, color = GOLD }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 18a5 5 0 00-10 0"/>
      <line x1="12" y1="2" x2="12" y2="9"/>
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
      <line x1="1" y1="18" x2="3" y2="18"/>
      <line x1="21" y1="18" x2="23" y2="18"/>
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
      <line x1="23" y1="22" x2="1" y2="22"/>
      <polyline points="8 6 12 2 16 6"/>
    </svg>
  );
}
function SunsetSVG({ size = 22, color = "#E8854A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 18a5 5 0 00-10 0"/>
      <line x1="12" y1="9" x2="12" y2="2"/>
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
      <line x1="1" y1="18" x2="3" y2="18"/>
      <line x1="21" y1="18" x2="23" y2="18"/>
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
      <line x1="23" y1="22" x2="1" y2="22"/>
      <polyline points="16 5 12 9 8 5"/>
    </svg>
  );
}

/* ── Hourly Data ────────────────────────────────────────────────────── */
const hourlyData = [
  { time: '지금',  icon: <SunIcon size={18} />,     temp: 23, rain: 0 },
  { time: '13시',  icon: <SunIcon size={18} />,     temp: 25, rain: 0 },
  { time: '14시',  icon: <CloudSunIcon size={18} />,temp: 26, rain: 10 },
  { time: '15시',  icon: <CloudSunIcon size={18} />,temp: 26, rain: 15 },
  { time: '16시',  icon: <RainIcon size={18} />,    temp: 24, rain: 60 },
  { time: '17시',  icon: <RainIcon size={18} />,    temp: 22, rain: 70 },
  { time: '18시',  icon: <RainIcon size={18} />,    temp: 20, rain: 55 },
  { time: '19시',  icon: <CloudSunIcon size={18} />,temp: 19, rain: 20 },
  { time: '20시',  icon: <MoonIcon size={18} />,    temp: 18, rain: 5  },
  { time: '21시',  icon: <MoonIcon size={18} />,    temp: 17, rain: 0  },
  { time: '22시',  icon: <MoonIcon size={18} />,    temp: 16, rain: 0  },
  { time: '23시',  icon: <MoonIcon size={18} />,    temp: 16, rain: 0  },
];

/* ── Weekly Data ────────────────────────────────────────────────────── */
const weeklyData = [
  { day: '오늘',  icon: <SunIcon size={16} />,     low: 16, high: 26, rain: 30, active: true },
  { day: '내일',  icon: <RainIcon size={16} />,    low: 15, high: 22, rain: 80 },
  { day: '화',    icon: <RainIcon size={16} />,    low: 14, high: 20, rain: 70 },
  { day: '수',    icon: <CloudSunIcon size={16} />,low: 16, high: 24, rain: 20 },
  { day: '목',    icon: <SunIcon size={16} />,     low: 17, high: 27, rain: 5  },
  { day: '금',    icon: <SunIcon size={16} />,     low: 18, high: 28, rain: 0  },
  { day: '토',    icon: <CloudSunIcon size={16} />,low: 17, high: 26, rain: 15 },
];

/* ── Detail Metrics ─────────────────────────────────────────────────── */
const metricItems = [
  { label: '체감온도', value: '22°', sub: '실제보다 1° 낮음', icon: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(1)} strokeWidth={1.5}><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" /></svg>
  )},
  { label: '습도', value: '72%', sub: '조금 높음', icon: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(1)} strokeWidth={1.5}><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" /></svg>
  )},
  { label: '바람', value: '4m/s', sub: '남서풍 · 약풍', icon: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(1)} strokeWidth={1.5}><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" /></svg>
  )},
  { label: '자외선', value: '5', sub: '보통 · SPF 30 권장', icon: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.5}>
      <circle cx={12} cy={12} r={5} /><line x1={12} y1={1} x2={12} y2={3} strokeLinecap="round" /><line x1={12} y1={21} x2={12} y2={23} strokeLinecap="round" />
      <line x1={4.22} y1={4.22} x2={5.64} y2={5.64} strokeLinecap="round" /><line x1={18.36} y1={18.36} x2={19.78} y2={19.78} strokeLinecap="round" />
      <line x1={1} y1={12} x2={3} y2={12} strokeLinecap="round" /><line x1={21} y1={12} x2={23} y2={12} strokeLinecap="round" />
    </svg>
  )},
  { label: '강수량', value: '3mm', sub: '오후 4~6시 집중', icon: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={CLEAR} strokeWidth={1.5}>
      <line x1={8} y1={19} x2={8} y2={21} strokeLinecap="round" /><line x1={12} y1={17} x2={12} y2={21} strokeLinecap="round" /><line x1={16} y1={19} x2={16} y2={21} strokeLinecap="round" />
      <path d="M20 16.4A5 5 0 0017 7h-1.26A8 8 0 104 15.25" strokeLinecap="round" />
    </svg>
  )},
  { label: '가시거리', value: '15km', sub: '양호', icon: (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(1)} strokeWidth={1.5}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx={12} cy={12} r={3} /></svg>
  )},
];

/* ── Main Component ─────────────────────────────────────────────────── */

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
export default function WeatherONDetail({ routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab, setActiveTab] = useState('홈');
  const backBtn = usePressTint();
  const shareBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (_) {} };
  }, []);

  const font = { fontFamily: "'Noto Sans KR', sans-serif" };
  const mono = { fontFamily: "'DM Mono', monospace" };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: weatherTheme.shellBg, padding: '24px 0' }}>

      {/* ── Phone Frame ─────────────────────────────────────────────── */}
      <div style={{
        width: 393, height: 852,
        borderRadius: 40,
        background: weatherTheme.gradient,
        position: 'relative',
        overflow: 'hidden', flexShrink: 0,
        boxShadow: ['0 0 0 1.5px rgba(255,255,255,0.08)', '0 40px 80px rgba(0,0,0,0.70)', '0 8px 24px rgba(0,0,0,0.45)'].join(','),
      }}>

        {/* ── Sun warm glow ── */}
        <div style={{
          position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
          width: 230, height: 230,
          background: 'radial-gradient(ellipse, rgba(240,160,32,0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* ── Status Bar ────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 24px 0', height: 44,
        }}>
          <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: INK(0.94) }}>
            12:28
          </span>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <svg width={16} height={10} viewBox="0 0 16 10" fill="none">
              {[0,1,2,3].map(i => (
                <rect key={i} x={i*4} y={10-(i+1)*2.5} width={3} height={(i+1)*2.5}
                  rx={1} fill={i<3 ? INK(0.85) : INK(0.30)} />
              ))}
            </svg>
            <svg width={15} height={11} viewBox="0 0 15 11" fill="none">
              <path d="M7.5 8.5a1 1 0 110 2 1 1 0 010-2z" fill={INK(0.85)} />
              <path d="M4.5 6.5C5.5 5.5 6.4 5 7.5 5s2 .5 3 1.5" stroke={INK(0.85)} strokeWidth={1.2} strokeLinecap="round" fill="none" />
              <path d="M2 4C3.5 2.5 5.4 1.5 7.5 1.5S11.5 2.5 13 4" stroke={INK(0.50)} strokeWidth={1.2} strokeLinecap="round" fill="none" />
            </svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <div style={{ width: 22, height: 11, borderRadius: 3, border: `1px solid ${INK(0.50)}`,
                padding: 1, display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '82%', height: '100%', borderRadius: 2, background: INK(0.85) }} />
              </div>
              <div style={{ width: 2, height: 5, borderRadius: '0 1px 1px 0', background: INK(0.40) }} />
            </div>
          </div>
        </div>

        {/* ── Header: Back + Title ───────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px 8px',
        }}>
          <button {...backBtn.handlers} aria-label="뒤로" style={{
            width: 40, height: 40, borderRadius: 12,
            background: NAVY_DARK,
            border: `1px solid ${INK(0.10)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position:'relative', overflow:'hidden', flexShrink: 0,
          }}>
            <PressTintOverlay pressed={backBtn.pressed} tint={GOLD}/>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(1)}
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ ...font, fontSize: 15, fontWeight: 700, color: INK(0.94) }}>
              날씨 상세
            </div>
            <div style={{ ...font, fontSize: 11, color: MISTLITE(1), marginTop: 1 }}>
              서울특별시 강남구
            </div>
          </div>

          <button {...shareBtn.handlers} aria-label="공유" style={{
            width: 40, height: 40, borderRadius: 12,
            background: NAVY_DARK,
            border: `1px solid ${INK(0.10)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', position:'relative', overflow:'hidden', flexShrink: 0,
          }}>
            <PressTintOverlay pressed={shareBtn.pressed} tint={GOLD}/>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(1)}
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={18} cy={5} r={3} /><circle cx={6} cy={12} r={3} /><circle cx={18} cy={19} r={3} />
              <line x1={8.59} y1={13.51} x2={15.42} y2={17.49} /><line x1={15.41} y1={6.51} x2={8.59} y2={10.49} />
            </svg>
          </button>
        </div>

        {/* ── Today Hero ────────────────────────────────────────────── */}
        <div style={{ padding: '4px 20px 0', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px',
            background: NAVY_DARK,
            border: `1px solid ${INK(0.10)}`,
            borderRadius: 20, marginBottom: 10,
          }}>
            <span style={{ ...mono, fontSize: 11, color: MISTLITE(1), letterSpacing: '.06em' }}>
              2026.06.18 · 수요일
            </span>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD, display: 'inline-block' }} />
            <span style={{ ...mono, fontSize: 11, color: GOLD }}>맑음</span>
          </div>

          <div style={{
            fontFamily: "'DM Mono',monospace", fontWeight: 500,
            fontSize: 72, color: INK(0.94), lineHeight: 1,
          }}>
            23°
          </div>

          <div style={{ ...font, fontSize: 13, color: MISTLITE(0.75), marginTop: 4 }}>
            최고 <span style={{ color: INK(0.94), fontWeight: 700 }}>26°</span>
            &nbsp;·&nbsp;
            최저 <span style={{ color: MISTLITE(1) }}>16°</span>
            &nbsp;·&nbsp;
            강수확률 <span style={{ color: CLEAR, fontWeight: 700 }}>30%</span>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
            padding: '5px 12px',
            background: 'rgba(58,191,160,0.14)',
            border: '1px solid rgba(58,191,160,0.28)',
            borderRadius: 20,
          }}>
            <RainIcon size={13}/>
            <span style={{ ...font, fontSize: 11, color: CLEAR, fontWeight: 600 }}>
              오후 4~6시 일시적 비 예보
            </span>
          </div>
        </div>

        {/* ── Scrollable Content Area ────────────────────────────────── */}
        <div style={{
          position: 'absolute', top: 250, bottom: 90, left: 0, right: 0,
          overflowY: 'auto',
          padding: '0 16px',
          scrollbarWidth: 'none',
        }}>

          {/* ── Hourly Forecast ─────────────────────────────────────── */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...font, fontSize: 11, fontWeight: 700, color: MIST,
              letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              시간별 예보
            </div>
            <BrandCard style={{ padding: '12px 0' }}>
              <div style={{
                display: 'flex', overflowX: 'auto', gap: 0,
                scrollbarWidth: 'none', padding: '0 12px',
              }}>
                {hourlyData.map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    minWidth: 52, gap: 6, padding: '4px 6px',
                    borderRadius: 12,
                    background: i === 0 ? NAVY_DARK : 'transparent',
                  }}>
                    <span style={{ ...mono, fontSize: 10, color: i === 0 ? '#fff' : MISTLITE(0.75) }}>
                      {h.time}
                    </span>
                    <div>{h.icon}</div>
                    <span style={{ ...font, fontSize: 13, fontWeight: 700,
                      color: i === 0 ? '#fff' : INK(0.80) }}>
                      {h.temp}°
                    </span>
                    {h.rain > 0 ? (
                      <span style={{ ...mono, fontSize: 9, color: CLEAR }}>
                        {h.rain}%
                      </span>
                    ) : (
                      <span style={{ fontSize: 9, color: 'transparent' }}>0%</span>
                    )}
                  </div>
                ))}
              </div>
            </BrandCard>
          </div>

          {/* ── 7-Day Forecast ──────────────────────────────────────── */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...font, fontSize: 11, fontWeight: 700, color: MIST,
              letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              7일 예보
            </div>
            <BrandCard style={{ padding: '10px 16px' }}>
              {weeklyData.map((w, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: i < weeklyData.length - 1 ? `1px solid ${INK(0.06)}` : 'none',
                  background: w.active ? 'rgba(240,160,32,0.07)' : 'transparent',
                  borderRadius: w.active ? 10 : 0,
                  margin: w.active ? '0 -8px' : 0,
                  paddingLeft: w.active ? 8 : 0,
                  paddingRight: w.active ? 8 : 0,
                }}>
                  <span style={{
                    ...font, fontSize: 13, fontWeight: w.active ? 700 : 500,
                    color: w.active ? '#fff' : INK(0.70),
                    width: 36,
                  }}>
                    {w.day}
                  </span>
                  <div style={{ width: 24, marginRight: 6 }}>{w.icon}</div>
                  <span style={{ ...mono, fontSize: 10, color: CLEAR, width: 32 }}>
                    {w.rain > 0 ? `${w.rain}%` : ''}
                  </span>
                  <div style={{ flex: 1, position: 'relative', height: 4, margin: '0 8px' }}>
                    <div style={{
                      position: 'absolute', left: '20%', right: `${100 - (w.high / 30 * 100)}%`,
                      height: '100%', borderRadius: 2,
                      background: `linear-gradient(90deg, ${SKY}, ${GOLD})`,
                    }} />
                  </div>
                  <span style={{ ...font, fontSize: 12, color: MISTLITE(1), width: 22, textAlign: 'right' }}>
                    {w.low}°
                  </span>
                  <span style={{ ...font, fontSize: 12, fontWeight: 700,
                    color: INK(0.88), width: 26, textAlign: 'right' }}>
                    {w.high}°
                  </span>
                </div>
              ))}
            </BrandCard>
          </div>

          {/* ── Detail Metrics 2×3 ───────────────────────────────────── */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...font, fontSize: 11, fontWeight: 700, color: MIST,
              letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              상세 기상 정보
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {metricItems.map((m, i) => (
                <BrandCard key={i} style={{ padding: '12px 12px 10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {m.icon}
                      <span style={{ ...font, fontSize: 10, color: MISTLITE(0.75) }}>
                        {m.label}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: "'DM Mono',monospace", fontWeight: 500,
                      fontSize: 20, color: INK(0.94), lineHeight: 1,
                    }}>
                      {m.value}
                    </span>
                    <span style={{ ...font, fontSize: 10, color: MISTLITE(0.75), lineHeight: 1.3 }}>
                      {m.sub}
                    </span>
                  </div>
                </BrandCard>
              ))}
            </div>
          </div>

          {/* ── Sunrise / Sunset ─────────────────────────────────────── */}
          <BrandCard style={{ marginBottom: 16, padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display:'flex', justifyContent:'center' }}><SunriseSVG size={22}/></div>
                <div style={{ ...font, fontSize: 11, color: MISTLITE(0.75), marginTop: 4 }}>일출</div>
                <div style={{
                  fontFamily: "'DM Mono',monospace", fontWeight: 500,
                  fontSize: 18, color: GOLD, marginTop: 2,
                }}>
                  05:11
                </div>
              </div>
              <div style={{ flex: 1, padding: '0 12px' }}>
                <svg width="100%" height={40} viewBox="0 0 140 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sunArc" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={GOLD} stopOpacity={0.3} />
                      <stop offset="45%" stopColor={GOLD} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={GOLD} stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <line x1={0} y1={38} x2={140} y2={38}
                    stroke={INK(0.16)} strokeWidth={1} strokeDasharray="3 3" />
                  <path d="M5 38 Q70 0 135 38"
                    fill="none" stroke="url(#sunArc)" strokeWidth={1.5} />
                  <circle cx={65} cy={10} r={4} fill={GOLD} />
                  <circle cx={65} cy={10} r={7} fill="rgba(240,160,32,0.20)" />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display:'flex', justifyContent:'center' }}><SunsetSVG size={22}/></div>
                <div style={{ ...font, fontSize: 11, color: MISTLITE(0.75), marginTop: 4 }}>일몰</div>
                <div style={{
                  fontFamily: "'DM Mono',monospace", fontWeight: 500,
                  fontSize: 18, color: '#E8854A', marginTop: 2,
                }}>
                  19:48
                </div>
              </div>
            </div>
          </BrandCard>

        </div> {/* end scroll area */}

        {/* ── Tab Bar ──────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', bottom: 18, left: 16, right: 16, height: 64,
          background: NAVY_DARK,
          borderRadius: 24,
          border: `1px solid ${INK(0.08)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '0 4px',
          boxShadow: '0 10px 24px rgba(0,0,0,0.45)',
          zIndex: 20,
        }}>
          {tabDefs.map(tab => (
            <TabItem key={tab.id} tab={tab} active={tab.id === activeTab} onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>

      </div>{/* end phone frame */}
    </div>
  );
}
