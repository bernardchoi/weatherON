import { useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

let NAVY_DARK = "#102140";
let PANEL = "#1A3360";
let PANEL_L1 = "#2A5D8F";
let GOLD = "#F0A020";
let ON_GOLD = "#10243F";
let INK = (a) => `rgba(232,237,246,${a})`;
let MISTLITE = (a) => `rgba(168,196,224,${a})`;

function applyWeatherONTheme(mode) {
  const theme = getWeatherONTheme(mode);
  NAVY_DARK = theme.NAVY_DARK;
  PANEL = theme.PANEL;
  PANEL_L1 = theme.PANEL_L1;
  GOLD = theme.GOLD;
  ON_GOLD = theme.onGold || ON_GOLD;
  INK = (a) => ink(theme, a);
  MISTLITE = (a) => mist(theme, a);
  return theme;
}

function BackArrowSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function SectionBlock({ section }) {
  return (
    <div style={{ background: PANEL, border: `1px solid ${INK(0.08)}`, borderRadius: 16, padding: "14px 14px" }}>
      <div style={{ color: INK(0.94), fontSize: 13.5, fontWeight: 800, marginBottom: 7 }}>{section.title}</div>
      <div style={{ color: INK(0.78), fontSize: 12.5, lineHeight: 1.75, whiteSpace: "pre-line" }}>{section.body}</div>
    </div>
  );
}

export default function WeatherONPolicyDocument({ navigate, routeState = {}, doc }) {
  const weatherTheme = applyWeatherONTheme(routeState?.themeMode);

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
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>
        {doc.id} · {doc.title} · 하이브리드 크롬
      </div>

      <div style={{
        width: 393, height: 852, borderRadius: 40, overflow: "hidden",
        position: "relative", flexShrink: 0,
        boxShadow: weatherTheme.phoneShadow,
        background: weatherTheme.gradient,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 28px 10px", height: 54, position: "absolute", top: 0, left: 0, right: 0, color: INK(0.94), fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
          <span>9:41</span>
          <span style={{ fontSize: 13, color: INK(0.70) }}>●●● 5G</span>
        </div>

        <div style={{ paddingTop: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 0" }}>
            <button onClick={() => navigate?.("R1")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: INK(0.94), fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>{doc.title}</div>
              <div style={{ color: INK(0.68), fontSize: 10.5, marginTop: 2 }}>최종 업데이트 {doc.updatedAt}</div>
            </div>
          </div>

          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 12, height: "calc(852px - 126px)", overflowY: "auto", paddingBottom: 34 }}>
            <div style={{ background: `linear-gradient(135deg, ${PANEL_L1}, ${PANEL})`, borderRadius: 18, padding: "15px 15px", border: `1px solid ${INK(0.10)}` }}>
              <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 5 }}>{doc.kicker}</div>
              <div style={{ color: INK(0.92), fontSize: 14, fontWeight: 800, lineHeight: 1.45 }}>{doc.summary}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 11 }}>
                {doc.chips.map((chip) => (
                  <span key={chip} style={{ height: 28, padding: "0 10px", borderRadius: 999, background: NAVY_DARK, color: INK(0.78), fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", border: `1px solid ${INK(0.08)}` }}>{chip}</span>
                ))}
              </div>
            </div>

            {doc.sections.map((section) => (
              <SectionBlock key={section.title} section={section}/>
            ))}

            <div style={{ background: NAVY_DARK, border: `1px solid ${GOLD}33`, borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>문서 고지</div>
              <div style={{ color: INK(0.78), fontSize: 11.5, lineHeight: 1.65 }}>
                {doc.notice}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · {doc.id} {doc.title}
      </div>
    </div>
  );
}
