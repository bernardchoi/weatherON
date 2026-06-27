import { useState, useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON H3 · 알림 사이드바 (하이브리드 크롬) ────────────────────
   와이어프레임 H3 기준: 우측 슬라이드인 패널
   - 좌측: 홈 화면 딤 처리
   - 우측: 알림 패널 (외출준비 / 비예보 / 신발 / 출발 알림)
   - 각 알림 탭 → 해당 상세 화면 딥링크
   - 최근 7일 보관
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#21407A';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let SKY       = '#4A8FD4';
let CLEAR     = '#3ABFA0';
let WARM      = '#E8854A';
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
  return (
    <div style={{ position:"absolute", inset:0, background: tint, opacity: pressed ? 0.12 : 0, transition:"opacity 0.12s ease", pointerEvents:"none" }}/>
  );
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
      color: active ? GOLD : INK(0.66), transition:"color 0.15s ease", // 비활성 탭은 라이트모드 대비 보정
    }}>
      <PressTintOverlay pressed={pressed} tint={GOLD}/>
      <div style={{ width:5, height:5, borderRadius:"50%", background: active ? GOLD : "transparent", marginBottom:1 }}/>
      {tab.icon}
      <span style={{ fontSize:10.5, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{_tabLabel}</span>
    </button>
  );
}

/* ── 알림 타입 아이콘 — brand/WeatherON_아이콘_시스템.md 기준 ── */
function SunSVG({ size = 18, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth={1.8}/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line key={i}
            x1={12 + 7.5 * Math.cos(rad)} y1={12 + 7.5 * Math.sin(rad)}
            x2={12 + 10 * Math.cos(rad)} y2={12 + 10 * Math.sin(rad)}
            stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
        );
      })}
    </svg>
  );
}
function UmbrellaSVG({ size = 18, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12a10 10 0 10-20 0z"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M9 21a2 2 0 004 0"/>
    </svg>
  );
}
function ShoeSVG({ size = 18, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18c0-2 1-3 3-4l5-2 4-3c1-1 2-1 3 0l3 3c1 1 1 2 1 3v3a1 1 0 01-1 1H4a1 1 0 01-1-1z"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function DepartSVG({ size = 18, color = INK(0.9) }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>
  );
}

const notifications = [
  { type: "외출 준비", icon: <SunSVG/>, time: "07:30", title: "오늘의 외출 준비", desc: "21° 맑음 · 추천 코디: 반팔 + 얇은 가디건", sub: "우산 불필요", color: GOLD, link: "H1 홈", isRead: false },
  { type: "비 예보", icon: <UmbrellaSVG/>, time: "14:00", title: "비 예보 사전 알림", desc: "18시 시작 · 시간당 4mm · 21시 그침", sub: "탭하면 강수 타임라인 보기", color: SKY, link: "H5", isRead: false },
  { type: "우산 추천", icon: <UmbrellaSVG/>, time: "08:20", title: "우산 추천", desc: "목적지에 오후 비 예보 · 3단 우산 권장", sub: "탭하면 우산 추천 상세 보기", color: SKY, link: "H4", isRead: true },
  { type: "출발 알림", icon: <DepartSVG/>, time: "08:30", title: "출발 알림", desc: "지금 출발하면 9:00 도착", sub: "판교 · 40분 소요", color: WARM, link: "G2", isRead: true },
];

function NotifCard({ notif, selected, onClick }) {
  const { pressed, handlers } = usePressTint();
  const readTone = notif.isRead ? 0.94 : 0.96;
  const bodyTone = notif.isRead ? 0.88 : 0.90;
  return (
    <div style={{
      borderRadius: 16, overflow: "hidden", position: "relative", flexShrink: 0,
      background: selected ? "rgba(240,160,32,0.14)" : PANEL_L1,
      border: selected ? `1px solid ${GOLD}` : "1px solid transparent",
    }}>
      <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background: notif.color }}/>
      <PressTintOverlay pressed={pressed} tint={notif.color}/>
      {!notif.isRead && (
        <div style={{ position: "absolute", top: 10, right: 10, width: 7, height: 7, borderRadius: "50%", background: notif.color }} />
      )}
      <button type="button" {...handlers} onClick={onClick} aria-label={`${notif.title} 알림`} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "12px 14px 12px 17px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
            {notif.icon}
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
              <span style={{ color: INK(readTone), fontSize: 12, fontWeight: 700 }}>{notif.title}</span>
              <span style={{ color: INK(0.88), fontSize: 10.2, fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>{notif.time}</span>
            </div>
            <div style={{ color: INK(bodyTone), fontSize: 11, lineHeight: 1.5 }}>{notif.desc}</div>
            <div style={{ color: INK(0.88), fontSize: 10.2, marginTop: 3, fontWeight: 800 }}>{notif.sub}</div>
          </div>
        </div>
      </button>
    </div>
  );
}

export default function WeatherON_H3({ navigate, routeState = {} } = {}) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);
  const [activeTab, setActiveTab] = useState("홈");
  const [selectedNotif, setSelectedNotif] = useState(notifications[1]);
  const closeBtn = usePressTint();
  const routeTab = (id) => {
    setActiveTab(id);
    if (id === "홈") navigate?.("H1");
    if (id === "코디") navigate?.("C1");
    if (id === "출발") navigate?.("G1");
    if (id === "MY") navigate?.("M1");
    if (id === "소셜") navigate?.("S0");
  };
  const openNotification = (notif) => {
    setSelectedNotif(notif);
    if (notif.link === "H5") navigate?.("H5");
    if (notif.link === "H4") navigate?.("H4", { umbrellaSignalReviewed: true });
    if (notif.link === "G2") navigate?.("G2");
    if (notif.link === "H1 홈") navigate?.("H1");
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
        H3 · 알림 사이드바 · 하이브리드 크롬
      </div>

      {/* Phone Frame */}
      <div style={{
        width: 393, height: 852, borderRadius: 40, overflow: "hidden",
        position: "relative", flexShrink: 0,
        boxShadow: weatherTheme.phoneShadow,
        background: weatherTheme.gradient,
      }}>
        {/* Dimmed home area (left ~28%) */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "28%", height: "100%",
          background: "rgba(3,8,16,0.62)",
          zIndex: 2,
          display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80,
        }}>
          <div style={{ position: "absolute", top: 36, left: 22, color: "rgba(248,251,255,0.86)", fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>9:41</div>
          <div style={{ color: "rgba(248,251,255,0.76)", fontSize: 10, textAlign: "center", lineHeight: 1.8 }}>
            홈<br/>화면
          </div>
        </div>

        {/* Divider highlight */}
        <div style={{ position: "absolute", top: 0, left: "28%", width: 1, height: "100%", background: `linear-gradient(to bottom, transparent, ${INK(0.12)}, transparent)`, zIndex: 3 }} />

        {/* Notification Panel (right 72%) — Navy 틴트 블러(Liquid Glass 구조적 chrome) */}
        <div style={{
          position: "absolute", top: 0, right: 0, width: "72%", height: "100%",
          background: NAVY_DARK,
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          zIndex: 4,
          display: "flex", flexDirection: "column",
        }}>
          {/* Status Bar */}
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 16px 0", height:54, alignItems:'flex-end', color: INK(0.70), fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
            <span>●●● 5G</span>
          </div>

          {/* Panel Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 0" }}>
            <span style={{ color: INK(0.94), fontSize: 17, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}>알림</span>
            <button {...closeBtn.handlers} onClick={() => navigate?.("H1")} style={{
              width: 40, height: 40, borderRadius: 12, background: NAVY_DARK,
              border: `1px solid ${INK(0.10)}`, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: INK(0.70), fontSize: 14,
              position:'relative', overflow:'hidden', flexShrink: 0,
            }}>
              <PressTintOverlay pressed={closeBtn.pressed} tint={GOLD}/>
              닫기
            </button>
          </div>

          {/* Unread count */}
          <div style={{ padding: "6px 16px 10px" }}>
            <span style={{ color: INK(0.68), fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
              읽지 않음 2개
            </span>
          </div>

          {/* Notification List */}
          <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none", padding: "0 12px", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 108 }}>
            {notifications.map((notif, idx) => (
              <NotifCard
                key={idx}
                notif={notif}
                selected={selectedNotif.title === notif.title}
                onClick={() => openNotification(notif)}
              />
            ))}

            <div style={{ background: NAVY_DARK, borderRadius: 14, padding: "10px 12px", border: `1px solid ${INK(0.08)}` }}>
              <div style={{ color: INK(0.74), fontSize: 10.5, fontWeight: 800, marginBottom: 4, fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em" }}>알림</div>
              <div style={{ color: INK(0.72), fontSize: 10.8, lineHeight: 1.55 }}>
                선택 알림 · {selectedNotif.title} · 딥링크 {selectedNotif.link}
              </div>
            </div>

            <div style={{ textAlign: "center", padding: "8px 0", color: INK(0.68), fontSize: 10.2, fontFamily: "'DM Mono', monospace" }}>
              읽음 처리 · 최근 7일 보관
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{
          position: "absolute", bottom: 18, left: 16, right: 16, height: 64,
          background: NAVY_DARK, borderRadius: 24, border: `1px solid ${INK(0.08)}`,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          padding: "0 4px", boxShadow: "0 10px 24px rgba(0,0,0,0.45)", zIndex: 1,
        }}>
          {tabDefs.map(tab => (
            <TabItem key={tab.id} tab={tab} active={tab.id === activeTab} onClick={() => routeTab(tab.id)} />
          ))}
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · H3 알림 사이드바
      </div>
    </div>
  );
}
