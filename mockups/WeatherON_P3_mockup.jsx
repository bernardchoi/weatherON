import { useState, useEffect, useRef } from "react";
import { DestinationIcon } from "./WeatherON_destination_icons.jsx";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

const placeImages = {
  baseball: {
    dark: new URL("../assets/place-categories/weatheron-place-baseball-v1.png", import.meta.url).href,
    light: new URL("../assets/place-categories/weatheron-place-baseball-light-v2.png", import.meta.url).href,
  },
  mountain: {
    dark: new URL("../assets/place-categories/weatheron-place-mountain-v1.png", import.meta.url).href,
    light: new URL("../assets/place-categories/weatheron-place-mountain-light-v2.png", import.meta.url).href,
  },
  beach: {
    dark: new URL("../assets/place-categories/weatheron-place-beach-v1.png", import.meta.url).href,
    light: new URL("../assets/place-categories/weatheron-place-beach-light-v2.png", import.meta.url).href,
  },
};

/* ── WeatherON P3 · 목적지 탭 · 카테고리 필터 (하이브리드 크롬) ────────
   와이어프레임 P3 기준: 저장된 목적지를 카테고리 칩으로 필터링
   - 전체/스포츠/아웃도어/계절/문화 전용 라인 아이콘 칩
   - 목적지 카드(카테고리별 원라인 팁)
   - G1 출발 메인의 목적지 목록과 동일 데이터 소스
   - 새 카테고리는 콘텐츠 테이블 확장만으로 추가 가능(Phase 4~)
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
function BackArrowSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
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

const categories = [
  { id: "전체", icon: "pin" },
  { id: "스포츠", icon: "baseball" },
  { id: "아웃도어", icon: "mountain" },
  { id: "계절", icon: "season" },
  { id: "문화", icon: "culture" },
];
const destinations = [
  {
    name: "잠실종합운동장",
    icon: "baseball",
    image: placeImages.baseball.dark,
    image라이트: placeImages.baseball.light,
    cat: "스포츠",
    tip: "경기 취소 확률 12% · 쿨링룩 추천",
    color: CLEAR,
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
    image: placeImages.mountain.dark,
    image라이트: placeImages.mountain.light,
    cat: "아웃도어",
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
    image: placeImages.beach.dark,
    image라이트: placeImages.beach.light,
    cat: "아웃도어",
    tip: "파도 보통 · 래시가드 추천",
    color: CLEAR,
    from: { label: "부산역", temp: "26°", weather: "맑음", rain: "5%" },
    to: { label: "해운대", temp: "24°", weather: "해풍", rain: "8%" },
    risk: "오후 해풍 강함 · 체감온도 낮아짐",
    recommendation: "래시가드 + 샌들 + 얇은 셔츠",
    departTime: "10:10",
    care: ["자외선·파도 상태", "해풍 체감온도", "젖은 노면 신발 알림"],
  },
];

function WeatherCompare({ destination }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {[destination.from, destination.to].map((place, index) => (
        <BrandCard key={place.label} style={{ padding: "13px 10px", textAlign: "center", borderRadius: 18 }}>
          <div style={{ color: INK(0.68), fontSize: 10.5, fontWeight: 800, marginBottom: 5, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {index === 0 ? "출발지" : "목적지"}
          </div>
          <div style={{ color: INK(0.94), fontSize: 18, fontWeight: 900, fontFamily: "'DM Mono',monospace" }}>{place.temp}</div>
          <div style={{ color: INK(0.78), fontSize: 11.5, marginTop: 2 }}>{place.label}</div>
          <div style={{ color: index === 0 ? SKY : destination.color, fontSize: 10.8, marginTop: 4 }}>
            {place.weather} · 강수 {place.rain}
          </div>
        </BrandCard>
      ))}
    </div>
  );
}

function DetailPill({ label, value, color = INK(0.84) }) {
  return (
    <div style={{
      borderRadius: 14,
      background: NAVY_DARK,
      border: `1px solid ${INK(0.08)}`,
      padding: "10px 11px",
    }}>
      <div style={{ color: INK(0.68), fontSize: 10.3, fontWeight: 800, marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{label}</div>
      <div style={{ color, fontSize: 12.2, fontWeight: 800, lineHeight: 1.4 }}>{value}</div>
    </div>
  );
}

function DestinationStateCard({ total, filter, onAdd }) {
  return (
    <BrandCard accent={CLEAR} style={{ borderRadius: 18, padding: "12px 15px 12px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: INK(0.78), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>목적지 알림</div>
          <div style={{ color: INK(0.86), fontSize: 12.2, lineHeight: 1.45 }}>
            {filter === "전체" ? "저장한 목적지별 준비 알림을 보여줌" : `${filter} 목적지만 필터링 중`}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
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
          }}>{total}곳</span>
          <button onClick={onAdd} style={{
            height: 30,
            borderRadius: 15,
            padding: "0 10px",
            border: 0,
            background: GOLD,
            color: ON_GOLD,
            fontSize: 11,
            fontWeight: 900,
            cursor: "pointer",
            fontFamily: "'Noto Sans KR',sans-serif",
          }}>추가</button>
        </div>
      </div>
    </BrandCard>
  );
}

function DestinationDetailStateCard({ destination, careOn, accountLinked, permissionReady }) {
  const ready = accountLinked && permissionReady;
  const color = careOn ? CLEAR : !accountLinked ? WARM : !permissionReady ? GOLD : destination.color;
  const copy = careOn
    ? "목적지 알림이 켜져 출발·신발·우산 알림에 반영됨"
    : !accountLinked
      ? "준비 가이드는 확인 가능 · 알림 저장은 계정 연결 필요"
      : !permissionReady
        ? "계정 연결됨 · 목적지 알림은 권한 확인 필요"
        : "준비 가이드는 확인 가능 · 알림을 켜면 출발까지 연결";
  return (
    <BrandCard accent={color} style={{ borderRadius: 18, padding: "12px 15px 12px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
            <div style={{ color: INK(0.78), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>목적지 상세</div>
          <div style={{ color: INK(0.86), fontSize: 12.2, lineHeight: 1.45 }}>
            {copy}
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
        }}>{careOn ? "켜짐" : ready ? "준비" : !accountLinked ? "계정 필요" : "권한 필요"}</span>
      </div>
    </BrandCard>
  );
}

function DestinationContextStrip({ destination }) {
  return (
    <BrandCard style={{ borderRadius: 18, padding: "12px 14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "선택 목적지", value: destination.name },
          { label: "카테고리", value: destination.cat },
          { label: "다음 화면", value: "P2/G2 전달" },
        ].map((item) => (
          <div key={item.label} style={{ minWidth: 0 }}>
            <div style={{ color: INK(0.66), fontSize: 9.8, fontWeight: 800, marginBottom: 4, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{item.label}</div>
            <div style={{ color: INK(0.86), fontSize: 11.5, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.value}</div>
          </div>
        ))}
      </div>
    </BrandCard>
  );
}

function getDestinationImage(destination, theme) {
  return theme.mode === "light" ? destination.image라이트 || destination.image : destination.image;
}

export default function WeatherON_P3({ navigate, routeState = {}, careState = {}, setDestinationCare, savedDestinations = [] } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab] = useState("출발");
  const [filter, setFilter] = useState("전체");
  const [selected, setSelected] = useState(routeState.selectedDestination || null);
  const [localCareOn, setLocalCareOn] = useState(false);
  const [accountLinked, setAccountLinked] = useState(Boolean(routeState.accountLinked));
  const [permissionReady, setPermissionReady] = useState(Boolean(routeState.permissionReady));
  const resumeCareKeyRef = useRef("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  const mergedDestinations = [
    ...savedDestinations,
    ...destinations.filter((item) => !savedDestinations.some((saved) => saved.name === item.name)),
  ];
  const filtered = filter === "전체" ? mergedDestinations : mergedDestinations.filter(d => d.cat === filter);
  const selectedImage = selected ? getDestinationImage(selected, weatherTheme) : "";
  useEffect(() => {
    if (routeState.selectedDestination) setSelected(routeState.selectedDestination);
    if (routeState.accountLinked) setAccountLinked(true);
    if (routeState.permissionReady) setPermissionReady(true);
    if (routeState.resumeCare && routeState.selectedDestination && routeState.accountLinked && routeState.permissionReady) {
      const resumeKey = `${routeState.selectedDestination.name}:care-on`;
      if (resumeCareKeyRef.current === resumeKey) return;
      resumeCareKeyRef.current = resumeKey;
      setDestinationCare?.(routeState.selectedDestination, true);
      setLocalCareOn(true);
    }
  }, [
    routeState.selectedDestination,
    routeState.accountLinked,
    routeState.permissionReady,
    routeState.resumeCare,
    setDestinationCare,
  ]);
  const openDetail = (destination) => {
    setSelected(destination);
    setLocalCareOn(false);
  };
  const closeDetail = () => {
    setSelected(null);
    setLocalCareOn(false);
  };
  const careOn = selected ? Boolean(careState[selected.name] || localCareOn) : false;
  const handleCareToggle = () => {
    if (!accountLinked) {
      navigate?.("A2", {
        pendingAction: "알림 추가",
        returnTo: "P3",
        resumeCare: true,
        selectedDestination: selected,
        permissionReady,
      });
      return;
    }
    if (!permissionReady) {
      navigate?.("O3", {
        pendingAction: "알림 추가",
        returnTo: "P3",
        resumeCare: true,
        selectedDestination: selected,
        accountLinked,
      });
      return;
    }
    const next = !careOn;
    if (selected) setDestinationCare?.(selected, next);
    setLocalCareOn(next);
  };
  const careCtaLabel = careOn
    ? "이 목적지 알림 켜짐"
    : !accountLinked
      ? "계정 연결하고 알림 켜기"
      : !permissionReady
        ? "알림 권한 확인하고 켜기"
        : "이 목적지 알림 켜기";

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        P3 · 목적지 탭 · 카테고리 필터 · 하이브리드 크롬
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
          <div style={{ padding: "16px 20px 0" }}>
            {selected ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={closeDetail} aria-label="닫기" style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <BackArrowSVG/>
                </button>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: INK(0.94), fontSize: 17, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                    <DestinationIcon type={selected.icon} size={16}/>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selected.name}</span>
                  </div>
                  <div style={{ color: INK(0.68), fontSize: 10.8, marginTop: 2 }}>목적지 상세 · 알림 설정</div>
                </div>
              </div>
            ) : (
              <>
                <span style={{ color: INK(0.94), fontSize: 20, fontWeight: 800 }}>목적지</span>
                <div style={{ color: INK(0.68), fontSize: 11, marginTop: 3 }}>저장한 목적지별 알림과 준비 가이드</div>
              </>
            )}
          </div>

          {!selected && (
            <div style={{ padding: "14px 20px 0", display: "flex", gap: 5, overflowX: "auto" }}>
              {categories.map(c => {
                const on = filter === c.id;
                return (
                  <button key={c.id} onClick={() => setFilter(c.id)} style={{
                    padding: "7px 10px", borderRadius: 20, whiteSpace: "nowrap",
                    background: on ? GOLD : NAVY_DARK, border: on ? "none" : `1px solid ${INK(0.12)}`,
                    color: on ? ON_GOLD : INK(0.78), fontSize: 12.5, fontWeight: on ? 700 : 600, cursor: "pointer",
                    fontFamily: "'Noto Sans KR',sans-serif",
                  }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <DestinationIcon type={c.icon} size={13}/>
                      {c.id}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: selected ? "calc(852px - 144px)" : "calc(852px - 200px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 118 }}>
            {selected ? (
              <>
                <BrandCard style={{ height: 132, borderRadius: 22, padding: 0 }}>
                  <img src={selectedImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </BrandCard>
                <DestinationDetailStateCard destination={selected} careOn={careOn} accountLinked={accountLinked} permissionReady={permissionReady}/>
                <DestinationContextStrip destination={selected}/>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button onClick={() => { setAccountLinked((v) => !v); setLocalCareOn(false); if (selected) setDestinationCare?.(selected, false); }} style={{
                    height: 38,
                    borderRadius: 14,
                    border: accountLinked ? "none" : `1px solid ${INK(0.10)}`,
                    background: accountLinked ? GOLD : NAVY_DARK,
                    color: accountLinked ? ON_GOLD : INK(0.78),
                    fontSize: 11.8,
                    fontWeight: 900,
                    cursor: "pointer",
                    fontFamily: "'Noto Sans KR',sans-serif",
                  }}>{accountLinked ? "계정 연결됨" : "게스트"}</button>
                  <button onClick={() => { setPermissionReady((v) => !v); setLocalCareOn(false); if (selected) setDestinationCare?.(selected, false); }} style={{
                    height: 38,
                    borderRadius: 14,
                    border: permissionReady ? "none" : `1px solid ${INK(0.10)}`,
                    background: permissionReady ? CLEAR : NAVY_DARK,
                    color: permissionReady ? ON_GOLD : INK(0.78),
                    fontSize: 11.8,
                    fontWeight: 900,
                    cursor: "pointer",
                    fontFamily: "'Noto Sans KR',sans-serif",
                  }}>{permissionReady ? "알림 권한 정상" : "알림 권한 전"}</button>
                </div>
                <WeatherCompare destination={selected}/>
                <BrandCard accent={selected.color} style={{ borderRadius: 18, padding: "14px 16px 14px 19px" }}>
                  <div style={{ color: INK(0.72), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 9 }}>오늘 준비</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <DetailPill label="리스크" value={selected.risk} color={INK(0.84)}/>
                    <DetailPill label="출발 추천" value={`${selected.departTime} 출발`} color={INK(0.84)}/>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <DetailPill label="준비 추천" value={selected.recommendation} color={INK(0.88)}/>
                  </div>
                </BrandCard>
                <BrandCard style={{ borderRadius: 18, padding: "13px 15px" }}>
                  <div style={{ color: INK(0.72), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 9 }}>알림 흐름</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selected.care.map((item, index) => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 8, background: NAVY_DARK, color: index === 0 ? selected.color : GOLD, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 900, fontFamily: "'DM Mono',monospace" }}>{index + 1}</span>
                        <span style={{ color: INK(0.82), fontSize: 12.2, lineHeight: 1.4 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </BrandCard>
                <button onClick={handleCareToggle} style={{
                  width: "100%",
                  height: 50,
                  borderRadius: 17,
                  background: careOn ? "rgba(58,191,160,0.16)" : GOLD,
                  border: careOn ? "1px solid rgba(58,191,160,0.35)" : "none",
                  color: careOn ? INK(0.78) : ON_GOLD,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Noto Sans KR',sans-serif",
                }}>
                  {careCtaLabel}
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button onClick={() => navigate?.("P2", {
                    destination: selected,
                    selectedDestination: selected,
                    returnTo: "P3",
                    accountLinked,
                    permissionReady,
                    careOn,
                  })} style={{
                    height: 46,
                    borderRadius: 16,
                    background: NAVY_DARK,
                    border: `1px solid ${INK(0.10)}`,
                    color: INK(0.84),
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "'Noto Sans KR',sans-serif",
                  }}>
                    {selected.cat} 준비 가이드
                  </button>
                  <button onClick={() => navigate?.("G2", {
                    destination: selected,
                    selectedDestination: selected,
                    returnTo: "P3",
                    accountLinked,
                    permissionReady,
                    careOn,
                  })} style={{
                    height: 46,
                    borderRadius: 16,
                    background: "rgba(240,160,32,0.16)",
                    border: "1px solid rgba(240,160,32,0.30)",
                    color: INK(0.78),
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "'Noto Sans KR',sans-serif",
                  }}>
                    목적지 알림
                  </button>
                </div>
              </>
            ) : (
              <>
                <BrandCard accent={CLEAR} style={{ borderRadius: 18, padding: "12px 16px 12px 19px" }}>
                  <div style={{ color: INK(0.78), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 5 }}>준비 가이드</div>
                  <div style={{ color: INK(0.84), fontSize: 12, lineHeight: 1.55 }}>
                    카테고리별 날씨 변수와 코디·신발·준비물을 목적지 카드에서 바로 확인해요
                  </div>
                </BrandCard>
                <DestinationStateCard total={filtered.length} filter={filter} onAdd={() => navigate?.("P1")}/>
                {filtered.length === 0 ? (
                  <BrandCard style={{ borderRadius: 18, padding: "28px 18px", textAlign: "center" }}>
                    <div style={{ color: INK(0.88), fontSize: 14, fontWeight: 800 }}>해당 카테고리의 목적지가 없어요</div>
                    <div style={{ color: INK(0.68), fontSize: 11.5, marginTop: 6, lineHeight: 1.5 }}>목적지를 추가하면 카테고리별 준비 알림이 여기에 표시돼요</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                      <button onClick={() => navigate?.("P1")} style={{
                        height: 42,
                        borderRadius: 15,
                        border: 0,
                        background: GOLD,
                        color: ON_GOLD,
                        fontSize: 12.5,
                        fontWeight: 900,
                        cursor: "pointer",
                        fontFamily: "'Noto Sans KR',sans-serif",
                      }}>목적지 추가</button>
                      <button onClick={() => setFilter("전체")} style={{
                        height: 42,
                        borderRadius: 15,
                        border: `1px solid ${INK(0.10)}`,
                        background: NAVY_DARK,
                        color: INK(0.82),
                        fontSize: 12.5,
                        fontWeight: 900,
                        cursor: "pointer",
                        fontFamily: "'Noto Sans KR',sans-serif",
                      }}>전체 보기</button>
                    </div>
                  </BrandCard>
                ) : filtered.map(d => (
                  <BrandCard key={d.name} accent={d.color} onClick={() => openDetail(d)} style={{ borderRadius: 18, padding: "10px 12px 10px 17px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img
                        src={getDestinationImage(d, weatherTheme)}
                        alt=""
                        style={{
                          width: 76,
                          height: 64,
                          borderRadius: 14,
                          objectFit: "cover",
                          border: `1px solid ${INK(0.08)}`,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                          <span style={{ color: INK(0.76), width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            <DestinationIcon type={d.icon} size={18}/>
                          </span>
                          <span style={{ color: INK(0.94), fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                        </div>
                        <span style={{ color: INK(0.72), fontSize: 12, lineHeight: 1.45 }}>{d.tip}</span>
                      </div>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={INK(0.66)} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </div>
                  </BrandCard>
                ))}
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
        WeatherON · P3 목적지 탭 · 카테고리 필터
      </div>
    </div>
  );
}
