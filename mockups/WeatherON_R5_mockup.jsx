import WeatherONPolicyDocument from "./WeatherON_policy_document.jsx";

const termsDoc = {
  id: "R5",
  title: "이용약관",
  updatedAt: "2026.06.25",
  kicker: "서비스 약관",
  summary: "WeatherON 사용 조건, 회원·게스트 이용 범위, 서비스 변경 및 책임 기준을 확인해요.",
  chips: ["회원/게스트", "서비스 범위", "광고", "면책"],
  sections: [
    {
      title: "제1조 목적",
      body: "이 약관은 WeatherON이 제공하는 날씨 기반 생활 준비 서비스의 이용 조건과 회사·이용자 간 권리, 의무, 책임 사항을 정합니다.",
    },
    {
      title: "제2조 서비스 내용",
      body: "WeatherON은 현재·시간별 날씨, 코디 추천, 우산·신발 추천, 목적지 날씨 비교, 출발 알림, 여행 준비 가이드를 제공합니다.\n일부 저장·동기화·프리미엄 기능은 계정 연결 후 사용할 수 있습니다.",
    },
    {
      title: "제3조 회원가입과 게스트 이용",
      body: "이용자는 회원가입 없이 기본 날씨와 추천 기능을 먼저 사용할 수 있습니다.\n계정이 필요한 기능을 사용할 때 지역 환경에 맞는 로그인 수단이 자동 추천됩니다.",
    },
    {
      title: "제4조 서비스 변경",
      body: "회사는 운영상 또는 기술상 필요에 따라 서비스 일부를 수정, 중단, 종료할 수 있습니다.\n중대한 변경은 앱 내 공지 또는 등록된 연락 수단으로 사전 안내합니다.",
    },
    {
      title: "제5조 이용자의 의무",
      body: "이용자는 허위 정보 입력, 타인의 권리 침해, 자동화된 비정상 접근, 서비스 운영 방해 행위를 해서는 안 됩니다.",
    },
    {
      title: "제6조 광고와 면책",
      body: "WeatherON은 서비스 운영을 위해 광고를 표시할 수 있습니다.\n날씨·코디·출발 알림은 외부 데이터와 예측을 기반으로 한 참고 정보이며, 최종 판단은 이용자에게 있습니다.",
    },
  ],
  notice: "정식 서비스 적용 전 회사명, 시행일, 관할, 연락처는 법무 검토 후 확정 필요.",
};

export default function WeatherON_R5(props) {
  return <WeatherONPolicyDocument {...props} doc={termsDoc}/>;
}
