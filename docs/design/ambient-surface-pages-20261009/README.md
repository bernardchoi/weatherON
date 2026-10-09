# WeatherON Ambient Surface — 전체 페이지 정적 시안

2026-10-09에 승인된 최종 10개 분할 패키지입니다. 아래 각 index.html에서 해당 묶음의 원본 PNG를 볼 수 있습니다. PNG와 하위 패키지의 index·manifest·설명·CSV는 승인 ZIP의 바이트를 그대로 보존했습니다. ZIP 자체는 중복 저장하지 않았습니다.

## 범위

- 기본 31개 화면 × iOS/Android 라이트·다크 4모드 = 124뷰를 대표 상태군 19개와 함께 104개 PNG 보드에 담았습니다. A1 부록은 31개 화면에 포함됩니다.
- 출시 숨김 16개 route는 범위 밖입니다. 모든 입력값·OS UI·상태 순열을 포함하지 않습니다.
- MY는 중앙 세로형 최종 core v3이며 이전 core 이미지는 포함하지 않습니다.
- 정적 디자인 시안입니다. 앱 적용, 실제 로그인·동기화·예약, 네이티브 동작·접근성·실기기 검증 완료를 의미하지 않습니다.
- 아이콘 구현 기준은 기존 `assets/brand/ambient-surface-ui-icons-final-v1-20261009/`의 확정 SVG입니다. 이번 추가는 앱 코드나 기존 애셋을 변경하지 않습니다.

## 묶음 찾기

| 묶음 | PNG | 보기 |
| --- | ---: | --- |
| 기본 탭 · 날씨 | 10 | [index.html](WeatherON-01A-Core-Weather-20261009/index.html) |
| 위치 · 알림 | 8 | [index.html](WeatherON-01B-Location-Alerts-20261009/index.html) |
| 코디 · 옷장 기본 화면 | 8 | [index.html](WeatherON-02A-Outfit-Main-20261009/index.html) |
| 코디 상태 · 필터 · 사진정보 | 12 | [index.html](WeatherON-02B-Outfit-Filters-Metadata-20261009/index.html) |
| 사진 진행 · 코디 경계 상태 | 8 | [index.html](WeatherON-02C-Outfit-Photo-Transitions-20261009/index.html) |
| 목적지 기본 화면 · 시간·교통·일정 | 8 | [index.html](WeatherON-03A-Destination-Main-20261009/index.html) |
| 목적지 피드백 · 경로 예외 | 8 | [index.html](WeatherON-03B-Destination-States-20261009/index.html) |
| 계정 · 설정 · 정책 iOS | 14 | [index.html](WeatherON-04A-Account-iOS-20261009/index.html) |
| 계정 · 설정 · 정책 Android | 14 | [index.html](WeatherON-04B-Account-Android-20261009/index.html) |
| 시작 · 온보딩 · A1 부록 | 14 | [index.html](WeatherON-05-Onboarding-20261009/index.html) |

## 원본 보존 및 검증

온보딩 원본의 README·index·manifest에는 이전 전달 구성인 “전체 5개 묶음” 안내가 남아 있습니다. 해당 문구는 원본 보존을 위해 유지했으며, 이 저장소의 최종 구성은 위 표의 10개 묶음입니다. 온보딩의 로컬 이미지 링크는 모두 유효합니다.

`package-verification.json`에 승인 ZIP 10개의 파일명·크기·SHA256 및 검증 결과를 기록했습니다. 안전 압축 경로와 CRC, PNG 104개의 manifest SHA256·중복·누락·청크 CRC·압축 데이터, 124개 화면/모드 참조와 19개 상태군, 각 index의 로컬 링크를 검사했습니다. 실제 앱 실행 검증은 수행하지 않았습니다.
