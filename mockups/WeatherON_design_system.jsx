import { useState } from "react";

/* ── WeatherON · 디자인 시스템 (canonical source) ─────────────────────
   목적: 목업 전반에 복붙되던 색 토큰 + 프리미티브의 단일 정의처.
   기준: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안,
         brand/WeatherON_아이콘_시스템.md (인앱 UI 아이콘 24px/stroke1.8/컬러)

   ※ 사용 메모: 현재 목업들은 번들러 없이 단일 파일 React 아티팩트로
     개별 렌더링됨(각 파일은 "react"만 import). 따라서 이 모듈을 런타임
     import 하려면 번들러(vite 등) 도입이 선행돼야 함. 그 전까지 각 목업은
     자체 사본을 유지하되, 토큰/프리미티브의 "정답"은 이 파일을 기준으로
     동기화한다. 값 변경 시 여기부터 고치고 사본에 반영할 것.
─────────────────────────────────────────────────────────────────────── */

/* ── Brand / Functional Color Tokens ── */
export const NAVY      = '#10243F'; // 다크 BG — 기존 Navy보다 덜 탁하고 더 선명한 기준색
export const NAVY_DARK = '#17365D'; // 다크 Surface
export const PANEL     = '#214A78'; // 다크 Elevated — 기본 카드 패널
export const PANEL_L1  = '#2A5D8F'; // L1 — 바텀시트 표면
export const PANEL_L2  = '#3470A6'; // L2 — 시트 내부 중첩 요소
export const GOLD      = '#F4B63F'; // Warm Sun — 브랜드 대표색보다 햇빛/강조 의미색으로 축소
export const SKY       = '#4AA3DF';
export const SKY_LITE  = '#A6CEF2'; // PANEL/PANEL_L2 위 소형 라벨 AA(4.5:1) 통과용 틴트
export const CLEAR     = '#2FC6A3';
export const WARM      = '#E8854A';
export const MIST      = '#B9CBE0';

/* 알파 헬퍼 — INK: 본문/회색 텍스트, MISTL: 푸른 회색 보조 텍스트.
   접근성 메모: PANEL 계열 위 보조 텍스트는 opacity ≥ 0.80 를 기본값으로
   둘 것(소형 텍스트 AA 4.5:1 확보). 0.5~0.65 대는 AA 미달이므로 지양. */
export const INK   = (a) => `rgba(232,237,246,${a})`;
export const MISTL = (a) => `rgba(185,203,224,${a})`;

export const GRADIENT = `linear-gradient(175deg, ${NAVY} 0%, #1F4E79 54%, #4AA3DF 120%)`;
export const RADIUS = { card: 20, cardSm: 16, sheet: 28, pill: 16, tab: 24 }; // squircle 근사

/* ── 라이트 모드 토큰 (2026-06-25 보정) ────────────────────────────────
   라이트모드는 밝은 배경 위에서 포인트가 탁하거나 촌스럽게 보이지 않도록
   다크모드의 Warm Sun을 그대로 재사용하지 않고 별도 고채도/중명도 토큰을 쓴다.
   CTA와 작은 상태 라벨 모두에서 읽히는 선을 기준으로 잡는다. ── */
export const RAIN_RED = '#E97F77';

export const LIGHT_BG      = '#F5F9FC'; // 라이트 Background
export const LIGHT_SURFACE = '#FFFFFF';
export const LIGHT_ELEVATED = '#EAF3FA';
export const LIGHT_GOLD    = '#C2410C'; // Dawn Orange — 라이트 UI 활성/CTA
export const LIGHT_SKY     = '#237BBD'; // Clear Sky
export const LIGHT_CLEAR   = '#007F73'; // Action Teal
export const LIGHT_WARM    = '#C84A2F'; // Coral Warm
export const LIGHT_GRADIENT = `linear-gradient(175deg, ${LIGHT_BG} 0%, ${LIGHT_ELEVATED} 58%, #D7EAF7 100%)`;
export const LIGHT_PANEL   = LIGHT_SURFACE; // L0 — 기본 카드 패널 (다크 모드 PANEL 대응)
export const LIGHT_PANEL_L1 = LIGHT_ELEVATED; // L1 — 바텀시트/탭바 표면
export const LIGHT_BORDER  = 'rgba(12,31,63,0.10)';

/* 라이트 모드 알파 헬퍼 — LIGHT_INK: 본문 텍스트(Navy 베이스), 다크 모드
   INK(흰색 베이스)와 대칭 짝. 접근성 기준은 동일(보조 텍스트 opacity ≥0.60). */
export const LIGHT_INK = (a) => `rgba(20,32,51,${a})`;

/* 화면/컴포넌트에서 현재 테마에 맞는 토큰 묶음을 한 번에 가져오기 위한
   헬퍼. 사용처는 아직 없음(목업은 다크 모드 단일 구현) — 라이트 모드 목업을
   만들 때 이 객체를 기준으로 분기할 것. */
export const THEME = {
  dark: {
    bgGradient: GRADIENT, panel: PANEL, panelL1: PANEL_L1, navy다크: NAVY_DARK,
    ink: INK, border: 'rgba(232,237,246,0.08)', statusBarIcon: '#fff',
  },
  light: {
    bgGradient: LIGHT_GRADIENT, panel: LIGHT_PANEL, panelL1: LIGHT_PANEL_L1, navy다크: LIGHT_PANEL_L1,
    ink: LIGHT_INK, border: LIGHT_BORDER, statusBarIcon: '#142033',
    gold: LIGHT_GOLD, sky: LIGHT_SKY, clear: LIGHT_CLEAR, warm: LIGHT_WARM,
  },
};

/* ── 상태 레이어(state layer) 프레스 — Material 리플의 원형 확산은 배제,
     톤다운 틴트 오버레이(0→0.12)만 채택. tint는 항상 브랜드/기능 토큰. ── */
export function usePressTint() {
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

export function PressTintOverlay({ pressed, tint }) {
  return (
    <div style={{
      position:'absolute', inset:0, background: tint,
      opacity: pressed ? 0.12 : 0,
      transition:'opacity 0.12s ease', pointerEvents:'none',
    }}/>
  );
}

/* ── BrandCard — 연속 곡률 코너 + 좌측 accent 바 + 상태 레이어 프레스 ── */
export function BrandCard({ accent, children, style = {}, onClick }) {
  const { pressed, handlers } = usePressTint();
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} {...(onClick ? handlers : {})} {...(onClick ? { type: "button" } : {})} style={{
      ...(onClick ? { appearance:'none', border:'none', font:'inherit', color:'inherit', textAlign:'left', width:'100%' } : {}),
      background: PANEL, borderRadius: RADIUS.card, padding: '14px 16px',
      position: 'relative', overflow: 'hidden', flexShrink: 0,
      boxShadow: '0 6px 16px rgba(0,0,0,0.30)',
      cursor: onClick ? 'pointer' : 'default', ...style,
    }}>
      {accent && <div style={{ position:'absolute', top:0, left:0, bottom:0, width:3, background:accent }}/>}
      {onClick && <PressTintOverlay pressed={pressed} tint={accent || GOLD}/>}
      {children}
    </Tag>
  );
}

/* ── 탭바 정의 + 아이템 ── */
export const tabDefs = [
  { id:'홈', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { id:'코디', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
    </svg>
  )},
  { id:'출발', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>
  )},
  { id:'MY', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )},
  { id:'소셜', icon:(
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  )},
];

export function TabItem({ tab, active, onClick }) {
  const { pressed, handlers } = usePressTint();
  const _tabLabel = tab.id === "MY" ? "마이" : tab.id;
  return (
    <button type="button" onClick={onClick} {...handlers} aria-label={_tabLabel} aria-current={active ? "page" : undefined} style={{
      appearance:'none', border:'none', background:'transparent', font:'inherit',
      flex:1, minHeight:52, position:'relative', overflow:'hidden', flexShrink: 0, borderRadius:14,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
      cursor:'pointer', userSelect:'none',
      color: active ? GOLD : MISTL(0.76), // 라이트 탭바 비활성 라벨 기준 — 0.70에서 한 단계 상향
      transition:'color 0.15s ease',
    }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      <div style={{ width:5, height:5, borderRadius:'50%', background: active ? GOLD : 'transparent', marginBottom:1 }}/>
      {tab.icon}
      <span style={{ fontSize:10.5, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{_tabLabel}</span>
    </button>
  );
}

export function TabBar({ activeId, onChange }) {
  return (
    <div style={{
      position:'absolute', bottom:18, left:16, right:16, height:64,
      background: NAVY_DARK, borderRadius: RADIUS.tab, border:`1px solid ${INK(0.08)}`,
      display:'flex', alignItems:'center', justifyContent:'space-around', padding:'0 4px',
      boxShadow:'0 10px 24px rgba(0,0,0,0.45)', zIndex:20,
    }}>
      {tabDefs.map(tab => (
        <TabItem key={tab.id} tab={tab} active={tab.id === activeId} onClick={() => onChange?.(tab.id)}/>
      ))}
    </div>
  );
}
