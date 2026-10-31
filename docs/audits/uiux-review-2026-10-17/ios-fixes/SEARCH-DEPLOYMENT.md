# 운영 검색 서버 배포 및 iOS 검증

- 대상: weatheron-api (https://weatheron-api.weatheron.workers.dev).
- 운영 버전: 6f045791-e723-42a1-93cb-41669dcdd628.
- 검색 서버 변경: 관련성 우선 후보 수집 옵션, 정렬별 캐시 분리, 산업 등 부분 문자열의 산 오분류 수정.
- 배포 전 check-ios-uiux, check-cloudflare-worker-proxy, check-cloudflare-request-logging 통과.
- 저장소 배포 명령의 필수 사전 단계에서 0005_consent_records.sql 적용됨. 테이블·인덱스 추가이며 기존 데이터 삭제 없음.
- 배포 명령 정상 종료. 운영 /health HTTP 200, 서울역·시청역 각각 HTTP 200/30개 후보 확인.
- 서울역 정확 일치 후보 존재. 시청역 1호선·2호선 후보 존재. 두 결과의 mountain 분류 없음.
- 공개 서울시청 좌표로 운영 API 검증했으며 사용자 위치·인증 토큰은 기록하지 않음.
- [운영 API 증거](./search-production.json).

## iOS

- 기존 수정 앱에서 검색 화면 진입·요청·빈 결과 표시 확인함.
- 사용자가 서울역을 직접 입력한 뒤 잠금했고, 미러링에서 실제 결과 30개 및 첫 결과 서울역(서울 중구 한강대로 405, 이동 분류) 확인함. 더 가까운 서울역공간모아보다 정확 일치 역이 위에 표시됨. [결과](./search-production-seoul.png).
- 첫 결과 클릭 시 선택 배지와 저장 버튼 활성화 확인함. 실제 저장은 하지 않음. [선택](./search-production-selected.png).
- X 버튼으로 입력·선택 초기화 및 주변 추천 복귀 확인함.
- 영문 Seoul Station은 빈 결과였음. 이 영문 별칭은 현재 별도 검색어 별칭에 등록되지 않음. [화면](./search-production-english-empty.png).
- 빈 검색창의 주변 추천은 거리순, 직접 입력 검색은 관련성순을 사용하도록 iOS 요청 모드 명시함. 타입·회귀 검사 통과. 한글 결과 검증 완료함. 정렬 제목도 관련성 높은 순으로 보정함. 최종 보정 앱 로컬 Xcode 빌드·설치·실행 성공함.
- 최종 앱에서 주변 추천이 아쿠아필드 고양 0.594km, 숯돌고개 0.659km 등 가까운 순으로 표시됨. [주변 추천](./search-production-nearby-final.png).
- 최종 앱에서 tokyo station 검색 시 Tokyo Station 추천 후보 1개와 관련성 높은 순 제목 확인함. 추천 후보 확인이며 해외 외부 공급자 완전성 검증은 아님. [최종 정렬 제목](./search-production-tokyo-final.png).
- 검색 초기화 후 기존 선택 목적지 내수동교회와 홈 화면으로 복귀함. 저장·삭제하지 않았으며 저장 목적지 3개 유지함.
