# 캐릭터 표시 이름의 기기 언어별 적용 — 2026-11-16

상태: 사용자 승인 표기 적용 및 정적 검증 완료. 실기기/시뮬레이터 검증은 수행하지 않음.

이 문서는 명칭 적용 직후의 커밋·푸시 전 검증 기록이다. 이후 사용자 승인에 따른 게시 상태는 `fix/my-profile-character-selection`의 Git 기록과 원격 브랜치를 기준으로 확인한다.

## 범위와 보존

- 저장소/호스트: `bernardchoi/weatherON`, Linux 소비 환경 `/workspace/weatherON`.
- 브랜치: `fix/my-profile-character-selection`, 기준 SHA `07dcadbb07fb5546fda3af529ef3503afcc34657`.
- 기존 미커밋 마이페이지 UI 변경 위에 표시 이름을 적용했다. 커밋·푸시·빌드·배포 없음. main 미통합.
- 이전 UI 패치 `/workspace/weatheron-review-evidence/weatheron-my-profile-character-selection.patch`는 그대로 보존했다. SHA256 `e93e48c73a23efcceba913ba576a91dc881cce46c197fdde2d85501965d26abf`.
- 수정 전 소스 해시를 `/workspace/weatheron-review-evidence/naming-before.json`에 저장했다. 마이페이지 화면, 기존 계정/선택 회귀 검사, 그림 크기 보정 helper의 해시가 동일함을 확인했다.
- ID/저장 모델, 저장 큐/재마운트 처리, 기기 언어 정책 및 공통 번역 런타임도 수정 전과 바이트 단위로 동일하다. 실제 사용자 저장소를 수정하거나 마이그레이션하지 않았다.
- `AGENTS.md`, 관련 `oma-mobile` skill 및 실행/검증 지침을 확인했다. 기존 UI 작업 보고서 `my-profile-character-selection.md`는 앞선 요청에 대한 기록으로 유지한다. 이 문서는 이후 승인된 명칭 변경을 기록한다.

## 승인된 표시 이름

| 내부 ID | 한국어 | 영어 | 일본어 |
|---|---|---|---|
| default | 기본 | Default | 標準 |
| main | 온비 | ONBY | オンビ |
| solar | 솔라 | Solar | ソーラー |
| rain | 레인 | Rain | レイン |
| storm | 스톰 | Storm | ストーム |
| wind | 윈드 | Wind | ウィンド |
| frost | 프로스트 | Frost | フロスト |
| mist | 미스트 | Mist | ミスト |

선택창의 화면 이름과 접근성 이름은 동일한 `copy[language][id]`를 사용한다. 기존 영문 ID 첫 글자 대문자 방식은 제거했다. 원형 프로필 버튼의 동작 이름은 기존 ‘캐릭터 선택’으로 유지하고, 접근성 현재값(`accessibilityValue.text`)에 현지화된 현재 캐릭터 이름을 제공한다. 그림은 계속 장식 요소로 숨겨 별도의 중복 탐색 대상을 만들지 않는다.

전체 지원 언어/모든 캐릭터 ID가 문자열 표를 갖도록 `satisfies Record<AppLanguage, Record<…>>` 타입 검사를 추가했다. 기기 언어는 기존 `expo-localization.getLocales()` → `resolveLocalePolicy` → `LocalizationContext` 경로를 그대로 따른다. 선호 목록의 첫 지원 언어를 사용하며 모두 미지원이면 영어가 된다. 언어별 표시만 달라지고 저장 ID/키/레코드 버전은 변하지 않는다.

캐릭터 이름의 실제 표시 소비자는 마이페이지 선택창 및 프로필 버튼이다. 다른 코드의 날씨 상태, 에셋 키, 모션/홈 캐릭터 ID는 사용자 표시 이름이 아니므로 변경하지 않았다.

## 이번에 수정한 파일

1. `apps/mobile/src/components/ProfileCharacterPicker.tsx`: 3개 언어의 8개 이름, 동일 화면/접근성 이름, 원형 버튼의 현재 이름, 표의 타입 완전성.
2. `scripts/generate-mobile-locales.mjs`: 승인된 7개 이름의 영어/일본어 고정 번역. 재생성 시 임의 번역으로 바뀌지 않도록 검증한다.
3. `apps/mobile/src/localization/locales/en.json`: 7개 이름 추가 및 더 이상 사용하지 않는 단독 ‘메인’ 키 제거.
4. `apps/mobile/src/localization/locales/ja.json`: 위와 동일한 일본어 카탈로그 동기화.
5. `scripts/check-profile-character-layout.cjs`: 24개 표시/접근성 이름, 12개 기기 언어/우선순위/fallback 사례, 8개 기존 ID/키/버전1 저장 레코드 검증 추가. 기존 그림 크기/큰 글자/상태 검사는 유지했다.
6. 이 보고서.

## 실제 실행 결과

| 검사 | 결과 |
|---|---|
| `node_modules/.bin/tsc --noEmit -p apps/mobile/tsconfig.json` | PASS |
| `node scripts/check-profile-character-layout.cjs` | PASS — 승인된 24개 이름과 동일한 접근성 표기, 12개 기기 locale 사례, ID/키/레코드 유지. 기존 전체 알파 프레임/몸체 중심/72% 위계 및 KO/EN/JA × 밝음/어두움 × 320–768pt × 배율1–3.2 구조 검사도 통과 |
| `node --no-warnings scripts/check-profile-character.mjs` | PASS — 모델, 기존 선택 저장/읽기, 잘못된 레코드, 다른 설정 보존, 실제 메모리 SQLite 경계, 디스크 오류 롤백, 쓰기 직렬화/재마운트, 원본 이미지 해시 |
| `node scripts/check-my-departure-interactions.cjs` | PASS — iOS/Android 계정 게이트와 선택 동작, 설정 이동 및 기존 목적지/모션 회귀 |
| `npm run check:mobile-localization` | PASS — 2285개 소스 메시지/카탈로그/고정 번역 및 기존 locale 정책 검증 |
| `node scripts/check-localization-native-exports.mjs` | PASS — 126개 소비자와 공통 네이티브 번역/접근성 경계 |
| `git diff --check` | PASS |

`generate-mobile-locales.mjs --messages=…`로 먼저 새 메시지를 확인했다. 새 키가 승인된 이름 7개뿐임을 확인하고, 제공된 번역 규칙으로 카탈로그를 재생성했다. 외부 번역 요청이나 앱 빌드는 수행하지 않았다. 최종 검사에서 남은 실패 없음.

## 미검증과 산출물

- 네이티브 글리프 줄바꿈, OS 앱별 언어 변경 후 실제 화면 갱신, VoiceOver/TalkBack 발음·탐색, 실제 터치/기기 저장소는 미검증이다.
- 이전 요청의 Library 캡처 2개는 다운로드 실패로 직접 비교하지 못한 상태를 유지한다. 이번 명칭 작업에서 다운로드 제한을 우회하거나 기기/시뮬레이터를 실행하지 않았다.
- 전체 누적 변경 패치: `/workspace/weatheron-review-evidence/weatheron-my-profile-character-selection-and-names.patch`.
- 이번 검증·소스 보존 메타데이터: `/workspace/weatheron-review-evidence/naming-manifest.json`.
- 위 경로는 이 소비 환경의 로컬 파일이며 다른 환경에 자동 공유되거나 Library에 저장되었다는 의미가 아니다.
