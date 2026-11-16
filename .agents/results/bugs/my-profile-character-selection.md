# 마이페이지 캐릭터 선택 UI 수정 — 2026-11-16

상태: 구현 및 정적 검증 완료. 첨부 캡처 비교와 네이티브 화면 검증은 미완료.

이 문서는 UI 구현 직후의 커밋·푸시 전 기록이다. 이후 승인된 이름 변경은 `profile-character-localized-names.md`에 기록하며, 커밋·원격 게시 여부는 해당 브랜치의 Git 기록과 푸시 결과를 기준으로 확인한다.

## 저장소와 기준

- 저장소: `bernardchoi/weatherON`, Linux 소비 환경 `/workspace/weatherON`.
- 작업 브랜치: `fix/my-profile-character-selection`.
- 기준 HEAD 및 확인한 원격 main: `07dcadbb07fb5546fda3af529ef3503afcc34657`.
- 시작 체크아웃: 깨끗한 `work` 브랜치, `63f5779`. 이 브랜치는 그대로 보존했다. 시작/종료 시 다른 worktree 및 stash 없음.
- 원격 `fix/destination-status-motion`: `01ee9585dc46b1018d804b85ff71d25c11fcc61b`. main의 자손이며 아직 main에 포함되지 않았다. `origin/main..origin/fix/destination-status-motion`에는 이 커밋 하나가 있다. 이번 변경에는 가져오지 않았다.
- 이번 패치는 미커밋·미푸시이며 main에 미통합이다. 홈/목적지 소스는 변경하지 않았다.

## 원인과 변경

`MyScreen.tsx`의 선택 버튼은 프로필 원과 떨어져 계정 작업 다음에 독립 텍스트로 배치되어 있었다. 원형 프로필을 `ProfileCharacterButton` 하나로 바꾸고, 장식 그림 아래에 기존 언어별 선택 캡션을 배치했다. 그림/캡션 자손은 접근성 탐색에서 숨기고 바깥 버튼에 이름과 button 역할을 부여했다. 캡션은 별도의 중복 터치 대상이 아니다.

일반 배율에서는 136/144pt 원 안에 64pt 그림과 캡션 공간을 따로 확보했다. 글자 배율 1.2 초과에서는 같은 버튼이 전체 폭의 높이 제한 없는 세로 배치로 바뀌고, 원형 그림 밑 캡션이 자유롭게 줄바꿈된다. 글자 크기 제한이나 한 줄 말줄임을 적용하지 않았다. Android는 계정 버튼과 선택 버튼을 형제 요소로 두어 중첩 버튼을 피했다. 계정 제목/설명의 한 줄 제한도 제거했다.

기존 선택창은 서로 다른 PNG에 일괄 80pt contain을 적용했다. 실제 메인 그림은 1024px 캔버스의 아래쪽에 있고 몸체 높이가 약 585px인 반면, 컴패니언 몸체는 512px 캔버스에서 약 340px다. 이에 기존 메인 몸체는 약 45.7pt, 다른 캐릭터는 약 53~54pt로 표시되었다.

`profileCharacterPresentation.ts`에 원본의 몸체 및 전체 알파 경계를 기록하고, 프로필 전용 렌더러에서 몸체 중심과 높이를 보정했다. 선택창은 96pt 스테이지를 사용해 대표 몸체를 76.8pt, 컴패니언 몸체를 55.3pt로 표시한다. 컴패니언은 아트바이블 2.2의 대표 대비 72% 위계를 따른다. 구름·번개·오라와 원본의 미세 알파 픽셀까지 프레임에 들어가는지 검사했다. 원본 PNG와 홈 렌더러는 수정하지 않았다.

선택창은 좁은 폭(360pt 미만) 또는 큰 글자(배율 1.2 초과)에서 한 열로 바뀐다. 카드 높이는 내용에 따라 늘어나고, 모달 제목과 설명도 카드와 함께 스크롤되어 큰 글자가 선택 영역을 밀어내지 않게 했다. 기존 이름·ID, 선택 저장 방식, 오류·재시도·닫기 동작은 유지했다.

## 변경 파일

1. `apps/mobile/src/screens/MyScreen.tsx`: 원형 선택 버튼 연결, 독립 텍스트 제거, Android 형제 버튼/큰 글자 배치.
2. `apps/mobile/src/components/ProfileCharacterPicker.tsx`: 단일 접근성 버튼, 보정 렌더러, 선택창 반응형 카드/스크롤.
3. `apps/mobile/src/utils/profileCharacterPresentation.ts`: 원본 픽셀 기준 몸체 중심·크기 보정.
4. `scripts/check-profile-character-layout.cjs`: 실제 알파 경계, 몸체 위계, 버튼/선택창 구조 및 상태 회귀 검사.
5. `scripts/check-my-departure-interactions.cjs`: 기존 모의 함수 보완, 선택 버튼/계정 이동 및 Android 중첩 버튼 방지 검사.
6. 이 보고서.

## 검증 결과

| 명령 | 최종 결과 | 검증 범위 |
|---|---|---|
| `node_modules/.bin/tsc --noEmit -p apps/mobile/tsconfig.json` | PASS | 모바일 전체 타입, 출력물 없음 |
| `node scripts/check-profile-character-layout.cjs` | PASS | 7개 원본 PNG 전체 알파가 64/80/96pt 프레임에 포함됨, 몸체 중심 및 72% 위계. KO/EN/JA × 밝음/어두움 × 320/360/390/430/768pt × 글자 배율 1/1.2/1.21/1.6/2/3.2의 실제 TSX 구조, 단일 접근성 동작, 8개 ID, 대기/저장/오류/재시도/닫기 |
| `node scripts/check-my-departure-interactions.cjs` | PASS | 게스트/약관/연결 계정과 위치/알림 상태, 계정 게이트 및 4개 설정 이동, 선택창 열기/닫기 독립성, Android 좁은/넓은/큰 글자 및 형제 버튼. 기존 목적지·설정 모션 회귀도 통과 |
| `node --no-warnings scripts/check-profile-character.mjs` | PASS | 8개 선택지, 잘못된 레코드, 실제 메모리 SQLite 저장/롤백, 쓰기 직렬화, 기존 설정 보존, 재마운트, 6개 에셋 출처 해시 |
| `node scripts/check-localization-native-exports.mjs` | PASS | 126개 소비자, 네이티브 경계, KO/EN/JA 텍스트·접근성·ref 호환 |
| `npm run check:mobile-localization` | PASS | 기존 2279개 메시지와 번역 카탈로그 일치 |
| `git diff --check` | PASS | 공백/패치 형식 |

수정 전 타입 검사와 프로필 저장 회귀 검사는 통과했다. 수정 전 `check-my-departure-interactions.cjs`는 `ReferenceError: useProfileCharacter is not defined`로 실패했다. 기존 테스트가 최근 프로필 기능의 모의 경계를 반영하지 못한 문제를 이번에 보완했으며, 최종 실행에서 남은 실패는 없다.

네이티브 Text 레이아웃 엔진을 실행한 검사가 아니다. 실제 글리프 줄바꿈/포커스 복귀/VoiceOver·TalkBack 탐색/터치/실제 모달 크기/프레임 성능은 미검증이다. 실기기·시뮬레이터·앱 빌드·웹 번들·커밋·푸시·배포를 실행하지 않았다. `AGENTS.md`와 관련 `oma-mobile` skill 및 React Native/접근성 지침을 읽고 적용했다. `oma` CLI가 없는 환경이므로 해당 CLI 실행 영수증은 없다.

## 첨부 및 보존

- 요청된 Library JPEG `libfile_dff1cb4332f48191bab163965342ac7b`와 PNG `libfile_8c6fac7fe41881918c48cf6471224ee7`를 Library skill의 `prepare_materialize`와 현재 제공된 전송 helper로 이 소비 환경의 `/workspace/weatheron-review-inputs`에 내려받기 시도했다.
- 두 파일 모두 `library file transfer failed: download failed`로 실패했다. 로컬 바이트가 없어 첨부 이미지는 보지 못했다. 다운로드 제한 우회나 다른 환경의 로컬 경로 사용은 하지 않았다. 따라서 사용자 캡처와의 전후 비교는 미검증이다.
- 저장소의 메인/컴패니언 원본 7개는 직접 열어 확인했다. `/workspace/weatheron-review-evidence/framing-comparison.png`는 이 에셋들을 기존/보정 방식으로 그린 정적 비교이며 실제 앱 화면 캡처가 아니다.
- 패치: `/workspace/weatheron-review-evidence/weatheron-my-profile-character-selection.patch`. 기존 추적 파일뿐 아니라 새 helper/검사/보고서도 포함한다. 패치의 역방향 적용 가능 여부를 현재 작업 트리에서 검사한다.
- 메타데이터/패치 해시: `/workspace/weatheron-review-evidence/manifest.json`.
- 위 경로는 이 소비 환경의 파일이다. 다른 환경에 자동 공유되거나 Library에 저장되었다고 가정하지 않는다.
