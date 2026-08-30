# Implementation Plan: 중앙 실패-폐쇄 승인 게이트

## Selected Design And Constraints

옵션 2를 iOS에 먼저 적용함. 서버는 모든 플랫폼에 하위 호환 가능한 승인 계약을 제공하고, iOS 신규·교체 사진만 현재 정책 버전의 `accept`를 저장 조건으로 강제함. 기존 로컬 사진의 메타데이터 수정과 Android의 현재 동작은 이번 단계에서 유지함.

## Source Revision And Drift Check

- 설계 기준 리비전: `554bef0edb966e6d865b8eecec487ea54255843c`
- 구현 시작 상태: 설계 산출물 `docs/security/wardrobe-photo-hardening/`만 미추적 상태였고 관련 소스 수정은 없었음.
- 구현 중 관련 경계가 달라지면 승인 계약을 다시 검토함.

## Affected Components

- `apps/server/src/wardrobeCore.mjs`
- `apps/server/migrations/0004_wardrobe_ai_usage.sql`
- `scripts/check-wardrobe-analysis.mjs`
- `wrangler.toml`
- `apps/mobile/src/providers/wardrobePhoto.ts`
- `apps/mobile/src/components/WardrobePhotoRegistration.tsx`
- `apps/mobile/src/state/useWeatherOnAppState.ts`
- `apps/mobile/src/state/persistedAppState.ts`
- `packages/shared/src/types/wardrobe.ts`
- 개인정보 고지 문서와 앱 내 정책 화면

## Ordered Work Packages

- 서버 입력을 제한 길이로 읽고 JPEG 시그니처·크기·픽셀·SOF/SOS/스캔 구조를 검증함.
- App Attest가 본문을 읽어도 분석 경계가 같은 요청의 복제본을 사용할 수 있게 함.
- 모델 응답에 옷장 적합성·사람·민감 콘텐츠·아이템 수·허용 가능한 쌍 종류를 추가하고, 서버가 승인 정책 버전을 부여함.
- 첫 승인 신뢰도가 높지 않거나 첫 판정이 비승인일 때 자동 2차 판정함. 승인과 불확실 판정이 갈리면 3차 판정에서 2-of-3 승인이 확인돼야 통과하고, 명시적 위험 신호가 충돌하면 저장 대신 재촬영으로 보냄.
- 옷장 적합성은 계절·용도·날씨 태그 품질과 분리하고, 부가 속성이 비어도 기본값과 확인 필요 상태로 정상 사진 저장을 허용함.
- 인증 사용자별 빠른 호출 제한과 D1 일일 예산을 적용함.
- 서버 승인을 정규화 JPEG의 SHA-256 지문에 결합하고, iOS 신규·교체 사진은 저장 전후 지문과 단일 사용 승인 권한을 UI·앱 상태 양쪽에서 확인함.
- iOS 승인 사진은 iCloud 백업에서 제외하고 `FileProtection.complete`를 적용하며 보호 설정 실패 시 저장을 취소함.
- 거절·취소·저장 후 임시 JPEG를 삭제하고, 일시 오류는 같은 사진으로 재시도 가능하게 함.
- 앱 내 고지와 개인정보처리방침을 실제 처리 흐름에 맞춤.

## Compatibility And Migration

서버 성공 응답은 기존 속성을 유지하면서 승인 정책 버전과 사진 지문을 추가함. iOS 기존 사진은 승인 메타데이터가 없어도 같은 이미지의 메타데이터 수정은 허용함. 신규 사진 또는 이미지 교체에는 현재 정책의 사진 결합 승인이 필요함. Android 저장 강제는 후속 단계로 남김.

## Tactical Protections During Migration

- App Attest는 기존 `monitor` 모드를 유지함.
- 서버 오류·모델 오류·정책 버전 불일치는 iOS에서 실패-폐쇄로 처리함.
- 이미지·base64·모델 원문은 로그와 D1에 기록하지 않음.
- 서버가 배포되기 전 새 iOS 앱을 외부 배포하지 않음.

## Tests And Security Validation

- 정상 단일 의류 사진 승인
- 저신뢰 판정 불일치 후 3차 2-of-3 승인과 단일 승인 거절
- 두 번 일치한 비의류·사람·민감 콘텐츠 거절
- 서로 불일치한 판정은 `review` 처리
- MIME 불일치, 잘못된 JPEG, 과대 본문, 과대 픽셀 거절
- App Attest 검증기가 본문을 읽은 뒤에도 분석 성공
- rate limit과 일일 예산 429
- iOS 사진 지문 불일치·재사용 승인·직접 sink 호출 차단과 Android 호환 분기 정적 검증

## Performance And Resource Benchmarks

첫 판정이 0.9 이상의 고신뢰 승인이면 AI 호출은 1회로 유지함. 저신뢰 승인·비승인·애매한 경우 2차 호출하고, 명시적 위험 없이 한 번만 승인된 경우에만 3차 호출함. 실제 사진 코퍼스와 실기기에서 준비 시간, 업로드·분석 p50/p95, 피크 메모리를 후속 측정함.

## Rollout And Rollback

서버·D1 마이그레이션을 먼저 배포한 뒤 iOS 빌드를 배포함. 거절률·review 비율·429·5xx·p95를 확인해 점진 확대함. 롤백은 iOS 강제를 기능 버전으로 되돌릴 수 있으나 수동 신규 저장 우회는 복구하지 않는 방향을 유지함.

## Acceptance Criteria

- iOS 신규·교체 사진은 현재 사진 지문에 결합된 단일 사용 서버 승인이 없으면 저장되지 않음.
- 정상 단일 의류 판정과 저신뢰 불일치 후 2-of-3 승인 경로가 통과함.
- 비의류·사람·민감·손상 이미지가 신규 사진 상태에 도달하지 않음.
- 기존 iOS 사진의 메타데이터 수정과 Android 기존 동작이 유지됨.
- 관련 타입 검사, 집중 서버 검사, diff 검사, iOS 로컬 빌드가 통과함.

## Open Decisions

- 실제 사진 코퍼스의 출시 임계값과 카테고리별 오탐 허용치
- Android에 같은 실패-폐쇄 정책을 적용할 시점
- 사람 착용 사진과 얼굴 없는 마네킹 사진의 최종 제품 정책
