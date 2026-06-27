# WeatherON 전체 목업 종합 리뷰

- Audit date: 2026-06-25
- Target: `http://127.0.0.1:5173/`
- Scope: 프리뷰 네비 등록 전체 43개 화면
- Evidence: `screenshots/` 폴더 내 43개 화면 캡처, `capture-results.json`

## 결론

현재 목업은 MVP 직전 기획 목업으로는 충분히 설득력 있음. 특히 "날씨 확인"이 아니라 "오늘 준비 결정"으로 포지셔닝한 점이 좋음. 코디, 우산, 신발, 출발 알림, 목적지 케어가 하나의 생활 루틴으로 묶여 있어 일반 날씨 앱과 차별점이 분명함.

다만 출시 수준까지 가려면 3가지를 더 줄여야 함.

1. 하단 고정 CTA와 탭바 충돌 가능성
2. 카드·칩·상태 라벨의 정보량
3. 저대비 보조 텍스트와 작은 터치 타겟

## 시장성과 트렌드 적합성

WeatherON 방향은 현재 시장 흐름과 잘 맞음.

- 날씨 앱 시장은 단순 예보보다 정확도, 초단기·초지역 정보, 확률형 예보, 개인화 안내 쪽으로 확장 중임. The Weather Channel 같은 대형 서비스도 2025년 기준 대규모 사용자 기반과 정확도, 세분화 기능을 경쟁력으로 유지 중임.
- 패션 추천 쪽은 AI 스타일링, 옷장 디지털화, 날씨·장소·상황 기반 추천이 계속 커지는 방향임. Acloset 같은 앱은 위치·날씨·상황을 기반으로 코디를 제안하는 흐름이 이미 사용자 경험으로 검증되고 있음.
- TrendGen 같은 최신 연구도 고품질 의류 이미지와 일관된 코디 구성이 추천 신뢰도에 중요하다고 봄.
- 단, Vogue의 AI 패션 관련 논의처럼 "취향"은 AI가 완전히 해결하기 어려움. WeatherON은 AI가 취향을 결정한다기보다 날씨·목적지·시간대 기준으로 선택 부담을 줄이는 보조 도구로 잡는 게 맞음.

참고:

- Weather app scale and feature trend: https://en.wikipedia.org/wiki/The_Weather_Company
- AI outfit recommendation and lay-down image trend: https://arxiv.org/abs/2603.27264
- AI styling and wardrobe/weather usage example: https://www.theguardian.com/technology/2025/jan/19/would-you-let-ai-choose-your-outfits
- AI fashion taste limitation: https://www.vogue.com/article/can-ai-ever-crack-taste

## 기술 구현 가능성

구현 가능성은 높음. 단, 한 번에 모두 만들면 범위가 커짐.

### MVP에서 바로 가능한 영역

- React Native 또는 Flutter 기반 모바일 앱
- 날씨 API 연동
- 지역 검색/목적지 등록
- 온도·강수·바람·시간대 기반 룰 엔진 추천
- 옷장 프리셋 기반 코디 추천
- 계정 연결, Guest 모드, 약관, 설정 상태 저장
- 로컬 푸시 알림

### 2단계로 미루는 게 나은 영역

- 실제 사용자 옷 사진 자동 분류
- AI 종주 플래너
- 커뮤니티 날씨 제보 신뢰도 시스템
- ON Square 캐릭터 성장/리액션
- 날씨 기반 광고 최적화
- 국가별 로그인·약관·광고 동의 정교화

### 기술 리스크

- iOS/Android 백그라운드 위치·알림 정책 대응 필요
- 날씨 API 정확도와 지역별 커버리지 차이 관리 필요
- 코디 추천은 사용자 옷장 데이터가 부족하면 품질이 급격히 낮아질 수 있음
- CWR/Weather Note는 스팸, 허위 제보, 위치 개인정보 이슈가 큼
- 이미지 애셋이 많아 번들 크기 최적화 필요

## UI 디자인 평가

강점:

- Navy/Gold/Clear 톤이 WeatherON만의 브랜드감을 형성함
- 코디 이미지 품질이 이전 카드형 플레이스홀더보다 좋아져 서비스 가치가 바로 보임
- Guest-first 구조가 진입 부담을 줄임
- 하단 탭 구조가 서비스 범위를 빠르게 이해시킴
- A/O/H/C/G/P 핵심 흐름은 기능 연결성이 좋아짐

위험:

- 어두운 배경 + 저투명 보조 텍스트가 많아 피로도가 있음
- 칩과 상태 라벨이 많아 "앱 화면"보다 "검증 대시보드" 느낌이 일부 남음
- 일부 화면은 첫 화면에서 기능을 다 보여주려 해 밀도가 높음
- 탭바 위 고정 CTA가 있는 화면은 여전히 안전영역 규칙을 더 통일해야 함
- H/G/C 계열은 시각 완성도가 높지만 R/W/S 계열은 아직 약간 목업 느낌이 남음

## UX 평가

강점:

- 가입 없이 홈 진입하는 구조는 좋음
- 계정 연결을 저장·동기화·알림 확장 시점에만 요구하는 방향이 맞음
- M1/A4 역할을 나눈 것은 좋은 정리임
- 목적지 등록을 선택사항으로 둔 것도 진입 저항을 낮춤
- 코디 추천은 "왜 이 옷인지" 근거가 있어 신뢰 형성에 유리함

위험:

- 온보딩 O2~O6는 설득력은 있으나 다소 길게 느껴질 수 있음
- M2 스마트 알림은 여전히 설명이 많아 실제 앱에서는 "자동 케어 ON/OFF + 현재 적용 기준"만 먼저 보여주는 게 좋음
- C3 프리셋 아이템은 방향은 좋지만 필터와 아이템 수가 많아 초반 사용자가 압도될 수 있음
- C4 코디 상세는 이미지/근거/대화형 재추천/저장 CTA가 모두 있어 우선순위가 다소 섞임
- G/P/S 계열은 기능 확장성이 좋아 보이지만 MVP 범위로는 과함

## 접근성 평가

확정 강점:

- 주요 CTA 대부분 40px 이상으로 확보됨
- 탭바 아이콘+텍스트 조합은 이해하기 쉬움
- 기능색이 의미별로 어느 정도 일관됨
- Guest/계정/권한 상태가 텍스트로도 제공됨

위험:

- 저투명 MIST 텍스트는 4.5:1 대비를 못 맞출 가능성이 있음
- 일부 칩은 24px 근처라 WCAG 2.2 Target Size Minimum 기준에서 검토 필요
- 버튼이 `<div>`로 구현된 화면이 있어 실제 앱/웹 구현 시 시맨틱 버튼으로 바꿔야 함
- 아이콘 버튼의 accessible label 필요
- 색상만으로 상태를 구분하는 칩은 보조 텍스트 유지 필요
- 스크롤 영역과 고정 CTA가 겹치는 화면은 포커스 이동/스크린리더 순서 확인 필요

참고:

- WCAG 2.2 target size minimum: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- WCAG contrast minimum: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

## 화면별 리뷰

| Step | Screen | Health | Notes | Evidence |
|---:|---|---|---|---|
| 1 | A1 스플래시 | 좋음 | 브랜드 진입과 Guest-first 메시지 명확함 | [screenshot](screenshots/01-A1-스플래시.png) |
| 2 | H1 게스트 홈 | 좋음 | 핵심 가치가 잘 보임. 탭바 위 제보 CTA 정리됨 | [screenshot](screenshots/02-H1-게스트-홈.png) |
| 3 | A2 계정 연결 | 좋음 | 계정 연결 부담 낮음. 국가 자동추천 구조와 잘 맞음 | [screenshot](screenshots/03-A2-계정-연결.png) |
| 4 | A3 약관 동의 | 보통 | 필수/선택 위계는 좋지만 법적 텍스트 화면 특성상 밀도 높음 | [screenshot](screenshots/04-A3-약관-동의.png) |
| 5 | C1 코디 메인 | 좋음 | 대표 코디 이미지 품질 좋음. 하단 판단 카드와 탭바 간 여유는 계속 확인 필요 | [screenshot](screenshots/05-C1-코디-메인.png) |
| 6 | C2 내 옷장 | 보통 | 옷장 그리드는 방향 좋음. 스크롤 길고 필터/아이템 밀도 높음 | [screenshot](screenshots/06-C2-내-옷장.png) |
| 7 | C3 옷 등록 | 보통 | 프리셋 방식은 좋음. 필터와 그리드가 한 화면에 많아 초반 부담 있음 | [screenshot](screenshots/07-C3-옷-등록.png) |
| 8 | C4 코디 상세 | 보통 | 히어로는 좋음. 상세/대화형/저장 CTA가 하단에서 경쟁함 | [screenshot](screenshots/08-C4-코디-상세.png) |
| 9 | H2 위치 변경 | 좋음 | 검색·현재 위치·저장 흐름이 이해 쉬움 | [screenshot](screenshots/09-H2-위치-변경.png) |
| 10 | H3 알림 사이드바 | 좋음 | 알림 허브 역할 명확함 | [screenshot](screenshots/10-H3-알림-사이드바.png) |
| 11 | H4 우산 추천 | 보통 | 추천 근거 좋음. 하단 CTA는 탭바와 안전영역 재검토 필요 | [screenshot](screenshots/11-H4-우산-추천.png) |
| 12 | H5 강수 타임라인 | 좋음 | 시간 기반 판단이 명확함 | [screenshot](screenshots/12-H5-강수-타임라인.png) |
| 13 | O1 스플래시 | 좋음 | 온보딩 진입 브랜드 화면으로 충분함 | [screenshot](screenshots/13-O1-스플래시.png) |
| 14 | O2 기능 소개 | 좋음 | 4대 기능 가치 제시 좋음. 텍스트 조금 더 줄이면 더 강함 | [screenshot](screenshots/14-O2-기능-소개.png) |
| 15 | O3 권한 요청 | 좋음 | 권한 이유 설명이 명확함 | [screenshot](screenshots/15-O3-권한-요청.png) |
| 16 | O4 스타일 태그 | 좋음 | 성별/연령대 포함 후 추천 품질 근거 강화됨 | [screenshot](screenshots/16-O4-스타일-태그.png) |
| 17 | O5 알림 시간 | 보통 | 자동 케어 방향 좋음. 설명이 많아 1차 화면은 더 줄일 필요 있음 | [screenshot](screenshots/17-O5-알림-시간.png) |
| 18 | O6 목적지 등록 | 좋음 | 선택 설정으로 잘 표현됨 | [screenshot](screenshots/18-O6-목적지-등록.png) |
| 19 | G1 출발 메인 | 좋음 | 자동 케어 상태가 잘 보임 | [screenshot](screenshots/19-G1-출발-메인.png) |
| 20 | G2 목적지 케어 | 좋음 | 목적지 날씨 비교와 케어 ON 개념이 이해됨 | [screenshot](screenshots/20-G2-목적지-케어.png) |
| 21 | G3 여행 플래너 | 보통 | 기능 가치는 있으나 MVP 범위로는 무거움 | [screenshot](screenshots/21-G3-여행-플래너.png) |
| 22 | G4 도보여행 | 보통 | 코스 정보 좋음. 하단부 CTA/콘텐츠가 조금 답답함 | [screenshot](screenshots/22-G4-도보여행.png) |
| 23 | G5 AI 종주 | 보통 | 프리미엄 가치 좋음. AI 기능은 구현 난도 높음 | [screenshot](screenshots/23-G5-AI-종주.png) |
| 24 | G6 프리미엄 | 보통 | 가격/혜택 구조는 명확함. MVP에서는 뒤로 미뤄도 됨 | [screenshot](screenshots/24-G6-프리미엄.png) |
| 25 | P1 목적지 추가 | 좋음 | O6와 패턴 통일됨 | [screenshot](screenshots/25-P1-목적지-추가.png) |
| 26 | P2 준비 가이드 | 좋음 | 장소별 준비물 서비스 가치가 잘 보임 | [screenshot](screenshots/26-P2-준비-가이드.png) |
| 27 | P3 목적지 필터 | 좋음 | 리스트/상세 확장 구조가 설득력 있음 | [screenshot](screenshots/27-P3-목적지-필터.png) |
| 28 | M1 MY 메인 | 좋음 | 설정 허브 역할이 명확해짐 | [screenshot](screenshots/28-M1-MY-메인.png) |
| 29 | M2 알림 설정 | 보통 | 자동 케어 방향 좋음. 설명과 상태 카드가 많음 | [screenshot](screenshots/29-M2-알림-설정.png) |
| 30 | M3 전역 설정 | 좋음 | 전역 설정 역할 명확함 | [screenshot](screenshots/30-M3-전역-설정.png) |
| 31 | A4 계정 관리 | 좋음 | M1과 역할 분리됨. 계정 전용 관리로 정리됨 | [screenshot](screenshots/31-A4-계정-관리.png) |
| 32 | R1 정책 허브 | 보통 | 심사 대응에는 충분. 사용자 화면으로는 건조함 | [screenshot](screenshots/32-R1-정책-허브.png) |
| 33 | R2 개인정보 | 보통 | 정책 문서 접근성은 좋음. 긴 텍스트 가독성 검증 필요 | [screenshot](screenshots/33-R2-개인정보.png) |
| 34 | R3 광고 동의 | 보통 | 광고 동의 흐름은 필요. 실제 UMP 문구와 정합성 필요 | [screenshot](screenshots/34-R3-광고-동의.png) |
| 35 | R4 광고 배치 | 보통 | 광고 슬롯 구분은 명확함. 실제 광고 SDK 정책 검증 필요 | [screenshot](screenshots/35-R4-광고-배치.png) |
| 36 | W1 날씨 제보 홈 | 좋음 | CWR 진입이 명확함 | [screenshot](screenshots/36-W1-날씨-제보-홈.png) |
| 37 | W2 날씨 제보 | 좋음 | 제보 입력 부담이 낮음 | [screenshot](screenshots/37-W2-날씨-제보.png) |
| 38 | W3 제보 완료 | 좋음 | 완료 피드백과 배지 보상이 좋음 | [screenshot](screenshots/38-W3-제보-완료.png) |
| 39 | W4 제보 이력 | 보통 | 이력은 유용하나 MVP 우선순위 낮음 | [screenshot](screenshots/39-W4-제보-이력.png) |
| 40 | S0 ON Square 시작 | 보통 | 감성 차별화 가능. MVP 핵심과는 분리 필요 | [screenshot](screenshots/40-S0-ON-Square-시작.png) |
| 41 | S1 내 ON Square | 보통 | 캐릭터 경험은 매력적이나 운영 비용 큼 | [screenshot](screenshots/41-S1-내-ON-Square.png) |
| 42 | S2 Weather Note | 보통 | 커뮤니티 가치 있음. 신고/위치 개인정보 설계 필요 | [screenshot](screenshots/42-S2-Weather-Note.png) |
| 43 | S3 날씨 리액션 | 좋음 | 익명 공감 구조는 가볍고 긍정 반응 가능성 있음 | [screenshot](screenshots/43-S3-날씨-리액션.png) |

## 우선 수정 권장

1. C4: 하단 대화형 재추천 영역과 저장/공유 CTA 위계 재정리
2. C3: 프리셋 필터는 유지하되 기본 노출량 축소
3. M2/O5: 자동 케어 설명 축소, "현재 켜진 것" 중심으로 재배치
4. H4/G4/G5: 하단 CTA 안전영역 통일
5. 전 화면: MIST 계열 보조 텍스트 대비 상향
6. 전 화면: 24px 미만 가능성이 있는 칩/아이콘 버튼 터치 타겟 재검토
7. R/W/S 라인: 핵심 플로우와 같은 시각 완성도까지 2차 폴리싱

## 1차 수정 대응 기록

적용일: 2026-06-25

- C4: 대화형 재추천을 기본 압축 카드로 전환하고, 저장/공유 CTA와 본문 스크롤 안전영역을 분리함
- C3: 프리셋 필터 구조는 유지하되 기본 노출량을 9개로 줄이고 더보기 확장으로 변경함
- M2/O5: 자동 케어 설명을 줄이고 현재 적용 상태 중심으로 재배치함
- H4/G4/G5: 하단 CTA와 탭바가 마지막 콘텐츠를 가리지 않도록 paddingBottom을 확대함
- G4/G5: 앱 화면에 어색한 검증용 상태 버튼을 상태 칩/권한 안내로 전환함
- 컬러: 기존 Navy/Gold 중심의 무거운 톤을 Clear Weather UI 기준으로 보정함
- 접근성: MIST 계열 보조 텍스트 대비를 우선 화면에서 상향하고 주요 CTA 높이를 44px 이상으로 유지함
- 라이트/다크: 별도 목업 파일 복제 대신 프리뷰 테마 토글을 유지하고, 프리뷰 네비의 43개 화면에 공통 라이트/다크 배경·프레임 토큰을 연결함
- 라이트 포인트 컬러: 탁한 브라운 계열 라이트 토큰을 Dawn Orange(#C2410C), Clear Sky(#237BBD), Action Teal(#007F73), Coral Warm(#C84A2F)로 교체해 포인트가 더 선명하고 현대적으로 보이도록 보정함

남은 리스크:

- 라이트모드 배경·프레임·포인트 컬러 전환은 전체 프리뷰 기준 반영됨. 2차는 카드 내부 세부 대비와 화면별 미세 폴리싱 필요
- R/W/S 라인은 배경 토큰은 적용됐지만, 사용자-facing 완성도 폴리싱은 2차 작업으로 유지
- 실제 네이티브 앱 구현 시 VoiceOver/TalkBack, 동적 글자 크기, 포커스 순서 검증 필요

## MVP 범위 제안

MVP 1차는 다음만 잡는 게 좋음.

- A1/H1/A2/A3/A4
- O2/O3/O4/O5/O6
- H1/H2/H3/H4/H5
- C1/C2/C3/C4
- G1/G2
- P1/P2/P3
- M1/M2/M3
- R1/R2/R3/R4

대응 기록:

- MVP 핵심 기능 PRD 부재 갭은 `docs/planning/WeatherON_MVP_기능_PRD.md` 작성으로 1차 해소함.
- 해당 PRD는 날씨 API, 코디 룰엔진, 옷장, 우산/신발 추천, 목적지 케어, 스마트 알림, MY/정책을 MVP 개발 기준으로 정리함.
- 도보여행 PRD는 기존 별도 문서로 유지하고, MVP 1차 기능 PRD에서는 제외/참조만 함.

MVP 이후:

- G3/G4/G5/G6
- W1~W4
- S0~S3

## Evidence limits

- 이번 평가는 목업 스크린샷과 DOM 기반 자동 검사 중심임.
- 실제 네이티브 앱의 스크린리더, 키보드 포커스, VoiceOver/TalkBack, 동적 폰트, 실제 API 지연 상태는 확인하지 않음.
- 색 대비는 정밀 계산이 아니라 화면/토큰 기반 위험 평가임.
- 시장성 평가는 공개 자료 기반의 정성 판단이며 실제 사용자 테스트나 리텐션 데이터는 아님.
