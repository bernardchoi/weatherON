import { useState, useEffect } from "react";
import { getWeatherONTheme } from "./WeatherON_theme_tokens.js";

/* ── WeatherON C4 · 코디 상세 · 대화형 재추천 (하이브리드 크롬) ────────
   와이어프레임 C4 기준: 코디 전체 뷰 + 상의/하의/아우터 분해 + 채팅형 재추천
   - 실제 의류 PNG 조합을 먼저 보여주고, 역할/날씨 근거/시간대 판단을 보조로 제공
   - 메시지 인풋으로 "좀 더 포멀하게 바꿔줘" 같은 재추천 요청 → AI 응답
   - 코디 저장 / 공유
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#1D5A86';
let NAVY_DARK = '#276A96';
let PANEL     = '#2B719D';
let PANEL_L1  = '#3D87B5';
let GOLD      = '#F4B63F';
let ON_GOLD  = '#123858';
let SKY       = '#4AA3DF';
let CLEAR     = '#2FC6A3';
let MIST      = '#E4F2FF';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(228,242,255,${a})`;

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
function BackArrowSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ShareSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={18} cy={5} r={3} /><circle cx={6} cy={12} r={3} /><circle cx={18} cy={19} r={3} />
      <line x1={8.59} y1={13.51} x2={15.42} y2={17.49} /><line x1={15.41} y1={6.51} x2={8.59} y2={10.49} />
    </svg>
  );
}
function SendSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
function LoginGateSheet({ onClose, onConnect }) {
  const connectBtn = usePressTint();
  const laterBtn = usePressTint();
  return (
    <>
    <div onClick={onClose} style={{
      position: "absolute",
      inset: 0,
      zIndex: 29,
      background: "rgba(3,8,16,0.34)",
      backdropFilter: "blur(2px)",
    }}/>
    <div style={{
      position: "absolute",
      left: 18,
      right: 18,
      bottom: 104,
      zIndex: 30,
      borderRadius: 22,
      background: NAVY_DARK,
      border: `1px solid ${INK(0.12)}`,
      boxShadow: "0 18px 40px rgba(0,0,0,0.46)",
      padding: 16,
      overflow: "hidden",
    }}>
      <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>
        SAVE 코디
      </div>
      <div style={{ color: INK(0.94), fontSize: 15, fontWeight: 900, marginBottom: 5 }}>저장하려면 로그인이 필요해요</div>
      <div style={{ color: MISTLITE(0.68), fontSize: 11.8, lineHeight: 1.55, marginBottom: 12 }}>
        코디 저장, 히스토리, 다기기 동기화는 계정 연결 후 사용할 수 있어요.
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button {...connectBtn.handlers} onClick={onConnect} style={{
          flex: 1,
          height: 42,
          borderRadius: 14,
          background: GOLD,
          border: "none",
          color: ON_GOLD,
          fontSize: 13,
          fontWeight: 800,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden", flexShrink: 0,
          fontFamily: "'Noto Sans KR',sans-serif",
        }}>
          <PressTintOverlay pressed={connectBtn.pressed} tint={NAVY}/>
          계정 연결
        </button>
        <button {...laterBtn.handlers} onClick={onClose} style={{
          flex: 1,
          height: 42,
          borderRadius: 14,
          background: PANEL,
          border: `1px solid ${INK(0.10)}`,
          color: INK(0.84),
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden", flexShrink: 0,
          fontFamily: "'Noto Sans KR',sans-serif",
        }}>
          <PressTintOverlay pressed={laterBtn.pressed} tint={GOLD}/>
          나중에
        </button>
      </div>
    </div>
    </>
  );
}

function GarmentPreview({ item, large = false }) {
  return (
    <img
      src={item.src}
      alt={item.name}
      style={{
        width: large ? "92%" : "100%",
        height: "100%",
        objectFit: "contain",
        filter: "drop-shadow(0 12px 12px rgba(0,0,0,0.34))",
      }}
    />
  );
}

function OutfitHero({ outfit }) {
  const [outer, top, bottom, shoes] = outfit.items;
  return (
    <BrandCard accent={CLEAR} style={{ padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ color: INK(0.78), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace" }}>코디</div>
          <div style={{ color: INK(0.94), fontSize: 16, fontWeight: 900, lineHeight: 1.25, marginTop: 3 }}>{outfit.title}</div>
        </div>
        <div style={{
          height: 30,
          borderRadius: 15,
          padding: "0 10px",
          background: NAVY_DARK,
          color: CLEAR,
          fontSize: 11,
          fontWeight: 900,
          display: "inline-flex",
          alignItems: "center",
          fontFamily: "'DM Mono',monospace",
        }}>{outfit.match}</div>
      </div>

      <div style={{
        borderRadius: 20,
        background: PANEL_L1,
        border: `1px solid ${INK(0.10)}`,
        overflow: "hidden", flexShrink: 0,
        padding: 10,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridAutoRows: 92,
          gap: 8,
        }}>
          {[outer, top, bottom, shoes].map((item) => (
            <div key={item.type} style={{
              minWidth: 0,
              minHeight: 0,
              borderRadius: 16,
              background: NAVY_DARK,
              border: `1px solid ${INK(0.08)}`,
              padding: item.type === "하의" ? 4 : 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}>
              <GarmentPreview item={item} large={item.type === "아우터" || item.type === "상의"}/>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 8 }}>
        {outfit.timeline.map((time) => (
          <div key={time.label} style={{
            borderRadius: 13,
            background: NAVY_DARK,
            border: `1px solid ${INK(0.07)}`,
            padding: "6px 6px",
            textAlign: "center",
            minWidth: 0,
          }}>
          <div style={{ color: INK(0.74), fontSize: 10, fontWeight: 900, fontFamily: "'DM Mono',monospace" }}>{time.label}</div>
            <div style={{ color: INK(0.86), fontSize: 10.2, fontWeight: 800, lineHeight: 1.25, marginTop: 3 }}>{time.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 8 }}>
        {outfit.items.map((item) => (
          <div key={item.type} style={{
            borderRadius: 14,
            background: NAVY_DARK,
            border: `1px solid ${INK(0.07)}`,
            padding: "8px 10px",
            minWidth: 0,
          }}>
            <div style={{ color: INK(0.72), fontSize: 10.2, fontWeight: 900, letterSpacing: "0.08em", fontFamily: "'Noto Sans KR',sans-serif" }}>{item.type}</div>
            <div style={{ color: INK(0.90), fontSize: 11.4, fontWeight: 900, lineHeight: 1.25, marginTop: 3 }}>{item.name}</div>
            <div style={{ color: INK(0.68), fontSize: 10.2, lineHeight: 1.3, marginTop: 2 }}>{item.reason}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {outfit.chips.map((chip, index) => (
          <span key={chip} style={{
            borderRadius: 13,
            background: PANEL_L1,
            border: `1px solid ${index === 0 ? CLEAR : INK(0.08)}`,
            color: INK(0.78),
            padding: "5px 8px",
            fontSize: 10.4,
            fontWeight: 800,
          }}>{chip}</span>
        ))}
      </div>
    </BrandCard>
  );
}

function DetailStateCard({ changed, shared, saved, onBack, onSave }) {
  const states = [
    { label: "재추천", value: changed ? "반영됨" : "기본", color: changed ? CLEAR : INK(0.72) },
    { label: "저장", value: saved ? "저장 완료" : "저장 전", color: saved ? CLEAR : GOLD, action: saved ? undefined : onSave },
    { label: "공유", value: shared ? "준비됨" : "대기", color: shared ? CLEAR : INK(0.72) },
  ];
  return (
    <BrandCard style={{ borderRadius: 16, padding: "12px 13px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 9 }}>
        <div>
          <div style={{ color: INK(0.72), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.09em", fontFamily: "'DM Mono',monospace" }}>상세</div>
          <div style={{ color: INK(0.74), fontSize: 11.2, marginTop: 3 }}>{saved ? "저장 완료. 코디 탭에서도 이어서 볼 수 있어요" : "변경한 코디는 코디 탭에 바로 반영돼요"}</div>
        </div>
        <button onClick={onBack} style={{
          height: 30,
          borderRadius: 15,
          border: `1px solid ${INK(0.10)}`,
          background: NAVY_DARK,
          color: INK(0.84),
          fontSize: 10.8,
          fontWeight: 900,
          cursor: "pointer",
          fontFamily: "'Noto Sans KR',sans-serif",
          padding: "0 10px",
          flexShrink: 0,
        }}>C1 복귀</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {states.map((state) => (
          <button key={state.label} onClick={state.action} style={{
            minHeight: 40,
            borderRadius: 13,
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
            <span style={{ color: INK(0.70), fontSize: 10.2, fontWeight: 800 }}>{state.label}</span>
            <span style={{ color: state.color, fontSize: 10.8, fontWeight: 900 }}>{state.value}</span>
          </button>
        ))}
      </div>
    </BrandCard>
  );
}

function ReRecommendCard({ changed, onQuickChange }) {
  const quickBtn = usePressTint();
  return (
    <BrandCard style={{ borderRadius: 16, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: INK(0.74), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.09em", fontFamily: "'DM Mono',monospace" }}>추천</div>
          <div style={{ color: INK(0.90), fontSize: 12.5, fontWeight: 900, marginTop: 4 }}>
            {changed ? "포멀 요청 반영됨" : "더 포멀한 조합으로 바꿀 수 있음"}
          </div>
          <div style={{ color: INK(0.74), fontSize: 10.8, lineHeight: 1.45, marginTop: 3 }}>
            대화형 추천은 필요할 때만 열어 쓰는 보조 액션으로 둠.
          </div>
        </div>
        <button {...quickBtn.handlers} onClick={onQuickChange} style={{
          minWidth: 92,
          height: 40,
          borderRadius: 14,
          border: "none",
          background: changed ? "rgba(47,198,163,0.16)" : GOLD,
          color: changed ? CLEAR : NAVY,
          fontSize: 11.8,
          fontWeight: 900,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Noto Sans KR',sans-serif",
        }}>
          <PressTintOverlay pressed={quickBtn.pressed} tint={changed ? CLEAR : NAVY}/>
          {changed ? "반영 완료" : "포멀하게"}
        </button>
      </div>
    </BrandCard>
  );
}

const initialOutfit = {
  title: "아침엔 가디건, 낮엔 린넨 티셔츠",
  match: "92%",
  chips: ["15°→26°", "비 없음", "출근·외출", "추위 민감 +1"],
  timeline: [
    { label: "08:00", value: "가디건 착용", color: CLEAR },
    { label: "14:00", value: "티셔츠 단독", color: GOLD },
    { label: "18:00", value: "그대로 유지", color: SKY },
  ],
  outer: "베이지 오버핏 가디건",
  top: "화이트 린넨 티셔츠",
  bottom: "슬레이트 슬림 슬랙스",
  shoes: "화이트 로우 스니커즈",
  items: [
    { type: "아우터", name: "베이지 오버핏 가디건", reason: "아침 15° 레이어", src: outfitAssets.cardigan, color: CLEAR },
    { type: "상의", name: "화이트 린넨 티셔츠", reason: "낮 26° 통기성", src: outfitAssets.tshirt, color: SKY },
    { type: "하의", name: "슬레이트 슬림 슬랙스", reason: "바람 약함", src: outfitAssets.slacks, color: GOLD },
    { type: "신발", name: "화이트 로우 스니커즈", reason: "노면 건조", src: outfitAssets.sneakers, color: CLEAR },
  ],
};
const formalOutfit = {
  title: "미팅용 트렌치 레이어드로 변경",
  match: "88%",
  chips: ["16°→24°", "바람 보통", "포멀 요청", "우산 불필요"],
  timeline: [
    { label: "08:00", value: "트렌치 착용", color: GOLD },
    { label: "13:00", value: "실내 단독", color: SKY },
    { label: "19:00", value: "부츠 유지", color: CLEAR },
  ],
  outer: "라이트 트렌치 코트",
  top: "스트라이프 롱슬리브",
  bottom: "슬레이트 슬림 슬랙스",
  shoes: "첼시 부츠",
  items: [
    { type: "아우터", name: "라이트 트렌치 코트", reason: "바람 보완", src: outfitAssets.trench, color: GOLD },
    { type: "상의", name: "스트라이프 롱슬리브", reason: "실내 단독 착용", src: outfitAssets.striped, color: SKY },
    { type: "하의", name: "슬레이트 슬림 슬랙스", reason: "포멀 톤 유지", src: outfitAssets.slacks, color: CLEAR },
    { type: "신발", name: "첼시 부츠", reason: "미팅 무드", src: outfitAssets.boots, color: GOLD },
  ],
};

export default function WeatherON_C4({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState.themeMode);
  const isLight = weatherTheme.mode === "light";
  const [activeTab] = useState("코디");
  const [outfit, setOutfit] = useState(routeState.outfitVariant === "formal" ? formalOutfit : initialOutfit);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [changed, setChanged] = useState(routeState.outfitVariant === "formal");
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(Boolean(routeState.outfitSaved || (routeState.resumeSave && routeState.pendingAction === "코디 저장")));
  const [messages, setMessages] = useState([
    { from: "ai", text: "아침 15도에는 가디건, 낮에는 린넨 티셔츠 단독 착용 추천." },
  ]);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const saveBtn = usePressTint();
  const shareBtn = usePressTint();
  const sendBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (routeState.outfitVariant === "formal") {
      setOutfit(formalOutfit);
      setChanged(true);
    }
    if (routeState.outfitSaved || (routeState.resumeSave && routeState.pendingAction === "코디 저장")) {
      setSaved(true);
      setAuthGateOpen(false);
    }
  }, [routeState.outfitVariant, routeState.outfitSaved, routeState.resumeSave, routeState.pendingAction]);

  const handleSend = () => {
    if (!draft.trim()) return;
    setMessages(prev => [...prev, { from: "user", text: draft }, { from: "ai", text: "코디를 다시 구성했어요. 위 미리보기를 확인해주세요." }]);
    setOutfit(formalOutfit);
    setChanged(true);
    setDraft("");
  };
  const applyFormal = () => {
    setOutfit(formalOutfit);
    setChanged(true);
    setChatOpen(false);
  };
  const goTab = (tabId) => {
    if (tabId === "홈") navigate?.("H1", { outfitSaved: saved, outfitVariant: changed ? "formal" : "default" });
    if (tabId === "코디") navigate?.("C1", { outfitSaved: saved, outfitVariant: changed ? "formal" : "default" });
    if (tabId === "출발") navigate?.("G1");
    if (tabId === "MY") navigate?.("M1");
    if (tabId === "소셜") navigate?.("S0");
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        C4 · 코디 상세 · 대화형 재추천 · 하이브리드 크롬
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0" }}>
            <button onClick={() => navigate?.("C1", { outfitSaved: saved, outfitVariant: changed ? "formal" : "default" })} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.94), fontSize: 17, fontWeight: 700 }}>코디 상세</span>
            <button {...shareBtn.handlers} onClick={() => setShared(true)} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position:'relative', overflow:'hidden' }}>
              <PressTintOverlay pressed={shareBtn.pressed} tint={GOLD}/>
              <ShareSVG/>
            </button>
          </div>

          <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 300px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 120 }}>

            <OutfitHero outfit={outfit}/>

            <DetailStateCard
              changed={changed}
              shared={shared}
              saved={saved}
              onBack={() => navigate?.("C1", { outfitSaved: saved, outfitVariant: changed ? "formal" : "default" })}
              onSave={() => setAuthGateOpen(true)}
            />

            <ReRecommendCard changed={changed} onQuickChange={applyFormal}/>

            {saved && (
              <BrandCard accent={CLEAR} style={{ borderRadius: 16, padding: "12px 14px" }}>
                <div style={{ color: CLEAR, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace" }}>저장됨</div>
                <div style={{ color: INK(0.84), fontSize: 12, lineHeight: 1.5, marginTop: 5 }}>
                  코디 저장 완료. C1으로 돌아가도 저장 완료 상태가 유지됨.
                </div>
              </BrandCard>
            )}

            <BrandCard style={{ borderRadius: 16, padding: chatOpen ? "12px 14px" : "10px 14px" }}>
              <button onClick={() => setChatOpen((open) => !open)} style={{
                width: "100%",
                minHeight: 40,
                border: 0,
                background: "transparent",
                color: INK(0.88),
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 0,
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 900,
                fontFamily: "'Noto Sans KR',sans-serif",
              }}>
                대화형 재추천
                <span style={{ color: INK(0.74), fontSize: 11 }}>{chatOpen ? "닫기" : "열기"}</span>
              </button>
              {chatOpen && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                    {messages.slice(-2).map((m, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth: "82%", padding: "9px 13px", borderRadius: 14,
                          background: m.from === "user" ? GOLD : NAVY_DARK,
                          color: m.from === "user" ? NAVY : INK(0.88),
                          fontSize: 12, lineHeight: 1.45,
                        }}>{m.text}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
                    <div style={{ flex: 1, background: NAVY_DARK, borderRadius: 14, padding: "10px 12px" }}>
                      <input value={draft} onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSend()}
                        placeholder="예: 더 포멀하게"
                        style={{ width: "100%", background: "none", border: "none", outline: "none", color: INK(0.94), fontSize: 12.5, fontFamily: "'Noto Sans KR', sans-serif" }} />
                    </div>
                    <button {...sendBtn.handlers} onClick={handleSend} aria-label="메시지 보내기" style={{
                      width: 42, height: 42, borderRadius: 14, background: GOLD, border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
                    }}>
                      <PressTintOverlay pressed={sendBtn.pressed} tint={NAVY}/>
                      <SendSVG/>
                    </button>
                  </div>
                </>
              )}
            </BrandCard>
          </div>

          <div style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 82,
            padding: "16px 20px 10px",
            display: "flex",
            gap: 8,
            zIndex: 22,
            background: isLight
              ? "linear-gradient(180deg, rgba(245,249,252,0), rgba(245,249,252,0.94) 34%, rgba(215,234,247,1) 100%)"
              : "linear-gradient(180deg, rgba(43,119,168,0), rgba(43,119,168,0.96) 38%, rgba(43,119,168,1) 100%)",
          }}>
            <button {...saveBtn.handlers} onClick={() => saved ? navigate?.("C1", { outfitSaved: true, outfitVariant: changed ? "formal" : "default" }) : setAuthGateOpen(true)} style={{
              flex: 1, height: 48, borderRadius: 16, background: GOLD, border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
              boxShadow: "0 6px 16px rgba(0,0,0,0.30)",
            }}>
              <PressTintOverlay pressed={saveBtn.pressed} tint={NAVY}/>
              <span style={{ fontSize: 14, fontWeight: 700, color: ON_GOLD, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{saved ? "C1에서 확인" : "코디 저장"}</span>
            </button>
            <button style={{
              flex: 1, height: 48, borderRadius: 16, background: PANEL, border: `1px solid ${INK(0.10)}`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              cursor: "pointer", color: shared ? CLEAR : INK(0.85), fontSize: 13, fontWeight: 600, fontFamily: "'Noto Sans KR', sans-serif",
            }} onClick={() => setShared(true)}>
              <ShareSVG/> {shared ? "공유 준비됨" : "공유"}
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
            <TabItem key={tab.id} tab={tab} active={tab.id === activeTab} onClick={() => goTab(tab.id)} />
          ))}
        </div>
        {authGateOpen && (
          <LoginGateSheet
            onClose={() => setAuthGateOpen(false)}
            onConnect={() => navigate?.("A2", {
              pendingAction: "코디 저장",
              returnTo: "C4",
              resumeSave: true,
              outfitSaved: true,
              outfitVariant: changed ? "formal" : "default",
            })}
          />
        )}
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · C4 코디 상세 · 대화형 재추천
      </div>
    </div>
  );
}
