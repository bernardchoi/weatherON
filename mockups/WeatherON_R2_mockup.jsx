import { useEffect } from "react";
import { getWeatherONTheme, ink, mist } from "./WeatherON_theme_tokens.js";

/* ── WeatherON R2 · 개인정보처리방침 (하이브리드 크롬) ─────────────────
   와이어프레임 R2 기준: 6개 섹션 정책 본문
   - 광고 SDK 수집 데이터 + Google 제3자 제공 고지
   - 위치정보 수집 안내 + 보호책임자 연락처 포함
   - A3 약관 동의의 "개인정보 수집·이용 동의" 항목과 동일 문서
     (본문 출처: WeatherON_약관_정책.md)
   디자인: brand/WeatherON_디자인_정체성_가이드.md 4-1장 하이브리드 크롬 채택안
─────────────────────────────────────────────────────────────────────── */

let NAVY      = '#15294D';
let NAVY_DARK = '#102140';
let PANEL     = '#1A3360';
let PANEL_L1  = '#2A5D8F';
let GOLD      = '#F0A020';
let ON_GOLD  = '#10243F';
let MIST      = '#869EBC';
let INK       = (a) => `rgba(232,237,246,${a})`;
let MISTLITE  = (a) => `rgba(168,196,224,${a})`;

function BackArrowSVG() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={INK(0.82)} strokeWidth={1.8} strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

const sections = [
  { title: "1. 수집하는 개인정보 항목", body: "광고 식별자, 기기정보, 네트워크 기반 위치, 앱 사용 데이터" },
  { title: "2. 제3자 제공", body: "Google AdMob — 맞춤 광고 제공 목적" },
  { title: "3. 광고 식별자 안내", body: "Google 광고 정책 페이지 안내 — 설정에서 맞춤광고 수신을 거부할 수 있어요" },
  { title: "4. 보관기간 및 파기", body: "회원 탈퇴 시 즉시 파기" },
  { title: "5. 이용자 권리", body: "개인정보 열람·정정·삭제를 요청할 권리가 있어요" },
  { title: "6. 개인정보 보호책임자", body: "문의: privacy@weatheron.kr" },
];


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
export default function WeatherON_R2({ navigate, routeState = {} } = {}) {
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
      <div style={{ color: MISTLITE(0.38), fontSize: 11, letterSpacing: 2, marginBottom: 16, fontFamily: "'DM Mono', monospace", textTransform:'uppercase' }}>
        R2 · 개인정보처리방침 · 하이브리드 크롬
      </div>

      <div style={{
        width: 393, height: 852, borderRadius: 40, overflow: "hidden",
        position: "relative", flexShrink: 0,
        boxShadow: weatherTheme.phoneShadow,
        background: weatherTheme.gradient,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 28px 10px", height:54, position:'absolute', top:0, left:0, right:0, color: INK(0.94), fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
          <span>9:41</span>
          <span style={{ fontSize: 13, color: INK(0.70) }}>●●● 5G</span>
        </div>

        <div style={{ paddingTop: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 0" }}>
            <button onClick={() => navigate?.("R1")} style={{ background: NAVY_DARK, border: `1px solid ${INK(0.10)}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackArrowSVG/>
            </button>
            <span style={{ color: INK(0.94), fontSize: 16, fontWeight: 700 }}>개인정보처리방침</span>
          </div>

          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16, height: "calc(852px - 130px)", overflowY: "auto", paddingBottom: 90 }}>
            <div style={{ color: INK(0.74), fontSize: 10.5, fontFamily: "'DM Mono',monospace" }}>최종 업데이트 2026.06.20</div>
            {sections.map(s => (
              <div key={s.title}>
                <div style={{ color: INK(0.94), fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
                <div style={{ color: INK(0.78), fontSize: 12.5, lineHeight: 1.8 }}>{s.body}</div>
              </div>
            ))}
            <div style={{ background: PANEL, borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ color: INK(0.76), fontSize: 11, lineHeight: 1.7 }}>
                본 문서는 weatheron.kr 웹사이트에도 동일하게 게시됩니다. A3 약관 동의의 "개인정보 수집·이용 동의" 항목과 동일한 문서입니다.
              </div>
            </div>
            <div style={{ background: PANEL, borderRadius: 14, padding: "12px 14px", border: `1px solid ${GOLD}33` }}>
              <div style={{ color: GOLD, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.10em", fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>문서</div>
              <div style={{ color: INK(0.78), fontSize: 12, lineHeight: 1.55 }}>
                개인정보 문서 · 6개 섹션 · A3 약관 동의와 동일 본문
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ color: MISTLITE(0.30), fontSize: 11, marginTop: 16, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
        WeatherON · R2 개인정보처리방침
      </div>
    </div>
  );
}
