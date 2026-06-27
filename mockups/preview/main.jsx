import React, { useCallback, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import WeatherON_A1 from "../WeatherON_A1_mockup.jsx";
import WeatherON_A2 from "../WeatherON_A2_mockup.jsx";
import WeatherON_A3 from "../WeatherON_A3_mockup.jsx";
import WeatherON_C1 from "../WeatherON_C1_mockup.jsx";
import WeatherON_C2 from "../WeatherON_C2_mockup.jsx";
import WeatherON_C3 from "../WeatherON_C3_mockup.jsx";
import WeatherON_C4 from "../WeatherON_C4_mockup.jsx";
import WeatherON_H1 from "../WeatherON_H1_mockup.jsx";
import WeatherON_H2 from "../WeatherON_H2_mockup.jsx";
import WeatherON_H3 from "../WeatherON_H3_mockup.jsx";
import WeatherON_H4 from "../WeatherON_H4_mockup.jsx";
import WeatherON_H5 from "../WeatherON_H5_mockup.jsx";
import WeatherON_O1 from "../WeatherON_O1_mockup.jsx";
import WeatherON_O2 from "../WeatherON_O2_mockup.jsx";
import WeatherON_O3 from "../WeatherON_O3_mockup.jsx";
import WeatherON_O4 from "../WeatherON_O4_mockup.jsx";
import WeatherON_O5 from "../WeatherON_O5_mockup.jsx";
import WeatherON_O6 from "../WeatherON_O6_mockup.jsx";
import WeatherON_G1 from "../WeatherON_G1_mockup.jsx";
import WeatherON_G2 from "../WeatherON_G2_mockup.jsx";
import WeatherON_G3 from "../WeatherON_G3_mockup.jsx";
import WeatherON_G4 from "../WeatherON_G4_mockup.jsx";
import WeatherON_G5 from "../WeatherON_G5_mockup.jsx";
import WeatherON_G6 from "../WeatherON_G6_mockup.jsx";
import WeatherON_P1 from "../WeatherON_P1_mockup.jsx";
import WeatherON_P2 from "../WeatherON_P2_mockup.jsx";
import WeatherON_P3 from "../WeatherON_P3_mockup.jsx";
import WeatherON_M1 from "../WeatherON_M1_mockup.jsx";
import WeatherON_M2 from "../WeatherON_M2_mockup.jsx";
import WeatherON_M3 from "../WeatherON_M3_mockup.jsx";
import WeatherON_A4 from "../WeatherON_A4_mockup.jsx";
import WeatherON_R1 from "../WeatherON_R1_mockup.jsx";
import WeatherON_R2 from "../WeatherON_R2_mockup.jsx";
import WeatherON_R3 from "../WeatherON_R3_mockup.jsx";
import WeatherON_R4 from "../WeatherON_R4_mockup.jsx";
import WeatherON_R5 from "../WeatherON_R5_mockup.jsx";
import WeatherON_R6 from "../WeatherON_R6_mockup.jsx";
import WeatherON_R7 from "../WeatherON_R7_mockup.jsx";
import WeatherON_W1 from "../WeatherON_W1_mockup.jsx";
import WeatherON_W2 from "../WeatherON_W2_mockup.jsx";
import WeatherON_W3 from "../WeatherON_W3_mockup.jsx";
import WeatherON_W4 from "../WeatherON_W4_mockup.jsx";
import WeatherON_S0 from "../WeatherON_S0_mockup.jsx";
import WeatherON_S1 from "../WeatherON_S1_mockup.jsx";
import WeatherON_S2 from "../WeatherON_S2_mockup.jsx";
import WeatherON_S3 from "../WeatherON_S3_mockup.jsx";
import { getWeatherONTheme } from "../WeatherON_theme_tokens.js";
import "./preview.css";

const screens = [
  { id: "A1", title: "스플래시", component: WeatherON_A1 },
  { id: "H1", title: "게스트 홈", component: WeatherON_H1 },
  { id: "A2", title: "계정 연결", component: WeatherON_A2 },
  { id: "A3", title: "약관 동의", component: WeatherON_A3 },
  { id: "C1", title: "코디 메인", component: WeatherON_C1 },
  { id: "C2", title: "내 옷장", component: WeatherON_C2 },
  { id: "C3", title: "옷 등록", component: WeatherON_C3 },
  { id: "C4", title: "코디 상세", component: WeatherON_C4 },
  { id: "H2", title: "위치 변경", component: WeatherON_H2 },
  { id: "H3", title: "알림 사이드바", component: WeatherON_H3 },
  { id: "H4", title: "우산 추천", component: WeatherON_H4 },
  { id: "H5", title: "강수 타임라인", component: WeatherON_H5 },
  { id: "O1", title: "스플래시", component: WeatherON_O1 },
  { id: "O2", title: "기능 소개", component: WeatherON_O2 },
  { id: "O3", title: "권한 요청", component: WeatherON_O3 },
  { id: "O4", title: "스타일 태그", component: WeatherON_O4 },
  { id: "O5", title: "알림 시간", component: WeatherON_O5 },
  { id: "O6", title: "목적지 등록", component: WeatherON_O6 },
  { id: "G1", title: "출발 메인", component: WeatherON_G1 },
  { id: "G2", title: "목적지 알림", component: WeatherON_G2 },
  { id: "G3", title: "여행 플래너", component: WeatherON_G3 },
  { id: "G4", title: "도보여행", component: WeatherON_G4 },
  { id: "G5", title: "AI 종주", component: WeatherON_G5 },
  { id: "G6", title: "프리미엄", component: WeatherON_G6 },
  { id: "P1", title: "목적지 추가", component: WeatherON_P1 },
  { id: "P2", title: "준비 가이드", component: WeatherON_P2 },
  { id: "P3", title: "목적지 필터", component: WeatherON_P3 },
  { id: "M1", title: "마이 메인", component: WeatherON_M1 },
  { id: "M2", title: "알림 설정", component: WeatherON_M2 },
  { id: "M3", title: "전역 설정", component: WeatherON_M3 },
  { id: "A4", title: "계정 관리", component: WeatherON_A4 },
  { id: "R1", title: "정책 허브", component: WeatherON_R1 },
  { id: "R2", title: "개인정보", component: WeatherON_R2 },
  { id: "R3", title: "광고 동의", component: WeatherON_R3 },
  { id: "R4", title: "광고 배치", component: WeatherON_R4 },
  { id: "R5", title: "이용약관", component: WeatherON_R5 },
  { id: "R6", title: "위치 약관", component: WeatherON_R6 },
  { id: "R7", title: "오픈소스", component: WeatherON_R7 },
  { id: "W1", title: "날씨 제보 홈", component: WeatherON_W1 },
  { id: "W2", title: "날씨 제보", component: WeatherON_W2 },
  { id: "W3", title: "제보 완료", component: WeatherON_W3 },
  { id: "W4", title: "제보 이력", component: WeatherON_W4 },
  { id: "S0", title: "온스퀘어 시작", component: WeatherON_S0 },
  { id: "S1", title: "내 온스퀘어", component: WeatherON_S1 },
  { id: "S2", title: "날씨 노트", component: WeatherON_S2 },
  { id: "S3", title: "날씨 리액션", component: WeatherON_S3 },
];

const SESSION_STATE_KEYS = ["accountLinked", "permissionReady", "locationReady", "premiumActive"];
const SETTINGS_STATE_KEYS = [
  "styleProfileSaved",
  "selectedStyles",
  "fit",
  "age",
  "locationManaged",
  "smartCareEnabled",
  "alertAdvancedOpen",
  "rainDetail",
  "routineAlert",
  "bedtimeAlert",
  "destinationAlert",
  "quietHours",
  "umbrellaSignalReviewed",
];

function extractSessionState(nextState = {}) {
  return SESSION_STATE_KEYS.reduce((updates, key) => {
    if (typeof nextState[key] === "boolean") updates[key] = nextState[key];
    return updates;
  }, {});
}

function extractSettingsState(nextState = {}) {
  return SETTINGS_STATE_KEYS.reduce((updates, key) => {
    if (nextState[key] !== undefined) updates[key] = nextState[key];
    return updates;
  }, {});
}

function PreviewApp() {
  const [activeId, setActiveId] = useState("A1");
  const [routeState, setRouteState] = useState({});
  const [sessionState, setSessionState] = useState({});
  const [settingsState, setSettingsState] = useState({});
  const [careState, setCareState] = useState({});
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [themeMode, setThemeMode] = useState("dark");
  const previewTheme = getWeatherONTheme(themeMode);
  const active = useMemo(() => screens.find((screen) => screen.id === activeId) ?? screens[0], [activeId]);
  const ActiveScreen = active.component;
  const navigate = useCallback((screenId, nextState = {}) => {
    setActiveId(screenId);
    setRouteState(nextState);
    if (nextState.clearAccountData) {
      setCareState({});
      setSavedDestinations([]);
      setSettingsState({});
    } else {
      setSettingsState((prev) => ({ ...prev, ...extractSettingsState(nextState) }));
    }
    setSessionState((prev) => ({ ...prev, ...extractSessionState(nextState) }));
  }, []);
  const activeRouteState = useMemo(() => ({ ...routeState, ...settingsState, ...sessionState, themeMode }), [routeState, settingsState, sessionState, themeMode]);
  const setDestinationCare = useCallback((destination, on = true) => {
    if (!destination?.name) return;
    setCareState((prev) => ({ ...prev, [destination.name]: on }));
  }, []);
  const addSavedDestination = useCallback((destination) => {
    if (!destination?.name) return;
    setSavedDestinations((prev) => {
      const next = prev.filter((item) => item.name !== destination.name);
      return [destination, ...next];
    });
  }, []);
  const updateSettingsState = useCallback((nextState = {}) => {
    setSettingsState((prev) => ({ ...prev, ...extractSettingsState(nextState) }));
  }, []);

  return (
    <main className={`preview-shell theme-${themeMode}`} style={{ background: previewTheme.shellBg }}>
      <aside className="preview-nav" aria-label="WeatherON mockup screens">
        <div className="preview-brand">
          <span>WeatherON</span>
          <strong>목업</strong>
        </div>
        <div className="preview-theme-toggle" aria-label="Theme mode">
          {[
            { id: "light", label: "라이트" },
            { id: "dark", label: "다크" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={themeMode === item.id ? "active" : ""}
              onClick={() => setThemeMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="preview-list">
          {screens.map((screen) => (
            <button
              key={screen.id}
              type="button"
              className={screen.id === active.id ? "active" : ""}
              onClick={() => navigate(screen.id)}
            >
              <span>{screen.id}</span>
              {screen.title}
            </button>
          ))}
        </div>
      </aside>
      <section className="preview-stage" aria-label={`${active.id} ${active.title}`} style={{ background: previewTheme.stageBg }}>
        <ActiveScreen
          navigate={navigate}
          routeState={activeRouteState}
          careState={careState}
          setDestinationCare={setDestinationCare}
          savedDestinations={savedDestinations}
          addSavedDestination={addSavedDestination}
          updateSettingsState={updateSettingsState}
        />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<PreviewApp />);
