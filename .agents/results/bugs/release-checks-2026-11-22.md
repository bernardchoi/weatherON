# 소규모 출시 점검, 2026-11-22

대상은 Daehyeons-Laptop의 bernardchoi/weatherON main 2b03964e. 외부 출시 보류.

- 원격 Source checks 44996663224의 Android 품질 검사 실패를 로컬에서 재현함. 위치·알림 단계의 이전 보조 버튼 문구 두 곳을 현재 사양에 맞추자 기존 검사 통과함.
- Android 빌드 준비 검사에서 위치 권한 단언 실패를 재현함. Expo public config가 android.permission.ACCESS_FINE_LOCATION을 반환하고 네이티브 매니페스트도 같은 권한을 선언함. 실제 출력 이름을 검사하도록 수정 후 통과함.
- 로컬 검사 29개 중 수정 후 27개 통과. Play 제출·폐쇄 테스트 준비 검사는 각각 9개·13개 미충족. 저장소의 준비 기록 기준임.
- 빌드 72의 1fe790bb에는 최신 온보딩이 없음. 후보 SHA의 Xcode Cloud·TestFlight 상태와 실기기 검증 필요. 원격 CI 재검증 필요.
- 별도 worktree의 Android 작은 화면 검사 변경은 기존 QA 작업임. stash 및 main 미병합 브랜치 없음. 원격 작업 폴더의 미커밋 상태는 미확인.
- 후속 확인으로 585e3d1c의 원격 Source checks와 Xcode Cloud 빌드 73 아카이브가 성공했고, TestFlight 내부 Team (Expo) 그룹에서 1.0.0 (73)이 테스트 중이었음. 실기기 설치·실행은 미확인. [빌드 73 기록](../../../docs/audits/testflight-build73-2026-11-22.md)
