# WeatherON 계정·인증·동기화 기준

기준일: 2026-08-08  
상태: 구현 기준 채택, 원격 운영 개통 전

## 1. 목적

이 문서는 WeatherON의 계정 연결, 로그인 세션, 약관 동의, 사용자 데이터 동기화, 기기 변경 복원, 로그아웃·회원 탈퇴 기준을 정의한다.

계정의 목적은 로그인 화면 자체가 아니라 다음 기능을 안전하게 이어주는 것이다.

- 저장 목적지와 출발·알림 조건 유지
- 스타일 기준, 옷장, 저장 코디 유지
- iOS와 Android를 포함한 다기기 복원
- 계정 기반 알림 확장
- 데이터 내보내기와 회원 탈퇴 같은 이용자 권리 제공

## 2. 제품 원칙

- 첫 실행에 회원가입을 강제하지 않고 Guest 홈으로 진입한다.
- A2 계정 연결은 저장·동기화·알림 확장처럼 계정 가치가 있는 액션에서만 호출한다.
- 로그인과 약관 동의가 끝나면 사용자가 원래 시도한 액션으로 복귀한다.
- 위치·알림 권한이 필요한 액션은 계정 완료 후 O3 권한 흐름을 거쳐 같은 액션으로 복귀한다.
- Cloudflare 계정 저장소를 서버 원본으로 사용한다. CloudKit을 별도 주 저장소로 병행하지 않는다.
- SQLite는 네이티브 로컬·오프라인 저장소로 유지한다.
- Provider 이메일이 같다는 이유만으로 계정을 자동 병합하지 않는다.

## 3. 채택 아키텍처

| 영역 | 채택 기준 |
|---|---|
| 모바일 | React Native + Expo Dev Client + TypeScript |
| 로컬 저장소 | `expo-sqlite`의 `weatheron.db` |
| 세션 보안 저장소 | iOS Keychain / Android Keystore를 사용하는 `expo-secure-store` |
| API | Cloudflare Workers |
| 계정·동기화 DB | Cloudflare D1 |
| 사용자 이미지 | 필요 시 Cloudflare R2, MVP 초기에는 업로드하지 않음 |
| 운영 시크릿 | Cloudflare Worker Secrets |
| iOS 앱 무결성 | App Attest 우선, DeviceCheck 보조 |
| Android 앱 무결성 | Play Integrity 기반 검증 도입 검토 |
| 푸시 | APNs/FCM 기기 토큰을 사용자 계정과 별도 기기 레코드로 관리 |

Cloudflare Workers는 인증 Provider 검증, WeatherON 세션 발급, 사용자별 접근 제어, 동기화 API, 계정 삭제를 담당한다. D1은 내부 `userId`를 기준으로 사용자와 여러 인증 수단을 연결한다.

## 4. 현재 구현 상태

### 구현됨

- `POST /auth/apple/challenge`
- `POST /auth/apple/exchange`
- `GET /auth/session`
- `POST /auth/logout`
- `POST /account/terms`
- Apple identity token의 서명, issuer, audience, 만료, nonce 검증
- 일회성 challenge와 state 검증
- D1 `users`, `auth_identities`, `auth_challenges`, `auth_sessions` 스키마
- 세션 토큰 해시 저장과 모바일 SecureStore 보관
- A2 Apple 로그인, A3 약관 저장, A4 연결 해제 UI 연결

### 아직 운영 완료로 볼 수 없음

- 원격 D1 생성·마이그레이션과 Worker 운영 배포
- Apple Developer의 Sign in with Apple capability 활성 상태 확인
- EAS iOS 실기기 빌드에서 실제 Apple 로그인 검증
- 로그인 이후 사용자 데이터 동기화 API
- Android에서 사용할 공통 로그인 수단
- 계정 연결, 전체 세션 종료, 회원 탈퇴, 데이터 내보내기
- Rate Limiting, App Attest/Play Integrity, 운영 감사 로그

## 5. 로그인 Provider 단계

| 단계 | Provider | 목적 |
|---|---|---|
| 1 | Sign in with Apple | iOS 실제 로그인과 D1 세션 개통 |
| 2 | 이메일 코드 | iOS·Android 공통 복구 및 보조 로그인 수단 |
| 3 | Google | Android와 일반 해외 기본 로그인 |
| 4 | 카카오 | 한국 사용자 우선 로그인 |
| 5 | 네이버·LINE | 한국 보완 및 일본 진출 시 추가 |

지역별 최종 노출 우선순위는 기존 기획을 유지한다.

- 한국: 카카오·네이버 우선, Google·Apple·이메일 코드 보조
- 일본: LINE 우선, Apple·Google·이메일 코드 보조
- 일반 해외: Google·Apple·이메일 코드 중심

단, MVP 검증을 위해 모든 Provider를 동시에 개통하지 않는다. 현재 위치가 아니라 스토어 국가, SIM/전화 국가, OS 지역, 기기 언어, 타임존 순으로 로그인 수단을 추천하고 현재 위치는 마지막 보조 신호로만 사용한다.

## 6. 내부 사용자와 계정 연결

- 모든 Provider는 D1의 하나의 내부 `userId`에 연결한다.
- `auth_identities`는 `provider + provider subject`를 고유 식별자로 사용한다.
- Provider subject 원문은 저장하지 않고 서버에서 해시한 식별자를 저장한다.
- Apple의 비공개 릴레이 이메일과 Google·이메일 로그인 주소가 같거나 비슷해도 자동 병합하지 않는다.
- 사용자가 기존 세션으로 로그인한 상태에서 새 Provider를 추가 인증한 경우에만 같은 `userId`에 연결한다.
- 계정 연결 전에는 어떤 계정의 데이터가 유지되는지 사용자에게 명확히 안내한다.

## 7. 동기화 범위

### 서버 동기화 대상

- 스타일 성별·연령대·핏·스타일 태그
- 옷장 보유 항목과 저장 코디
- 저장 목적지, 도착 희망 시각, 이동수단, 반복 요일
- 목적지 케어와 알림 조건
- Smart Care 사용자 설정
- 온도·거리 단위, 테마 등 사용자 선택 설정
- 향후 계정 기반 알림 이력

### 기기 로컬 유지

- 위치·알림 권한 상태
- 현재 GPS 원본 좌표와 일시적인 검색 위치
- 날씨 응답 캐시와 Provider fallback 상태
- 인증 토큰
- 현재 화면, 선택 중인 항목, 임시 폼
- 기기별 알림 수신·읽음 상태

푸시 토큰은 동기화 데이터가 아니라 계정에 연결된 기기 레코드로 서버에 저장하며 로그아웃·권한 철회·토큰 갱신 시 정리한다.

## 8. 동기화 정책

- Cloudflare/D1을 서버 원본으로 사용하고 SQLite를 오프라인 미러로 사용한다.
- 각 동기화 레코드는 `id`, `user_id`, `updated_at`, `deleted_at`, `revision`을 가진다.
- 앱은 마지막 동기화 cursor 이후 변경분만 송수신한다.
- 첫 로그인에서 서버 데이터가 비어 있으면 허용된 로컬 데이터를 서버로 올린다.
- 서버와 로컬 데이터가 모두 있으면 컬렉션별 merge를 수행하고, 단일 설정값은 최신 revision을 우선한다.
- 삭제는 tombstone으로 먼저 동기화하고 보존 기간 이후 영구 삭제한다.
- 권한 상태, 날씨 캐시, 인증 토큰은 동기화하지 않는다.

## 9. 약관과 계정 수명주기

### 약관

- 필수: 만 14세 이상, 이용약관, 개인정보 수집·이용, 위치기반서비스 이용약관
- 선택: 마케팅 정보 수신
- 서버는 약관별 `document_key`, `version`, `accepted_at`, `withdrawn_at`을 기록한다.
- 현재처럼 `requiredAccepted=true`만 저장하는 방식은 운영 전 약관별 기록으로 확장한다.

### 로그아웃

- 현재 기기 세션만 revoke한다.
- SQLite의 사용자 데이터 삭제 여부는 사용자가 선택할 수 있도록 후속 UX를 정의한다.
- 다른 기기 세션과 서버 데이터는 유지한다.

### 계정 연결 해제

- 특정 Provider 연결만 제거한다.
- 마지막 로그인 수단은 대체 수단을 연결하기 전 제거할 수 없다.

### 회원 탈퇴

- 별도 재확인 후 모든 세션, 인증 연결, 사용자 동기화 데이터, push token, R2 파일을 삭제한다.
- 법령상 보관 대상은 운영 데이터와 분리하고 보관 사유·기간을 기록한다.
- 앱 내 경로와 외부 웹 삭제 요청 경로를 모두 준비한다.

## 10. 최소 보안 기준

- 모든 운영 API는 HTTPS만 사용한다.
- 세션 원문은 서버 DB에 저장하지 않고 SHA-256 해시만 저장한다.
- 로그인 challenge, 이메일 코드, 계정 연결, 회원 탈퇴 요청은 일회성 nonce와 만료 시간을 사용한다.
- 인증·코드 발송·검증 API에 IP·계정·기기 단위 Rate Limiting을 적용한다.
- 모든 사용자 데이터 API는 세션의 `userId`만 신뢰하고 요청 body의 임의 userId를 신뢰하지 않는다.
- 운영 로그에 identity token, session token, 이메일 원문, GPS 원본을 기록하지 않는다.
- iOS는 App Attest, Android는 Play Integrity 검증을 단계적으로 적용한다.
- 계정 삭제와 연결 변경은 최근 인증 또는 재인증을 요구한다.

### App Attest 2단계 구현 상태

- iOS 로컬 Expo 모듈이 키 생성, attestation, assertion을 `DCAppAttestService`로 수행한다.
- Worker는 D1에 일회용 challenge, 사용자·기기별 공개키, assertion counter, 실패 이력을 저장한다.
- 현재 보호 요청은 세션 복원, 약관 저장, 로그아웃이며 동기화·결제 API가 추가되면 같은 검증 계층에 연결한다.
- `APP_INTEGRITY_MODE=monitor`는 실패를 기록하고 요청을 통과시킨다. 실기기 안정화 후 `enforce`로 전환한다.
- Android는 현재 비활성이며 후속 Play Integrity 결과를 동일한 challenge·정책·감사 계층에 연결한다.

## 11. 실제 로그인 활성화 완료 기준

- 원격 D1 마이그레이션과 Worker 배포 완료
- iOS 실기기에서 Apple 로그인 성공
- 신규 로그인, 취소, 실패, 약관 저장, 앱 재실행 세션 복원 검증
- 기존 약관 사용자는 A3를 건너뛰고 미동의 사용자는 A3로 이동
- A3 완료 후 필요한 경우 O3를 거쳐 원래 액션으로 복귀
- 로그아웃 후 세션 API가 401을 반환하고 로컬 토큰이 제거됨
- 토큰·이메일·nonce가 운영 로그에 노출되지 않음
- Apple Developer App ID에 App Attest capability 활성화 및 운영 entitlement 서명 확인
- D1 `0002_app_integrity.sql` 원격 마이그레이션 및 Worker `monitor` 배포 완료
- iOS 실기기에서 attestation 등록, assertion counter 증가, 재사용 실패 기록 확인
- 실패율·미지원 기기 비율을 확인한 뒤 `APP_INTEGRITY_MODE=enforce` 전환
- Android 전환을 약속하기 전 공통 로그인 수단과 동기화 API가 실제 기기에서 검증됨

## 12. 관련 문서

- `docs/planning/WeatherON_MVP_기능_PRD.md`
- `docs/planning/WeatherON_기능_출시_로드맵.md`
- `docs/architecture/WeatherON_MVP_기술_ADR.md`
- `docs/architecture/WeatherON_SQLITE_STORAGE_SCHEMA.md`
- `docs/policy/weatheron_security_policy.html`
- `docs/policy/WeatherON_약관_정책.md`
