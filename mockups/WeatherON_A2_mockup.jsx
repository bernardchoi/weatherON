import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON A2 · 계정 연결 (하이브리드 크롬) ────────────────────────
   와이어프레임 A2 기준: 계정 필요 기능에서 호출되는 자동 추천 기반 로그인 화면
   - 한국: 카카오·네이버 우선 / 일본: LINE 우선 / 일반 해외: Google·Apple·이메일 코드
   - 국가 선택은 노출하지 않고, 지역 신호는 내부 추천 로직으로만 사용
   - iOS는 Apple 로그인 제공 유지 (App Store 정책)
   - UI 언어는 기기 설정을 유지하고, 로그인 수단만 지역 신호로 추천
   - Guest 홈에서 저장·동기화·알림 확장·여행 플래너 등 계정 필요 기능 탭 시 진입
   - 최초 로그인 시 → A3 약관 동의로 진행
   - 탭바 없음 (로그인 전 단계)
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
   ※ 버튼별 브랜드 색상은 와이어프레임 노트에 "미드파이에서 적용"으로 명시—
     배경은 NAVY_DARK 톤으로 통일하고, 브랜드 인지를 위한 최소한의 점(딥)
     컬러만 적용해 Navy/Gold 브랜드 모먼트를 희석하지 않음.
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#2A5D8F';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
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

/* ── 소셜 로그인 브랜드 마크 — 각 제공사 실제 로고를 22px 원형 배지 안에
   배치. 배지 배경은 각 브랜드 공식 컬러(카카오 옐로/네이버 그린), Google·
   Apple은 자체 멀티컬러/블랙 로고가 살도록 화이트 배경을 깐다.
   브랜드 자체 색상은 로그인 버튼 한정으로만 쓰고(Navy/Gold 브랜드 모먼트는
   배경·CTA에 그대로 유지), 와이어프레임 노트의 "브랜드 색상은 적용"을 반영. ── */
function BrandBadge({ bg, border, children }) {
  return (
    <div style={{
      width: 26, height: 26, borderRadius: "50%", background: bg,
      border: border || "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, overflow: "hidden",
    }}>{children}</div>
  );
}
function KakaoSVG() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="#391B1B">
      <path d="M12 3C6.48 3 2 6.48 2 11.04c0 2.93 1.95 5.49 4.86 6.92-.16.6-1.03 3.76-1.06 3.99 0 0-.02.18.1.25.12.07.26.02.26.02.34-.05 3.92-2.58 4.54-3.01.74.11 1.5.16 2.3.16 5.52 0 10-3.48 10-8.04S17.52 3 12 3z"/>
    </svg>
  );
}
function NaverSVG() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="#fff">
      <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z"/>
    </svg>
  );
}
function GoogleSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.8746 2.6836-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3445 0-4.3282-1.5831-5.0364-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"/>
      <path fill="#FBBC05" d="M3.9636 10.71c-.1818-.5454-.2854-1.1268-.2854-1.7273s.1036-1.1818.2854-1.7273V4.9582H.9573C.3477 6.1731 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.9636 10.71z"/>
      <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5814-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9636 7.2727C4.6718 5.1455 6.6555 3.5795 9 3.5795z"/>
    </svg>
  );
}
function AppleSVG() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="#000">
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-3.014 1.57-.12 0-.23-.02-.3-.03-.014-.11-.04-.225-.04-.34 0-1.14.572-2.27 1.207-2.98.804-.94 2.142-1.64 3.156-1.68.03.13.05.26.05.38zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.673 0 3.082.06 4.71 2.5-.123.09-2.554 1.51-2.554 4.62 0 3.31 2.564 4.46 2.79 4.81z"/>
    </svg>
  );
}
function LineSVG() {
  return (
    <svg width={18} height={18} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#06C755"/>
      <path fill="#fff" d="M10 16.5h4.2v11h6.3v3.4H10V16.5zm12.2 0h4.2v14.4h-4.2V16.5zm6.9 0h3.8l5.2 7.6v-7.6H42v14.4h-3.7l-5.3-7.7v7.7h-3.9V16.5z"/>
    </svg>
  );
}
function MailSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3"/>
      <path d="M4 7l8 6 8-6"/>
    </svg>
  );
}

const pendingActions = [
  "계정 연결",
  "코디 저장",
  "옷장 저장",
  "장소 저장",
  "알림 추가",
  "여행 저장",
  "프리미엄 진입",
  "날씨 노트 작성",
  "날씨 제보 저장",
];

const providersByRegion = {
  korea: [
    { id: "kakao",  label: "카카오로 시작하기",  sub: "자동 추천", badge: <BrandBadge bg="#FEE500"><KakaoSVG/></BrandBadge> },
    { id: "naver",  label: "네이버로 시작하기",  sub: "계정 선택지 보완", badge: <BrandBadge bg="#03C75A"><NaverSVG/></BrandBadge> },
    { id: "apple",  label: "Apple로 계속하기",  sub: "iOS 기본 옵션", badge: <BrandBadge bg="#fff" border={`1px solid ${INK(0.10)}`}><AppleSVG/></BrandBadge> },
    { id: "google", label: "Google로 계속하기", sub: "추가 로그인 수단", badge: <BrandBadge bg="#fff" border={`1px solid ${INK(0.10)}`}><GoogleSVG/></BrandBadge> },
  ],
  japan: [
    { id: "line",   label: "LINE으로 시작하기",   sub: "자동 추천", badge: <BrandBadge bg="#06C755"><LineSVG/></BrandBadge> },
    { id: "apple",  label: "Apple로 계속하기",   sub: "iPhone 사용자 기본", badge: <BrandBadge bg="#fff" border={`1px solid ${INK(0.10)}`}><AppleSVG/></BrandBadge> },
    { id: "google", label: "Google로 계속하기",  sub: "Android/웹 사용자 보조", badge: <BrandBadge bg="#fff" border={`1px solid ${INK(0.10)}`}><GoogleSVG/></BrandBadge> },
    { id: "email",  label: "이메일 코드로 계속하기", sub: "소셜 계정 없이 가입", badge: <BrandBadge bg={NAVY_DARK} border={`1px solid ${INK(0.16)}`}><MailSVG/></BrandBadge> },
  ],
  global: [
    { id: "google", label: "Google로 계속하기",  sub: "자동 추천", badge: <BrandBadge bg="#fff" border={`1px solid ${INK(0.10)}`}><GoogleSVG/></BrandBadge> },
    { id: "apple",  label: "Apple로 계속하기",   sub: "iOS 기본 옵션", badge: <BrandBadge bg="#fff" border={`1px solid ${INK(0.10)}`}><AppleSVG/></BrandBadge> },
    { id: "email",  label: "이메일 코드로 계속하기", sub: "소셜 계정 미사용자", badge: <BrandBadge bg={NAVY_DARK} border={`1px solid ${INK(0.16)}`}><MailSVG/></BrandBadge> },
  ],
};

function inferAuthRegion(routeState = {}) {
  if (["korea", "japan", "global"].includes(routeState.authRegion)) return routeState.authRegion;

  const language = typeof navigator !== "undefined" ? `${navigator.language || ""} ${navigator.languages?.join(" ") || ""}`.toLowerCase() : "";
  const timeZone = typeof Intl !== "undefined" ? (Intl.DateTimeFormat().resolvedOptions().timeZone || "").toLowerCase() : "";
  const accountSignals = [
    routeState.storeCountry,
    routeState.simCountry,
    routeState.osRegion,
    routeState.deviceRegion,
  ].map((value) => `${value || ""}`.toLowerCase());
  const locationSignal = `${routeState.currentLocationCountry || ""}`.toLowerCase();
  const hasKoreaAccountSignal = accountSignals.some((value) => ["kr", "kor", "korea", "south korea", "대한민국", "한국"].includes(value));
  const hasJapanAccountSignal = accountSignals.some((value) => ["jp", "jpn", "japan", "日本", "일본"].includes(value));

  if (hasKoreaAccountSignal) return "korea";
  if (hasJapanAccountSignal) return "japan";
  if (language.includes("ko")) return "korea";
  if (language.includes("ja")) return "japan";
  if (timeZone.includes("seoul")) return "korea";
  if (timeZone.includes("tokyo")) return "japan";
  if (["kr", "kor", "korea", "south korea", "대한민국", "한국"].includes(locationSignal)) return "korea";
  if (["jp", "jpn", "japan", "日本", "일본"].includes(locationSignal)) return "japan";
  return "global";
}

function SocialButton({ provider, onClick }) {
  const { pressed, handlers } = usePressTint();
  return (
    <button {...handlers} onClick={onClick} style={{
      width: "100%", height: 52, borderRadius: 16,
      background: NAVY_DARK, border: `1px solid ${INK(0.12)}`,
      display: "flex", alignItems: "center", gap: 12, padding: "0 16px",
      cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      {provider.badge}
      <span style={{ flex: 1, textAlign: "left", fontFamily: "'Noto Sans KR',sans-serif" }}>
        <span style={{ display: "block", color: INK(0.94), fontSize: 14, fontWeight: 700 }}>{provider.label}</span>
        <span style={{ display: "block", color: INK(0.68), fontSize: 10.5, marginTop: 2 }}>{provider.sub}</span>
      </span>
    </button>
  );
}

export default function WeatherON_A2({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const region = inferAuthRegion(routeState);
  const [showAllMethods, setShowAllMethods] = useState(false);
  const otherBtn = usePressTint();
  const laterBtn = usePressTint();
  const pendingAction = pendingActions.includes(routeState.pendingAction) ? routeState.pendingAction : "계정 연결";
  const visibleProviders = showAllMethods ? providersByRegion[region] : providersByRegion[region].slice(0, 2);

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
        A2 · 계정 연결 · 하이브리드 크롬
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
            <button onClick={() => navigate?.(routeState.returnTo || "H1", routeState.returnTo ? routeState : {})} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.94), fontSize: 18, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}>계정 연결</span>
          </div>

          {/* Content */}
          <div style={{ padding: "38px 24px 0", display: "flex", flexDirection: "column" }}>
            <div style={{
              background: PANEL,
              border: `1px solid ${INK(0.12)}`,
              borderRadius: 22,
              padding: "22px 18px",
              marginBottom: 20,
              textAlign: "center",
              boxShadow: "0 10px 26px rgba(0,0,0,0.25)",
            }}>
              <div style={{ color: INK(0.94), fontSize: 21, fontWeight: 900, marginBottom: 8, letterSpacing: 0, fontFamily: "'Noto Sans KR',sans-serif" }}>
                계정 연결하면<br/>준비 설정을 이어갈 수 있어요
              </div>
              <div style={{ color: INK(0.72), fontSize: 12.5, lineHeight: 1.65, fontFamily: "'Noto Sans KR',sans-serif" }}>
                추천 확인은 계속 가능하고,<br/>저장·동기화·알림 추가만 계정에 연결돼요
              </div>
            </div>
            <div style={{ textAlign: "center", color: INK(0.88), fontSize: 14.5, fontWeight: 800, marginBottom: 10, lineHeight: 1.45, fontFamily: "'Noto Sans KR',sans-serif" }}>
              추천 방법
            </div>
            <div style={{ margin: "0 0 14px", color: INK(0.68), fontSize: 11.2, textAlign: "center", fontFamily: "'Noto Sans KR',sans-serif" }}>
              자동 추천된 방법을 먼저 보여줘요
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {["설정 이어보기", "알림 저장"].map((label) => (
                <div key={label} style={{
                  height: 34,
                  borderRadius: 14,
                  background: NAVY_DARK,
                  border: `1px solid ${INK(0.08)}`,
                  color: INK(0.72),
                  fontSize: 11.4,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Noto Sans KR',sans-serif",
                }}>{label}</div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {visibleProviders.map(p => (
                <SocialButton
                  key={p.id}
                  provider={p}
                  onClick={() => navigate?.("A3", { ...routeState, pendingAction })}
                />
              ))}
            </div>

            <button {...otherBtn.handlers} onClick={() => {
              setShowAllMethods(true);
            }} style={{
              width: "100%", height: 38, borderRadius: 14, marginTop: 12,
              background: "transparent", border: `1px solid ${INK(0.10)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              <PressTintOverlay pressed={otherBtn.pressed} tint={GOLD}/>
              <span style={{ color: INK(0.72), fontSize: 12, fontWeight: 700, fontFamily: "'Noto Sans KR',sans-serif" }}>
                다른 방법 보기
              </span>
            </button>

            <button {...laterBtn.handlers} onClick={() => navigate?.(routeState.returnTo || "H1", routeState.returnTo ? routeState : {})} style={{
              width: "100%", height: 38, borderRadius: 14, marginTop: 12,
              background: "none", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              <PressTintOverlay pressed={laterBtn.pressed} tint={GOLD}/>
              <span style={{ color: INK(0.70), fontSize: 12.5, fontWeight: 700, fontFamily: "'Noto Sans KR',sans-serif" }}>
                나중에 할래요
              </span>
            </button>
          </div>

          {/* Footer disclaimer */}
          <div style={{ position: "absolute", left: 24, right: 24, bottom: 36, textAlign: "center" }}>
            <div style={{ color: INK(0.64), fontSize: 10.5, lineHeight: 1.6, fontFamily: "'Noto Sans KR',sans-serif" }}>
              최초 계정 연결 시 다음 단계에서<br/>약관 동의를 진행합니다
            </div>
          </div>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · A2 계정 연결
      </div>
    </div>
  );
}
