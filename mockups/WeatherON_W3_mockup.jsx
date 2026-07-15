import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON W3 · 제보 완료 + 신뢰도 + 배지 (하이브리드 크롬) ────────
   와이어프레임 W3 기준:
   - F3: 신뢰도 알고리즘 결과 즉시 표시(확정/미확정)
   - F4: 현재 레벨 + 다음 레벨까지 남은 건수
   - 확정 시 "홈에 오버레이 표시 중" 메시지로 기여 실감
   - 레벨: 새싹(0~9) → 관측자(10~49) → 리포터(50~199) → 동네 관측왕(200~) → 날씨 도우미(500~)
   - 모달형(탭바 없음) — W2 제보 직후 표시
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#1D5A86';
let NAVY_DARK = '#276A96';
let PANEL     = '#2B719D';
let PANEL_L1  = '#3D87B5';
let GOLD      = '#F0A020';
let ON_GOLD  = '#123858';
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
function BrandCard({ accent, children, style = {} }) {
  return (
    <div style={{
      background: PANEL, borderRadius: 18, position: "relative", overflow: "hidden", flexShrink: 0,
      textAlign: "left", ...style,
    }}>
      {accent && <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:accent }}/>}
      {children}
    </div>
  );
}
function CheckCircleSVG({ size = 40, color = CLEAR }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6}>
      <circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function CloudSVG({ size = 14, color = WARM }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round"><path d="M6 16a4 4 0 014-4h6a3 3 0 010 6H7a3 3 0 01-3-3 3 3 0 013-3"/></svg>;
}

export default function WeatherON_W3({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const confirmBtn = usePressTint();

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
        W3 · 제보 완료 + 신뢰도 + 배지 · 하이브리드 크롬
      </div>

      <div style={{
        width: 393, height: 852, borderRadius: 40, overflow: "hidden",
        position: "relative", flexShrink: 0,
        boxShadow: weatherTheme.phoneShadow,
        background: weatherTheme.gradient,
      }}>
        <div style={{
          position: "absolute", top: 100, left: "50%", transform: "translateX(-50%)",
          width: 240, height: 240,
          background: "radial-gradient(ellipse, rgba(58,191,160,0.16) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 28px 10px", height:54, position:'absolute', top:0, left:0, right:0, color: INK(0.94), fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
          <span>9:41</span>
          <span style={{ fontSize: 13, color: INK(0.70) }}>●●● 5G</span>
        </div>

        <div style={{ paddingTop: 54 }}>
          <div style={{ textAlign: "center", padding: "16px 20px 0", color: INK(0.94), fontSize: 16, fontWeight: 700 }}>제보 완료</div>

          <div style={{ padding: "20px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <CheckCircleSVG/>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: INK(0.94), fontSize: 16, fontWeight: 800, marginBottom: 6 }}>제보 감사합니다!</div>
              <div style={{ color: INK(0.70), fontSize: 12, fontFamily: "'DM Mono',monospace" }}>합정동 · 비 · 오후 2:41</div>
            </div>

            <BrandCard style={{ width: "100%", padding: "14px 16px" }}>
              <div style={{ color: INK(0.72), fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>주변 제보 현황</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(58,191,160,0.16)", color: INK(0.78), fontSize: 11.5, fontWeight: 700, borderRadius: 14, padding: "5px 10px" }}>
                확정됨 — 반경 500m · 4건
              </span>
              <div style={{ color: INK(0.70), fontSize: 11.5, marginTop: 8 }}>"비" 제보 확정 · 홈 화면에 오버레이 표시 중</div>
            </BrandCard>

            <BrandCard accent={WARM} style={{ width: "100%", padding: "14px 16px 14px 19px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ color: INK(0.92), fontSize: 13 }}>배지</span>
                <span style={{ color: INK(0.74), fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>배지 업데이트</span>
              </div>
              <div style={{ fontSize: 12.5, marginBottom: 8 }}>
                <span style={{ color: INK(0.68) }}>누적 확정 제보 </span>
                <b style={{ color: INK(0.94) }}>12건</b>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(232,133,74,0.14)", color: INK(0.78), fontSize: 11, fontWeight: 700, borderRadius: 14, padding: "4px 10px", marginBottom: 8 }}>
                <CloudSVG/> 관측자 레벨 2
              </span>
              <div style={{ color: INK(0.68), fontSize: 11 }}>다음 레벨까지 38건 → 기상 리포터</div>
            </BrandCard>

            <BrandCard style={{ width: "100%", padding: "12px 14px", border: `1px solid ${CLEAR}33` }}>
              <div style={{ color: INK(0.76), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>배지</div>
              <div style={{ color: INK(0.78), fontSize: 12, lineHeight: 1.55 }}>
                확정 제보 · 홈 오버레이 표시 · 관측자 레벨 2 갱신
              </div>
            </BrandCard>
          </div>
        </div>

        <div style={{ position: "absolute", left: 24, right: 24, bottom: 48 }}>
          <button {...confirmBtn.handlers} onClick={() => navigate?.("W1")} style={{
            width: "100%", height: 50, borderRadius: 18, background: PANEL, border: `1px solid ${INK(0.10)}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
          }}>
            <PressTintOverlay pressed={confirmBtn.pressed} tint={GOLD}/>
            <span style={{ fontSize: 14, fontWeight: 600, color: INK(0.88), fontFamily: "'Noto Sans KR',sans-serif" }}>확인</span>
          </button>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · W3 제보 완료 + 신뢰도 + 배지
      </div>
    </div>
  );
}
