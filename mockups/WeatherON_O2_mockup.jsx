import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

const O2_ILLUSTRATION = new URL("../assets/onboarding/weatheron-onboarding-o2-ready-5sec-v1.png", import.meta.url).href;

/* ── WeatherON O2 · 온보딩 기능 소개 (하이브리드 크롬) ─────────────────
   와이어프레임 O2 기준: 4대 기능 한눈 비교 + 기능별 상세 소개
   - 첫 화면: 오늘 준비 5초 완결 가치 + 4대 기능 카드
   - 상세 화면: 선택 기능의 역할 / 유용한 상황 / 다음 단계 설정
   - 건너뛰기 시에도 권한 요청(O3)은 진행한다는 의미를 문구로 명확화
   - 마지막 CTA: "추천 기준 설정하기" → O3 의도
   - 탭바 없음 (온보딩 단계)
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#2A5D8F';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let SKY       = '#4A8FD4';
let CLEAR     = '#3ABFA0';
let WARM      = '#E8854A';
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

function OnboardingHero({ src }) {
  return (
    <div style={{
      height: 154,
      borderRadius: 24,
      overflow: "hidden",
      background: NAVY_DARK,
      border: `1px solid ${INK(0.10)}`,
      boxShadow: "0 14px 26px rgba(0,0,0,0.22)",
    }}>
      <img
        src={src}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}

function ShirtSVG({ size = 40, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4L4 7l3 3 2-1.5V20h6V8.5L17 10l3-3-5-3-1.5 1a3 3 0 01-3 0L9 4z"/>
    </svg>
  );
}
function UmbrellaSVG({ size = 40, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12a10 10 0 10-20 0z"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M9 21a2 2 0 004 0"/>
    </svg>
  );
}
function ShoeSVG({ size = 40, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18c0-2 1-3 3-4l5-2 4-3c1-1 2-1 3 0l3 3c1 1 1 2 1 3v3a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function DepartSVG({ size = 40, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>
  );
}

const features = [
  {
    icon: <ShirtSVG size={24}/>,
    heroIcon: <ShirtSVG/>,
    accent: CLEAR,
    title: "코디 추천",
    oneLine: "날씨에 맞는 오늘 옷",
    what: "현재 기온, 체감, 시간대와 스타일 기준을 묶어 오늘 입을 조합을 제안해요.",
    when: "아침은 쌀쌀하고 낮은 더운 날, 레이어링 판단이 필요할 때 유용해요.",
    setup: "다음 단계에서 스타일 태그, 코디 핏 기준, 추천 연령대를 설정해요.",
    mini: "가디건 + 티셔츠",
  },
  {
    icon: <UmbrellaSVG size={24}/>,
    heroIcon: <UmbrellaSVG/>,
    accent: SKY,
    title: "우산 추천",
    oneLine: "비 오는 시간에 맞는 우산",
    what: "강수량, 지속시간, 바람을 함께 보고 우산 필요 여부와 종류를 알려줘요.",
    when: "비가 잠깐 오는지, 종일 오는지, 접이식으로 충분한지 헷갈릴 때 유용해요.",
    setup: "위치 권한을 허용하면 현재 위치 기준으로 더 정확해져요.",
    mini: "비 없음",
  },
  {
    icon: <ShoeSVG size={24}/>,
    heroIcon: <ShoeSVG/>,
    accent: WARM,
    title: "신발 추천",
    oneLine: "노면과 코디에 맞는 신발",
    what: "비, 바람, 노면 상태와 오늘 코디를 함께 보고 피해야 할 신발까지 알려줘요.",
    when: "캔버스화, 부츠, 스니커즈 중 무엇을 신을지 빠르게 정해야 할 때 유용해요.",
    setup: "외출 알림 시간을 설정하면 출발 전 자동으로 받아볼 수 있어요.",
    mini: "로우 스니커즈",
  },
  {
    icon: <DepartSVG size={24}/>,
    heroIcon: <DepartSVG/>,
    accent: GOLD,
    title: "출발 알림",
    oneLine: "나갈 시간을 놓치지 않게",
    what: "도착 목표와 소요시간을 기준으로 출발 시각을 계산하고 준비 알림을 보내요.",
    when: "목적지가 있거나 일정 시간에 맞춰 나가야 할 때 유용해요.",
    setup: "목적지는 선택 사항이고, 기본 외출 알림만 설정해도 사용할 수 있어요.",
    mini: "18:20 출발",
  },
];

function MiniWeatherScenario() {
  return (
    <div style={{
      borderRadius: 24,
      background: PANEL,
      border: `1px solid ${INK(0.10)}`,
      padding: 14,
      boxShadow: "0 14px 26px rgba(0,0,0,0.22)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ color: INK(0.72), fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", fontFamily: "'DM Mono',monospace" }}>
            오늘 준비
          </div>
          <div style={{ color: INK(0.94), fontSize: 22, fontWeight: 900, marginTop: 3, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            22° 맑음
          </div>
        </div>
        <div style={{
          width: 54,
          height: 54,
          borderRadius: 18,
          background: "rgba(240,160,32,0.16)",
          border: "1px solid rgba(240,160,32,0.24)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: GOLD,
          fontSize: 20,
          fontWeight: 900,
        }}>
          5s
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {features.map((item) => (
          <div key={item.title} style={{
            minHeight: 42,
            borderRadius: 14,
            background: NAVY_DARK,
            border: `1px solid ${INK(0.08)}`,
            padding: "8px 9px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: item.accent, flexShrink: 0 }}/>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: INK(0.88), fontSize: 10.8, fontWeight: 800, lineHeight: 1.25 }}>{item.title}</div>
              <div style={{ color: INK(0.68), fontSize: 9.8, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.mini}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ item, active, onClick }) {
  const press = usePressTint();
  return (
    <button onClick={onClick} {...press.handlers} style={{
      minHeight: 78,
      borderRadius: 18,
      background: active ? PANEL_L1 : NAVY_DARK,
      border: active ? `1px solid ${GOLD}` : `1px solid ${INK(0.10)}`,
      padding: 11,
      color: INK(0.94),
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
      position: "relative",
      overflow: "hidden", flexShrink: 0,
      textAlign: "left",
      fontFamily: "'Noto Sans KR',sans-serif",
    }}>
      <PressTintOverlay pressed={press.pressed} tint={item.accent}/>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 14,
        background: PANEL_L1,
        border: `1px solid ${INK(0.08)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: item.accent,
        flexShrink: 0,
      }}>
        {item.icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: INK(0.94), fontSize: 13, fontWeight: 900, lineHeight: 1.2 }}>{item.title}</div>
        <div style={{ color: INK(0.70), fontSize: 10.7, marginTop: 3, lineHeight: 1.32 }}>{item.oneLine}</div>
      </div>
    </button>
  );
}

function DetailRow({ label, text }) {
  return (
    <div style={{
      borderRadius: 16,
      background: NAVY_DARK,
      border: `1px solid ${INK(0.08)}`,
      padding: "10px 12px",
    }}>
      <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.06em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ color: INK(0.82), fontSize: 11.5, lineHeight: 1.55, fontFamily: "'Noto Sans KR',sans-serif" }}>
        {text}
      </div>
    </div>
  );
}

export default function WeatherON_O2({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [mode, setMode] = useState("overview");
  const [page, setPage] = useState(0);
  const startBtn = usePressTint();
  const skipBtn = usePressTint();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  const current = features[page];
  const isLast = page === features.length - 1;
  const goDetail = (index) => {
    setPage(index);
    setMode("detail");
  };
  const goNext = () => {
    if (mode === "overview") {
      navigate?.("O3");
      return;
    }
    if (!isLast) setPage((p) => Math.min(p + 1, features.length - 1));
    if (isLast) navigate?.("O3");
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: weatherTheme.shellBg, fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        O2 · 온보딩 기능 소개 · 하이브리드 크롬
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

        {/* Skip */}
        <div style={{ position: "absolute", top: 60, right: 20 }}>
          <button {...skipBtn.handlers} onClick={() => navigate?.("O3")} style={{
            background: "none", border: "none", cursor: "pointer", padding: "8px 4px",
            color: INK(0.70), fontSize: 12, fontFamily: "'Noto Sans KR',sans-serif",
          }}>기능 소개 건너뛰기</button>
        </div>

        <div style={{ position: "absolute", top: 104, left: 20, right: 20, bottom: 130 }}>
          {mode === "overview" ? (
            <div>
              <div style={{ color: INK(0.94), fontSize: 22, fontWeight: 900, lineHeight: 1.28, letterSpacing: 0, fontFamily: "'Noto Sans KR',sans-serif" }}>
                날씨 보고,<br/>입고, 나가세요
              </div>
              <div style={{ color: INK(0.76), fontSize: 12.7, lineHeight: 1.55, marginTop: 8, marginBottom: 14, fontFamily: "'Noto Sans KR',sans-serif" }}>
                코디·우산·신발·출발 알림까지 한 번에 준비해요
              </div>
              <OnboardingHero src={O2_ILLUSTRATION}/>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 13 }}>
                {features.map((item, index) => (
                  <FeatureCard key={item.title} item={item} active={false} onClick={() => goDetail(index)}/>
                ))}
              </div>
              <div style={{ marginTop: 12, color: INK(0.66), fontSize: 10.7, lineHeight: 1.45, textAlign: "center", fontFamily: "'Noto Sans KR',sans-serif" }}>
                카드를 누르면 기능별로 더 자세히 볼 수 있어요
              </div>
            </div>
          ) : (
            <div>
              <button onClick={() => setMode("overview")} style={{
                height: 32,
                borderRadius: 16,
                background: NAVY_DARK,
                border: `1px solid ${INK(0.10)}`,
                color: INK(0.72),
                padding: "0 11px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 14,
                fontFamily: "'Noto Sans KR',sans-serif",
              }}>
                전체 기능 보기
              </button>
              <div style={{
                borderRadius: 24,
                background: PANEL,
                border: `1px solid ${INK(0.10)}`,
                padding: 18,
                boxShadow: "0 14px 28px rgba(0,0,0,0.22)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 13 }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: NAVY_DARK,
                    border: `1px solid ${INK(0.08)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: current.accent,
                    position: "relative",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}>
                    <div style={{ position: "absolute", inset: 0, background: current.accent, opacity: 0.13 }}/>
                    {current.heroIcon}
                  </div>
                  <div>
                    <div style={{ color: INK(0.70), fontSize: 10.5, fontWeight: 800, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace" }}>
                      FEATURE {page + 1}
                    </div>
                    <div style={{ color: INK(0.94), fontSize: 19, fontWeight: 900, lineHeight: 1.25, marginTop: 2 }}>{current.title}</div>
                    <div style={{ color: INK(0.70), fontSize: 11.3, marginTop: 4 }}>{current.oneLine}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <DetailRow label="무엇을 해주는지" text={current.what}/>
                  <DetailRow label="언제 유용한지" text={current.when}/>
                  <DetailRow label="다음 단계에서 필요한 설정" text={current.setup}/>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                {features.map((item, index) => (
                  <FeatureCard key={item.title} item={item} active={index === page} onClick={() => goDetail(index)}/>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dots */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 114, display: "flex", justifyContent: "center", gap: 7 }}>
          {features.map((_, i) => (
            <div key={i} onClick={() => setPage(i)} style={{
              width: mode === "detail" && i === page ? 18 : 6, height: 6, borderRadius: 3,
              background: mode === "detail" && i === page ? GOLD : INK(0.24),
              cursor: "pointer", transition: "all 0.2s",
            }}/>
          ))}
        </div>

        {/* CTA */}
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 48 }}>
          <button {...startBtn.handlers} onClick={goNext} style={{
            width: "100%", height: 54, borderRadius: 18, background: GOLD, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0,
            boxShadow: "0 6px 16px rgba(0,0,0,0.30)",
          }}>
            <PressTintOverlay pressed={startBtn.pressed} tint={NAVY}/>
            <span style={{ fontSize: 15, fontWeight: 700, color: ON_GOLD, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              {mode === "overview" || isLast ? "추천 기준 설정하기" : "다음"}
            </span>
          </button>
          <div style={{ color: INK(0.66), fontSize: 10.5, textAlign: "center", marginTop: 8, fontFamily: "'Noto Sans KR',sans-serif" }}>
            다음 단계에서 권한과 추천 기준을 설정해요
          </div>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · O2 온보딩 기능 소개
      </div>
    </div>
  );
}
