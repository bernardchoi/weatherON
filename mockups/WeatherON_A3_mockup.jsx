import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON A3 · 약관 동의 (하이브리드 크롬) ────────────────────────
   와이어프레임 A3 기준: 최초 로그인 시 약관 동의 화면
   - 전체 동의 + 필수 3종("만 14세 이상", 이용약관, 개인정보 수집·이용,
     위치기반서비스) + 선택 1종(마케팅 정보 수신)
   - 필수 미동의 시 진행 불가 (CTA 비활성)
   - 항목 탭(체크 제외 영역) → 약관 본문 인앱 페이지 (R2와 동일 문서)
   - 완료 → 계정 필요 기능으로 복귀, 필요 시 선택 온보딩 진입
   - 탭바 없음 (로그인 전 단계)
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#2A5D8F';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let CLEAR     = '#3ABFA0';
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

function BackArrowSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function CheckSVG({ size = 12, color = NAVY }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function ChevronRightSVG() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={INK(0.66)} strokeWidth={2} strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ── 체크박스 — 공유 글리프(토글+태양노브) 모티프의 미니어처. 채워진
   상태는 Gold, 비활성은 윤곽선만. ── */
function Checkbox({ checked, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
      background: checked ? GOLD : "transparent",
      border: checked ? "none" : `1.5px solid ${MISTLITE(0.35)}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer",
    }}>
      {checked && <CheckSVG/>}
    </div>
  );
}

const requiredTerms = [
  { id: "age",      label: "만 14세 이상입니다", linkable: false },
  { id: "terms",    label: "이용약관 동의", linkable: true },
  { id: "privacy",  label: "개인정보 수집·이용 동의", linkable: true },
  { id: "location", label: "위치기반서비스 이용약관", linkable: true },
];
const optionalTerms = [
  { id: "marketing", label: "마케팅 정보 수신 동의", linkable: false },
];
const returnActions = ["계정 연결", "코디 저장", "옷장 저장", "장소 저장", "알림 추가", "여행 저장", "프리미엄 진입", "날씨 노트 작성", "날씨 제보 저장"];

function AgreementSummaryCard({ requiredOk, requiredCount, totalRequired, optionalOn }) {
  return (
    <div style={{
      background: PANEL,
      border: `1px solid ${INK(0.10)}`,
      borderRadius: 20,
      padding: "16px 16px",
      marginBottom: 16,
      boxShadow: "0 12px 26px rgba(0,0,0,0.24)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <div>
          <div style={{ color: INK(0.76), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace" }}>약관 상태</div>
          <div style={{ color: INK(0.94), fontSize: 15, fontWeight: 900, marginTop: 3 }}>
            {requiredOk ? "필수 항목이 준비됐어요" : "필수 항목만 확인해주세요"}
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
        }}>{requiredCount}/{totalRequired}</span>
      </div>
      <div style={{ color: INK(0.70), fontSize: 11.5, lineHeight: 1.55 }}>
        {requiredOk ? "동의 후 사용자가 하던 저장·알림 흐름으로 이어져요." : "선택 동의는 건너뛰어도 계속할 수 있어요."}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <span style={{ flex: 1, height: 30, borderRadius: 15, background: NAVY_DARK, color: INK(0.78), display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10.8, fontWeight: 900 }}>필수 {requiredOk ? "완료" : "대기"}</span>
        <span style={{ flex: 1, height: 30, borderRadius: 15, background: NAVY_DARK, color: INK(0.72), display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10.8, fontWeight: 900 }}>마케팅 {optionalOn ? "켬" : "끔"}</span>
      </div>
    </div>
  );
}

export default function WeatherON_A3({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [checks, setChecks] = useState({ age: true, terms: true, privacy: true, location: true, marketing: false });
  const submitBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  const allTerms = [...requiredTerms, ...optionalTerms];
  const allChecked = allTerms.every(t => checks[t.id]);
  const requiredOk = requiredTerms.every(t => checks[t.id]);
  const requiredCount = requiredTerms.filter(t => checks[t.id]).length;
  const returnAction = returnActions.includes(routeState.pendingAction) ? routeState.pendingAction : "계정 연결";

  const toggleAll = () => {
    const next = !allChecked;
    const updated = {};
    allTerms.forEach(t => updated[t.id] = next);
    setChecks(updated);
  };
  const toggleOne = (id) => setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  const completeAgreement = () => {
    if (!requiredOk) return;
    if (routeState.returnTo) {
      if (routeState.pendingAction === "프리미엄 진입") {
        navigate?.("G6", {
          ...routeState,
          returnTo: routeState.returnTo,
          accountLinked: true,
        });
        return;
      }
      navigate?.(routeState.returnTo, {
        ...routeState,
        accountLinked: true,
        resumeSave: routeState.resumeSave,
        saved: routeState.saved,
      });
      return;
    }
    navigate?.("H1", { accountLinked: true });
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        A3 · 약관 동의 · 하이브리드 크롬
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 0" }}>
            <button onClick={() => navigate?.("A2", routeState)} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.94), fontSize: 18, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}>약관 동의</span>
          </div>

          {/* Content */}
          <div style={{ padding: "26px 20px 0" }}>
            <div style={{ textAlign: "center", color: INK(0.94), fontSize: 20, fontWeight: 900, lineHeight: 1.35, marginBottom: 8, fontFamily: "'Noto Sans KR',sans-serif" }}>
              약관 확인 후<br/>바로 이어서 진행해요
            </div>
            <div style={{ textAlign: "center", color: INK(0.70), fontSize: 12.3, lineHeight: 1.55, marginBottom: 18 }}>
              필수 항목만 동의하면 계정 연결이 완료돼요
            </div>

            <AgreementSummaryCard
              requiredOk={requiredOk}
              requiredCount={requiredCount}
              totalRequired={requiredTerms.length}
              optionalOn={checks.marketing}
            />

            {/* 전체 동의 */}
            <div onClick={toggleAll} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: PANEL, borderRadius: 16, padding: "14px 16px",
              cursor: "pointer", marginBottom: 12,
            }}>
              <Checkbox checked={allChecked} onToggle={toggleAll}/>
              <span style={{ color: INK(0.94), fontSize: 14.5, fontWeight: 700, fontFamily: "'Noto Sans KR',sans-serif" }}>전체 동의</span>
            </div>

            {/* 필수 항목 */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {requiredTerms.map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 4px" }}>
                  <Checkbox checked={checks[t.id]} onToggle={() => toggleOne(t.id)}/>
                  <span style={{ color: INK(0.74), fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>필수</span>
                  <span style={{ flex: 1, color: INK(0.85), fontSize: 13.5, fontFamily: "'Noto Sans KR',sans-serif" }}>{t.label}</span>
                  {t.linkable && <ChevronRightSVG/>}
                </div>
              ))}
              {optionalTerms.map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 4px" }}>
                  <Checkbox checked={checks[t.id]} onToggle={() => toggleOne(t.id)}/>
                  <span style={{ color: INK(0.68), fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>선택</span>
                  <span style={{ flex: 1, color: INK(0.85), fontSize: 13.5, fontFamily: "'Noto Sans KR',sans-serif" }}>{t.label}</span>
                  {t.linkable && <ChevronRightSVG/>}
                </div>
              ))}
            </div>

            {!requiredOk && (
              <div style={{ marginTop: 10, padding: "9px 12px", background: "rgba(240,160,32,0.10)", border: "1px solid rgba(240,160,32,0.30)", borderRadius: 12 }}>
                <span style={{ color: INK(0.76), fontSize: 11.5, fontFamily: "'Noto Sans KR',sans-serif" }}>필수 약관에 모두 동의하면 시작할 수 있어요</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <div style={{ position: "absolute", left: 24, right: 24, bottom: 40 }}>
            <button {...submitBtn.handlers} onClick={completeAgreement} disabled={!requiredOk} style={{
              width: "100%", height: 54, borderRadius: 18,
              background: requiredOk ? GOLD : NAVY_DARK,
              border: requiredOk ? "none" : `1px solid ${INK(0.10)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: requiredOk ? "pointer" : "not-allowed",
              position: "relative", overflow: "hidden", flexShrink: 0,
              boxShadow: requiredOk ? "0 6px 16px rgba(0,0,0,0.30)" : "none",
              opacity: requiredOk ? 1 : 0.55,
              transition: "all 0.2s",
            }}>
              {requiredOk && <PressTintOverlay pressed={submitBtn.pressed} tint={NAVY}/>}
              <span style={{ fontSize: 15, fontWeight: 700, color: requiredOk ? ON_GOLD : INK(0.64), fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {requiredOk ? `동의하고 ${returnAction} 계속` : "동의하고 시작하기"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · A3 약관 동의
      </div>
    </div>
  );
}
