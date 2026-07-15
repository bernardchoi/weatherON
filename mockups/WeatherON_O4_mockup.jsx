import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON O4 · 스타일 태그 선택 (하이브리드 크롬) ─────────────────
   와이어프레임 O4 기준: 온보딩 1/3 — 코디 추천에 반영할 선호 스타일
   - 캐주얼 / 미니멀 / 포멀 / 스트릿 / 로맨틱 5종 멀티 선택(최소 1개 필수)
   - 남성 / 여성 / 상관없음, 10-20대 / 20-30대 / 30-40대 / 40-50대 / 50+ 단일 선택
   - 선택 스타일 미리보기 콜라주
   - MY에서 변경 가능 (추후, M1 → 스타일 태그 설정)
   - 탭바 없음 (온보딩 단계, 진행 표시 "1 / 3")
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#1D5A86';
let NAVY_DARK = '#276A96';
let PANEL     = '#2B719D';
let PANEL_L1  = '#3D87B5';
let GOLD      = '#F0A020';
let ON_GOLD  = '#123858';
let CLEAR     = '#3ABFA0';
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
function ShirtSVG({ size = 26, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4L4 7l3 3 2-1.5V20h6V8.5L17 10l3-3-5-3-1.5 1a3 3 0 01-3 0L9 4z"/>
    </svg>
  );
}

function Chip({ label, active, onClick, compact = false }) {
  const { pressed, handlers } = usePressTint();
  return (
    <button onClick={onClick} {...handlers} style={{
      height: compact ? 32 : 38,
      padding: compact ? "0 11px" : "0 15px",
      borderRadius: compact ? 16 : 19,
      background: active ? GOLD : NAVY_DARK,
      border: active ? "none" : `1px solid ${INK(0.14)}`,
      color: active ? ON_GOLD : INK(0.80),
      fontSize: compact ? 12 : 13,
      fontWeight: active ? 700 : 600,
      cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
      fontFamily: "'Noto Sans KR',sans-serif",
      whiteSpace: "nowrap",
    }}>
      {!active && <PressTintOverlay pressed={pressed} tint={GOLD}/>}
      {label}
    </button>
  );
}

const styles = ["캐주얼", "미니멀", "포멀", "스트릿", "로맨틱"];
const fitOptions = ["남성", "여성", "상관없음"];
const ageOptions = ["10-20대", "20-30대", "30-40대", "40-50대", "50+"];

function OptionSection({ title, desc, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: INK(0.92), fontSize: 12.5, fontWeight: 800, marginBottom: 3, fontFamily: "'Noto Sans KR',sans-serif" }}>
        {title}
      </div>
      <div style={{ color: INK(0.68), fontSize: 10.7, marginBottom: 8, lineHeight: 1.35, fontFamily: "'Noto Sans KR',sans-serif" }}>
        {desc}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {children}
      </div>
    </div>
  );
}

export default function WeatherON_O4({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [selected, setSelected] = useState(routeState.selectedStyles || ["캐주얼", "포멀"]);
  const [fit, setFit] = useState(routeState.fit || "상관없음");
  const [age, setAge] = useState(routeState.age || "20-30대");
  const nextBtn = usePressTint();
  const settingMode = Boolean(routeState.returnTo);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  const toggle = (s) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const canProceed = selected.length > 0;
  const completeStyle = () => {
    if (!canProceed) return;
    const nextState = {
      ...routeState,
      selectedStyles: selected,
      fit,
      age,
      styleProfileSaved: true,
    };
    navigate?.(routeState.returnTo || "O5", routeState.returnTo ? nextState : { selectedStyles: selected, fit, age });
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        O4 · 스타일 태그 선택 · 하이브리드 크롬
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
          {/* Header w/ progress */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
            <button onClick={() => navigate?.(routeState.returnTo || "O3", routeState.returnTo ? routeState : {})} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.68), fontSize: 12, fontFamily: "'DM Mono',monospace" }}>{settingMode ? "설정" : "1 / 3"}</span>
          </div>

          {/* Progress bar */}
          <div style={{ padding: "12px 20px 0" }}>
            <div style={{ height: 4, borderRadius: 2, background: INK(0.08), overflow: "hidden" }}>
              <div style={{ width: settingMode ? "100%" : "33%", height: "100%", background: GOLD, borderRadius: 2 }}/>
            </div>
          </div>

          <div style={{ padding: "22px 20px 0" }}>
            <div style={{ color: INK(0.94), fontSize: 16.5, fontWeight: 800, marginBottom: 6, fontFamily: "'Noto Sans KR',sans-serif" }}>
              코디 추천 기준을 골라주세요
            </div>
            <div style={{ color: INK(0.75), fontSize: 13, marginBottom: 18, fontFamily: "'Noto Sans KR',sans-serif" }}>
              스타일은 복수 선택 가능 · 핏과 연령대는 추천 보정에만 사용돼요
            </div>

            <OptionSection title="스타일 태그" desc="오늘 입을 옷의 무드를 정해요">
              {styles.map(s => (
                <Chip key={s} label={s} active={selected.includes(s)} onClick={() => toggle(s)}/>
              ))}
            </OptionSection>

            <OptionSection title="코디 핏 기준" desc="성별 정보가 아니라 추천 실루엣 기준이에요">
              {fitOptions.map(option => (
                <Chip key={option} compact label={option} active={fit === option} onClick={() => setFit(option)}/>
              ))}
            </OptionSection>

            <OptionSection title="추천 연령대" desc="코디 톤과 브랜드 무드 보정용이에요">
              {ageOptions.map(option => (
                <Chip key={option} compact label={option} active={age === option} onClick={() => setAge(option)}/>
              ))}
            </OptionSection>

            {/* Preview collage */}
            <div style={{
              borderRadius: 20, background: PANEL, minHeight: 144,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
              border: `1px solid ${INK(0.08)}`,
              padding: "14px 12px",
            }}>
              <div style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "0 2px 2px",
              }}>
                <div>
                  <div style={{ color: INK(0.78), fontSize: 10.2, fontWeight: 900, letterSpacing: "0.09em", fontFamily: "'DM Mono',monospace" }}>
                    스타일
                  </div>
                  <div style={{ color: INK(0.68), fontSize: 10.6, marginTop: 2, fontFamily: "'Noto Sans KR',sans-serif" }}>
                    {selected.length ? `${selected.length}개 태그 · ${fit} · ${age}` : "스타일 1개 이상 필요"}
                  </div>
                </div>
                <span style={{
                  height: 24,
                  borderRadius: 12,
                  padding: "0 8px",
                  background: NAVY_DARK,
                  color: INK(0.78),
                  fontSize: 10.5,
                  fontWeight: 900,
                  display: "inline-flex",
                  alignItems: "center",
                  fontFamily: "'DM Mono',monospace",
                  flexShrink: 0,
                }}>{canProceed ? "준비" : "선택 필요"}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {(selected.length ? selected : ["선택해보세요"]).slice(0,3).map((s, i) => (
                  <div key={i} style={{ width: 56, height: 56, borderRadius: 16, background: PANEL_L1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShirtSVG size={24} color={selected.length ? INK(0.78) : INK(0.42)}/>
                  </div>
                ))}
              </div>
              <div style={{ color: INK(0.68), fontSize: 11.5, fontFamily: "'Noto Sans KR',sans-serif" }}>
                {selected.length ? `${selected.join(" · ")} 스타일로 추천해드려요` : "스타일을 1개 이상 선택해주세요"}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                {[`핏 ${fit}`, age].map((label) => (
                  <span key={label} style={{
                    height: 23,
                    padding: "0 8px",
                    borderRadius: 12,
                    background: NAVY_DARK,
                    border: `1px solid ${INK(0.10)}`,
                    color: INK(0.72),
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 10.5,
                    fontWeight: 700,
                    fontFamily: "'Noto Sans KR',sans-serif",
                  }}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 48 }}>
          <button {...nextBtn.handlers} onClick={completeStyle} disabled={!canProceed} style={{
            width: "100%", height: 54, borderRadius: 18,
            background: canProceed ? GOLD : NAVY_DARK,
            border: canProceed ? "none" : `1px solid ${INK(0.10)}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: canProceed ? "pointer" : "not-allowed",
            position: "relative", overflow: "hidden", flexShrink: 0,
            opacity: canProceed ? 1 : 0.55,
            boxShadow: canProceed ? "0 6px 16px rgba(0,0,0,0.30)" : "none",
          }}>
            {canProceed && <PressTintOverlay pressed={nextBtn.pressed} tint={NAVY}/>}
            <span style={{ fontSize: 15, fontWeight: 700, color: canProceed ? ON_GOLD : INK(0.64), fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              {settingMode ? "저장하고 돌아가기" : "다음"}
            </span>
          </button>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · O4 스타일 태그 선택
      </div>
    </div>
  );
}
