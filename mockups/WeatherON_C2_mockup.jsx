import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON C2 · 내 옷장 (목록·수정·삭제) (하이브리드 크롬) ─────────
   와이어프레임 C2 기준: 카테고리 필터 + 3열 그리드
   - 전체/상의/하의/아우터/신발 칩 필터
   - 옷 아이템 3열 그리드(탭 → 수정/삭제 시트 E0b)
   - 우상단 ＋ → C3 옷 등록
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
   아이콘: brand/WeatherON_아이콘_시스템.md 기준(헤더 16px·리스트행 18px)
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#2A5D8F';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let CLEAR     = '#3ABFA0';
let WARM      = '#E8854A';
let MIST      = '#869EBC';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(168,196,224,${a})`;

const outfitAssets = {
  cardigan: new URL("../assets/outfits/weatheron-outfit-cardigan-v1.png", import.meta.url).href,
  tshirt: new URL("../assets/outfits/weatheron-outfit-linen-tshirt-v1.png", import.meta.url).href,
  slacks: new URL("../assets/outfits/weatheron-outfit-slim-slacks-v1.png", import.meta.url).href,
  sneakers: new URL("../assets/outfits/weatheron-outfit-low-sneakers-v1.png", import.meta.url).href,
  trench: new URL("../assets/outfits/weatheron-outfit-trench-coat-v1.png", import.meta.url).href,
  striped: new URL("../assets/outfits/weatheron-outfit-striped-long-sleeve-v1.png", import.meta.url).href,
  boots: new URL("../assets/outfits/weatheron-outfit-chelsea-boots-v1.png", import.meta.url).href,
};


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

/* ── 의류 아이콘 — brand/WeatherON_아이콘_시스템.md 기준(24px/stroke1.8), 카드 안에서는 28px 일러스트 슬롯 ── */
function ShirtSVG({ size = 28, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4L4 7l3 3 2-1.5V20h6V8.5L17 10l3-3-5-3-1.5 1a3 3 0 01-3 0L9 4z"/>
    </svg>
  );
}
function JacketSVG({ size = 28, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4L4 7l3 3 2-1.5V20h6V8.5L17 10l3-3-5-3-1.5 1a3 3 0 01-3 0L9 4z"/>
      <line x1="12" y1="8" x2="12" y2="20"/>
    </svg>
  );
}
function PantsSVG({ size = 28, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l1 9-1 9h-4l-1-10-1 10H7l-1-9z"/>
    </svg>
  );
}
function ShoeSVG({ size = 28, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18c0-2 1-3 3-4l5-2 4-3c1-1 2-1 3 0l3 3c1 1 1 2 1 3v3a1 1 0 01-1 1H4a1 1 0 01-1-1z"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

const categories = ["전체", "상의", "하의", "아우터", "신발", "액세서리"];
const closetItems = [
  { icon: ShirtSVG,  label: "화이트 린넨 티셔츠", cat: "상의", src: outfitAssets.tshirt },
  { icon: ShirtSVG,  label: "스트라이프 셔츠",     cat: "상의", src: outfitAssets.striped },
  { icon: JacketSVG, label: "베이지 가디건",       cat: "아우터", src: outfitAssets.cardigan },
  { icon: PantsSVG,  label: "슬레이트 슬랙스",     cat: "하의", src: outfitAssets.slacks, imageStyle: { width: "72%" } },
  { icon: PantsSVG,  label: "데님 팬츠",           cat: "하의", src: outfitAssets.slacks, imageStyle: { width: "72%", filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.26)) saturate(0.72)" } },
  { icon: JacketSVG, label: "라이트 트렌치",       cat: "아우터", src: outfitAssets.trench },
  { icon: ShoeSVG,   label: "화이트 스니커즈",     cat: "신발", src: outfitAssets.sneakers, imageStyle: { width: "112%" } },
  { icon: ShoeSVG,   label: "첼시 부츠",           cat: "신발", src: outfitAssets.boots, imageStyle: { width: "112%" } },
];

function iconForCategory(cat) {
  if (cat === "아우터") return JacketSVG;
  if (cat === "하의") return PantsSVG;
  if (cat === "신발") return ShoeSVG;
  return ShirtSVG;
}

function GarmentPreview({ item }) {
  return (
    <img
      src={item.src}
      alt={item.label}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.28))",
        ...item.imageStyle,
      }}
    />
  );
}

function ClothCard({ item, onClick }) {
  const { pressed, handlers } = usePressTint();
  const Icon = item.icon;
  return (
    <button type="button" {...handlers} onClick={onClick} aria-label={item.label} style={{
      appearance: "none", border: `1px solid ${INK(0.06)}`, font: "inherit",
      width: "100%", minWidth: 0, aspectRatio: "1 / 1", borderRadius: 16, background: PANEL,
      position: "relative", overflow: "hidden", flexShrink: 0, cursor: "pointer",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: 5,
      padding: 8,
      boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
    }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      <div style={{ width: "100%", height: 62, borderRadius: 12, background: NAVY_DARK, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {item.src ? <GarmentPreview item={item}/> : <Icon size={28} color={MISTLITE(0.85)}/>}
      </div>
      <span style={{ fontSize: 10.6, fontWeight: 800, color: INK(0.82), textAlign: "center", padding: "0 2px", lineHeight: 1.22 }}>{item.label}</span>
    </button>
  );
}

function EmptyWardrobe({ onAdd, onSample }) {
  const add = usePressTint();
  const sample = usePressTint();
  return (
    <div style={{
      gridColumn: "1 / -1",
      minHeight: 430,
      borderRadius: 22,
      background: PANEL,
      border: `1px solid ${INK(0.08)}`,
      padding: "28px 22px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 14,
    }}>
      <div style={{
        width: 74,
        height: 74,
        borderRadius: 24,
        background: NAVY_DARK,
        border: `1px solid ${INK(0.10)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <ShirtSVG size={34} color={MISTLITE(0.86)}/>
      </div>
      <div>
        <div style={{ color: INK(0.94), fontSize: 17, fontWeight: 800, lineHeight: 1.35 }}>아직 등록된 옷이 없어요</div>
        <div style={{ color: MISTLITE(0.72), fontSize: 12.2, lineHeight: 1.55, marginTop: 8 }}>
          옷장을 비워두면 기본 날씨 룰로 추천하고,<br/>첫 옷을 등록하면 실제 보유 아이템으로 맞춰줘요.
        </div>
      </div>
      <button {...add.handlers} onClick={onAdd} style={{
        width: "100%",
        height: 48,
        borderRadius: 16,
        border: "none",
        background: GOLD,
        color: ON_GOLD,
        fontSize: 14,
        fontWeight: 800,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden", flexShrink: 0,
        fontFamily: "'Noto Sans KR',sans-serif",
      }}>
        <PressTintOverlay pressed={add.pressed} tint={NAVY}/>
        첫 옷 등록하기
      </button>
      <button {...sample.handlers} onClick={onSample} style={{
        width: "100%",
        height: 44,
        borderRadius: 15,
        border: `1px solid ${INK(0.10)}`,
        background: NAVY_DARK,
        color: INK(0.78),
        fontSize: 12.5,
        fontWeight: 700,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden", flexShrink: 0,
        fontFamily: "'Noto Sans KR',sans-serif",
      }}>
        <PressTintOverlay pressed={sample.pressed} tint={GOLD}/>
        샘플 옷장 보기
      </button>
    </div>
  );
}

function WardrobeStateCard({ count, filter, empty, accountLinked, onAdd, onRecommend }) {
  const color = accountLinked ? CLEAR : WARM;
  return (
    <div style={{
      gridColumn: "1 / -1",
      borderRadius: 18,
      background: PANEL,
      border: `1px solid ${INK(0.08)}`,
      padding: "12px 14px",
      boxShadow: "0 6px 16px rgba(0,0,0,0.22)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ color, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace" }}>옷장</div>
          <div style={{ color: INK(0.84), fontSize: 12.2, marginTop: 4, lineHeight: 1.45 }}>
            {empty
              ? accountLinked ? "첫 옷 등록 후 실제 보유 아이템 추천으로 전환" : "기본 날씨 룰 추천 유지 · 저장 시 계정 연결"
              : accountLinked ? `${filter} 기준 ${count}개 아이템으로 추천 기준 보정` : "옷장 확인 가능 · 저장 시 계정 연결"}
          </div>
        </div>
        <span style={{
          height: 30,
          borderRadius: 15,
          padding: "0 10px",
          background: NAVY_DARK,
          color: !accountLinked ? WARM : empty ? GOLD : CLEAR,
          fontSize: 11,
          fontWeight: 900,
          display: "inline-flex",
          alignItems: "center",
          fontFamily: "'DM Mono',monospace",
          flexShrink: 0,
        }}>{!accountLinked ? "보기" : empty ? "0/42" : `${count}/42`}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 11 }}>
        <button onClick={onRecommend} style={{
          minHeight: 44,
          borderRadius: 14,
          border: `1px solid ${INK(0.10)}`,
          background: NAVY_DARK,
          color: INK(0.84),
          fontSize: 11.6,
          fontWeight: 900,
          cursor: "pointer",
          fontFamily: "'Noto Sans KR',sans-serif",
        }}>추천으로 복귀</button>
        <button onClick={onAdd} style={{
          minHeight: 44,
          borderRadius: 14,
          border: 0,
          background: GOLD,
          color: ON_GOLD,
          fontSize: 11.6,
          fontWeight: 900,
          cursor: "pointer",
          fontFamily: "'Noto Sans KR',sans-serif",
        }}>옷 추가</button>
      </div>
    </div>
  );
}

function ItemActionSheet({ item, onClose, onEdit, onDelete }) {
  if (!item) return null;
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
      }}>
        <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>
          아이템
        </div>
        <div style={{ color: INK(0.94), fontSize: 15, fontWeight: 900 }}>{item.label}</div>
        <div style={{ color: MISTLITE(0.68), fontSize: 11.8, lineHeight: 1.55, marginTop: 5, marginBottom: 12 }}>
          수정하거나 삭제하면 다음 추천 기준에 바로 반영돼요.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <button onClick={onEdit} style={{
            height: 42,
            borderRadius: 14,
            border: 0,
            background: GOLD,
            color: ON_GOLD,
            fontSize: 12.5,
            fontWeight: 900,
            cursor: "pointer",
            fontFamily: "'Noto Sans KR',sans-serif",
          }}>수정</button>
          <button onClick={onDelete} style={{
            height: 42,
            borderRadius: 14,
            border: `1px solid rgba(232,133,74,0.30)`,
            background: "rgba(232,133,74,0.12)",
            color: "#E8854A",
            fontSize: 12.5,
            fontWeight: 900,
            cursor: "pointer",
            fontFamily: "'Noto Sans KR',sans-serif",
          }}>삭제</button>
          <button onClick={onClose} style={{
            height: 42,
            borderRadius: 14,
            border: `1px solid ${INK(0.10)}`,
            background: PANEL,
            color: INK(0.84),
            fontSize: 12.5,
            fontWeight: 900,
            cursor: "pointer",
            fontFamily: "'Noto Sans KR',sans-serif",
          }}>닫기</button>
        </div>
      </div>
    </>
  );
}

export default function WeatherON_C2({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab] = useState("코디");
  const [filter, setFilter] = useState("전체");
  const [viewMode, setViewMode] = useState("list");
  const [selectedItem, setSelectedItem] = useState(null);
  const [accountLinked, setAccountLinked] = useState(Boolean(routeState.accountLinked));
  const addBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (routeState.accountLinked) setAccountLinked(true);
  }, [routeState.accountLinked]);

  const addedPreset = routeState.addedPreset
    ? { icon: iconForCategory(routeState.addedPreset.cat), ...routeState.addedPreset }
    : null;
  const wardrobeItems = addedPreset ? [addedPreset, ...closetItems] : closetItems;
  const filtered = filter === "전체" ? wardrobeItems : wardrobeItems.filter(i => i.cat === filter);
  const isEmpty = viewMode === "empty";
  const handleAdd = () => navigate?.("C3", { accountLinked, wardrobeMode: "add" });
  const handleEdit = () => navigate?.("C3", { accountLinked, wardrobeMode: "edit", selectedItem });
  const goTab = (tabId) => {
    if (tabId === "홈") navigate?.("H1");
    if (tabId === "코디") navigate?.("C1");
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
        C2 · 내 옷장 · 하이브리드 크롬
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
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => navigate?.("C1")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <BackArrowSVG/>
              </button>
              <span style={{ color: INK(0.94), fontSize: 18, fontWeight: 700 }}>내 옷장</span>
            </div>
            <button {...addBtn.handlers} onClick={handleAdd} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: INK(0.94), fontSize: 18, fontWeight: 700, position:'relative', overflow:'hidden' }}>
              <PressTintOverlay pressed={addBtn.pressed} tint={GOLD}/>
              ＋
            </button>
          </div>

          <div style={{ padding: "14px 20px 0", display: "flex", gap: 7, rowGap: 7, flexWrap: "wrap" }}>
            {categories.map(c => {
              const on = filter === c;
              return (
                <button key={c} onClick={() => setFilter(c)} style={{
                  padding: "7px 14px", borderRadius: 20, whiteSpace: "nowrap",
                  background: on ? GOLD : NAVY_DARK, border: on ? "none" : `1px solid ${INK(0.12)}`,
                  color: on ? NAVY : INK(0.78), fontSize: 12.5, fontWeight: on ? 700 : 600, cursor: "pointer",
                  fontFamily: "'Noto Sans KR',sans-serif",
                }}>{c}</button>
              );
            })}
          </div>

          <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, height: "calc(852px - 154px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 138 }}>
            <WardrobeStateCard
              count={isEmpty ? 0 : filtered.length}
              filter={filter}
              empty={isEmpty}
              accountLinked={accountLinked}
              onAdd={handleAdd}
              onRecommend={() => navigate?.("C1")}
            />
            {viewMode === "empty" ? (
              <EmptyWardrobe onAdd={handleAdd} onSample={() => setViewMode("list")} />
            ) : (
              <>
                {filtered.map((item, i) => <ClothCard key={i} item={item} onClick={() => setSelectedItem(item)}/>)}
                <button onClick={handleAdd} style={{
              width: "100%", minWidth: 0, aspectRatio: "1 / 1", borderRadius: 16, background: "none",
              border: `1.5px dashed ${MISTLITE(0.30)}`, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
              color: MISTLITE(0.66), fontSize: 11, fontWeight: 600,
            }}>
              <span style={{ fontSize: 20, lineHeight: 1 }}>＋</span>
              추가
                </button>
              </>
            )}
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
        <ItemActionSheet
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={handleEdit}
          onDelete={() => {
            setSelectedItem(null);
            setViewMode("empty");
          }}
        />
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · C2 내 옷장
      </div>
    </div>
  );
}
