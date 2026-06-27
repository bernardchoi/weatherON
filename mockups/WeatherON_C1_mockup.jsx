import { useState, useEffect } from "react";
import { getWeatherONTheme } from "./WeatherON_theme_tokens.js";

/* ── WeatherON C1 · 코디 메인 (AI 추천, 하이브리드 크롬) ───────────────
   와이어프레임 C1 기준: 내 옷장 + 날씨 + 스타일 태그 기반 AI 코디
   - 코디 탭 메인 / AI 추천 코디 뷰 (상의+하의+아우터 조합)
   - 추천 이유 (아침 쌀쌀 → 가디건 레이어드, 낮 따뜻)
   - 코디 상세 / 다시 추천 버튼 / 내 옷장 관리 링크 (42벌 등록)
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
   ※ 토큰·프리미티브 canonical 정의처: WeatherON_design_system.jsx
     (번들러 도입 전까지 사본 유지, 값 변경 시 디자인시스템 파일부터 동기화)
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#21407A';
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

/* ── 의류/시스템 아이콘 — brand/WeatherON_아이콘_시스템.md 기준 (24px, stroke 1.8) ── */
function ShirtSVG({ size = 20, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4L4 7l3 3 2-1.5V20h6V8.5L17 10l3-3-5-3-1.5 1a3 3 0 01-3 0L9 4z"/>
    </svg>
  );
}
function JacketSVG({ size = 20, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4L4 7l3 3 2-1.5V20h6V8.5L17 10l3-3-5-3-1.5 1a3 3 0 01-3 0L9 4z"/>
      <line x1="12" y1="8" x2="12" y2="20"/>
      <circle cx="10.5" cy="11" r="0.6" fill={color} stroke="none"/>
      <circle cx="10.5" cy="15" r="0.6" fill={color} stroke="none"/>
    </svg>
  );
}
function PantsSVG({ size = 20, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l1 9-1 9h-4l-1-10-1 10H7l-1-9z"/>
    </svg>
  );
}
function ShoeSVG({ size = 20, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18c0-2 1-3 3-4l5-2 4-3c1-1 2-1 3 0l3 3c1 1 1 2 1 3v3a1 1 0 01-1 1H4a1 1 0 01-1-1z"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function HangerSVG({ size = 18, color = MISTLITE(0.78) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a2 2 0 110 4"/>
      <path d="M12 7L3 14.5a1 1 0 00.4 1.8h17.2a1 1 0 00.4-1.8L12 7z"/>
      <line x1="5" y1="19" x2="19" y2="19"/>
    </svg>
  );
}
function RefreshSVG({ size = 14, color = MISTLITE(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  );
}
function SunSVG({ size = 14, color = GOLD }) {
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

function GarmentPreview({ src, name, imageStyle = {} }) {
  return (
    <img
      src={src}
      alt={name}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.24))",
        ...imageStyle,
      }}
    />
  );
}

/* ── Outfit Set — MVP용 옷장 아이템 카드 그리드 ───────────
   큰 일러스트 대신 실제 옷장 썸네일/상품 이미지로 확장 가능한 구조. ── */
function OutfitItemTile({ type, name, meta, src, accent, dark = false, imageStyle }) {
  return (
    <div style={{
      minHeight: 116,
      borderRadius: 14,
      background: NAVY_DARK,
      border: `1px solid ${INK(0.08)}`,
      padding: 8,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden", flexShrink: 0,
      boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
    }}>
      <div style={{
        position: "absolute",
        right: 8,
        top: 8,
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: accent,
        opacity: 0.10,
      }}/>
      <div style={{ color: INK(0.68), fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", fontFamily: "'Noto Sans KR',sans-serif" }}>{type}</div>
      <div style={{
        height: 56,
        borderRadius: 11,
        background: "linear-gradient(180deg, #F8FBFF, #E7EEF7)",
        border: "1px solid rgba(16,33,64,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: 3,
      }}>
        <GarmentPreview src={src} name={name} imageStyle={{
          filter: dark ? "drop-shadow(0 9px 10px rgba(16,33,64,0.18)) brightness(1.03) contrast(1.05)" : undefined,
          ...imageStyle,
        }}/>
      </div>
      <div>
        <div style={{ color: INK(0.92), fontSize: 11.2, fontWeight: 800, lineHeight: 1.18 }}>{name}</div>
        <div style={{ color: INK(0.68), fontSize: 10.2, marginTop: 1 }}>{meta}</div>
      </div>
    </div>
  );
}

const outfitSets = {
  default: [
    { type: "아우터", name: "오버핏 가디건", meta: "아침 15° 대응", src: outfitAssets.cardigan, accent: CLEAR },
    { type: "상의", name: "린넨 티셔츠", meta: "낮 26° 대응", src: outfitAssets.tshirt, accent: SKY },
    { type: "하의", name: "슬림 슬랙스", meta: "바람 초속 2.3m", src: outfitAssets.slacks, accent: GOLD, dark: true, imageStyle: { width: "72%" } },
    { type: "신발", name: "로우 스니커즈", meta: "비 없음", src: outfitAssets.sneakers, accent: CLEAR, imageStyle: { width: "112%" } },
  ],
  formal: [
    { type: "아우터", name: "라이트 트렌치", meta: "바람 보통", src: outfitAssets.trench, accent: GOLD },
    { type: "상의", name: "스트라이프 롱슬리브", meta: "실내 단독", src: outfitAssets.striped, accent: SKY },
    { type: "하의", name: "슬림 슬랙스", meta: "포멀 톤", src: outfitAssets.slacks, accent: CLEAR, dark: true, imageStyle: { width: "72%" } },
    { type: "신발", name: "첼시 부츠", meta: "미팅 무드", src: outfitAssets.boots, accent: GOLD, imageStyle: { width: "112%" } },
  ],
};

const decisionCopy = {
  default: {
    title: "가디건은 챙기고, 낮엔 티셔츠로 충분해요",
    desc: "08시 15°는 쌀쌀하고, 14시 26°부터는 더워져요.",
    chips: ["08시 가디건 착용", "14시 이너 충분", "추위 민감 +1"],
    summaryChips: ["15°→26°", "비 없음", "옷장 4개", "92% 매칭"],
    callStatus: "비 없음",
  },
  formal: {
    title: "미팅 일정이면 트렌치 레이어드가 더 안정적이에요",
    desc: "바람이 있어 겉옷은 유지하고, 실내에서는 롱슬리브 단독으로 충분해요.",
    chips: ["08시 트렌치 착용", "13시 실내 단독", "포멀 요청 반영"],
    summaryChips: ["16°→24°", "바람 보통", "포멀 요청", "88% 매칭"],
    callStatus: "포멀",
  },
};

function OutfitSetGrid({ variant = "default" }) {
  const items = outfitSets[variant] || outfitSets.default;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
      {items.map((item) => <OutfitItemTile key={item.type} {...item}/>)}
    </div>
  );
}

function RecommendationStateCard({ onStyle, onLogin, saved, styleProfileSaved, selectedStyles, outfitVariant }) {
  const states = [
    { label: "옷장", value: "4개 매칭", color: CLEAR },
    { label: "스타일", value: styleProfileSaved ? (selectedStyles?.[0] || "저장됨") : "미니멀", color: styleProfileSaved ? CLEAR : GOLD },
    { label: "저장", value: saved ? "저장 완료" : "계정 필요", color: saved ? CLEAR : SKY, action: saved ? undefined : onLogin },
  ];
  return (
    <BrandCard style={{ borderRadius: 16, padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
        <div>
          <div style={{ color: MIST, fontSize: 10.2, fontWeight: 900, letterSpacing: "0.09em", fontFamily: "'DM Mono',monospace" }}>추천 기준</div>
          <div style={{ color: INK(0.84), fontSize: 10.8, marginTop: 2 }}>{outfitVariant === "formal" ? "포멀한 일정 기준 추천" : styleProfileSaved ? "저장한 스타일 기준 반영" : saved ? "오늘 코디 저장됨" : "기본 날씨 기준 추천"}</div>
        </div>
        <button onClick={onStyle} style={{
          height: 28,
          borderRadius: 15,
          border: `1px solid ${INK(0.10)}`,
          background: NAVY_DARK,
          color: GOLD,
          fontSize: 10.8,
          fontWeight: 900,
          cursor: "pointer",
          fontFamily: "'Noto Sans KR',sans-serif",
          padding: "0 10px",
          flexShrink: 0,
        }}>기준 수정</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {states.map((state) => (
          <button key={state.label} onClick={state.action} style={{
            minHeight: 36,
            borderRadius: 12,
            border: `1px solid ${INK(0.08)}`,
            background: NAVY_DARK,
            cursor: state.action ? "pointer" : "default",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            fontFamily: "'Noto Sans KR',sans-serif",
          }}>
            <span style={{ color: INK(0.66), fontSize: 10.2, fontWeight: 800 }}>{state.label}</span>
            <span style={{ color: state.color === SKY ? INK(0.72) : state.color, fontSize: 10.2, fontWeight: 900 }}>{state.value}</span>
          </button>
        ))}
      </div>
    </BrandCard>
  );
}

export default function WeatherON_C1({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState.themeMode);
  const [activeTab, setActiveTab] = useState("코디");
  const [outfitSaved, setOutfitSaved] = useState(Boolean(routeState.outfitSaved || (routeState.resumeSave && routeState.pendingAction === "코디 저장")));
  const [styleProfileSaved, setStyleProfileSaved] = useState(Boolean(routeState.styleProfileSaved));
  const [outfitVariant, setOutfitVariant] = useState(routeState.outfitVariant || "default");
  const wardrobeBtn = usePressTint();
  const detailBtn = usePressTint();
  const retryBtn = usePressTint();
  const wardrobeRow = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (routeState.outfitSaved || (routeState.resumeSave && routeState.pendingAction === "코디 저장")) {
      setOutfitSaved(true);
    }
    if (routeState.styleProfileSaved) setStyleProfileSaved(true);
    if (routeState.outfitVariant) setOutfitVariant(routeState.outfitVariant);
  }, [routeState.outfitSaved, routeState.resumeSave, routeState.pendingAction, routeState.styleProfileSaved, routeState.outfitVariant]);

  const goTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "홈") navigate?.("H1", { outfitVariant, outfitSaved });
    if (tabId === "출발") navigate?.("G1");
    if (tabId === "MY") navigate?.("M1");
    if (tabId === "소셜") navigate?.("S0");
  };
  const currentDecision = decisionCopy[outfitVariant] || decisionCopy.default;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        C1 · 코디 메인 (AI 추천) · 하이브리드 크롬
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
            <span style={{ color: INK(0.94), fontSize: 20, fontWeight: 800 }}>코디</span>
            <button {...wardrobeBtn.handlers} onClick={() => navigate?.("C2")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, position:'relative', overflow:'hidden' }}>
              <PressTintOverlay pressed={wardrobeBtn.pressed} tint={GOLD}/>
              <ShirtSVG size={16} color={weatherTheme.mode === "light" ? weatherTheme.logoNavy : INK(0.92)}/>
            </button>
          </div>

          {/* Weather context */}
          <div style={{ padding: "8px 20px 0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, color: MISTLITE(0.88), fontSize: 12 }}>
              <SunSVG size={13}/> 21° 맑음 · 일교차 11° 기준 추천
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "9px 20px", display: "flex", flexDirection: "column", gap: 7, height: "calc(852px - 250px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 28 }}>

            <RecommendationStateCard
              saved={outfitSaved}
              styleProfileSaved={styleProfileSaved}
              selectedStyles={routeState.selectedStyles}
              outfitVariant={outfitVariant}
              onStyle={() => navigate?.("O4", { returnTo: "C1", selectedStyles: routeState.selectedStyles, fit: routeState.fit, age: routeState.age })}
              onLogin={() => navigate?.("A2", {
                pendingAction: "코디 저장",
                returnTo: "C1",
                resumeSave: true,
                outfitSaved: true,
                outfitVariant,
              })}
            />

            {outfitSaved && (
              <BrandCard accent={CLEAR} style={{ borderRadius: 16, padding: "12px 14px" }}>
                <div style={{ color: CLEAR, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace" }}>저장된 코디</div>
                <div style={{ color: INK(0.86), fontSize: 12.2, lineHeight: 1.5, marginTop: 5 }}>
                  오늘 코디가 저장됨. 다음 추천부터 착용 기록과 옷장 매칭 기준에 반영됨.
                </div>
              </BrandCard>
            )}

            {/* AI Outfit Preview Card */}
            <BrandCard accent={CLEAR} onClick={() => navigate?.("C4", { outfitVariant, outfitSaved })} style={{ borderRadius: 18, padding: "11px 13px 11px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: CLEAR }} />
                  <span style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>오늘 입을 세트</span>
                </div>
              <span style={{ color: INK(0.70), fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 800 }}>옷장 4/42</span>
              </div>

              <OutfitSetGrid variant={outfitVariant}/>
              <div style={{ marginTop: 7, display: "flex", gap: 5, flexWrap: "wrap" }}>
                {currentDecision.summaryChips.map((chip, index) => (
                  <span key={chip} style={{
                    borderRadius: 14,
                    background: PANEL_L1,
                    border: `1px solid ${index === 3 ? CLEAR : INK(0.08)}`,
                    color: index === 3 ? INK(0.92) : INK(0.78),
                    padding: "4px 6px",
                    fontSize: 10.4,
                    fontWeight: 800,
                    fontFamily: index === 0 ? "'DM Mono',monospace" : "'Noto Sans KR',sans-serif",
                  }}>{chip}</span>
                ))}
              </div>

            </BrandCard>

            {/* 판단 카드 */}
            <BrandCard style={{ borderRadius: 16, padding: "11px 13px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                <div style={{ color: MIST, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>오늘의 판단</div>
                <div style={{ color: INK(0.92), fontSize: 10.5, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{currentDecision.callStatus}</div>
              </div>
              <div style={{ color: INK(0.94), fontSize: 13.5, fontWeight: 800, lineHeight: 1.32, marginBottom: 4 }}>
                {currentDecision.title}
              </div>
              <div style={{ color: INK(0.72), fontSize: 10.8, lineHeight: 1.38, marginBottom: 8 }}>
                {currentDecision.desc}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                {currentDecision.chips.map((item, index) => (
                  <span key={item} style={{
                    minWidth: 0,
                    borderRadius: 12,
                    background: NAVY_DARK,
                    border: `1px solid ${INK(0.06)}`,
                    color: index === 1 ? GOLD : INK(0.82),
                    padding: "5px 6px",
                    fontSize: 10,
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}>{item}</span>
                ))}
              </div>
            </BrandCard>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button {...detailBtn.handlers} onClick={() => navigate?.("C4", { outfitVariant, outfitSaved })} style={{
                flex: 1, padding: "12px", borderRadius: 16,
                background: GOLD, border: "none",
                color: ON_GOLD, fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
                position:'relative', overflow:'hidden', flexShrink: 0,
              }}>
                <PressTintOverlay pressed={detailBtn.pressed} tint={NAVY}/>
                상세 보기
              </button>
              <button {...retryBtn.handlers} onClick={() => setOutfitVariant((variant) => variant === "formal" ? "default" : "formal")} style={{
                flex: 1, padding: "12px", borderRadius: 16,
                background: PANEL, border: `1px solid ${INK(0.10)}`,
                color: INK(0.85), fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif",
                position:'relative', overflow:'hidden', flexShrink: 0,
              }}>
                <PressTintOverlay pressed={retryBtn.pressed} tint={GOLD}/>
                <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                  <RefreshSVG size={13} color={MISTLITE(0.85)}/> 셔플
                </span>
              </button>
            </div>

            {/* 내 옷장 링크 */}
            <div onClick={() => navigate?.("C2")} {...wardrobeRow.handlers} style={{
              background: PANEL, borderRadius: 16, position: "relative", overflow: "hidden", flexShrink: 0, cursor:'pointer',
            }}>
              <PressTintOverlay pressed={wardrobeRow.pressed} tint={GOLD}/>
              <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                <HangerSVG size={18} color={MISTLITE(0.85)}/>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ color: INK(0.85), fontSize: 14, fontWeight: 600 }}>내 옷장 관리</div>
                <div style={{ color: INK(0.68), fontSize: 11, marginTop: 1 }}>42벌 등록됨</div>
                </div>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.40)} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
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
            <TabItem key={tab.id} tab={tab} active={tab.id === activeTab} onClick={() => goTab(tab.id)} />
          ))}
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · C1 코디 메인
      </div>
    </div>
  );
}
