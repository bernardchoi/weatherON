import { useState, useEffect } from "react";
import { getWeatherONTheme } from "./WeatherON_theme_tokens.js";

/* ─────────────────────────────────────────────────────────────────────
   WeatherON — H1 홈 메인 (하이브리드 크롬 최종 확정안)
   기준: brand/WeatherON_디자인_정체성_가이드.md 3장 + 4-1장(채택 항목)
   WeatherON_H1_hybrid_chrome_DEMO.jsx에서 채택 확정된 디자인을
   공식 H1 목업으로 반영. "구조적 chrome" 범위에서만 Liquid Glass /
   Material 메커니즘을 채택하고, 항상 Navy/Gold/기능색 토큰으로 리틴트.

   채택한 것: 바텀시트 블러(Navy 틴트)+드래그 핸들, 스프링 오버슈트
   트랜지션, squircle 코너, 상태 레이어 프레스(리플 대체), Navy 톤
   스텝 엘리베이션. 받지 않은 것: Material You 다이내믹 컬러, 시스템
   백색/그레이 틴트, FAB 원형 실루엣, 원형 확산 리플, 일반화된 스페큘러.

   ※ 토큰·프리미티브(색/usePressTint/PressTintOverlay/BrandCard/TabItem)의
     canonical 정의처: WeatherON_design_system.jsx. 번들러 도입 전까지는
     아래 사본을 유지하되 값 변경 시 디자인시스템 파일부터 고치고 동기화할 것.
   ───────────────────────────────────────────────────────────────────── */

/* ── Brand / Functional Color Tokens ── */
let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360'; // L0 — 기본 카드 패널
let PANEL_L1  = '#21407A'; // L1 — 바텀시트 표면
let PANEL_L2  = '#2A4F90'; // L2 — 시트 내부 중첩 요소
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let SKY       = '#4A8FD4';
let CLEAR     = '#3ABFA0';
let MIST      = '#869EBC';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(168,196,224,${a})`;

function applyWeatherONTheme(mode) {
  const theme = getWeatherONTheme(mode);
  NAVY = theme.NAVY;
  NAVY_DARK = theme.NAVY_DARK;
  PANEL = theme.PANEL;
  PANEL_L1 = theme.PANEL_L1;
  PANEL_L2 = theme.PANEL_L2;
  GOLD = theme.GOLD;
  ON_GOLD = theme.onGold || ON_GOLD;
  SKY = theme.SKY;
  CLEAR = theme.CLEAR;
  MIST = theme.MIST;
  INK = (a) => `rgba(${theme.inkRgb},${a})`;
  MISTLITE = (a) => `rgba(${theme.mistRgb},${a})`;
  return theme;
}

const outfitAssets = {
  cardigan: new URL("../assets/outfits/weatheron-outfit-cardigan-v1.png", import.meta.url).href,
  tshirt: new URL("../assets/outfits/weatheron-outfit-linen-tshirt-v1.png", import.meta.url).href,
  slacks: new URL("../assets/outfits/weatheron-outfit-slim-slacks-v1.png", import.meta.url).href,
  sneakers: new URL("../assets/outfits/weatheron-outfit-low-sneakers-v1.png", import.meta.url).href,
  trench: new URL("../assets/outfits/weatheron-outfit-trench-coat-v1.png", import.meta.url).href,
  striped: new URL("../assets/outfits/weatheron-outfit-striped-long-sleeve-v1.png", import.meta.url).href,
  boots: new URL("../assets/outfits/weatheron-outfit-chelsea-boots-v1.png", import.meta.url).href,
};

/* ── SVG Icon Helpers ───────────────────────────────────────────────── */
function SunSVG({ size = 68 }) {
  const rays = [
    [34,4,34,12],[34,56,34,64],[4,34,12,34],[56,34,64,34],
    [16.1,16.1,21.9,21.9],[46.1,46.1,51.9,51.9],
    [51.9,16.1,46.1,21.9],[21.9,46.1,16.1,51.9],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 68 68" fill="none">
      <circle cx={34} cy={34} r={16} fill={GOLD}/>
      {rays.map(([x1,y1,x2,y2],i)=>(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={GOLD} strokeWidth={3} strokeLinecap="round"/>
      ))}
    </svg>
  );
}

function BellSVG() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none"
      stroke={INK(0.82)} strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

function LockSVG({ size = 13, color = INK(0.82) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2"/>
      <path d="M8 11V8a4 4 0 018 0v3"/>
    </svg>
  );
}

function CloseSVG() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke={INK(0.7)} strokeWidth={2.2}
      strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18"/>
      <line x1="18" y1="6" x2="6" y2="18"/>
    </svg>
  );
}

/* ── Tab Icons ──────────────────────────────────────────────────────── */
const tabDefs = [
  { id:'홈', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { id:'코디', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
    </svg>
  )},
  { id:'출발', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>
  )},
  { id:'MY', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )},
  { id:'소셜', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  )},
];

/* ── 상태 레이어(state layer) 프레스 피드백 ──────────────────────────
   Material 리플의 "퍼지는 원" 애니메이션은 배제하고, 톤다운 틴트
   오버레이(opacity 0→0.12)만 채택 — 항상 Gold/기능색 토큰 사용. ── */
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
      position:'absolute', inset:0,
      background: tint,
      opacity: pressed ? 0.12 : 0,
      transition:'opacity 0.12s ease',
      pointerEvents:'none',
    }}/>
  );
}

/* ── Brand Card — 연속 곡률(squircle 근사) 코너 + 상태 레이어 프레스 ── */
function BrandCard({ accent, children, style={}, onClick }) {
  const { pressed, handlers } = usePressTint();
  const actionHandlers = onClick ? {
    ...handlers,
    onClick,
    onPointerUp: (event) => {
      onClick(event);
    },
    onMouseUp: (event) => {
      handlers.onMouseUp();
      onClick(event);
    },
    onTouchEnd: (event) => {
      handlers.onTouchEnd();
      onClick(event);
    },
  } : handlers;
  return (
    <div
      {...actionHandlers}
      style={{
        background: PANEL,
        borderRadius: 20, // squircle 근사 — Liquid Glass 연속 곡률 채택
        padding: '14px 16px',
        position: 'relative',
        overflow: 'hidden', flexShrink: 0,
        boxShadow: '0 6px 16px rgba(0,0,0,0.30)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}>
      {accent && (
        <div style={{
          position:'absolute', top:0, left:0, bottom:0, width:3,
          background:accent,
        }}/>
      )}
      <PressTintOverlay pressed={pressed} tint={accent || GOLD}/>
      {children}
      {onClick && (
        <button
          type="button"
          aria-label="카드 열기"
          onClick={onClick}
          style={{
            position:'absolute',
            inset:0,
            zIndex:3,
            opacity:0,
            border:'none',
            background:'transparent',
            cursor:'pointer',
          }}
        />
      )}
    </div>
  );
}

function GuestBadge() {
  return (
    <div style={{
      position:'absolute', left:20,
      display:'flex', alignItems:'center', gap:5,
      height:32, padding:'0 10px',
      borderRadius:16,
      background:NAVY_DARK,
      border:'1px solid rgba(232,237,246,0.10)',
      color: INK(0.78),
      fontSize:10.5, fontWeight:700,
      fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}>
      <span style={{ width:6, height:6, borderRadius:999, background:CLEAR }}/>
      게스트 · 한국어
    </div>
  );
}

function AccountBadge() {
  return (
    <div style={{
      position:'absolute', left:20,
      display:'flex', alignItems:'center', gap:5,
      height:32, padding:'0 10px',
      borderRadius:16,
      background:NAVY_DARK,
      border:'1px solid rgba(58,191,160,0.22)',
      color: INK(0.84),
      fontSize:10.5, fontWeight:800,
      fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}>
      <span style={{ width:6, height:6, borderRadius:999, background:CLEAR, boxShadow:'0 0 10px rgba(58,191,160,0.55)' }}/>
      ON · 개인화
    </div>
  );
}

function LoginRequiredCard({ onClick }) {
  const triggers = ['코디 저장', '알림 추가', '여행 저장'];
  return (
    <BrandCard accent={GOLD} style={{ paddingLeft:18, paddingTop:12, paddingBottom:12 }} onClick={onClick}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
        <div style={{ minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10.5, fontWeight:700, color:MIST, letterSpacing:'0.2px', marginBottom:5, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            <LockSVG size={12} color={MIST}/> A2 계정 연결 트리거
          </div>
          <div style={{ fontSize:13.5, fontWeight:800, color: INK(0.94), lineHeight:1.35, fontFamily:"'Noto Sans KR',sans-serif" }}>
            연결하면 저장하고 이어서 볼 수 있어요
          </div>
          <div style={{ fontSize:11.2, color: INK(0.74), marginTop:3, fontFamily:"'Noto Sans KR',sans-serif" }}>
            날씨·코디 추천은 게스트로 계속 이용 가능
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:9 }}>
            {triggers.map(label => (
              <span key={label} style={{
                height:24, padding:'0 8px',
                borderRadius:12,
                border:'1px solid rgba(232,237,246,0.12)',
                background: NAVY_DARK,
                color: INK(0.82),
                display:'inline-flex', alignItems:'center', gap:4,
                fontSize:10.3, fontWeight:700,
                fontFamily:"'Noto Sans KR',sans-serif",
              }}>
                <LockSVG size={10} color={INK(0.62)}/>{label}
              </span>
            ))}
          </div>
        </div>
        <div style={{
          flexShrink:0, height:30, padding:'0 10px', marginTop:17,
          borderRadius:15, background:GOLD,
          color: ON_GOLD, display:'flex', alignItems:'center',
          fontSize:11.5, fontWeight:800, fontFamily:"'Noto Sans KR',sans-serif",
        }}>
          연결
        </div>
      </div>
    </BrandCard>
  );
}

function AccountHomeCard({ onClick }) {
  const chips = ['옷장 42', '목적지 3', '알림 켬'];
  return (
    <BrandCard accent={CLEAR} style={{ paddingLeft:18, paddingTop:12, paddingBottom:12 }} onClick={onClick}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:10.5, fontWeight:700, color:CLEAR, letterSpacing:'0.2px', marginBottom:5, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            개인 홈
          </div>
          <div style={{ fontSize:13.8, fontWeight:800, color: INK(0.94), lineHeight:1.35, fontFamily:"'Noto Sans KR',sans-serif" }}>
            저장한 기준으로 오늘 준비 중
          </div>
          <div style={{ fontSize:11.2, color: INK(0.74), marginTop:3, fontFamily:"'Noto Sans KR',sans-serif" }}>
            코디·목적지·알림 기준이 계정에 동기화됨
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:9 }}>
            {chips.map(label => (
              <span key={label} style={{
                height:24, padding:'0 8px',
                borderRadius:12,
                border:'1px solid rgba(58,191,160,0.22)',
                background:'rgba(58,191,160,0.10)',
                color: INK(0.88),
                display:'inline-flex', alignItems:'center',
                fontSize:10.3, fontWeight:800,
                fontFamily:"'Noto Sans KR',sans-serif",
              }}>
                {label}
              </span>
            ))}
          </div>
        </div>
        <div style={{
          flexShrink:0, height:30, padding:'0 10px', marginTop:17,
          borderRadius:15, background:'rgba(58,191,160,0.16)',
          border:'1px solid rgba(58,191,160,0.30)',
          color:CLEAR, display:'flex', alignItems:'center',
          fontSize:11.5, fontWeight:900, fontFamily:"'Noto Sans KR',sans-serif",
        }}>
          동기화
        </div>
      </div>
    </BrandCard>
  );
}

function HomeStateRail({ onPermission, accountLinked = false }) {
  const states = accountLinked ? [
    { label: "계정", value: "동기화 켬", tone: CLEAR },
    { label: "위치", value: "정상", tone: CLEAR },
    { label: "알림", value: "맞춤 케어", tone: SKY, action: onPermission },
  ] : [
    { label: "게스트 열람", value: "저장만 제한", tone: GOLD },
    { label: "위치", value: "정상", tone: CLEAR },
    { label: "알림", value: "설정 전", tone: SKY, action: onPermission },
  ];
  return (
    <div style={{
      position: "absolute",
      top: 382,
      left: 20,
      right: 20,
      height: 34,
      display: "grid",
      gridTemplateColumns: "1fr 0.72fr 0.82fr",
      gap: 6,
      zIndex: 5,
    }}>
      {states.map((state) => (
        <button key={state.label} onClick={state.action} style={{
          borderRadius: 17,
          border: "1px solid rgba(232,237,246,0.10)",
          background: NAVY_DARK,
          color: INK(0.82),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          fontSize: 10.6,
          fontWeight: 800,
          cursor: state.action ? "pointer" : "default",
          fontFamily: "'Noto Sans KR',sans-serif",
          padding: "0 8px",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: state.tone, flexShrink: 0 }}/>
          <span style={{ whiteSpace: "nowrap" }}>{state.label}</span>
          <span style={{ color: INK(0.92), whiteSpace: "nowrap" }}>{state.value}</span>
        </button>
      ))}
    </div>
  );
}

function AccountGateSheet({ open, onClose, onConnect }) {
  const connect = usePressTint();
  const later = usePressTint();
  return (
    <>
      <div onClick={onClose} style={{
        position:'absolute', inset:0,
        background:'rgba(3,8,16,0.58)',
        backdropFilter:'blur(16px)',
        WebkitBackdropFilter:'blur(16px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition:'opacity 0.22s ease',
        zIndex:50,
      }}/>
      <div style={{
        position:'absolute', left:16, right:16, bottom:18,
        borderRadius:24,
        background:`linear-gradient(180deg, ${PANEL_L1} 0%, ${NAVY_DARK} 100%)`,
        border:'1px solid rgba(232,237,246,0.10)',
        boxShadow:'0 -20px 60px rgba(0,0,0,0.55)',
        padding:'18px 18px 20px',
        transform: open ? 'translateY(0)' : 'translateY(calc(100% + 28px))',
        transition:'transform 0.34s cubic-bezier(0.34,1.2,0.64,1)',
        zIndex:51,
      }}>
        <div style={{
          width:36, height:4, borderRadius:2,
          background:'rgba(232,237,246,0.24)',
          margin:'0 auto 16px',
        }}/>
        <div style={{ color: INK(0.94), fontSize:17, fontWeight:800, lineHeight:1.35 }}>
          저장하려면 계정 연결이 필요해요
        </div>
        <div style={{ color: INK(0.74), fontSize:12.2, lineHeight:1.55, marginTop:7 }}>
          추천 확인은 게스트로 계속 가능하고, 저장·동기화·알림 추가만 계정 연결 후 사용할 수 있어요.
        </div>
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          <button {...later.handlers} onClick={onClose} style={{
            flex:1, height:48, borderRadius:16,
            background:PANEL,
            border:'1px solid rgba(232,237,246,0.10)',
            color: INK(0.82),
            fontSize:13.5, fontWeight:800,
            cursor:'pointer', position:'relative', overflow:'hidden', flexShrink: 0,
            fontFamily:"'Noto Sans KR',sans-serif",
          }}>
            <PressTintOverlay pressed={later.pressed} tint={GOLD}/>
            나중에
          </button>
          <button {...connect.handlers} onClick={onConnect} style={{
            flex:1.2, height:48, borderRadius:16,
            background:GOLD,
            border:'none',
            color: ON_GOLD,
            fontSize:13.5, fontWeight:900,
            cursor:'pointer', position:'relative', overflow:'hidden', flexShrink: 0,
            fontFamily:"'Noto Sans KR',sans-serif",
          }}>
            <PressTintOverlay pressed={connect.pressed} tint={NAVY}/>
            계정 연결
          </button>
        </div>
      </div>
    </>
  );
}

/* ── 상세 메트릭 아이콘 — brand/WeatherON_아이콘_시스템.md 기준 (날씨상세 메트릭과 동일 path 재사용) ── */
function HumiditySVG({ size = 13, color = INK(0.90) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6}>
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
    </svg>
  );
}
function WindSVG({ size = 13, color = INK(0.90) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round">
      <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/>
    </svg>
  );
}
function UvSVG({ size = 13, color = GOLD }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth={1.6}/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line key={i}
            x1={12 + 7.5 * Math.cos(rad)} y1={12 + 7.5 * Math.sin(rad)}
            x2={12 + 10 * Math.cos(rad)} y2={12 + 10 * Math.sin(rad)}
            stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
        );
      })}
    </svg>
  );
}
function RainDropSVG({ size = 13, color = SKY }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <line x1="8" y1="19" x2="8" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <line x1="16" y1="19" x2="16" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <path d="M20 16.4A5 5 0 0017 7h-1.26A8 8 0 104 15.25" stroke={INK(0.70)} strokeWidth={1.4} strokeLinecap="round"/>
    </svg>
  );
}
function UmbrellaSVG({ size = 14, color = SKY }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12a10 10 0 10-20 0z"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M9 21a2 2 0 004 0"/>
    </svg>
  );
}
function ShirtSVG({ size = 14, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4L4 7l3 3 2-1.5V20h6V8.5L17 10l3-3-5-3-1.5 1a3 3 0 01-3 0L9 4z"/>
    </svg>
  );
}

/* ── Outfit Glyph — H1 실제 의류 애셋 축약형 ──
   목업은 생성형 PNG 컷을 사용하고, 제품화 단계에서는 사용자 옷장 컷으로 교체. ── */
function OutfitGlyphSVG({ size = 66, variant = "default" }) {
  const itemSets = {
    default: [
      { label: "아우터", src: outfitAssets.cardigan, fit: "92%" },
      { label: "상의", src: outfitAssets.tshirt, fit: "92%" },
      { label: "하의", src: outfitAssets.slacks, fit: "82%" },
      { label: "신발", src: outfitAssets.sneakers, fit: "100%" },
    ],
    formal: [
      { label: "아우터", src: outfitAssets.trench, fit: "96%" },
      { label: "상의", src: outfitAssets.striped, fit: "90%" },
      { label: "하의", src: outfitAssets.slacks, fit: "82%" },
      { label: "신발", src: outfitAssets.boots, fit: "96%" },
    ],
  };
  const itemTiles = itemSets[variant] || itemSets.default;
  return (
    <div style={{
      width: size,
      height: size,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 4,
      flexShrink: 0,
      position: "relative",
    }}>
      {itemTiles.map((item) => (
        <div key={item.label} style={{
          position: "relative",
          borderRadius: 9,
          background: NAVY_DARK,
          border: "1px solid rgba(232,237,246,0.10)",
          overflow: "hidden",
          boxShadow: "0 4px 9px rgba(0,0,0,0.22)",
        }}>
          <img
            src={item.src}
            alt=""
            aria-hidden="true"
            style={{
              width: item.fit,
              height: item.fit,
              objectFit: "contain",
              position: "absolute",
              left: "50%",
              top: "48%",
              transform: "translate(-50%, -50%)",
              filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.28))",
            }}
          />
        </div>
      ))}
      <div style={{
        position: "absolute",
        right: 1,
        bottom: 1,
        width: 18,
        height: 18,
        borderRadius: 9,
        background: "rgba(240,160,32,0.20)",
        border: "1px solid rgba(240,160,32,0.36)",
        color: INK(0.94),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 900,
        fontFamily: "'DM Mono',monospace",
      }}>켬</div>
    </div>
  );
}

/* ── Status Bar Icons ───────────────────────────────────────────────── */
function StatusIcons() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
      <svg width="18" height="13" viewBox="0 0 18 13" fill={INK(0.88)}>
        <rect x="0" y="8" width="3" height="5" rx="1"/>
        <rect x="5" y="5.5" width="3" height="7.5" rx="1"/>
        <rect x="10" y="3" width="3" height="10" rx="1"/>
        <rect x="15" y="0" width="3" height="13" rx="1"/>
      </svg>
      <svg width="16" height="12" viewBox="0 0 24 18" fill="none"
        stroke={INK(0.88)} strokeWidth="2.5" strokeLinecap="round">
        <path d="M2 6C6.5 1.5 17.5 1.5 22 6"/>
        <path d="M5 10C8 7 16 7 19 10"/>
        <path d="M8.5 14C10 12.5 14 12.5 15.5 14"/>
        <circle cx="12" cy="17" r="1.5" fill={INK(0.88)} stroke="none"/>
      </svg>
      <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
        <rect x="0.5" y="0.5" width="21" height="12" rx="2.5"
          stroke={INK(0.55)} strokeWidth="1"/>
        <rect x="2" y="2" width="15" height="9" rx="1.5" fill={INK(0.88)}/>
        <path d="M23 4v5a2.5 2.5 0 000-5z" fill={INK(0.42)}/>
      </svg>
    </div>
  );
}

/* ── 바텀시트 — Navy 틴트 블러(Liquid Glass) + 드래그 핸들(Material) +
     스프링 오버슈트 트랜지션(Liquid Glass) ── */
function PlaceSheet({ open, onClose, onMore }) {
  const cta = usePressTint();
  return (
    <>
      {/* 백드롭 — 시스템 백색이 아닌 Navy 틴트로 블러 */}
      <div onClick={onClose} style={{
        position:'absolute', inset:0,
        background:'rgba(21,41,77,0.55)',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition:'opacity 0.28s ease',
        zIndex:40,
      }}/>

      {/* 시트 패널 */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0,
        height:392,
        background: `linear-gradient(180deg, ${PANEL_L1} 0%, ${NAVY_DARK} 100%)`,
        borderRadius:'28px 28px 0 0', // squircle 근사
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition:'transform 0.46s cubic-bezier(0.34,1.56,0.64,1)', // 스프링 오버슈트
        boxShadow:'0 -24px 60px rgba(0,0,0,0.55)',
        zIndex:41,
        padding:'14px 20px 28px',
        display:'flex', flexDirection:'column',
      }}>
        {/* 드래그 핸들 — Material 제스처 어포던스, 중립 톤(Mist) */}
        <div style={{
          width:36, height:4, borderRadius:2,
          background:'rgba(232,237,246,0.25)',
          margin:'0 auto 18px',
        }}/>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <span style={{ fontSize:15, fontWeight:700, color: INK(0.94), fontFamily:"'Noto Sans KR',sans-serif" }}>
            AI 장소 추천
          </span>
          <div onClick={onClose} style={{
            width:28, height:28, borderRadius:'50%',
            background: PANEL_L2,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer',
          }}>
            <CloseSVG/>
          </div>
        </div>

        {/* 시트 내부 중첩 카드 — Navy 톤 스텝(PANEL_L2)으로 한 단계 더 깊은 엘리베이션 표현 */}
        <div style={{
          background: PANEL_L2,
          borderRadius:18,
          padding:'14px 16px',
          marginBottom:10,
        }}>
          <div style={{ fontSize:10.5, fontWeight:600, color:'#A6CEF2', marginBottom:4, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            합정동 · 도보 6분
          </div>
          <div style={{ fontSize:14.5, fontWeight:700, color: INK(0.94), marginBottom:3, fontFamily:"'Noto Sans KR',sans-serif" }}>
            맑은 날 테라스 카페 BEST
          </div>
          <div style={{ fontSize:11.5, color: INK(0.82), fontFamily:"'Noto Sans KR',sans-serif" }}>
            기온 22°C · 자외선 보통 · 야외석 추천
          </div>
        </div>

        <div style={{
          background: PANEL_L2,
          borderRadius:18,
          padding:'14px 16px',
          marginBottom:18,
        }}>
          <div style={{ fontSize:10.5, fontWeight:600, color:'#A6CEF2', marginBottom:4, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            망원동 · 도보 12분
          </div>
          <div style={{ fontSize:14.5, fontWeight:700, color: INK(0.94), marginBottom:3, fontFamily:"'Noto Sans KR',sans-serif" }}>
            한강뷰 피크닉 스팟
          </div>
          <div style={{ fontSize:11.5, color: INK(0.82), fontFamily:"'Noto Sans KR',sans-serif" }}>
            기온 22°C · 바람 초속 2.3m · 돗자리 챙기세요
          </div>
        </div>

        {/* 시트 내 CTA — 브랜드 모먼트 고정, 상태 레이어 프레스만 적용 */}
        <div
          {...cta.handlers}
          onClick={onMore}
          style={{
            height:48, borderRadius:18,
            background: GOLD,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', userSelect:'none',
            position:'relative', overflow:'hidden', flexShrink: 0,
          }}>
          <PressTintOverlay pressed={cta.pressed} tint={NAVY}/>
          <span style={{ fontSize:14, fontWeight:700, color: ON_GOLD, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            장소 더보기
          </span>
        </div>
      </div>
    </>
  );
}

/* ── Main Mockup ────────────────────────────────────────────────────── */
export default function WeatherONHome({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState.themeMode);
  const [activeTab, setActiveTab] = useState('홈');
  const [loginHint, setLoginHint] = useState('');
  const [outfitVariant, setOutfitVariant] = useState(routeState.outfitVariant || "default");
  const ctaPress = usePressTint();
  const accountLinked = Boolean(routeState.accountLinked);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap';
    const style = document.createElement('style');
    style.textContent = '#weatheron-h1-cards::-webkit-scrollbar{display:none;}';
    document.head.appendChild(link);
    document.head.appendChild(style);
    return () => {
      try { document.head.removeChild(link); } catch(_){}
      try { document.head.removeChild(style); } catch(_){}
    };
  }, []);

  useEffect(() => {
    if (routeState.outfitVariant) setOutfitVariant(routeState.outfitVariant);
  }, [routeState.outfitVariant]);

  const pills = [
    { icon:<HumiditySVG/>, label:'65%',   sub:'습도' },
    { icon:<WindSVG/>, label:'초속 2.3m', sub:'바람' },
    { icon:<UvSVG/>, label:'자외선 3',  sub:'보통' },
    { icon:<RainDropSVG/>, label:'0mm',   sub:'강수' },
  ];

  const cardTag  = { fontSize:10.5, fontWeight:600, color:MIST, letterSpacing:'0.3px', marginBottom:6, fontFamily:"'Plus Jakarta Sans',sans-serif" };
  const cardMain = { fontSize:15, fontWeight:700, color: INK(0.94), lineHeight:1.35, marginBottom:4, fontFamily:"'Noto Sans KR',sans-serif" };
  const cardSub  = { fontSize:11.5, color: INK(0.82), fontFamily:"'Noto Sans KR',sans-serif" };
  const hasRainSignal = (routeState.hasRainSignal ?? true) && !routeState.umbrellaSignalReviewed;
  const rainSignalCopy = routeState.rainSignalCopy || {
    label: "비 신호",
    title: "목적지에 오후 비 예보가 있어요",
    summary: "18~21시 강수확률 80% · 3단 우산 추천 →",
  };
  const outfitCopy = {
    default: {
      title: "아침엔 가디건, 낮엔 티셔츠",
      summary: "옷장 4개 매칭 · 15°→26° →",
    },
    formal: {
      title: "미팅엔 트렌치, 실내는 니트",
      summary: "재추천 반영 · 16°→24° →",
    },
  }[outfitVariant] || {
    title: "아침엔 가디건, 낮엔 티셔츠",
    summary: "옷장 4개 매칭 · 15°→26° →",
  };
  const showAccountHint = () => {
    setLoginHint('코디/옷장/장소 저장·알림 추가·여행 저장은 계정 연결 후 사용할 수 있어요');
    window.setTimeout(() => setLoginHint(''), 2200);
  };
  const goTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId === '코디') navigate?.('C1', { outfitVariant });
    if (tabId === '출발') navigate?.('G1');
    if (tabId === 'MY') navigate?.('M1');
    if (tabId === '소셜') navigate?.('S0');
  };

  return (
    <div style={{
      minHeight:'100vh',
      background: weatherTheme.shellBg,
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'center',
      gap:20,
      padding:'32px 20px',
    }}>
      <p style={{
        fontSize:11, fontWeight:500,
        color: MISTLITE(0.64),
        letterSpacing:'1.6px',
        fontFamily:'system-ui',
        textAlign:'center',
        maxWidth:393,
      }}>
        WeatherON · H1 홈 메인 · 하이브리드 크롬
      </p>

      <div style={{
        width:393, height:852,
        borderRadius:40,
        overflow:'hidden',
        position:'relative', flexShrink: 0,
        background: weatherTheme.gradient,
        boxShadow: weatherTheme.phoneShadow,
        fontFamily:"'Noto Sans KR',-apple-system,sans-serif",
      }}>

        <div style={{
          position:'absolute', top:80, left:'50%', transform:'translateX(-50%)',
          width:230, height:230,
          background:'radial-gradient(ellipse, rgba(240,160,32,0.14) 0%, transparent 70%)',
          pointerEvents:'none',
        }}/>

        {/* STATUS BAR */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:54,
          display:'flex', alignItems:'flex-end', justifyContent:'space-between',
          padding:'0 28px 10px',
          zIndex:20,
        }}>
          <span style={{ fontSize:15, fontWeight:700, color: INK(0.94), letterSpacing:'0.2px', fontFamily:"'DM Mono',monospace" }}>9:41</span>
          <StatusIcons/>
        </div>

        {/* 위치 HEADER */}
        <div style={{
          position:'absolute', top:54, left:0, right:0, height:50,
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:10,
        }}>
          {accountLinked ? <AccountBadge/> : <GuestBadge/>}
          <button onClick={() => navigate?.('H2')} style={{
            display:'flex', alignItems:'center', gap:4,
            background: NAVY_DARK,
            border:'1px solid rgba(232,237,246,0.10)',
            borderRadius:18, padding:'7px 14px',
            cursor:'pointer',
          }}>
            <span style={{ fontSize:13.5, fontWeight:500, color: INK(0.92), fontFamily:"'Noto Sans KR',sans-serif" }}>
              서울 마포구 합정동
            </span>
            <span style={{ fontSize:10, color: INK(0.82), marginLeft:2 }}>▾</span>
          </button>
          <button onClick={() => navigate?.('H3')} style={{
            position:'absolute', right:20,
            width:40, height:40,
            background: NAVY_DARK,
            border:'1px solid rgba(232,237,246,0.10)',
            borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer',
          }}>
            <BellSVG/>
          </button>
        </div>

        {/* WEATHER HERO */}
        <div style={{
          position:'absolute', top:108, left:0, right:0, height:230,
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
        }}>
          <div style={{ marginBottom:10 }}><SunSVG/></div>
          <div style={{
            fontFamily:"'DM Mono',monospace",
            fontWeight:500, fontSize:80,
            color: INK(0.94), lineHeight:0.92,
            letterSpacing:'-2px',
          }}>
            22°
          </div>
          <div style={{ fontSize:17, fontWeight:400, color:MIST, marginTop:10, fontFamily:"'Noto Sans KR',sans-serif" }}>맑음</div>
          <div style={{ fontSize:12, color: INK(0.74), marginTop:5, fontFamily:"'DM Mono',monospace" }}>
            체감 21° · 최고 26° · 최저 15°
          </div>
        </div>

        {/* 상세 PILLS */}
        <div style={{
          position:'absolute', top:344, left:0, right:0,
          display:'flex', justifyContent:'center', gap:7, padding:'0 16px',
        }}>
          {pills.map(p => (
            <div key={p.sub} style={{
              display:'flex', alignItems:'center', gap:4,
              padding:'7px 11px',
              background: NAVY_DARK,
              border:'1px solid rgba(232,237,246,0.12)',
              borderRadius:16,
            }}>
              {p.icon}
              <span style={{ fontSize:11.5, fontWeight:500, color: INK(0.90), whiteSpace:'nowrap', fontFamily:"'DM Mono',monospace" }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>

        <HomeStateRail accountLinked={accountLinked} onPermission={() => navigate?.('O3')}/>

        {/* CARDS AREA */}
        <div id="weatheron-h1-cards" style={{
          position:'absolute', top:426, left:20, right:20, bottom:150,
          display:'flex', flexDirection:'column', gap:9,
          overflowY:'auto',
          scrollbarWidth:'none',
          msOverflowStyle:'none',
          paddingBottom:8,
        }}>
          {loginHint && (
            <div style={{
              position:'absolute', left:0, right:0, top:-44,
              minHeight:34, borderRadius:17,
              background: NAVY_DARK,
              border:'1px solid rgba(232,237,246,0.12)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color: INK(0.84), fontSize:11.5, fontWeight:700,
              fontFamily:"'Noto Sans KR',sans-serif",
              boxShadow:'0 10px 24px rgba(0,0,0,0.35)',
            }}>
              {loginHint}
            </div>
          )}

          {hasRainSignal && (
            <BrandCard accent={SKY} style={{ paddingLeft:18 }} onClick={() => navigate?.('H4', { umbrellaSignalReviewed: true })}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{...cardTag, display:'flex', alignItems:'center', gap:5, color:SKY}}>
                    <UmbrellaSVG size={12} color={SKY}/>{rainSignalCopy.label}
                  </div>
                  <div style={cardMain}>{rainSignalCopy.title}</div>
                  <div style={cardSub}>{rainSignalCopy.summary}</div>
                </div>
                <div style={{
                  width:46,
                  height:46,
                  borderRadius:16,
                  background: routeState.themeMode === "light" ? "rgba(24,94,150,0.10)" : "rgba(74,143,212,0.16)",
                  border:`1px solid ${routeState.themeMode === "light" ? "rgba(24,94,150,0.20)" : "rgba(74,143,212,0.28)"}`,
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  flexShrink:0,
                }}>
                  <UmbrellaSVG size={24} color={SKY}/>
                </div>
              </div>
            </BrandCard>
          )}

          {/* AI 장소 추천 카드 — 탭하면 목적지 필터/상세 허브로 이동 */}
          <BrandCard accent={SKY} style={{ paddingLeft:18 }} onClick={() => navigate?.('P3')}>
            <div style={cardTag}>AI 장소 추천</div>
            <div style={cardMain}>오늘 이 날씨엔 합정동 카페 어때요?</div>
            <div style={cardSub}>맑음 · 기온 22°C · 목적지 가이드 보기 →</div>
          </BrandCard>

          <BrandCard accent={CLEAR} style={{ paddingLeft:18 }} onClick={() => navigate?.('C1', { outfitVariant })}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{...cardTag, display:'flex', alignItems:'center', gap:5}}><ShirtSVG size={12} color={MIST}/> 코디 추천</div>
                <div style={cardMain}>{outfitCopy.title}</div>
                <div style={cardSub}>{outfitCopy.summary}</div>
              </div>
              <div style={{ background: NAVY_DARK, borderRadius: 14, padding: 5, border:'1px solid rgba(232,237,246,0.08)' }}>
                <OutfitGlyphSVG size={66} variant={outfitVariant}/>
              </div>
            </div>
          </BrandCard>

          {accountLinked ? (
            <AccountHomeCard onClick={() => navigate?.('M1')}/>
          ) : (
            <LoginRequiredCard onClick={() => navigate?.('A2')}/>
          )}
        </div>

        {/* CWR 제보 버튼 — v2.0 보조 참여 액션. 탭바 위 안전영역에 고정 */}
        <div
          {...ctaPress.handlers}
          onClick={() => navigate?.('W1')}
          style={{
            position:'absolute', left:'50%', bottom:96, transform:'translateX(-50%)',
            height:40, minWidth:160, padding:'0 15px',
            borderRadius:20,
            background: NAVY_DARK,
            border:'1px solid rgba(240,160,32,0.42)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 6px 14px rgba(0,0,0,0.26)',
            cursor:'pointer', userSelect:'none',
            overflow:'hidden',
            zIndex:18,
          }}>
          <PressTintOverlay pressed={ctaPress.pressed} tint={NAVY}/>
          <span style={{ fontSize:12.8, fontWeight:800, color:GOLD, fontFamily:"'Noto Sans KR',sans-serif" }}>
            지금 날씨 제보하기
          </span>
        </div>

        {/* TAB BAR — 탭별 상태 레이어 프레스 적용 */}
        <div style={{
          position:'absolute', bottom:18, left:16, right:16, height:64,
          background: NAVY_DARK,
          borderRadius:24,
          border:'1px solid rgba(232,237,246,0.08)',
          display:'flex', alignItems:'center', justifyContent:'space-around',
          padding:'0 4px',
          boxShadow:'0 10px 24px rgba(0,0,0,0.45)',
          zIndex:20,
        }}>
          {tabDefs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <TabItem key={tab.id} tab={tab} active={active} onClick={() => goTab(tab.id)}/>
            );
          })}
        </div>

      </div>

      <p style={{ fontSize:11, color: MISTLITE(0.22), fontFamily:'system-ui', letterSpacing:'0.5px' }}>
        하이브리드 크롬 · 네이비 브랜드 토큰 · WeatherON 디자인 체계
      </p>
    </div>
  );
}

function TabItem({ tab, active, onClick }) {
  const { pressed, handlers } = usePressTint();
  const _tabLabel = tab.id === "MY" ? "마이" : tab.id;
  return (
    <button
      type="button"
      onClick={onClick}
      {...handlers}
      aria-label={_tabLabel}
      aria-current={active ? "page" : undefined}
      style={{
        appearance:'none', border:'none', background:'transparent', font:'inherit',
        flex:1, minHeight:52, position:'relative', overflow:'hidden', flexShrink: 0,
        borderRadius:14,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:4,
        cursor:'pointer', userSelect:'none',
        color: active ? GOLD : MIST,
        transition:'color 0.15s ease',
      }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      <div style={{
        width:5, height:5, borderRadius:'50%',
        background: active ? GOLD : 'transparent',
        marginBottom:1,
      }}/>
      {tab.icon}
      <span style={{ fontSize:10.5, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        {_tabLabel}
      </span>
    </button>
  );
}
