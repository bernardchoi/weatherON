import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON G6 · 프리미엄 구독 페이월 (하이브리드 크롬) ─────────────
   와이어프레임 G6 기준: "깊이 분리" 모델 — 기능 분리가 아닌 더 깊은 사용
   - 무료 vs 프리미엄 비교 4행(알림/코디추천/도보여행/목적지)
   - 월간 ₩2,900 / 연간 ₩19,900(43% 할인, BEST 배지) 두 플랜
   - 모달형 풀스크린(✕ 닫기) — 탭바 없음
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
   ※ 가격·결제는 실제 결제 연동 전 표시값 — Apple/Google 인앱결제 정책 준수 필요
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#2A5D8F';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let WARM      = '#E8854A';
const PREMIUM   = '#AB8EDD';
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
function CloseSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
    </svg>
  );
}
function StarSVG({ size = 30, color = PREMIUM }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

const comparisonRows = [
  { label: "알림", free: "1개 고정", premium: "한도 확대" },
  { label: "코디 추천", free: "오늘 기본", premium: "7일 플래닝" },
  { label: "도보여행", free: "기본 체크", premium: "AI 종주 플래너" },
  { label: "목적지", free: "1개", premium: "즐겨찾기 확대" },
];

function PlanCard({ tier, price, unit, sub, selected, badge, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <button onClick={onClick} {...handlers} style={{
      flex: 1, padding: "16px 10px 14px", borderRadius: 18, textAlign: "center",
      background: selected ? GOLD : NAVY_DARK,
      border: selected ? "none" : `1px solid ${INK(0.12)}`,
      cursor: "pointer", position: "relative", overflow: "visible",
    }}>
      {badge && (
        <div style={{
          position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
          background: WARM, color: ON_GOLD, fontSize: 10, fontWeight: 900,
          padding: "3px 9px", borderRadius: 7, whiteSpace: "nowrap",
        }}>{badge}</div>
      )}
      <div style={{ position: "relative", overflow: "hidden", flexShrink: 0, borderRadius: 12 }}>
        {!selected && <PressTintOverlay pressed={pressed} tint={GOLD}/>}
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: selected ? ON_GOLD : INK(0.68), marginBottom: 4 }}>{tier}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: selected ? ON_GOLD : INK(0.94) }}>{price}</div>
        <div style={{ fontSize: 10.5, color: selected ? ON_GOLD : INK(0.68), marginTop: 2 }}>{unit}</div>
        {sub && <div style={{ fontSize: 10.2, color: selected ? ON_GOLD : INK(0.68), marginTop: 1, fontWeight: 800 }}>{sub}</div>}
      </div>
    </button>
  );
}

export default function WeatherON_G6({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [plan, setPlan] = useState("annual");
  const [subscribed, setSubscribed] = useState(Boolean(routeState.premiumActive));
  const subscribeBtn = usePressTint();
  const closeTarget = routeState.returnTo || "G1";
  const complete프리미엄 = () => {
    if (!subscribed) {
      setSubscribed(true);
      return;
    }
    if (routeState.returnTo) {
      navigate?.(routeState.returnTo, {
        ...routeState,
        premiumActive: true,
        accountLinked: routeState.accountLinked ?? true,
      });
      return;
    }
    navigate?.("G5", { premiumActive: true, accountLinked: true });
  };

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
        G6 · 프리미엄 구독 페이월 · 하이브리드 크롬
      </div>

      <div style={{
        width: 393, height: 852, borderRadius: 40, overflow: "hidden",
        position: "relative", flexShrink: 0,
        boxShadow: weatherTheme.phoneShadow,
        background: weatherTheme.gradient,
      }}>
        {/* 프리미엄 글로우 */}
        <div style={{
          position: "absolute", top: 90, left: "50%", transform: "translateX(-50%)",
          width: 240, height: 240,
          background: "radial-gradient(ellipse, rgba(171,142,221,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 28px 10px", height:54, position:'absolute', top:0, left:0, right:0, color: INK(0.94), fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
          <span>9:41</span>
          <span style={{ fontSize: 13, color: INK(0.70) }}>●●● 5G</span>
        </div>

        <div style={{ paddingTop: 54 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 20px 0" }}>
            <button onClick={() => navigate?.(closeTarget, routeState.returnTo ? routeState : {})} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <CloseSVG/>
            </button>
          </div>

          <div style={{ padding: "8px 24px 0", display: "flex", flexDirection: "column", gap: 16, height: "calc(852px - 220px)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 128 }}>

            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><StarSVG/></div>
              <div style={{ color: INK(0.94), fontSize: 18, fontWeight: 800 }}>WeatherON 프리미엄</div>
              <div style={{ color: INK(0.70), fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
                기능 분리가 아닌 깊이 분리 —<br/>같은 기능을 더 깊게, 더 자유롭게
              </div>
            </div>

            <div style={{ background: PANEL, borderRadius: 18, padding: "14px 16px" }}>
              <div style={{ color: MIST, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>무료와 프리미엄 비교</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {comparisonRows.map((r, i) => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: i === 0 ? "none" : `1px solid ${INK(0.06)}`, paddingTop: i === 0 ? 0 : 9 }}>
                    <span style={{ color: INK(0.78), fontSize: 12.5 }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontFamily: "'Noto Sans KR',sans-serif" }}>
                      <span style={{ color: INK(0.68) }}>{r.free}</span>
                      <span style={{ color: INK(0.70), margin: "0 6px", fontWeight: 900 }}>→</span>
                      <span style={{ color: INK(0.86), fontWeight: 800 }}>{r.premium}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: NAVY_DARK, borderRadius: 18, padding: "12px 15px", border: `1px solid ${subscribed ? "rgba(58,191,160,0.35)" : "rgba(171,142,221,0.30)"}` }}>
              <div style={{ color: INK(0.78), fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 5 }}>프리미엄</div>
              <div style={{ color: INK(0.84), fontSize: 12.2, lineHeight: 1.5 }}>
                {subscribed ? (routeState.returnTo ? "구독 완료 · 원래 저장/알림 액션으로 복귀 가능" : "구독 완료 · AI 종주 플래너로 이어짐") : "미구독 · 플랜 선택 후 프리미엄 기능 활성"}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, paddingTop: 12 }}>
              <PlanCard tier="월간" price="₩2,900" unit="/월" selected={plan === "monthly"} onClick={() => setPlan("monthly")}/>
              <PlanCard tier="연간" price="₩19,900" unit="/년 · ₩1,658/월" badge="추천 · 43% 절약" selected={plan === "annual"} onClick={() => setPlan("annual")}/>
            </div>
          </div>

          <div style={{ position: "absolute", left: 24, right: 24, bottom: 40 }}>
            <button {...subscribeBtn.handlers} onClick={complete프리미엄} style={{
              width: "100%", height: 54, borderRadius: 18, background: GOLD, border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
              boxShadow: "0 6px 16px rgba(0,0,0,0.30)",
            }}>
              <PressTintOverlay pressed={subscribeBtn.pressed} tint={NAVY}/>
              <span style={{ fontSize: 15, fontWeight: 700, color: ON_GOLD, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {subscribed ? (routeState.returnTo ? "원래 설정으로 돌아가기" : "AI 종주 플래너 열기") : plan === "annual" ? "연간 플랜 시작하기" : "월간 플랜 시작하기"}
              </span>
            </button>
            <div style={{ textAlign: "center", color: INK(0.72), fontSize: 10.2, marginTop: 10 }}>
              언제든 해지 가능 · Apple 인앱결제
            </div>
          </div>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · G6 프리미엄 구독 페이월
      </div>
    </div>
  );
}
