import { useEffect, useState } from "react";
import { getWeatherONTheme } from "./WeatherON_theme_tokens.js";

/* ── WeatherON O5 · 스마트 알림 기준 설정 (하이브리드 크롬) ─────────────
   목적: 사용자가 세부 시간을 일일이 정하지 않아도 기본 생활 패턴만 고르면
   강수·특보·출근·외출·여행·자기 전 확인 알림을 자동으로 챙기는 구조.
─────────────────────────────────────────────────────────────────────── */

let NAVY      = "#10243F";
let NAVY_DARK = "#17365D";
let PANEL     = "#214A78";
let PANEL_L1  = "#2A5D8F";
let GOLD      = "#F4B63F";
let ON_GOLD  = '#10243F';
let SKY       = "#4AA3DF";
let CLEAR     = "#2FC6A3";
const WARM = "#E8854A";
let MIST      = "#B9CBE0";
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(185,203,224,${a})`;

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
  return <div style={{ position: "absolute", inset: 0, background: tint, opacity: pressed ? 0.12 : 0, transition: "opacity 0.12s ease", pointerEvents: "none" }}/>;
}

function BackArrowSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function BellSVG({ color = GOLD, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

function CloudRainSVG({ color = SKY, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 16.4A5 5 0 0017 7h-1.2A8 8 0 104 15.3"/>
      <path d="M8 19v2M13 18v2M18 19v2"/>
    </svg>
  );
}

function SunSVG({ color = WARM, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
    </svg>
  );
}

function MoonSVG({ color = MISTLITE(0.9), size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A8.5 8.5 0 1111.2 3a6.5 6.5 0 009.8 9.8z"/>
    </svg>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 44,
      height: 26,
      borderRadius: 13,
      background: on ? GOLD : NAVY_DARK,
      border: on ? "none" : `1px solid ${INK(0.14)}`,
      position: "relative",
      cursor: "pointer",
      flexShrink: 0,
      transition: "all 0.2s",
    }}>
      <div style={{
        position: "absolute",
        top: 3,
        left: on ? 21 : 3,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: on ? NAVY : "rgba(232,237,246,0.55)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.28)",
        transition: "left 0.2s",
      }}/>
    </button>
  );
}

function RoutineButton({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      height: 38,
      borderRadius: 13,
      border: selected ? "none" : `1px solid ${INK(0.12)}`,
      background: selected ? GOLD : NAVY_DARK,
      color: selected ? NAVY : INK(0.76),
      fontSize: 12.5,
      fontWeight: 800,
      cursor: "pointer",
      fontFamily: "'Noto Sans KR',sans-serif",
    }}>
      {label}
    </button>
  );
}

function AlertCard({ icon, title, body, right }) {
  return (
    <div style={{
      background: PANEL,
      borderRadius: 17,
      padding: "13px 14px",
      border: `1px solid ${INK(0.08)}`,
      boxShadow: "0 6px 16px rgba(0,0,0,0.24)",
      display: "flex",
      alignItems: "center",
      gap: 11,
    }}>
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 13,
        background: NAVY_DARK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: INK(0.94), fontSize: 13.8, fontWeight: 800, lineHeight: 1.25 }}>{title}</div>
        <div style={{ color: INK(0.72), fontSize: 11.2, lineHeight: 1.45, marginTop: 3 }}>{body}</div>
      </div>
      {right}
    </div>
  );
}

export default function WeatherON_O5({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState.themeMode);
  const [routine, setRoutine] = useState("출근");
  const nextBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: weatherTheme.shellBg,
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>
        O5 · 스마트 알림 기준 · 하이브리드 크롬
      </div>

      <div style={{
        width: 393,
        height: 852,
        borderRadius: 40,
        overflow: "hidden",
        position: "relative", flexShrink: 0,
        boxShadow: weatherTheme.phoneShadow,
        background: weatherTheme.gradient,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 28px 10px", height: 54, position: "absolute", top: 0, left: 0, right: 0, color: INK(0.94), fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
          <span>9:41</span>
          <span style={{ fontSize: 13, color: INK(0.70) }}>●●● 5G</span>
        </div>

        <div style={{ paddingTop: 54 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 0" }}>
            <button onClick={() => navigate?.("O4")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.68), fontSize: 12, fontFamily: "'DM Mono',monospace" }}>2 / 3</span>
          </div>
          <div style={{ padding: "12px 20px 0" }}>
            <div style={{ height: 4, borderRadius: 2, background: INK(0.08), overflow: "hidden" }}>
              <div style={{ width: "66%", height: "100%", background: GOLD, borderRadius: 2 }}/>
            </div>
          </div>

          <div style={{ padding: "18px 20px 0", display: "flex", flexDirection: "column", gap: 11, height: "calc(852px - 206px)", overflowY: "auto", paddingBottom: 118, scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <div>
              <div style={{ color: INK(0.94), fontSize: 18, fontWeight: 900, lineHeight: 1.28 }}>
                알림이 알아서 챙기게 할까요?
              </div>
              <div style={{ color: INK(0.75), fontSize: 12.5, lineHeight: 1.55, marginTop: 6 }}>
                기준만 고르면 WeatherON이 상황에 맞춰 알림 시간을 조정해요
              </div>
            </div>

            <div style={{
              background: NAVY_DARK,
              borderRadius: 18,
              padding: 14,
              border: `1px solid ${INK(0.10)}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ color: GOLD, fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", fontFamily: "'DM Mono',monospace" }}>알아서 챙기기</div>
                  <div style={{ color: INK(0.86), fontSize: 12.4, lineHeight: 1.45, marginTop: 4 }}>날씨 변화와 이동 패턴에 맞춰 자동 보정</div>
                </div>
                <BellSVG color={GOLD} size={28}/>
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
                {[
                  `상황 ${routine}`,
                  "필수 날씨 켬",
                  "목적지 확장 예정",
                ].map((label, index) => (
                  <span key={label} style={{
                    height: 24,
                    borderRadius: 12,
                    padding: "0 8px",
                    background: index === 0 ? "rgba(240,160,32,0.14)" : PANEL_L1,
                    border: `1px solid ${index === 0 ? "rgba(240,160,32,0.28)" : INK(0.08)}`,
                    color: INK(0.90),
                    fontSize: 10.5,
                    fontWeight: 900,
                    display: "inline-flex",
                    alignItems: "center",
                    fontFamily: "'Noto Sans KR',sans-serif",
                  }}>{label}</span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color: INK(0.68), fontSize: 11, fontWeight: 800, marginBottom: 8, letterSpacing: "0.08em", fontFamily: "'DM Mono',monospace" }}>
                주 사용 상황
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                {["출근", "외출", "여행"].map((item) => (
                  <RoutineButton key={item} label={item} selected={routine === item} onClick={() => setRoutine(item)}/>
                ))}
              </div>
            </div>

            <AlertCard
              icon={<CloudRainSVG/>}
              title="강수·기상특보는 필수 알림"
              body="비 시작과 기상특보는 별도 시간 설정 없이 자동 발송"
              right={<span style={{ color: CLEAR, fontSize: 11.5, fontWeight: 900, flexShrink: 0 }}>켬</span>}
            />

            <AlertCard
              icon={<SunSVG/>}
              title={`${routine} 준비 알림`}
              body={routine === "여행" ? "D-1 체크와 당일 재확인을 자동으로 묶음" : "첫 이동 전 날씨·코디·우산·신발을 한 번에 안내"}
              right={<span style={{ color: GOLD, fontSize: 11.5, fontWeight: 900, flexShrink: 0 }}>자동</span>}
            />

            <div style={{
              background: NAVY_DARK,
              borderRadius: 16,
              border: `1px solid ${INK(0.09)}`,
              padding: "12px 14px",
            }}>
              <div style={{ color: INK(0.82), fontSize: 10.8, fontWeight: 900, letterSpacing: "0.08em", fontFamily: "'DM Mono',monospace", marginBottom: 6 }}>
                작동 방식
              </div>
              <div style={{ color: INK(0.84), fontSize: 11.6, lineHeight: 1.45 }}>
                하루 최대 3건으로 묶고, 수면 시간대에는 긴급 날씨만 보냄.
              </div>
            </div>

            <div style={{ color: INK(0.68), fontSize: 10.8, lineHeight: 1.55, textAlign: "center" }}>
              세부 조정은 마이 &gt; 알림 설정의 고급 설정에서 할 수 있어요
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", left: 24, right: 24, bottom: 48 }}>
          <button {...nextBtn.handlers} onClick={() => navigate?.("O6")} style={{
            width: "100%",
            height: 54,
            borderRadius: 18,
            background: GOLD,
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden", flexShrink: 0,
            boxShadow: "0 6px 16px rgba(0,0,0,0.30)",
          }}>
            <PressTintOverlay pressed={nextBtn.pressed} tint={NAVY}/>
            <span style={{ fontSize: 15, fontWeight: 800, color: ON_GOLD, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>다음</span>
          </button>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · O5 스마트 알림 기준
      </div>
    </div>
  );
}
