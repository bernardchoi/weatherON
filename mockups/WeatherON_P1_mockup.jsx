import { useState, useEffect } from "react";
import { DestinationIcon } from "./WeatherON_destination_icons.jsx";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

const placeImages = {
  baseball: new URL("../assets/place-categories/weatheron-place-baseball-v1.png", import.meta.url).href,
  mountain: new URL("../assets/place-categories/weatheron-place-mountain-v1.png", import.meta.url).href,
  beach: new URL("../assets/place-categories/weatheron-place-beach-v1.png", import.meta.url).href,
};

/* ── WeatherON P1 · 목적지 입력 · 카테고리 자동 인식 (하이브리드 크롬) ──
   와이어프레임 P1 기준: G1 출발 탭 "+목적지 추가"의 상세 확장 화면
   - 장소명/주소 검색 → 카카오 Local API 기반 카테고리 자동 인식
   - 검색 결과에 카테고리 전용 라인 아이콘 칩 표시(야구장 · 등산 · 해변)
   - 선택된 장소는 카테고리 인식 결과 + 목적지 알림 확장 안내 박스로 표시
   - CTA: "목적지 알림에 추가" → G1 출발 메인 목록에 추가
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#1D5A86';
let NAVY_DARK = '#276A96';
let PANEL     = '#2B719D';
let PANEL_L1  = '#3D87B5';
let GOLD      = '#F0A020';
let ON_GOLD  = '#123858';
let SKY       = '#4A8FD4';
let WARM      = '#E8854A';
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
function SearchSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={MISTLITE(0.70)} strokeWidth={1.8} strokeLinecap="round">
      <circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2={16.65} y2={16.65} />
    </svg>
  );
}

const results = [
  {
    name: "잠실종합운동장",
    icon: "baseball",
    image: placeImages.baseball,
    cat: "스포츠",
    type: "야구장",
    tip: "경기 취소 확률 12% · 쿨링룩 추천",
    color: SKY,
    from: { label: "서울 삼성동", temp: "23°", weather: "맑음", rain: "0%" },
    to: { label: "잠실 야구장", temp: "21°", weather: "구름조금", rain: "12%" },
    risk: "내야 1루석 자외선 지수 9",
    recommendation: "쿨링 티셔츠 + 모자 + SPF50 선크림",
    departTime: "17:40",
    care: ["경기 시작 2시간 전 좌석 날씨", "출발 30분 전 우산·신발", "경기 취소 리스크 급변"],
  },
  {
    name: "북한산국립공원",
    icon: "mountain",
    image: placeImages.mountain,
    cat: "아웃도어",
    type: "등산",
    tip: "정상 낙뢰 위험 · 오전 하산 권장",
    color: WARM,
    from: { label: "서울 삼성동", temp: "23°", weather: "맑음", rain: "0%" },
    to: { label: "북한산 정상", temp: "16°", weather: "바람 강함", rain: "35%" },
    risk: "오후 2시 이후 낙뢰 가능성 상승",
    recommendation: "방풍 재킷 + 등산화 + 여분 양말",
    departTime: "07:20",
    care: ["출발 전 산악 날씨", "정상 예상 체감온도", "하산 권장 시각 알림"],
  },
  {
    name: "해운대해수욕장",
    icon: "beach",
    image: placeImages.beach,
    cat: "아웃도어",
    type: "해변",
    tip: "파도 보통 · 래시가드 추천",
    color: SKY,
    from: { label: "부산역", temp: "26°", weather: "맑음", rain: "5%" },
    to: { label: "해운대", temp: "24°", weather: "해풍", rain: "8%" },
    risk: "오후 해풍 강함 · 체감온도 낮아짐",
    recommendation: "래시가드 + 샌들 + 얇은 셔츠",
    departTime: "10:10",
    care: ["자외선·파도 상태", "해풍 체감온도", "젖은 노면 신발 알림"],
  },
];

function DestinationAddState({ count, selected, saved, accountLinked, gateState }) {
  const ready = Boolean(selected);
  const color = saved ? GOLD : !accountLinked ? WARM : ready ? SKY : MIST;
  return (
    <BrandCard accent={color} style={{ borderRadius: 18, padding: "12px 16px 12px 19px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>목적지</div>
          <div style={{ color: INK(0.84), fontSize: 12.2, lineHeight: 1.45 }}>
            {saved ? "G1 목록과 P3 목적지 필터에 반영됨" : ready ? gateState : "검색 결과에서 목적지를 선택해야 추가 가능"}
          </div>
        </div>
        <span style={{
          height: 30,
          borderRadius: 15,
          padding: "0 10px",
          background: NAVY_DARK,
          color: INK(0.92),
          fontSize: 11,
          fontWeight: 900,
          display: "inline-flex",
          alignItems: "center",
          fontFamily: "'DM Mono',monospace",
          flexShrink: 0,
        }}>{saved ? "저장됨" : !accountLinked ? "계정 필요" : ready ? `${count}건` : "0건"}</span>
      </div>
    </BrandCard>
  );
}

export default function WeatherON_P1({ navigate, routeState = {}, addSavedDestination, setDestinationCare } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab] = useState("출발");
  const initialDestination = routeState.selectedDestination || results[0];
  const [query, setQuery] = useState(initialDestination.name || "잠실");
  const [selected, setSelected] = useState(initialDestination);
  const [saved, setSaved] = useState(Boolean(routeState.saved));
  const [accountLinked, setAccountLinked] = useState(Boolean(routeState.accountLinked));
  const setBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!routeState.resumeSave || !routeState.selectedDestination) return;
    setSelected(routeState.selectedDestination);
    setQuery(routeState.selectedDestination.name);
    setAccountLinked(true);
    addSavedDestination?.(routeState.selectedDestination);
    setDestinationCare?.(routeState.selectedDestination, true);
    setSaved(true);
  }, [routeState.resumeSave, routeState.selectedDestination, addSavedDestination, setDestinationCare]);

  const filtered = query.trim()
    ? results.filter((r) => r.name.includes(query.trim()) || r.cat.includes(query.trim()) || r.type.includes(query.trim()))
    : results;
  const selectedVisible = selected && filtered.some((r) => r.name === selected.name);
  const readyToSave = Boolean(selectedVisible);
  const gateState = accountLinked
    ? `${selected?.name || "목적지"}을 목적지 알림 후보로 선택`
    : `${selected?.name || "목적지"} 선택 · 영구 저장은 계정 연결 필요`;
  const ctaLabel = saved
    ? "출발 탭으로 돌아가기"
    : !readyToSave
      ? "목적지를 먼저 선택"
      : accountLinked
        ? "목적지 알림에 추가"
        : "계정 연결하고 저장";
  const handleSave = () => {
    if (!readyToSave) return;
    if (saved) {
      navigate?.("G1");
      return;
    }
    if (!accountLinked) {
      navigate?.("A2", {
        pendingAction: "장소 저장",
        returnTo: "P1",
        selectedDestination: selected,
        resumeSave: true,
      });
      return;
    }
    addSavedDestination?.(selected);
    setDestinationCare?.(selected, true);
    setSaved(true);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        P1 · 목적지 입력 · 카테고리 자동 인식 · 하이브리드 크롬
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
            <button onClick={() => navigate?.("G1")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <div>
              <div style={{ color: INK(0.94), fontSize: 17, fontWeight: 800 }}>목적지 추가</div>
              <div style={{ color: INK(0.76), fontSize: 10.8, marginTop: 2 }}>장소를 고르면 알림 기준이 맞춰져요</div>
            </div>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 130px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 118 }}>

            <div style={{ display: "flex", alignItems: "center", gap: 10, background: PANEL, borderRadius: 16, padding: "12px 14px" }}>
              <SearchSVG/>
              <input value={query} onChange={e => { setQuery(e.target.value); setSaved(false); }} placeholder="장소명 또는 주소 검색"
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: query ? "#fff" : MISTLITE(0.60), fontSize: 13.5, fontFamily: "'Noto Sans KR', sans-serif" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "게스트", value: false },
                { label: "계정 연결됨", value: true },
              ].map((option) => {
                const on = accountLinked === option.value;
                return (
                  <button key={option.label} onClick={() => { setAccountLinked(option.value); setSaved(false); }} style={{
                    height: 36,
                    borderRadius: 14,
                    border: on ? "none" : `1px solid ${INK(0.10)}`,
                    background: on ? GOLD : NAVY_DARK,
                    color: on ? NAVY : INK(0.78),
                    fontSize: 11.8,
                    fontWeight: 900,
                    cursor: "pointer",
                    fontFamily: "'Noto Sans KR',sans-serif",
                  }}>{option.label}</button>
                );
              })}
            </div>

            <DestinationAddState count={filtered.length} selected={selectedVisible ? selected : null} saved={saved} accountLinked={accountLinked} gateState={gateState}/>

            <BrandCard accent={GOLD} style={{ borderRadius: 18, padding: "12px 16px 12px 19px" }}>
              <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", marginBottom: 5, fontFamily: "'DM Mono',monospace" }}>목적지 알림</div>
              <div style={{ color: INK(0.84), fontSize: 12, lineHeight: 1.55 }}>
                등록한 장소는 출발 탭에 저장되고, 날씨 비교·출발 시각·신발/우산 알림 기준으로 사용돼요
              </div>
            </BrandCard>

            <BrandCard style={{ borderRadius: 18, overflow: "hidden", padding: 0 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center" }}>
                  <div style={{ color: INK(0.94), fontSize: 13.5, fontWeight: 800 }}>검색 결과가 없어요</div>
                  <div style={{ color: MISTLITE(0.62), fontSize: 11.4, lineHeight: 1.5, marginTop: 6 }}>장소명이나 주소를 다시 입력해 주세요</div>
                  <button onClick={() => { setQuery(""); setSelected(results[0]); }} style={{
                    marginTop: 12,
                    height: 36,
                    borderRadius: 14,
                    border: 0,
                    background: GOLD,
                    color: ON_GOLD,
                    fontSize: 11.8,
                    fontWeight: 900,
                    cursor: "pointer",
                    fontFamily: "'Noto Sans KR',sans-serif",
                    padding: "0 12px",
                  }}>전체 보기</button>
                </div>
              ) : filtered.map((r, i) => (
                <div key={r.name} onClick={() => { setSelected(r); setSaved(false); }} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", cursor: "pointer",
                  borderTop: i === 0 ? "none" : `1px solid ${INK(0.06)}`,
                  background: selected.name === r.name ? "rgba(240,160,32,0.08)" : "transparent",
                }}>
                  <span style={{ flex: 1, color: INK(0.94), fontSize: 13.5, fontWeight: 600 }}>{r.name}</span>
                  <span style={{ background: NAVY_DARK, border: `1px solid ${INK(0.12)}`, borderRadius: 14, padding: "4px 10px", color: INK(0.78), fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <DestinationIcon type={r.icon} size={13}/>
                    {r.type}
                  </span>
                </div>
              ))}
            </BrandCard>

            {selectedVisible && <BrandCard accent={SKY} style={{ borderRadius: 18, padding: "14px 16px 14px 19px" }}>
              <div style={{ color: INK(0.94), fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{selected.name} 선택됨</div>
              <div style={{ color: INK(0.80), fontSize: 12.5, lineHeight: 1.6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <DestinationIcon type={selected.icon} size={14}/>
                  {selected.cat} · {selected.type}으로 인식됨
                </span>
              </div>
                <div style={{ color: INK(0.76), fontSize: 11.5, marginTop: 4 }}>
                게스트는 미리보기 가능, 저장과 목적지 알림은 계정 연결 후 반영돼요
              </div>
            </BrandCard>}

            {saved && (
              <BrandCard accent={GOLD} style={{ borderRadius: 18, padding: "12px 16px 12px 19px" }}>
                <div style={{ color: GOLD, fontSize: 12.5, fontWeight: 800 }}>목적지 알림에 추가됨</div>
                <div style={{ color: INK(0.76), fontSize: 11.5, lineHeight: 1.55, marginTop: 5 }}>
                  출발 탭 목록과 목적지 필터에 함께 반영돼요.
                </div>
              </BrandCard>
            )}
          </div>
        </div>

        <div style={{ position: "absolute", left: 20, right: 20, bottom: 90 }}>
          <button {...setBtn.handlers} onClick={handleSave} disabled={!saved && !readyToSave} style={{
            width: "100%", height: 52, borderRadius: 18, background: !saved && !readyToSave ? "rgba(134,158,188,0.26)" : saved ? "rgba(240,160,32,0.16)" : GOLD, border: saved ? "1px solid rgba(240,160,32,0.34)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: !saved && !readyToSave ? "default" : "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
            boxShadow: saved || !readyToSave ? "none" : "0 6px 16px rgba(0,0,0,0.30)",
          }}>
            <PressTintOverlay pressed={setBtn.pressed} tint={NAVY}/>
            <span style={{ fontSize: 15, fontWeight: 700, color: !saved && !readyToSave ? MISTLITE(0.68) : saved ? GOLD : NAVY, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{ctaLabel}</span>
          </button>
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
        WeatherON · P1 목적지 입력 · 카테고리 자동 인식
      </div>
    </div>
  );
}
