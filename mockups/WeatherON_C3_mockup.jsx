import { useMemo, useState, useEffect } from "react";
import { getWeatherONTheme } from "./WeatherON_theme_tokens.js";

/* ── WeatherON C3 · 옷장 아이템 추가 (프리셋 우선) ────────────────
   MVP 기준: 직접 촬영보다 프리셋 라이브러리에서 빠르게 옷장을 채우는 흐름을 우선한다.
   직접 사진 등록은 "없는 아이템 추가" 보조 탭으로 유지한다.
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#1D5A86';
let NAVY_DARK = '#276A96';
let PANEL     = '#2B719D';
let GOLD      = '#F4B63F';
let ON_GOLD  = '#123858';
let CLEAR     = '#2FC6A3';
const WARM      = '#E8854A';
let SKY       = '#4AA3DF';
let MIST      = '#E4F2FF';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(228,242,255,${a})`;

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

const outfitAssets = {
  cardigan: new URL("../assets/outfits/weatheron-outfit-cardigan-v1.png", import.meta.url).href,
  tshirt: new URL("../assets/outfits/weatheron-outfit-linen-tshirt-v1.png", import.meta.url).href,
  slacks: new URL("../assets/outfits/weatheron-outfit-slim-slacks-v1.png", import.meta.url).href,
  sneakers: new URL("../assets/outfits/weatheron-outfit-low-sneakers-v1.png", import.meta.url).href,
  trench: new URL("../assets/outfits/weatheron-outfit-trench-coat-v1.png", import.meta.url).href,
  striped: new URL("../assets/outfits/weatheron-outfit-striped-long-sleeve-v1.png", import.meta.url).href,
  boots: new URL("../assets/outfits/weatheron-outfit-chelsea-boots-v1.png", import.meta.url).href,
  knit: new URL("../assets/outfits/weatheron-outfit-knit-sweater-v1.png", import.meta.url).href,
  hoodie: new URL("../assets/outfits/weatheron-outfit-zip-hoodie-v1.png", import.meta.url).href,
  rainJacket: new URL("../assets/outfits/weatheron-outfit-light-rain-jacket-v1.png", import.meta.url).href,
  waterproof: new URL("../assets/outfits/weatheron-outfit-waterproof-sneakers-v1.png", import.meta.url).href,
  denim: new URL("../assets/outfits/weatheron-outfit-wide-denim-v1.png", import.meta.url).href,
  skirt: new URL("../assets/outfits/weatheron-outfit-pleated-skirt-v1.png", import.meta.url).href,
  cap: new URL("../assets/outfits/weatheron-outfit-navy-cap-v1.png", import.meta.url).href,
  umbrella: new URL("../assets/outfits/weatheron-outfit-compact-umbrella-v1.png", import.meta.url).href,
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
function CloseSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
    </svg>
  );
}
function SearchSVG({ size = 15, color = MISTLITE(0.62) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round">
      <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>
    </svg>
  );
}
function CameraSVG({ size = 30, color = MISTLITE(0.55) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

function Chip({ label, active, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <button onClick={onClick} {...handlers} style={{
      minHeight: 38,
      padding: "0 12px",
      borderRadius: 19,
      background: active ? GOLD : NAVY_DARK,
      border: active ? "none" : `1px solid ${INK(0.12)}`,
      color: active ? NAVY : INK(0.80),
      fontSize: 11.6,
      fontWeight: active ? 800 : 700,
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      flexShrink: 0,
      fontFamily: "'Noto Sans KR',sans-serif",
    }}>
      {!active && <PressTintOverlay pressed={pressed} tint={GOLD}/>}
      {label}
    </button>
  );
}

function Segment({ active, onPreset, onPhoto }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 6,
      padding: 4,
      borderRadius: 18,
      background: NAVY_DARK,
      border: `1px solid ${INK(0.08)}`,
    }}>
      {[
        { id: "preset", label: "프리셋 선택", onClick: onPreset },
        { id: "photo", label: "사진으로 등록", onClick: onPhoto },
      ].map((item) => (
        <button key={item.id} onClick={item.onClick} style={{
          height: 38,
          borderRadius: 14,
          border: 0,
          background: active === item.id ? GOLD : "transparent",
          color: active === item.id ? NAVY : INK(0.76),
          fontSize: 12.4,
          fontWeight: 900,
          cursor: "pointer",
          fontFamily: "'Noto Sans KR',sans-serif",
        }}>{item.label}</button>
      ))}
    </div>
  );
}

const catOptions = ["전체", "아우터", "상의", "하의", "신발", "액세서리"];
const seasonTagOptions = ["전체", "봄가을", "여름", "겨울"];
const purposeTagOptions = ["전체", "비", "바람", "출근", "여행"];
const directCatOptions = ["상의", "하의", "아우터", "신발", "액세서리"];
const seasonOptions = ["봄가을", "여름", "겨울"];

const presetItems = [
  { id: "cardigan", label: "베이지 가디건", cat: "아우터", src: outfitAssets.cardigan, tags: ["봄가을", "출근", "바람"], weather: "아침 쌀쌀", imageStyle: { width: "104%" } },
  { id: "trench", label: "라이트 트렌치", cat: "아우터", src: outfitAssets.trench, tags: ["봄가을", "출근", "바람"], weather: "바람 보통" },
  { id: "windbreaker", label: "라이트 바람막이", cat: "아우터", src: outfitAssets.rainJacket, tags: ["비", "바람", "여행"], weather: "가벼운 비" },
  { id: "hoodie", label: "집업 후디", cat: "아우터", src: outfitAssets.hoodie, tags: ["봄가을", "여행"], weather: "일교차" },
  { id: "linen", label: "화이트 린넨 티셔츠", cat: "상의", src: outfitAssets.tshirt, tags: ["여름", "출근", "여행"], weather: "낮 더움" },
  { id: "stripe", label: "스트라이프 셔츠", cat: "상의", src: outfitAssets.striped, tags: ["봄가을", "출근"], weather: "실내 단독" },
  { id: "knit", label: "라이트 니트", cat: "상의", src: outfitAssets.knit, tags: ["겨울", "봄가을"], weather: "쌀쌀함" },
  { id: "tee-cool", label: "쿨링 티셔츠", cat: "상의", src: outfitAssets.tshirt, tags: ["여름", "여행"], weather: "자외선 높음", imageStyle: { filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.28)) saturate(1.08)" } },
  { id: "slacks", label: "슬레이트 슬랙스", cat: "하의", src: outfitAssets.slacks, tags: ["봄가을", "출근"], weather: "바람 약함", imageStyle: { width: "72%" } },
  { id: "denim", label: "와이드 데님", cat: "하의", src: outfitAssets.denim, tags: ["봄가을", "여행"], weather: "활동 많음", imageStyle: { width: "74%" } },
  { id: "skirt", label: "플리츠 스커트", cat: "하의", src: outfitAssets.skirt, tags: ["봄가을", "출근"], weather: "맑음" },
  { id: "warm-slacks", label: "웜 슬랙스", cat: "하의", src: outfitAssets.slacks, tags: ["겨울", "출근"], weather: "아침 추움", imageStyle: { width: "72%", filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.28)) brightness(0.88)" } },
  { id: "sneakers", label: "화이트 스니커즈", cat: "신발", src: outfitAssets.sneakers, tags: ["봄가을", "여름", "여행"], weather: "노면 건조", imageStyle: { width: "112%" } },
  { id: "waterproof", label: "방수 스니커즈", cat: "신발", src: outfitAssets.waterproof, tags: ["비", "여행"], weather: "노면 젖음", imageStyle: { width: "112%" } },
  { id: "boots", label: "첼시 부츠", cat: "신발", src: outfitAssets.boots, tags: ["겨울", "출근"], weather: "바람 강함", imageStyle: { width: "110%" } },
  { id: "low-sneaker-dark", label: "다크 로우 스니커즈", cat: "신발", src: outfitAssets.sneakers, tags: ["봄가을", "출근"], weather: "긴 외출", imageStyle: { width: "112%", filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.28)) saturate(0.2) brightness(0.82)" } },
  { id: "cap", label: "네이비 캡", cat: "액세서리", src: outfitAssets.cap, tags: ["여름", "여행"], weather: "자외선" },
  { id: "umbrella", label: "컴팩트 우산", cat: "액세서리", src: outfitAssets.umbrella, tags: ["비", "출근", "여행"], weather: "오후 비" },
];

function AddStateCard({ mode, selected, saved, accountLinked }) {
  const ready = mode === "preset" ? Boolean(selected) : true;
  const color = saved ? CLEAR : !accountLinked ? WARM : ready ? GOLD : MIST;
  const labelColor = saved || accountLinked ? color : INK(0.78);
  return (
    <div style={{
      borderRadius: 16,
      background: PANEL,
      border: `1px solid ${INK(0.08)}`,
      padding: "12px 14px",
      boxShadow: "0 6px 16px rgba(0,0,0,0.22)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ color: labelColor, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace" }}>옷장 추가</div>
          <div style={{ color: INK(0.84), fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
            {saved ? "옷장에 추가됨. 다음 코디 추천부터 반영됨" : mode === "preset" ? `${selected?.label || "프리셋"} 선택됨` : "없는 아이템만 사진으로 직접 등록"}
          </div>
        </div>
        <span style={{
          height: 30,
          borderRadius: 15,
          padding: "0 10px",
          background: NAVY_DARK,
          color: labelColor,
          fontSize: 11,
          fontWeight: 900,
          display: "inline-flex",
          alignItems: "center",
          fontFamily: "'DM Mono',monospace",
          flexShrink: 0,
        }}>{saved ? "추가됨" : "준비"}</span>
      </div>
    </div>
  );
}

function PresetCard({ item, selected, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <button onClick={onClick} {...handlers} style={{
      width: "100%",
      minWidth: 0,
      height: 112,
      borderRadius: 15,
      border: selected ? `1.5px solid ${GOLD}` : `1px solid ${INK(0.08)}`,
      background: selected ? "rgba(240,160,32,0.14)" : PANEL,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "space-between",
      padding: 7,
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      flexShrink: 0,
      fontFamily: "'Noto Sans KR',sans-serif",
    }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      <div style={{
        height: 62,
        borderRadius: 12,
        background: weatheronImageWellBg(),
        border: `1px solid ${INK(0.07)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
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
      </div>
      <div style={{ textAlign: "left" }}>
        <div style={{ color: INK(0.90), fontSize: 11, fontWeight: 900, lineHeight: 1.18, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</div>
        <div style={{ color: selected ? INK(0.94) : INK(0.76), fontSize: 10.2, fontWeight: 800, marginTop: 1 }}>{item.cat} · {item.weather}</div>
      </div>
    </button>
  );
}

function weatheronImageWellBg() {
  return "linear-gradient(180deg, rgba(248,251,255,0.96), rgba(231,239,248,0.88))";
}

function SelectedPreview({ item }) {
  if (!item) return null;
  return (
    <div style={{
      borderRadius: 18,
      background: NAVY_DARK,
      border: `1px solid rgba(240,160,32,0.24)`,
      padding: 9,
      display: "flex",
      gap: 10,
      alignItems: "center",
      flexShrink: 0,
    }}>
      <div style={{
        width: 50,
        height: 50,
        borderRadius: 15,
        background: weatheronImageWellBg(),
        border: `1px solid ${INK(0.08)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        <img src={item.src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", ...item.imageStyle }}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: GOLD, fontSize: 10.2, fontWeight: 900, letterSpacing: "0.08em", fontFamily: "'DM Mono',monospace" }}>선택됨</div>
        <div style={{ color: INK(0.94), fontSize: 13.2, fontWeight: 900, marginTop: 1 }}>{item.label}</div>
        <div style={{ color: INK(0.68), fontSize: 10.5, lineHeight: 1.3, marginTop: 1 }}>
          {item.tags.slice(0, 3).join(" · ")} · {item.weather}
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children, withDivider = false }) {
  return (
    <div style={{ flexShrink: 0 }}>
      {withDivider && (
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(232,237,246,0.18), transparent)",
          margin: "1px 0 8px",
        }}/>
      )}
      <div style={{
        display: "grid",
        gridTemplateColumns: "44px 1fr",
        alignItems: "start",
        gap: 8,
      }}>
        <div style={{
          color: INK(0.68),
          fontSize: 10.7,
          fontWeight: 900,
          lineHeight: "34px",
          whiteSpace: "nowrap",
        }}>
          {title}
        </div>
        <div style={{ display: "flex", gap: 6, rowGap: 6, flexWrap: "wrap" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function DirectPhotoForm({ category, setCategory, season, setSeason, name, setName, photoSelected, setPhotoSelected }) {
  const photoArea = usePressTint();
  return (
    <>
      <div {...photoArea.handlers} onClick={() => setPhotoSelected(true)} style={{
        height: 150,
        borderRadius: 22,
        background: PANEL,
        border: `1.5px dashed ${photoSelected ? "rgba(240,160,32,0.42)" : INK(0.18)}`,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        cursor: "pointer",
      }}>
        <PressTintOverlay pressed={photoArea.pressed} tint={GOLD}/>
        {photoSelected ? (
          <>
            <img src={outfitAssets.cardigan} alt="선택한 옷 사진" style={{ height: 82, width: "78%", objectFit: "contain", filter: "drop-shadow(0 14px 14px rgba(0,0,0,0.34))" }}/>
            <span style={{ color: GOLD, fontSize: 12.5, fontWeight: 800 }}>사진 선택 완료</span>
          </>
        ) : (
          <>
            <CameraSVG/>
            <span style={{ color: MISTLITE(0.72), fontSize: 12.4, fontWeight: 800 }}>사진 촬영 / 앨범 선택</span>
            <span style={{ color: MISTLITE(0.64), fontSize: 10.8 }}>프리셋에 없는 옷만 직접 등록</span>
          </>
        )}
      </div>

      <div>
        <div style={{ color: MIST, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 9, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>카테고리</div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {directCatOptions.map(c => <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)}/>)}
        </div>
      </div>

      <div style={{ background: PANEL, borderRadius: 16, padding: "12px 14px", flexShrink: 0 }}>
        <span style={{ color: MISTLITE(0.66), fontSize: 11, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700 }}>이름 (선택)</span>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="예: 베이지 가디건"
          style={{ width: "100%", marginTop: 6, background: "none", border: "none", outline: "none", color: INK(0.94), fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }} />
      </div>

      <div>
        <span style={{ color: MIST, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", display: "block", marginBottom: 9, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>계절 태그</span>
        <div style={{ display: "flex", gap: 7 }}>
          {seasonOptions.map(s => <Chip key={s} label={s} active={season === s} onClick={() => setSeason(s)}/>)}
        </div>
      </div>
    </>
  );
}

export default function WeatherON_C3({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState.themeMode);
  const [mode, setMode] = useState(routeState.mode || "preset");
  const [category, setCategory] = useState(routeState.category || routeState.selectedItem?.cat || "전체");
  const [seasonTag, setSeasonTag] = useState(routeState.seasonTag || (seasonTagOptions.includes(routeState.tag) ? routeState.tag : "전체"));
  const [purposeTag, setPurposeTag] = useState(routeState.purposeTag || (purposeTagOptions.includes(routeState.tag) ? routeState.tag : "전체"));
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState(routeState.season || "여름");
  const [directCategory, setDirectCategory] = useState(routeState.selectedItem?.cat || "상의");
  const [name, setName] = useState(routeState.name || routeState.selectedItem?.label || "");
  const [photoSelected, setPhotoSelected] = useState(Boolean(routeState.photoSelected || routeState.selectedItem));
  const [selectedId, setSelectedId] = useState(routeState.presetId || "cardigan");
  const [saved, setSaved] = useState(Boolean(routeState.saved || (routeState.resumeSave && routeState.pendingAction === "옷장 저장")));
  const [accountLinked, setAccountLinked] = useState(Boolean(routeState.accountLinked));
  const [showAllPresets, setShowAllPresets] = useState(false);
  const saveBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.innerHTML = "#weatheron-c3-scroll::-webkit-scrollbar{display:none;}";
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    if (routeState.accountLinked) setAccountLinked(true);
    if (routeState.category) setCategory(routeState.category);
    if (routeState.selectedItem?.cat) setDirectCategory(routeState.selectedItem.cat);
    if (routeState.selectedItem?.label) setName(routeState.selectedItem.label);
    if (routeState.photoSelected || routeState.selectedItem) setPhotoSelected(true);
    if (routeState.presetId) setSelectedId(routeState.presetId);
    if (routeState.saved || (routeState.resumeSave && routeState.pendingAction === "옷장 저장")) {
      setAccountLinked(true);
      setSaved(true);
    }
  }, [
    routeState.accountLinked,
    routeState.category,
    routeState.selectedItem,
    routeState.photoSelected,
    routeState.presetId,
    routeState.saved,
    routeState.resumeSave,
    routeState.pendingAction,
  ]);

  const filteredPresets = useMemo(() => {
    const q = query.trim();
    return presetItems.filter((item) => {
      const categoryOk = category === "전체" || item.cat === category;
      const seasonOk = seasonTag === "전체" || item.tags.includes(seasonTag);
      const purposeOk = purposeTag === "전체" || item.tags.includes(purposeTag);
      const queryOk = !q || item.label.includes(q) || item.cat.includes(q) || item.tags.some((itemTag) => itemTag.includes(q));
      return categoryOk && seasonOk && purposeOk && queryOk;
    });
  }, [category, seasonTag, purposeTag, query]);

  useEffect(() => {
    setShowAllPresets(false);
  }, [category, seasonTag, purposeTag, query]);

  const selectedPreset = presetItems.find((item) => item.id === selectedId) || filteredPresets[0] || presetItems[0];
  const visiblePresets = showAllPresets ? filteredPresets : filteredPresets.slice(0, 9);
  const selectedForSave = mode === "preset"
    ? selectedPreset
    : {
        id: "direct-photo",
        label: name || "직접 등록 아이템",
        cat: directCategory,
        src: outfitAssets.cardigan,
        tags: [season],
        weather: "직접 등록",
      };

  const saveToWardrobe = () => {
    if (saved) {
      navigate?.("C2", { addedPreset: selectedForSave, accountLinked });
      return;
    }
    if (mode === "photo" && !photoSelected) return;
    if (!accountLinked) {
      navigate?.("A2", {
        pendingAction: "옷장 저장",
        returnTo: "C3",
        resumeSave: true,
        mode,
        presetId: selectedPreset.id,
        category,
        seasonTag,
        purposeTag,
        photoSelected,
        name,
        season,
      });
      return;
    }
    setSaved(true);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        C3 · 아이템 추가 · 하이브리드 크롬
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
            <button onClick={() => navigate?.("C2")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <CloseSVG/>
            </button>
            <span style={{ color: INK(0.94), fontSize: 16, fontWeight: 800 }}>아이템 추가</span>
            <div style={{ width: 40 }}/>
          </div>

          <div id="weatheron-c3-scroll" style={{ padding: "12px 20px 0", display: "flex", flexDirection: "column", gap: 8, height: "calc(852px - 210px)", overflowY: "auto", paddingBottom: 156, scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <AddStateCard mode={mode} selected={selectedForSave} saved={saved} accountLinked={accountLinked}/>

            <Segment
              active={mode}
              onPreset={() => setMode("preset")}
              onPhoto={() => setMode("photo")}
            />

            {mode === "preset" ? (
              <>
                <div style={{
                  height: 40,
                  borderRadius: 15,
                  background: PANEL,
                  border: `1px solid ${INK(0.08)}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "0 13px",
                  flexShrink: 0,
                }}>
                  <SearchSVG/>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="아이템, 날씨, 목적 검색"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "transparent",
                      border: 0,
                      outline: 0,
                      color: INK(0.94),
                      fontSize: 12.8,
                      fontFamily: "'Noto Sans KR',sans-serif",
                    }}
                  />
                </div>

                <div style={{
                  borderRadius: 18,
                  background: NAVY_DARK,
                  border: `1px solid ${INK(0.08)}`,
                  padding: "9px 11px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  flexShrink: 0,
                }}>
                  <FilterSection title="아이템">
                  {catOptions.map(c => <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)}/>)}
                  </FilterSection>
                  <FilterSection title="계절" withDivider>
                    {seasonTagOptions.map(t => <Chip key={t} label={t} active={seasonTag === t} onClick={() => setSeasonTag(t)}/>)}
                  </FilterSection>
                  <FilterSection title="목적" withDivider>
                    {purposeTagOptions.map(t => <Chip key={t} label={t} active={purposeTag === t} onClick={() => setPurposeTag(t)}/>)}
                  </FilterSection>
                </div>

                <SelectedPreview item={selectedPreset}/>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ color: INK(0.82), fontSize: 12, fontWeight: 900 }}>
                    프리셋 {filteredPresets.length}개
                  </div>
                  {filteredPresets.length > 9 && (
                    <button onClick={() => setShowAllPresets((value) => !value)} style={{
                      height: 32,
                      borderRadius: 16,
                      border: `1px solid ${INK(0.10)}`,
                      background: NAVY_DARK,
                      color: INK(0.90),
                      fontSize: 11.4,
                      fontWeight: 900,
                      padding: "0 11px",
                      cursor: "pointer",
                      fontFamily: "'Noto Sans KR',sans-serif",
                    }}>
                      {showAllPresets ? "접기" : "더 보기"}
                    </button>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, paddingBottom: 8 }}>
                  {visiblePresets.map((item) => (
                    <PresetCard key={item.id} item={item} selected={item.id === selectedPreset.id} onClick={() => setSelectedId(item.id)}/>
                  ))}
                </div>

                {filteredPresets.length === 0 && (
                  <div style={{
                    borderRadius: 18,
                    background: PANEL,
                    border: `1px solid ${INK(0.08)}`,
                    padding: "26px 18px",
                    textAlign: "center",
                    color: MISTLITE(0.72),
                    fontSize: 12.4,
                    lineHeight: 1.5,
                  }}>
                    검색 결과가 없음. 필터를 줄이거나 직접 등록을 사용.
                  </div>
                )}
              </>
            ) : (
              <DirectPhotoForm
                category={directCategory}
                setCategory={setDirectCategory}
                season={season}
                setSeason={setSeason}
                name={name}
                setName={setName}
                photoSelected={photoSelected}
                setPhotoSelected={setPhotoSelected}
              />
            )}

            {saved && (
              <div style={{
                borderRadius: 16,
                background: "rgba(240,160,32,0.14)",
                border: "1px solid rgba(240,160,32,0.28)",
                padding: "13px 14px",
                flexShrink: 0,
              }}>
                <div style={{ color: GOLD, fontSize: 12.5, fontWeight: 900 }}>옷장에 추가됨</div>
                <div style={{ color: INK(0.72), fontSize: 11.5, lineHeight: 1.5, marginTop: 5 }}>
                  저장된 아이템은 다음 코디 추천부터 날씨·스타일 기준에 반영됨.
                </div>
              </div>
            )}
          </div>

          <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, zIndex: 20 }}>
            <button {...saveBtn.handlers} onClick={saveToWardrobe} disabled={mode === "photo" && !saved && !photoSelected} style={{
              width: "100%",
              height: 52,
              borderRadius: 18,
              background: mode === "photo" && !saved && !photoSelected ? "rgba(134,158,188,0.26)" : GOLD,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: mode === "photo" && !saved && !photoSelected ? "default" : "pointer",
              position: "relative",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: mode === "photo" && !saved && !photoSelected ? "none" : "0 6px 16px rgba(0,0,0,0.30)",
            }}>
              <PressTintOverlay pressed={saveBtn.pressed} tint={NAVY}/>
              <span style={{ fontSize: 15, fontWeight: 800, color: mode === "photo" && !saved && !photoSelected ? MISTLITE(0.68) : NAVY, fontFamily: "'Noto Sans KR',sans-serif" }}>
                {saved ? "옷장으로 돌아가기" : mode === "photo" && !photoSelected ? "사진을 먼저 선택" : "내 옷장에 추가"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · C3 아이템 추가
      </div>
    </div>
  );
}
