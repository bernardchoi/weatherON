import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON R3 · 광고 동의 관리(UMP) 모달 (하이브리드 크롬) ─────────
   와이어프레임 R3 기준: Google UMP SDK로 GDPR/CCPA 대응
   - 홈 화면이 딤 처리된 배경 위에 바텀시트로 노출
   - 동의 / 동의하지 않음(비개인화 광고로 전환) / 옵션 더보기
   - iOS는 ATT 권한 팝업 별도 노출
   - 최초 실행 시 1회 노출, 설정(R1)에서 재변경 가능
   - 바텀시트 처리는 H1의 PlaceSheet와 동일 패턴(Navy 틴트 블러+드래그 핸들)
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#21407A';
let PANEL_L2  = '#2A4F90';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let CLEAR     = '#3ABFA0';
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
function SunSVG({ size = 44 }) {
  const rays = [[22,3,22,8],[22,36,22,41],[3,22,8,22],[36,22,41,22],[9.5,9.5,12.9,12.9],[31.1,31.1,34.5,34.5],[34.5,9.5,31.1,12.9],[12.9,31.1,9.5,34.5]];
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx={22} cy={22} r={10} fill={GOLD}/>
      {rays.map(([x1,y1,x2,y2],i)=>(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GOLD} strokeWidth={2} strokeLinecap="round"/>))}
    </svg>
  );
}
function BellSVG() {
  return <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
}

const tabDefs = [
  { id: "홈", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { id: "코디", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" /></svg> },
  { id: "출발", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg> },
  { id: "MY", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  { id: "소셜", icon: <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg> },
];
function TabItem({ tab, active }) {
  return (
    <div style={{
      flex:1, height:52, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:4,
      color: active ? GOLD : INK(0.66),
    }}>
      <div style={{ width:5, height:5, borderRadius:"50%", background: active ? GOLD : "transparent", marginBottom:1 }}/>
      {tab.icon}
      <span style={{ fontSize:10.5, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{tab.id === "MY" ? "마이" : tab.id}</span>
    </div>
  );
}

export default function WeatherON_R3({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [resolved, setResolved] = useState(null); // null | 'agree' | 'decline'
  const [optionsOpen, setOptionsOpen] = useState(false);
  const agreeBtn = usePressTint();
  const declineBtn = usePressTint();
  const moreBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        R3 · 광고 동의 관리(UMP) 모달 · 하이브리드 크롬
      </div>

      <div style={{
        width: 393, height: 852, borderRadius: 40, overflow: "hidden",
        position: "relative", flexShrink: 0,
        boxShadow: weatherTheme.phoneShadow,
        background: weatherTheme.gradient,
      }}>
        {/* 딤 처리된 홈 화면 배경 */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.55, filter: "blur(1px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 28px 10px", height:54, color: INK(0.94), fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
            <span>9:41</span><span style={{ fontSize: 13, color: INK(0.70) }}>●●● 5G</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 50 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 18, padding: "7px 14px" }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: INK(0.92) }}>서울 마포구 합정동 ▾</span>
            </div>
            <div style={{ position: "absolute", right: 20, width: 40, height: 40, background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BellSVG/>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 0 0" }}>
            <SunSVG/>
            <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 500, fontSize: 56, color: INK(0.94), marginTop: 6 }}>22°</div>
            <div style={{ fontSize: 15, color: MIST, marginTop: 6 }}>맑음</div>
          </div>
          <div style={{ padding: "30px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: PANEL, borderRadius: 18, padding: "14px 16px" }}>
              <div style={{ color: MIST, fontSize: 10.5, fontWeight: 700, marginBottom: 4 }}>AI 장소 추천</div>
              <div style={{ color: INK(0.94), fontSize: 14, fontWeight: 700 }}>오늘 이 날씨엔 합정동 카페 어때요?</div>
            </div>
          </div>
        </div>

        {/* 백드롭 추가 딤 */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,8,16,0.45)" }}/>

        {/* UMP 바텀시트 — Navy 틴트 블러 + 드래그 핸들 */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          background: `linear-gradient(180deg, ${PANEL_L1} 0%, ${NAVY_DARK} 100%)`,
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -24px 60px rgba(0,0,0,0.55)",
          padding: "14px 24px 36px",
          zIndex: 10,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(232,237,246,0.25)", margin: "0 auto 18px" }}/>

          {resolved ? (
            <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
              <div style={{ color: CLEAR, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                {resolved === "agree" ? "맞춤 광고에 동의했어요" : "비개인화 광고로 설정했어요"}
              </div>
              <div style={{ color: MISTLITE(0.60), fontSize: 11.5 }}>설정 &gt; 광고 및 맞춤 설정에서 언제든 변경 가능해요</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: INK(0.94), textAlign: "center", marginBottom: 10 }}>광고 개인화 설정</div>
              <div style={{ color: INK(0.78), fontSize: 12.5, textAlign: "center", lineHeight: 1.7, marginBottom: 18 }}>
                더 관련성 높은 광고를 위해 정보를 사용할까요?<br/>동의하지 않아도 광고는 계속 표시됩니다(비개인화 광고)
              </div>

              <button {...agreeBtn.handlers} onClick={() => setResolved("agree")} style={{
                width: "100%", height: 50, borderRadius: 18, background: GOLD, border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0, marginBottom: 8,
              }}>
                <PressTintOverlay pressed={agreeBtn.pressed} tint={NAVY}/>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: ON_GOLD, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>동의</span>
              </button>
              <button {...declineBtn.handlers} onClick={() => setResolved("decline")} style={{
                width: "100%", height: 48, borderRadius: 18, background: PANEL_L2, border: `1px solid ${INK(0.10)}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0, marginBottom: 10,
              }}>
                <PressTintOverlay pressed={declineBtn.pressed} tint={GOLD}/>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: INK(0.96), fontFamily: "'Noto Sans KR',sans-serif" }}>동의하지 않음</span>
              </button>
              <button {...moreBtn.handlers} onClick={() => setOptionsOpen(!optionsOpen)} style={{
                width: "100%", background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                position: "relative", overflow: "hidden", flexShrink: 0,
              }}>
                <PressTintOverlay pressed={moreBtn.pressed} tint={GOLD}/>
                <span style={{ color: INK(0.76), fontSize: 12 }}>{optionsOpen ? "옵션 접기" : "옵션 더보기"}</span>
              </button>
              {optionsOpen && (
                <div style={{ marginTop: 8, background: NAVY_DARK, borderRadius: 14, padding: "10px 12px", color: MISTLITE(0.62), fontSize: 11, lineHeight: 1.6 }}>
                  맞춤 광고, 분석, 비개인화 광고 전환 정보를 확인하는 확장 옵션
                </div>
              )}
            </>
          )}
          <div style={{ marginTop: 12, background: NAVY_DARK, border: `1px solid ${GOLD}33`, borderRadius: 14, padding: "10px 12px" }}>
            <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>동의 상태</div>
            <div style={{ color: INK(0.78), fontSize: 11.5, lineHeight: 1.55 }}>
              {resolved === "agree" ? "맞춤 광고 동의" : resolved === "decline" ? "비개인화 광고" : optionsOpen ? "옵션 확인 중" : "동의 대기"} · 설정에서 재변경 가능
            </div>
          </div>
        </div>

        {/* Tab Bar (딤 처리된 배경 일부) */}
        <div style={{
          position: "absolute", bottom: 18, left: 16, right: 16, height: 64,
          background: NAVY_DARK, borderRadius: 24, border: `1px solid ${INK(0.08)}`,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          padding: "0 4px", opacity: 0.4, zIndex: 1,
        }}>
          {tabDefs.map(tab => (
            <TabItem key={tab.id} tab={tab} active={tab.id === "홈"}/>
          ))}
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · R3 광고 동의 관리(UMP) 모달
      </div>
    </div>
  );
}
