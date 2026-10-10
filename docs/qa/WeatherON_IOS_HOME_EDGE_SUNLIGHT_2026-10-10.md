# iOS Home 상하단 배경 연결·햇빛 강화 — 2026-10-10

## 범위와 원인

기존 HEAD `003606266ce68cbf4b9e55834fdc20916008db63` 및 다수 미커밋 변경을 보존했다. 저장소 AGENTS.md와 최신 준비 안내·햇빛 참조 QA 기록을 먼저 읽었다. 이 worktree와 상위 경로에는 관련 `.agents/skills`가 없었다. 실행 중인 xcodebuild/Metro는 없었고 기존 MCP 서버만 실행 중이었다.

홈 본문 내부에만 Ambient가 있었고 SafeAreaView/root, native ScreenStackItem content, BottomNav 외곽 래퍼가 각각 불투명 색을 칠했다. 이 때문에 상태바와 홈 인디케이터 쪽 배경이 본문과 분리됐다.

HomeAmbientHost/Portal로 동일 Ambient 한 장을 safe-area 밖 루트의 콘텐츠 뒤에 배치했다. iOS H1에서만 가림 래퍼를 투명하게 하며 다른 화면/Android의 기존 배경 선택은 보존한다. SafeAreaView의 네 방향 inset, ScrollView 크기, 하단 dock 위치·터치 영역·실제 UIKit 유리 표면은 유지한다. 읽기 보호 영역은 safe-area origin만큼 루트 좌표로 옮기고 터치 효과는 동일 origin 내부에서 원래 좌표를 사용한다. StatusBar는 기존 공통 테마의 dark-content/light-content 선택을 유지한다.

Reduce Transparency에서는 배경의 기존 불투명 바탕과 효과 생략 정책, 홈 제어 패널과 dock의 불투명 fallback을 보존한다. 투명 래퍼가 루트 바깥 앱을 비치게 하는 구조가 아니다. 테마/날씨 override나 기기 설정 변경은 없다.

## 햇빛

기존 실제 영상 관찰과 승인된 자체 구현을 바탕으로 상단 프레임 밖 광원·넓은 halo의 크기와 라이트 강도를 높이고 두 옅은 광선을 조금 더 또렷하게 했다. 기존 공통 native phase에서 이동·회전 폭을 소폭 확대하되 opacity는 0.60–0.88에서 0.86–0.94로 좁혀 밝기 출렁임을 줄였다. 투명 끝점과 overscan을 유지하며 전체 화면 단색 flash나 별도 타이머는 추가하지 않았다. 다크 강도는 유지했다. 실제 맑음+day/twilight 조건, 밤/비/흐림 생략, Reduce Motion/저전력/비활성 정지 정책은 그대로다. 새 영상 해석이나 에셋 추가는 없다.

## 검사

- mobile TypeScript noEmit, git diff --check 통과.
- Ambient response/surface: 실제 RN gradient parser, 태양시간/테마 분리, 밤/비/흐림 햇빛 생략, 접근성/전력/터치 lifecycle 및 새 루트 크기·좌표 확인 통과.
- 새 host 검사: 단일 배경 등록/해제, H1 이외 숨김, 원래 콘텐츠 유지, inline fallback 통과.
- home outing/forecast, viewport, weather icon, iOS home experience, native module 통합 검사 통과.
- 보수적 dark/clear 대비: 본문 6.97:1, muted 4.59:1, accentLabel 5.16:1. 두 테마와 기존 날씨 조합의 검사 기준 통과. 실제 접근성 사용자 체감 검사와 구분한다.

## 빌드·실기기

기존 QA workspace/project가 worktree에서는 빠져 있고 Git 밖 evidence/native-build-config에 보관되어 있었다. 동일 파일을 임시 복원하고 기존 설치된 node_modules를 임시 연결했다. 새 의존성 설치나 서명 변경은 없었다. Xcode 27, 기존 DerivedData, ARM64/jobs1의 증분 빌드 한 번으로 BUILD SUCCEEDED. codesign strict 검증 후 같은 iPhone에 덮어 설치·테스트 인자 없는 정상 실행 성공. 종료 후 임시 workspace/project와 node_modules 연결만 제거했다. 기존 보관본과 모든 사용자 변경은 유지했다.

설치 JS bundle SHA256: `bf64de19bcc49e215021436398950754b8e32a4c0fac11055c599af55f5c03ec`.

실제 1320×2868 캡처에서 라이트 상태바와 홈 본문·하단의 배경 연결, 상단 오른쪽의 확산 빛, 기존 정보 배치와 유리/코디 표면을 확인했다. 상태바 글자·아이콘은 검정이다. viewport/content 758/758pt, fontScale .882, overflow 0pt. 실제 reliable=1, clear=1, solarPhase=3(day), lowPowerMode/reducedMotion/reducedTransparency=false였다. 기기 설정을 바꾸지 않았다.

18.431초 간격 원본 캡처의 문자·아이콘·glass·사진·시스템 UI를 피한 ROI에서 평균 RGB 채널 차이는 상단 빛 1.863, 열린 오른쪽 바탕 0.999였다. 배경 픽셀이 실제 바뀌었다는 근거이며 햇빛만의 기여/움직임 자연스러움/연속 체감을 증명하지 않는다.

## 남은 확인

기존 App Attest assertion 경고 1회가 진단에 기록됐고 warning toast가 캡처에서 dock 일부를 가렸다. 경고를 숨기거나 해결했다고 주장하지 않는다. 상하단 열린 배경 연결은 보이지만 dock 전체 최종 외관은 가림 제한이 있다. 실제 터치/스크롤/H5 왕복, 다크·큰 글씨·Reduce Transparency·VoiceOver·장시간 성능 전체 PASS는 아니다. 기존 사용자 햇빛 가독성 PASS를 이 항목들로 확대하지 않았다.

개인 위치가 있는 캡처와 기기 식별자·로그는 Git 밖 로컬 evidence/home-edge-sunlight-20261010에 보관했다. 커밋·푸시·병합·Cloud/EAS 빌드·배포·앱 데이터 삭제는 하지 않았다.

## 사용자 승인 후 커밋 전 최종 확인

사용자가 여기까지 승인된 홈 후속 변경의 커밋·작업 브랜치 일반 푸시를 요청했다. 위의 미커밋 기록은 설치 당시 상태다. HEAD 0036062 이후의 홈 정보 역할/실제 체감/목적지 선택시각/H5, 가독성·확정 레이아웃·UIKit glass, 테마 override 제거, 낮 배경·햇빛·safe-area 연결 및 관련 검사·QA를 하나의 통합 변경으로 검토했다. 개인 자료·원본 영상/캡처·기기 식별자·인증/서명 설정·빌드 산출물은 포함하지 않는다.

최종 타입 검사, home outing/host/viewport/weather icon, Ambient response/surface 및 대비, iOS home experience/native modules/reliability, shared rules/correctness/weather-outfit/review regressions, localization 검사를 재실행해 모두 통과했다. 앱 소스는 위 설치본 이후 변경하지 않았으며 Xcode 빌드·설치는 다시 수행하지 않았다.

사용자 PASS는 승인된 가독성·확정 레이아웃과 직전 햇빛의 읽기 방해 없음 범위다. 새 강화본의 사용자 체감, 실제 터치·스크롤·다크·접근성 전체 검증은 여전히 미완료다. main 병합·배포·수동 CI 실행은 이 승인에 포함되지 않는다.
