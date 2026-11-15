# WeatherON 1.0.0 (69) 내부 TestFlight 배포 기록

2026-11-15 로컬 Mac에서 원격 main을 fetch함. 요청 범위는 코디 아이템 상세 전환 수정(252977b6)과 회귀 검사 수정(2e75fa2e). 둘 다 main에 포함됨. main 소스는 2e75fa2e6f6e696daa3fbb0086fa4df4dc3dbd9d. 다른 작업 폴더의 미커밋 Android 레이아웃 검사 수정은 배포 범위 밖이며 stash 없음.

Xcode Cloud의 WeatherON Default 워크플로에서 main을 수동 빌드함. 빌드 69의 커밋 표시 2e75fa2가 원격 SHA와 일치함. App Store Connect에서 빌드 69의 테스트 준비 완료를 확인한 뒤 내부 Team (Expo)에 추가함. 내부 그룹 목록의 1.0.0 (69) 상태는 테스트 중이며 그룹 테스터는 1명.

모바일 TypeScript와 check-native-navigation, check-outfit-commentary, check-ambient-motion 통과.

**실제 iPhone 검증 통과.** 2026-11-15 사용자가 내부 TestFlight 빌드 69에서 코디 아이템을 직접 눌렀고, 선택한 아이템이 깜빡이지 않고 코디 상세 화면으로 전환됨을 확인함.
