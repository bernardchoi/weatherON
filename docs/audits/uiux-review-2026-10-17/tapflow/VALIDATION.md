# Tapflow iOS 검증 — 2026-10-17

## 환경
- Tapflow CLI / MCP npm 패키지: 0.27.1.
- Node 24.15.0 / Xcode 27.1.
- 릴레이: http://localhost:4000, 기본 설치 폴더 ~/.tapflow.
- iOS 에이전트 연결 완료. 검사 대상: iPhone 18 Pro Max 시뮬레이터 7F40E780-E6CE-42B7-B3BD-FCF991E45AD0.
- 외부 터널 사용하지 않음. 오디오 캡처 OFF. 네트워크 필터 설치하지 않음.
- Codex stdio MCP 등록 완료. 인증 설정·실제 MCP handshake는 아직 미완료.
- 기존 실물 iPhone 데이터 변경하지 않음.
- 현재 작업 코드의 Release 시뮬레이터 QA 빌드 성공함. 로그: /tmp/weatheron-tapflow-build.log.
- 빌드 산출물: /tmp/weatheron-qa-20261015/Build/Products/Release-iphonesimulator/WeatherON.app.
- 앱 설치·실행·화면 검증은 MCP 인증 승인 전이라 수행하지 않음.

## 검증 기준
| 흐름 | 통과 조건 | 상태 |
|---|---|---|
| MCP 연결 | initialize / tools/list / list_devices 성공 | 인증 승인 대기 |
| 검색 | Seoul Station, 서울역, Tokyo Station, Eiffel Tower 등 실제 운영 결과·좌표·장소명 확인 | 미검증 |
| 저장 | 검색 결과 선택→목적지 저장→목록·재실행 유지 확인 | 미검증 |
| 날씨 | 목적지 위치·시차·기온이 해당 장소 기준으로 표시 | 미검증 |
| 경로 | 실제 경로와 미지원·추정 상태 구분, 시각·이동수단 변경 확인 | 미검증 |
| 알림 | 권한→네이티브 예약→실제 로컬 수신→탭/보기 이동 | 미검증 |

## 차단 사항
- 자동 승인 검토가 로컬 관리자 계정·30일 API PAT(view, builds:write) 생성과 저장을 거절함.
- 계정·수신 주체·권한·유효기간에 관한 구체적 사용자 승인 요청함. 승인 전 자격증명 생성이나 대체 인증 우회하지 않음.
- 문서 main과 배포된 MCP 0.27.1 사이 차이 존재: 배포판은 TAPFLOW_TOKEN 필수, 문서의 토큰 파일 자동 읽기는 구현되지 않음. 승인 후 안전한 로컬 파일 로딩 방식으로 연결할 예정임.
