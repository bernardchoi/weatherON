# 영문 서울역·해외 검색 검증

## 수정 및 배포

- shared·서버 별칭에 `Seoul Station`, `seoulstation`, `서울 역` → `서울역` 추가함.
- iOS 정렬에도 같은 별칭을 적용해 정확한 서울역을 가까운 업체보다 우선함. 주변 추천 거리순 유지함.
- Google 지오코딩이 장소명 대신 도로·도시 주소 요소를 반환할 때 검색어를 표시명으로 사용함. 공급자가 준 주소·좌표는 그대로 유지함.
- Google 검색 성공 시 실제 공급자 후보 사용함. 추천 후보는 결과 없음·장애 때 유지함. 프록시 클라이언트의 추천 후보 재추가 제거함.
- 최종 운영 Worker: `4d7fde53-6696-48a9-ad13-60a4e1132651`.
- 이번 배포 시 D1 적용할 마이그레이션 없었음.
- check-cloudflare-worker-proxy, check-place-search-english, check-shared-rules, 모바일 TypeScript, git diff --check 통과함. 장소명 보존·서버/앱 추천 후보 중복 방지 회귀 검사 포함함.

## 운영 API

[수정 전](./before.json), [최종 운영 응답](./production.json).

사용자 Google 결제 활성화 후 직접 Geocoding 요청 OK 확인함. 운영에는 잠시 REQUEST_DENIED가 섞였으나 최종 재검사 모두 실제 공급자 응답 확인함. 키 값 출력·문서 기록 없음.

| 검색어 | 공급자 | 검증 좌표 근처 | 시간대 | 판정 |
| --- | --- | --- | --- | --- |
| Seoul Station | kakao | 37.5541, 126.9707 | Asia/Seoul | 통과 |
| Tokyo Station | google | 35.6813, 139.7671 | Asia/Tokyo | 통과, 단일 후보 |
| Eiffel Tower | google | 48.8584, 2.2945 | Europe/Paris | 통과 |
| Times Square | google | 40.7580, -73.9855 | America/New_York | 통과 |
| British Museum | google | 51.5194, -0.1270 | Europe/London | 통과 |
| Marina Bay Sands | google | 1.2838, 103.8591 | Asia/Singapore | 통과 |

HTTP 200뿐 아니라 실제 공급자, IANA 시간대, 알려진 장소 좌표와 위·경도 각각 0.03도 이내인지 검사함. 해외 후보는 추천 항목 중복 없이 한 개 반환 확인함. 비일본 해외 countryCode는 기존 공유 계약의 GLOBAL 사용함. 국가 위치는 공급자 주소와 좌표로 확인함.

## iOS 미러링

- 미러링 정상 크기 복구 후 실제 iPhone 화면에서 영문 검색 수행함.
- Seoul Station: 서울역 첫 번째 표시, 서울 중구 한강대로 405 주소, 가까운 업체보다 우선 표시 확인함. 선택 시 저장 버튼 활성화됨.
- Eiffel Tower: Paris, France 주소, Times Square: Manhattan, NY 주소, British Museum: London, UK 주소, Marina Bay Sands: Singapore 주소 확인함. 각 결과 선택 및 버튼 활성화 확인함.
- 초기화 시 선택 해제·버튼 비활성·주변 장소 거리순 복귀 확인함.
- 증거: [서울역](./seoul-station.png), [서울역 선택](./seoul-selected.png), [에펠탑](./eiffel-selected.png), [타임스스퀘어](./times-square-selected.png), [대영박물관](./british-museum-selected.png), [마리나베이샌즈](./marina-bay-sands-selected.png).
- 최종 앱 로컬 Xcode Release 빌드·덮어 설치·실행 성공함. [도쿄역 단일 결과 선택](./tokyo-final-selected.png), [최종 앱 에펠탑 검색](./eiffel-final.png) 확인함. 도쿄역 실제 후보 한 개만 표시되고 선택 버튼 활성화됨.
- 검증 후 기존 저장 목적지 3개 유지, 내수동교회 선택·홈 화면 복원함.

## 검증 범위

- 기존 Ambient 디자인 유지함. 목적지 저장·삭제 및 계정 변경 없음.
- 검색 결과·선택까지 검증함. 해외 목적지 저장 후 날씨·경로·알림은 이번 검증에 포함하지 않음.
- 로컬 Xcode 개발 서명 앱으로 검증함. Xcode Cloud·TestFlight·App Store 배포 검증 아님.
- 기존 Geocoding 공급자 유지함. 임의 장소 자동완성 전체 품질은 위 6개 사례로 보장하지 않음.
