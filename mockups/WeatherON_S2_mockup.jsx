import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON S2 · 날씨 노트 지도 (하이브리드 크롬) ────────────────
   와이어프레임 S2 기준:
   - ON Square 도시 맵에 실황 핀 다수 표시
   - GPS 자동 태그 · 24시간 후 만료
   - '도움됨' 누적 → 작성자 CP +1 적립
   - CWR(커뮤니티 날씨 제보)와 연계
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#21407A';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let SKY       = '#4A8FD4';
let MIST      = '#869EBC';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(168,196,224,${a})`;


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
function BrandCard({ children, style = {} }) {
  return <div style={{ background: PANEL, borderRadius: 18, ...style }}>{children}</div>;
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
function PencilSVG() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z"/></svg>;
}
function MapPinSVG({ size = 16, color = GOLD, filled = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth={1.8}>
      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill={filled ? NAVY : "none"} stroke={filled ? NAVY : color}/>
    </svg>
  );
}

const pins = [
  { top: 50, left: 60 }, { top: 90, left: 200 }, { top: 60, left: 260 },
  { top: 130, left: 100 }, { top: 30, left: 150 }, { top: 110, left: 40 },
];

export default function WeatherON_S2({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab, setActiveTab] = useState("소셜");
  const [accountLinked, setAccountLinked] = useState(Boolean(routeState.accountLinked));
  const [permissionReady, setPermissionReady] = useState(Boolean(routeState.permissionReady || routeState.locationReady));
  const [helpful, setHelpful] = useState(false);
  const [pinHelpfulCount, setPinHelpfulCount] = useState(12);
  const [localHelpCount, setLocalHelpCount] = useState(routeState.squareCheckedIn ? 13 : 12);
  const [noteState, setNoteState] = useState(
    routeState.resumeNoteWrite
      ? "작성 준비 완료 · 계정 연결됨"
      : routeState.resumeLocationReport
        ? "위치 제보 준비 완료 · 권한 확인됨"
        : "읽는 중"
  );
  const writeBtn = usePressTint();
  const reportBtn = usePressTint();
  const helpBtn = usePressTint();
  const routeTab = (id) => {
    setActiveTab(id);
    if (id === "홈") navigate?.("H1");
    if (id === "코디") navigate?.("C1");
    if (id === "출발") navigate?.("G1");
    if (id === "MY") navigate?.("M1");
    if (id === "소셜") navigate?.("S1");
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (routeState.accountLinked) setAccountLinked(true);
    if (routeState.permissionReady || routeState.locationReady) setPermissionReady(true);
    if (routeState.resumeNoteWrite && routeState.accountLinked) {
      setNoteState("작성 준비 완료 · 계정 연결됨");
    }
    if (routeState.resumeLocationReport && (routeState.permissionReady || routeState.locationReady)) {
      setNoteState("위치 제보 준비 완료 · 권한 확인됨");
    }
  }, [
    routeState.accountLinked,
    routeState.permissionReady,
    routeState.locationReady,
    routeState.resumeNoteWrite,
    routeState.resumeLocationReport,
  ]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        S2 · 날씨 노트 지도 · 하이브리드 크롬
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
            <span style={{ color: INK(0.94), fontSize: 18, fontWeight: 700 }}>날씨 노트</span>
            <PencilSVG/>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, height: "calc(852px - 130px)", overflowY: "auto", paddingBottom: 90 }}>

            <div style={{
              height: 180, borderRadius: 20, position: "relative", overflow: "hidden", flexShrink: 0,
              background: `linear-gradient(135deg, ${PANEL_L1} 0%, ${PANEL} 100%)`,
              border: `1px solid ${INK(0.08)}`,
            }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: i * 22, height: 1, background: "rgba(232,237,246,0.04)" }}/>
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: i * 44, width: 1, background: "rgba(232,237,246,0.04)" }}/>
              ))}
              {pins.map((p, i) => (
                <div key={i} style={{ position: "absolute", top: p.top, left: p.left }}>
                  <MapPinSVG filled={i === 0}/>
                </div>
              ))}
              <div style={{ position: "absolute", bottom: 8, right: 10, color: INK(0.82), fontSize: 10, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>실황 핀 6건</div>
            </div>

            <BrandCard style={{ padding: "14px 16px" }}>
              <div style={{ color: MIST, fontSize: 10.5, fontWeight: 700, marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>핀 미리보기 — 서울 종로</div>
              <div style={{ color: INK(0.94), fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>"우산 필수, 빗줄기 강함"</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                <div style={{ color: INK(0.78), fontSize: 11 }}>3분 전 · 도움됨 {pinHelpfulCount}</div>
                <button {...helpBtn.handlers} onClick={() => {
                  if (helpful) return;
                  setHelpful(true);
                  setPinHelpfulCount((value) => value + 1);
                  setLocalHelpCount((value) => value + 1);
                  setNoteState("도움됨 반영 · 포인트 +1");
                }} style={{
                  height:32, borderRadius:11, padding:"0 11px",
                  background: helpful ? "rgba(74,143,212,0.18)" : NAVY_DARK,
                  border: `1px solid ${helpful ? SKY : INK(0.10)}`,
                  color: helpful ? INK(0.88) : INK(0.78),
                  fontSize:11.5, fontWeight:800, cursor: helpful ? "default" : "pointer",
                  position:"relative", overflow:"hidden",
                }}>
                  {!helpful && <PressTintOverlay pressed={helpBtn.pressed} tint={SKY}/>}
                  {helpful ? "반영됨" : "도움됨"}
                </button>
              </div>
            </BrandCard>

            <BrandCard style={{ padding:"12px 14px", border:`1px solid ${SKY}33` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ color:INK(0.86), fontSize:12.5, fontWeight:800 }}>오늘 종로 날씨 도움 지수</div>
                <div style={{ color:SKY, fontSize:12, fontWeight:900, fontFamily:"'DM Mono',monospace" }}>{localHelpCount}/20</div>
              </div>
              <div style={{ height:8, borderRadius:999, background:NAVY_DARK, overflow:"hidden" }}>
                <div style={{ width:`${Math.min((localHelpCount / 20) * 100, 100)}%`, height:"100%", borderRadius:999, background:`linear-gradient(90deg, ${SKY}, ${GOLD})` }}/>
              </div>
              <div style={{ color:INK(0.68), fontSize:10.5, marginTop:7 }}>도움 반응이 쌓이면 해당 지역 핀 신뢰도가 올라가요</div>
            </BrandCard>

            <div style={{ display: "flex", gap: 8 }}>
              <button {...writeBtn.handlers} onClick={() => {
                if (!accountLinked) {
                  setNoteState("작성 계정 필요 · A2 이동");
                  navigate?.("A2", {
                    pendingAction: "날씨 노트 작성",
                    returnTo: "S2",
                    resumeNoteWrite: true,
                    permissionReady,
                  });
                  return;
                }
                setNoteState("작성 준비 완료 · 계정 연결됨");
              }} style={{
                flex: 1, height: 46, borderRadius: 16, background: PANEL, border: `1px solid ${INK(0.10)}`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
              }}>
                <PressTintOverlay pressed={writeBtn.pressed} tint={GOLD}/>
                <PencilSVG/>
                <span style={{ color: INK(0.85), fontSize: 13, fontWeight: 600 }}>핀 작성</span>
              </button>
              <button {...reportBtn.handlers} onClick={() => {
                if (!permissionReady) {
                  setNoteState("위치 권한 확인 필요 · O3 이동");
                  navigate?.("O3", {
                    pendingAction: "날씨 노트 작성",
                    returnTo: "S2",
                    resumeLocationReport: true,
                    accountLinked,
                  });
                  return;
                }
                setNoteState("위치 제보 준비 완료 · 권한 확인됨");
              }} style={{
                flex: 1, height: 46, borderRadius: 16, background: GOLD, border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
              }}>
                <PressTintOverlay pressed={reportBtn.pressed} tint={NAVY}/>
                <MapPinSVG color={NAVY} filled={false}/>
                <span style={{ color: ON_GOLD, fontSize: 13, fontWeight: 700 }}>내 위치 제보</span>
              </button>
            </div>

            <div style={{ textAlign: "center", color: INK(0.74), fontSize: 10.5 }}>
              핀은 GPS로 자동 태그되고 24시간 후 만료돼요
            </div>

            <BrandCard style={{ padding: "12px 14px", border: `1px solid ${SKY}33` }}>
              <div style={{ color: INK(0.86), fontSize: 10.5, fontWeight: 800, marginBottom: 5, fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em" }}>노트</div>
              <div style={{ color: INK(0.84), fontSize: 12, lineHeight: 1.55 }}>
                {noteState} · {accountLinked ? "계정 연결됨" : "게스트 읽기 가능"} · {permissionReady ? "위치 권한 정상" : "위치 제보는 권한 필요"}
              </div>
            </BrandCard>
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: 18, left: 16, right: 16, height: 64,
          background: NAVY_DARK, borderRadius: 24, border: `1px solid ${INK(0.08)}`,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          padding: "0 4px", boxShadow: "0 10px 24px rgba(0,0,0,0.45)", zIndex: 20,
        }}>
          {tabDefs.map(tab => (
            <TabItem key={tab.id} tab={tab} active={tab.id === activeTab} onClick={() => routeTab(tab.id)} />
          ))}
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · S2 날씨 노트 지도
      </div>
    </div>
  );
}
