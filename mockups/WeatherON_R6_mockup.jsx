import WeatherONPolicyDocument from "./WeatherON_policy_document.jsx";

const locationDoc = {
  id: "R6",
  title: "위치기반서비스 이용약관",
  updatedAt: "2026.06.25",
  kicker: "위치 서비스 약관",
  summary: "현재 위치, 저장 목적지, 출발 알림에 위치정보가 어떻게 쓰이는지 확인해요.",
  chips: ["현재 위치", "목적지", "출발 알림", "동의 철회"],
  sections: [
    {
      title: "제1조 목적",
      body: "이 약관은 WeatherON의 위치기반서비스 이용 조건과 위치정보 처리 기준을 정합니다.",
    },
    {
      title: "제2조 위치기반서비스 내용",
      body: "현재 위치 날씨 제공, 출발지·목적지 날씨 비교, 출발 시각 역산, 우산·신발 알림, 목적지 준비 가이드를 제공합니다.",
    },
    {
      title: "제3조 위치정보 수집 방법",
      body: "위치정보는 이용자가 위치 권한을 허용한 경우 기기 GPS, Wi-Fi, 기지국 정보를 통해 수집됩니다.\n이용자가 직접 입력한 장소명, 주소, 목적지 라벨도 위치 서비스에 사용할 수 있습니다.",
    },
    {
      title: "제4조 보유와 삭제",
      body: "실시간 위치는 서비스 제공 후 최소 범위로 처리하고 장기 보관하지 않습니다.\n저장 목적지는 이용자가 삭제하거나 회원 탈퇴할 때까지 보관될 수 있습니다.",
    },
    {
      title: "제5조 동의 철회",
      body: "이용자는 기기 설정 또는 WeatherON 설정에서 언제든 위치 권한을 변경할 수 있습니다.\n권한을 끄면 현재 위치 기반 추천과 출발 알림 정확도가 제한될 수 있습니다.",
    },
    {
      title: "제6조 보호책임자",
      body: "위치정보 관련 문의는 개인정보 보호책임자 또는 고객센터를 통해 요청할 수 있습니다.\n정식 출시 전 담당자명과 연락처는 확정 고지합니다.",
    },
  ],
  notice: "한국 위치정보법 기준 검토가 필요한 문서임. 정식 출시 전 위치정보사업 신고 필요 여부와 문구 확정 필요.",
};

export default function WeatherON_R6(props) {
  return <WeatherONPolicyDocument {...props} doc={locationDoc}/>;
}
