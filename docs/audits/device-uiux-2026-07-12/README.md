# WeatherON 실기기 UI·UX 감사 및 개선 검증

- 일시: 2026-07-12 KST
- 기기: A142 · Android 16 · 1080×2400
- 앱: `com.weatheron.mobile` 로컬 release APK
- 범위: 첫 실행, 온보딩, 홈, 코디, 출발, 목적지 검색·저장·케어, 알림 권한, MY, 표시 설정, 라이트·다크 표현, 탭 전환, 작은 화면 회귀

## 결과

| 단계 | 확인 내용 | 상태 |
|---:|---|---|
| 1 | 콜드 스타트·첫 실행·온보딩 3단계 | 양호 |
| 2 | 홈 날씨·코디·목적지·행동 카드 | 양호 |
| 3 | 코디 추천·상세·저장·옷장·프리셋 | 양호 |
| 4 | 출발 목록·목적지 상세·시간·이동수단·반복 알림 | 양호 |
| 5 | 목적지 검색·결과 선택·저장·권한 연결 | 개선 후 양호 |
| 6 | 알림 사이드바·센터·딥링크·권한 복구 | 양호 |
| 7 | MY·권한·알림·표시·정책 | 개선 후 양호 |
| 8 | 라이트·다크·시스템 테마 | 양호 |
| 9 | 탭 전환·눌림 피드백·모션 감소 | 개선 후 양호 |
| 10 | 390×844·대형 폰 레이아웃 자동 회귀 | 통과 |

## 수정한 문제

1. 키보드가 열린 목적지 검색에서 결과 첫 탭이 선택되지 않고 키보드만 닫히던 문제 수정함.
2. 공통 카드·목록 행·뒤로가기·검색 결과·목적지 제어에 120ms 눌림 레이어 추가함.
3. 탭과 CTA 눌림 시간을 각각 120ms·110ms로 통일함.
4. 화면 전환을 320ms에서 240ms로 줄이고 cubic-out으로 정리함.
5. OS 모션 감소 설정에서 화면 이동·페이드가 생략되도록 수정함.
6. `투명 효과`를 `투명 효과 줄이기`로 명확히 바꾸고 스위치 노브 이동 애니메이션을 추가함.
7. 코디·알림·목적지·작은 화면 자동 QA의 오래된 문구·오버레이 처리 기준을 현재 UI와 맞춤.

## 성능·안정성

- 빠른 4탭 반복 전환: 최신 프레임 기준 jank 0.41%, missed vsync 0회
- 앱 PID 필터 logcat: FATAL, ANR, ReactNativeJS 런타임 오류 없음
- release APK 빌드·설치 성공

## 검증

- `npx tsc --noEmit -p apps/mobile/tsconfig.json` 통과
- `npm run check:android-product-quality` 통과
- `npm run export:android-web` 통과
- `npm run check:android-core-flow` 통과
- `npm run check:android-small-screen-layout` 통과
- 전체 통합 명령은 기존 native `versionName 0.1.0` preflight 기준 때문에 중단됨. UI 변경 회귀와 무관함.

## 주요 증거

- `19b-after-home-stable.png`: 개선 버전 홈
- `21-after-search-one-tap-selected.png`: 키보드 열린 상태에서 한 번 탭해 선택 완료
- `23b-display-settings-final-stable.png`: 명확해진 투명 효과 설정과 ON 상태
- `22-motion-after.mp4`: 홈·코디·출발·MY 전환 녹화

## 한계

- Android 실기기 1대 기준임.
- TalkBack 실제 탐색, iPhone VoiceOver, 120Hz 기기, 저사양 기기, 장시간 배터리·메모리 검증은 별도 세션 필요함.
