import WeatherONPolicyDocument from "./WeatherON_policy_document.jsx";

const licenseDoc = {
  id: "R7",
  title: "오픈소스 라이선스",
  updatedAt: "2026.06.25",
  kicker: "라이선스 고지",
  summary: "WeatherON 앱에서 사용하는 주요 오픈소스와 SDK 라이선스 고지 사항을 확인해요.",
  chips: ["React", "Vite", "아이콘", "광고 SDK"],
  sections: [
    {
      title: "React",
      body: "Copyright Meta Platforms, Inc. and affiliates.\nLicense: MIT\nWeatherON 목업 및 앱 UI 구성에 사용합니다.",
    },
    {
      title: "Vite",
      body: "Copyright Evan You and Vite contributors.\nLicense: MIT\n목업 빌드와 프론트엔드 개발 환경에 사용합니다.",
    },
    {
      title: "Mermaid",
      body: "License: MIT\n기획 플로우차트 문서 생성과 시각화에 사용합니다.",
    },
    {
      title: "아이콘 및 이미지 애셋",
      body: "앱 아이콘, 의류 이미지, 목적지 이미지는 WeatherON 자체 제작 또는 라이선스 확인된 애셋만 사용합니다.\n외부 아이콘 라이브러리 사용 시 각 라이선스를 이 페이지에 추가합니다.",
    },
    {
      title: "광고·분석 SDK",
      body: "Google AdMob, Google UMP 등 외부 SDK는 실제 도입 시 각 SDK 약관과 개인정보 처리 조건을 별도 고지합니다.",
    },
  ],
  notice: "현재는 MVP 목업 기준 고지임. 실제 앱 배포 전 패키지 목록 자동 추출 결과와 SDK 라이선스 전문으로 갱신 필요.",
};

export default function WeatherON_R7(props) {
  return <WeatherONPolicyDocument {...props} doc={licenseDoc}/>;
}
