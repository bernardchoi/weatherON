import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON · AI 추천 상태 목업 (로딩 / 빈 / 에러 / 권한) ───────────
   디자인 리뷰 후속: AI 추천 기능의 비-해피패스 상태 커버리지.
   - 코디(C1) 표면: 완료 / 로딩(스켈레톤) / 옷장 비움(0벌) / 추천 실패
   - 장소(H1) 표면: 기본 / 로딩 / 추천 없음 / 위치 미허용
   해피패스 본 목업: WeatherON_C1_mockup.jsx, WeatherON_H1_mockup.jsx
   토큰·프리미티브 정의 출처(canonical): WeatherON_design_system.jsx
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#1D5A86';
let NAVY_DARK = '#276A96';
let PANEL     = '#2B719D';
let PANEL_L1  = '#3D87B5';
let PANEL_L2  = '#55A0CA';
let GOLD      = '#F0A020';
let ON_GOLD  = '#123858';
let SKY       = '#4A8FD4';
let SKY_LITE  = '#A6CEF2'; // PANEL/PANEL_L2 위 소형 라벨 AA 통과 틴트
let CLEAR     = '#3ABFA0';
let MIST      = '#E4F2FF';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTL     = (a) => `rgba(228,242,255,${a})`;

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
  return <div style={{ position:"absolute", inset:0, background:tint, opacity:pressed?0.12:0, transition:"opacity 0.12s ease", pointerEvents:"none" }}/>;
}

/* ── 공용 버튼 (Gold 채움 1개 원칙: 상태 화면당 primary 1개) ── */
function PrimaryBtn({ label, onClick, full=true }) {
  const p = usePressTint();
  return (
    <button type="button" onClick={onClick} {...p.handlers} style={{
      appearance:"none", border:"none", font:"inherit",
      height:46, borderRadius:16, background:GOLD,
      display:"flex", alignItems:"center", justifyContent:"center",
      cursor:"pointer", userSelect:"none", position:"relative", overflow:"hidden", flexShrink: 0,
      width: full?"100%":"auto", padding: full?0:"0 22px",
      boxShadow:"0 6px 14px rgba(0,0,0,0.30)",
    }}>
      <PressTintOverlay pressed={p.pressed} tint={NAVY}/>
      <span style={{ fontSize:14, fontWeight:700, color: ON_GOLD, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{label}</span>
    </button>
  );
}
function GhostBtn({ label, onClick }) {
  const p = usePressTint();
  return (
    <button type="button" onClick={onClick} {...p.handlers} style={{
      appearance:"none", font:"inherit",
      height:46, borderRadius:16, background:PANEL, border:`1px solid ${INK(0.10)}`,
      display:"flex", alignItems:"center", justifyContent:"center",
      cursor:"pointer", userSelect:"none", position:"relative", overflow:"hidden", flexShrink: 0, width:"100%",
    }}>
      <PressTintOverlay pressed={p.pressed} tint={GOLD}/>
      <span style={{ fontSize:14, fontWeight:600, color:INK(0.85), fontFamily:"'Noto Sans KR',sans-serif" }}>{label}</span>
    </button>
  );
}

/* ── 스켈레톤 블록 (shimmer) ── */
function Skel({ w="100%", h=14, r=8, mb=0 }) {
  return (
    <div style={{
      width:w, height:h, borderRadius:r, marginBottom:mb,
      background:`linear-gradient(90deg, ${PANEL_L2} 0%, #34609E 50%, ${PANEL_L2} 100%)`,
      backgroundSize:"200% 100%", animation:"won-shimmer 1.3s ease-in-out infinite",
    }}/>
  );
}

/* ── 아이콘 ── */
function HangerSVG({ size=30, color=MISTL(0.85) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a2 2 0 110 4"/>
      <path d="M12 7L3 14.5a1 1 0 00.4 1.8h17.2a1 1 0 00.4-1.8L12 7z"/>
      <line x1="5" y1="19" x2="19" y2="19"/>
    </svg>
  );
}
function AlertSVG({ size=30, color=GOLD }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function PinOffSVG({ size=30, color=SKY_LITE }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
      <line x1="3" y1="3" x2="21" y2="21"/>
    </svg>
  );
}
function MapPinSVG({ size=30, color=SKY_LITE }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

/* ── 빈/에러 공용 레이아웃 ── */
function EmptyBlock({ icon, title, body, primary, ghost }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center",
      padding:"34px 22px", gap:0,
    }}>
      <div style={{
        width:64, height:64, borderRadius:20, background:NAVY_DARK,
        border:`1px solid ${INK(0.08)}`, display:"flex", alignItems:"center", justifyContent:"center",
        marginBottom:16,
      }}>{icon}</div>
      <div style={{ fontSize:16, fontWeight:700, color: INK(0.94), marginBottom:7, fontFamily:"'Noto Sans KR',sans-serif" }}>{title}</div>
      <div style={{ fontSize:12.5, lineHeight:1.55, color:INK(0.82), marginBottom:20, maxWidth:250, fontFamily:"'Noto Sans KR',sans-serif" }}>{body}</div>
      <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:8 }}>
        {primary}
        {ghost}
      </div>
    </div>
  );
}

/* ── 코디(C1) 콘텐츠 — 상태별 ── */
function CodiContent({ state }) {
  if (state === "로딩") {
    return (
      <div style={{ padding:"12px 20px", display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ background:PANEL, borderRadius:20, padding:16 }}>
          <Skel w="40%" h={12} mb={12}/>
          <Skel w="100%" h={150} r={14} mb={12}/>
          <div style={{ display:"flex", gap:6 }}>
            <Skel w={56} h={20} r={20}/><Skel w={56} h={20} r={20}/><Skel w={56} h={20} r={20}/>
          </div>
        </div>
        <div style={{ background:PANEL, borderRadius:16, padding:16 }}>
          <Skel w="35%" h={12} mb={10}/><Skel w="90%" h={12} mb={8}/><Skel w="80%" h={12}/>
        </div>
        <div style={{ textAlign:"center", color:MISTL(0.7), fontSize:11.5, marginTop:2, fontFamily:"'Noto Sans KR',sans-serif" }}>
          날씨에 맞는 코디를 찾고 있어요…
        </div>
      </div>
    );
  }
  if (state === "옷장 비움") {
    return (
      <EmptyBlock
        icon={<HangerSVG/>}
        title="옷장이 아직 비어 있어요"
        body="옷을 등록하면 오늘 날씨와 일교차에 맞춰 AI가 코디를 추천해드려요."
        primary={<PrimaryBtn label="옷 등록하기"/>}
        ghost={<GhostBtn label="샘플 코디로 둘러보기"/>}
      />
    );
  }
  if (state === "추천 실패") {
    return (
      <EmptyBlock
        icon={<AlertSVG/>}
        title="추천을 불러오지 못했어요"
        body="네트워크 상태를 확인하고 잠시 후 다시 시도해주세요. 문제가 계속되면 등록된 옷장은 그대로 보관돼요."
        primary={<PrimaryBtn label="다시 시도"/>}
        ghost={<GhostBtn label="내 옷장 보기"/>}
      />
    );
  }
  // 완료
  return (
    <div style={{ padding:"12px 20px", display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ background:PANEL, borderRadius:20, padding:"16px 16px 16px 19px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:CLEAR }}/>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:CLEAR }}/>
          <span style={{ color:MIST, fontSize:11, fontWeight:700, letterSpacing:"0.06em", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>오늘의 AI 코디</span>
        </div>
        <div style={{ background:NAVY_DARK, borderRadius:14, padding:"22px 12px", border:`1px solid ${INK(0.08)}`, display:"flex", alignItems:"center", justifyContent:"center", gap:14 }}>
          <span style={{ fontSize:13, color:INK(0.88), fontFamily:"'Noto Sans KR',sans-serif" }}>가디건 · 린넨티 · 슬랙스 · 스니커즈</span>
        </div>
        <div style={{ display:"flex", gap:6, marginTop:10 }}>
          {["캐주얼","레이어드","봄가을"].map(t=>(
            <span key={t} style={{ background:NAVY_DARK, border:`1px solid ${INK(0.10)}`, borderRadius:20, padding:"3px 9px", color:MISTL(0.85), fontSize:10 }}>{t === "MY" ? "마이" : t}</span>
          ))}
        </div>
      </div>
      <div style={{ textAlign:"center", color:MISTL(0.7), fontSize:11, fontFamily:"'Noto Sans KR',sans-serif" }}>
        ※ 완료 상태 전체는 WeatherON_C1_mockup.jsx 참조
      </div>
    </div>
  );
}

/* ── 장소(H1) 콘텐츠 — 상태별 ── */
function PlaceCard({ accent=SKY, children }) {
  return (
    <div style={{ background:PANEL, borderRadius:20, padding:"14px 16px 14px 18px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:accent }}/>
      {children}
    </div>
  );
}
function PlaceContent({ state }) {
  if (state === "로딩") {
    return (
      <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:11 }}>
        <div style={{ background:PANEL, borderRadius:20, padding:16 }}>
          <Skel w="35%" h={11} mb={10}/><Skel w="85%" h={14} mb={8}/><Skel w="60%" h={12}/>
        </div>
        <div style={{ background:PANEL, borderRadius:20, padding:16 }}>
          <Skel w="30%" h={11} mb={10}/><Skel w="80%" h={14} mb={8}/><Skel w="55%" h={12}/>
        </div>
        <div style={{ textAlign:"center", color:MISTL(0.7), fontSize:11.5, marginTop:2, fontFamily:"'Noto Sans KR',sans-serif" }}>
          주변 추천 장소를 찾고 있어요…
        </div>
      </div>
    );
  }
  if (state === "추천 없음") {
    return (
      <EmptyBlock
        icon={<MapPinSVG/>}
        title="지금은 추천할 장소가 없어요"
        body="현재 날씨·시간대에 맞는 주변 장소를 찾지 못했어요. 위치를 옮기거나 잠시 후 다시 확인해보세요."
        primary={<PrimaryBtn label="다시 찾기"/>}
        ghost={<GhostBtn label="지역 바꾸기"/>}
      />
    );
  }
  if (state === "위치 미허용") {
    return (
      <EmptyBlock
        icon={<PinOffSVG/>}
        title="위치 권한이 필요해요"
        body="위치를 켜면 지금 있는 동네 기준으로 날씨에 맞는 장소를 추천해드려요. 위치 정보는 추천에만 사용돼요."
        primary={<PrimaryBtn label="위치 허용하기"/>}
        ghost={<GhostBtn label="직접 지역 검색"/>}
      />
    );
  }
  // 기본
  return (
    <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:11 }}>
      <PlaceCard accent={SKY}>
        <div style={{ fontSize:10.5, fontWeight:600, color:SKY_LITE, marginBottom:6, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>✦ AI 장소 추천</div>
        <div style={{ fontSize:15, fontWeight:700, color: INK(0.94), marginBottom:4, fontFamily:"'Noto Sans KR',sans-serif" }}>오늘 이 날씨엔 합정동 카페 어때요?</div>
        <div style={{ fontSize:11.5, color:INK(0.82), fontFamily:"'Noto Sans KR',sans-serif" }}>맑음 · 기온 22°C · 탭해서 더보기 →</div>
      </PlaceCard>
      <div style={{ textAlign:"center", color:MISTL(0.7), fontSize:11, fontFamily:"'Noto Sans KR',sans-serif" }}>
        ※ 기본 상태 전체는 WeatherON_H1_mockup.jsx 참조
      </div>
    </div>
  );
}

/* ── 헤더 (표면별) ── */
function FrameHeader({ surface, state }) {
  if (surface === "장소") {
    const denied = state === "위치 미허용";
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:50, position:"relative" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, background:NAVY_DARK, border:`1px solid ${INK(0.10)}`, borderRadius:18, padding:"7px 14px" }}>
          {denied
            ? <><PinOffSVG size={13} color={GOLD}/><span style={{ fontSize:13, fontWeight:600, color:GOLD, fontFamily:"'Noto Sans KR',sans-serif" }}>위치 권한 필요</span></>
            : <span style={{ fontSize:13.5, fontWeight:500, color:INK(0.92), fontFamily:"'Noto Sans KR',sans-serif" }}>서울 마포구 합정동 ▾</span>}
        </div>
      </div>
    );
  }
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", height:50 }}>
      <span style={{ color: INK(0.94), fontSize:20, fontWeight:800, fontFamily:"'Noto Sans KR',sans-serif" }}>코디</span>
      <div style={{ display:"flex", alignItems:"center", gap:5, color:MISTL(0.88), fontSize:12, fontFamily:"'Noto Sans KR',sans-serif" }}>21° 맑음 · 일교차 11°</div>
    </div>
  );
}

const STATES = {
  "코디": ["완료","로딩","옷장 비움","추천 실패"],
  "장소": ["기본","로딩","추천 없음","위치 미허용"],
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
  if (typeof MIST !== "undefined") MIST = theme.MIST;
  if (typeof INK !== "undefined") INK = (a) => ink(theme, a);
  if (typeof MISTLITE !== "undefined") MISTLITE = (a) => mist(theme, a);
  if (typeof MISTL !== "undefined") MISTL = (a) => mist(theme, a);
  return theme;
}
export default function WeatherON_AI_States({ routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [surface, setSurface] = useState("코디");
  const [state, setState] = useState("로딩");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
    const sheet = document.createElement("style");
    sheet.textContent = "@keyframes won-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}";
    document.head.appendChild(sheet);
  }, []);

  const states = STATES[surface];
  const curState = states.includes(state) ? state : states[0];

  return (
    <div style={{ minHeight:"100vh", background: weatherTheme.shellBg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, padding:"28px 20px" }}>
      <div style={{ color:MISTL(0.45), fontSize:11, letterSpacing:2, fontFamily:"'DM Mono',monospace", textTransform:"uppercase" }}>
        WeatherON · AI 추천 상태 (로딩 / 빈 / 에러 / 권한)
      </div>

      {/* 표면 전환 */}
      <div style={{ display:"flex", gap:6 }}>
        {["코디","장소"].map(s => (
          <div key={s} onClick={()=>{ setSurface(s); setState(STATES[s][0]); }} style={{
            padding:"6px 16px", borderRadius:20, cursor:"pointer", fontSize:12, fontWeight:700,
            fontFamily:"'Noto Sans KR',sans-serif",
            background: surface===s ? GOLD : NAVY_DARK,
            color: surface===s ? NAVY : INK(0.7),
            border:`1px solid ${surface===s ? GOLD : INK(0.12)}`,
          }}>{s} 추천</div>
        ))}
      </div>

      {/* 상태 전환 */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center", maxWidth:393 }}>
        {states.map(s => (
          <div key={s} onClick={()=>setState(s)} style={{
            padding:"5px 13px", borderRadius:16, cursor:"pointer", fontSize:11.5, fontWeight:600,
            fontFamily:"'Noto Sans KR',sans-serif",
            background: curState===s ? PANEL_L2 : NAVY_DARK,
            color: curState===s ? "#fff" : MISTL(0.7),
            border:`1px solid ${curState===s ? SKY : INK(0.10)}`,
          }}>{s}</div>
        ))}
      </div>

      {/* 폰 프레임 */}
      <div style={{
        width:393, height:760, borderRadius:40, overflow:"hidden", position:"relative", flexShrink:0,
        background: weatherTheme.gradient,
        boxShadow:["0 0 0 1.5px rgba(255,255,255,0.08)","0 40px 80px rgba(0,0,0,0.70)"].join(","),
        fontFamily:"'Noto Sans KR',sans-serif",
      }}>
        {/* 상태바 */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", padding:"0 28px 10px", height:54, color: INK(0.94), fontSize:15, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>
          <span>9:41</span><span style={{ fontSize:13, color:INK(0.70) }}>●●● 5G</span>
        </div>

        <FrameHeader surface={surface} state={curState}/>

        <div style={{ paddingTop:10 }}>
          {surface === "코디" ? <CodiContent state={curState}/> : <PlaceContent state={curState}/>}
        </div>

        {/* 탭바 (정적) */}
        <div style={{ position:"absolute", bottom:18, left:16, right:16, height:60, background:NAVY_DARK, borderRadius:24, border:`1px solid ${INK(0.08)}`, display:"flex", alignItems:"center", justifyContent:"space-around", boxShadow:"0 10px 24px rgba(0,0,0,0.45)" }}>
          {["홈","코디","출발","MY","소셜"].map(t => {
            const active = (surface==="코디" && t==="코디") || (surface==="장소" && t==="홈");
            return (
              <div key={t} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, color: active?GOLD:MISTL(0.70) }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background: active?GOLD:"transparent" }}/>
                <span style={{ fontSize:10.5, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{t === "MY" ? "마이" : t}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ color:MISTL(0.30), fontSize:11, fontFamily:"'DM Mono',monospace", letterSpacing:1 }}>
        WeatherON · AI 추천 상태 커버리지 · 보조 텍스트 AA 통과
      </div>
    </div>
  );
}
