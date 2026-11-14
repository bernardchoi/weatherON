# WeatherON 스킬 33개 최종 검증 보고서

2026-11-14 로컬 Mac에서 스킬 33개를 각각 새 Codex 세션에서 호출하고 지정한 작업의 산출물을 확인함. 스킬·훅 설치 기준은 `main`의 `94178970`, 시장조사·음성·보안 연동 설정과 보안 후보 판정 기준은 `7f573a21`임.

## OMA_BIN 실행 경로 검토

**현재 WeatherON 로컬 환경에서 수정 불필요로 판정함.** Deepsec의 훅 전용 규칙은 실행 파일을 환경변수로 선택하는 코드 한 곳을 검출함. 훅 래퍼는 상위 프로세스에서 받은 `OMA_BIN`을 사용할 수 있으나, 등록된 훅 6개의 명령은 고정돼 있고 프롬프트나 도구 입력이 해당 변수에 대입되는 경로는 발견되지 않았음. 확인 당시 변수는 설정되지 않았고 `oma`는 사용자 계정에 설치한 CLI로 해석됐음. [훅 래퍼](../../.codex/hooks/oma-hook.sh) · [등록된 명령](../../.codex/hooks.json) · [검출 규칙](../../.deepsec/generated-matchers.ts)

판정 범위는 위 커밋과 로컬 실행 환경임. CI나 별도 런처가 외부 입력으로 실행 경로를 정하게 되면 재검토가 필요함.

## 스킬별 작업과 결과

| 스킬 | 확인한 결과 |
|---|---|
| oma-academic-writing | 기기 성능 측정 결과를 영어 90단어로 요약하고 원자료와 대조함. |
| oma-architecture | 공유 우산 규칙부터 모바일 화면까지 호출 관계를 Mermaid로 정리함. |
| oma-backend | 핸들러에 인증·해외 좌표 사례 4개 실행. 401 세 건, 200 한 건. |
| oma-brainstorm | 홈 강우 안내 대안을 비교하고 측정 가능한 실험을 제시함. |
| oma-coordination | 강수 임계값 변경 시 담당·의존성·통합 검사를 정리한 인계서. |
| oma-db | SQLite 큐 생성·중복 삽입 거부·기존 시각 보존 확인. |
| oma-debug | 강수량과 확률 NaN, 비/미상 관측 2건 재현. 기대값 일치. |
| oma-design | 홈 상태 표시와 재시도 버튼 감사. Android 최소 높이 44dp 확인. |
| oma-dev-workflow | 33개 매니페스트 및 훅 실행 권한 사전검사 스크립트 실행. |
| oma-docs | 설치 커밋에 OMA docs sync 실행. 제안 223건이 스킬 문서이고 제품 문서 후보는 0건. |
| oma-explanation | 우산 규칙 9개를 오프라인 HTML로 렌더링·검증. 경계 예시 3개 대조. |
| oma-frontend | 강풍·강우 예시의 접근성 HTML 카드 구현. 공유 규칙 출력 및 DOM 검사. |
| oma-hwp | 합성 한글 강우 알림 HWPML을 kordoc으로 변환하고 본문·문단 대조. 후처리 의존성 임시 설치. |
| oma-image | Codex OAuth로 비구름 PNG 생성. 흰 배경과 파란 아이콘 육안 확인. 512 요청 대비 원본 1254px, 128px 파생본 있음. |
| oma-market | 프로젝트 설정으로 last30days 3.39.0 실행. Hacker News 게시물 2건 수집·브리프 작성. |
| oma-mobile | React Native 강수 알림 switch의 두 상태·접근성·누를 때 상세 이동 확인. |
| oma-observability | Live Activity 종료 푸시 접수율 산식 구현. 합성 3건 중 분모 2, 성공 1. 운영 지표 아님. |
| oma-orchestration | Codex 자식에 임계값 독립 판독 배정. 부모가 50% 이상 선언 및 실제 사용처 대조. OMA 전용 역할 미설정. |
| oma-pdf | 실제 29쪽 제안서 표지를 Markdown으로 추출해 렌더링과 한국어 제목 대조. |
| oma-pm | 홈 준비 카드 접근성 티켓 1건 작성. 소스·수용 조건·기기 확인 기준 포함. |
| oma-qa | 기존 우산 추천 회귀 스크립트 실행. 단언 9개 통과. |
| oma-recap | 이전 32개 호출 로그를 읽어 파일 시각 기준 활동·성공 수·검증 범위를 재구성함. |
| oma-refactor | 강수 판정 우선순위를 리팩터링. 원본·변경본 10/10 일치. |
| oma-scholar | 강수확률 이해에 관한 Joslyn 외(2009) 논문의 제목·DOI를 독립 서지정보와 대조. Knows 0건, OpenAlex 대체 검색 성공, 출판사 본문 403. |
| oma-scm | 설치 커밋의 경로·파일 수·main 포함 여부를 Git 객체 기준 검사. |
| oma-search | Apple ActivityKit 공개 문서 조회 및 근거 확인. |
| oma-security | Deepsec 2.3.12로 지정한 훅 범위를 검사함. 기본 규칙 73개에서 후보 0건, 훅 전용 규칙에서 `OMA_BIN` 후보 1건. 현재 환경에서 수정 불필요로 판정함. |
| oma-skill-creation | 우산 규칙 QA 예제 스킬 작성 및 참조 명령 검증. 설치하지 않음. |
| oma-slide | WeatherON 우산 안내를 2장 HTML 슬라이드 제작. OMA Chrome 검증 2/2 통과, 경고 0건. |
| oma-tf-infra | 클라우드 제공자 없는 강수 임계값 Terraform 예제 작성 및 변수 경계 검증. |
| oma-translation | 실제 한국어 UI 문구를 영어·일본어로 번역하고 변수 보존 확인. |
| oma-video | 6.02초 1084×2412 QA 영상에서 0.5초 프레임 추출·육안 확인. |
| oma-voice | VoiceStudio 약관 2개 직접 동의 및 모델 설치 완료. 한국어 WAV 2.557초, 24 kHz PCM 모노. Whisper 전사 단어 일치. 사용자 직접 청취로 문구·발음·억양 통과. |
