# WeatherON 정책·운영설정 재검토

기준일: 2026-09-20. 한국·일본 법규, 영어·일본어 번역, iOS 공개 정책과 Cloudflare 실제 설정을 대조함. 9월 19일 보고서와 충돌하는 사실은 이 문서가 우선함. 법률전문가의 인증·적법성 보증이 아니며, 미확인 운영 사실은 확정하지 않음.

## 실제 Cloudflare 확인 결과

사용자 로그인 후 대시보드와 기존 Wrangler 인증으로 읽기 전용 확인함. 사용자 데이터 행·사진·토큰 값은 조회하지 않음. 설정 변경·복원·배포·D1 마이그레이션은 하지 않음.

| 항목 | 확인된 사실 | 정책상 의미 |
|---|---|---|
| 구독 | 청구 > 구독: Workers Free, 활성 | Paid 플랜 기준 기간을 적용하지 않음 |
| D1 | `weatheron-users`: `running_in_region=APAC`, `jurisdiction=null`, read replication disabled | 아시아·태평양 실행 지역만 확인됨. 한국·일본·미국 중 특정 국가로 추정하지 않음 |
| D1 복구 이력 | Free 플랜 공식 Time Travel 기간 7일 | 운영 DB 삭제와 복구 이력 만료를 구분하여 3개 언어 정책에 반영 |
| 운영 Worker | 개요: Workers Logs·Workers Traces 비활성화. API: `logpush=false`, `tail_consumers=[]` | URL 로그를 현재 3일 저장한다고 쓰지 않음. Cloudflare 내부 보안·운영 메타데이터까지 미수집이라고 단정하지 않음 |
| 운영 버전 | `34e5ab5b-0908-496d-9005-dcbd20b38e64`, 배포 2026-09-05 | 로컬 로그 가림 설정의 운영 적용 완료를 주장하지 않음 |
| 로컬 설정 | `observability.enabled=true`, logs enabled, invocation_logs false, redact_query_string true | 다음 배포 시 운영과 달라짐. 배포 직전 공개 정책의 로그 설명도 재확인 필요 |
| 로그 상품 기간 | Workers Free: 활성화 시 3일, Paid: 7일 | 상품 문서상 기간이며 현재 비활성 운영 로그의 보관 증거는 아님 |

근거: [D1 한도](https://developers.cloudflare.com/d1/platform/limits/), [D1 위치 정책](https://developers.cloudflare.com/d1/configuration/data-location/), [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/).

`APAC`은 국가 목록이 아님. D1 실행 지역은 Workers·Workers AI·Durable Objects·지원 접근·하위처리자의 국가를 증명하지 않음. 7일은 D1 Time Travel 기간이며 모든 Cloudflare 저장소·로그·백업의 일괄 파기기간이 아님.

## 법규 재검토

### 한국

- [개인정보 보호법 제30조](https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1029331583): 2026-09-11 시행본 확인. 처리 목적·기간·위탁·파기·권리행사 등 누락 여부를 실제 데이터별로 판단해야 함. 정책 시행일이 법률 시행일보다 빠르다는 사정만으로 위법이 되는 것은 아님. 이번에는 운영 사실 정정이며 기존 동의 문서 버전을 임의로 올리지 않음. 공개 확정 시 문서·동의 화면·서버 버전 함께 정리 필요.
- [제28조의8 제1항](https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1029331979): 국외 위탁·보관에 반드시 별도 동의 하나만 가능한 것은 아님. 계약 체결·이행에 필요한 위탁·보관과 법정 공개·통지 요건을 충족하는 경로도 있음. WeatherON이 어느 근거를 충족하는지 계약·국가·목적별로 확정해야 함. [동의 시 고지사항](https://law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1033215841)의 국가·수령자·기간을 APAC만으로 충족했다고 판단하지 않음.
- 위치권한 선택 안내와 계정 동의 강제는 별개임. `TermsConsentScreen.tsx`와 `authCore.mjs`는 위치 동의를 계정 진행 조건으로 사용함. 9월 19일 문서의 ‘네 항목 필수화로 해소’는 선택 동의 문제까지 해소했다는 뜻으로 사용하면 안 됨. 수동 지역 이용·거부 경로와 서버 계약 수정 및 회귀검사 필요.
- [위치정보법 제16·18·19조](https://elaw.klri.re.kr/eng_mobile/viewer.do?hseq=61450&key=ACT+ON+THE+PROTECTION+AND+USE+OF+LOCATION+INFORMATION&type=lawname)는 사업 유형별 검토 대상으로 유지함. 해당 링크는 번역본으로 최신 한국어 시행법·시행령·고시 확인을 대신하지 않음. 개인 개발자라는 사유만으로 비적용 또는 등록·신고 의무를 확정하지 않음. 확인자료 기록 기능과 적용되는 기간의 확정은 미완료임.

### 일본

- [PPC 통칙 가이드라인](https://www.ppc.go.jp/personalinfo/legal/guidelines_tsusoku/) 제32~39조 관련 절차 및 역외적용 부분 대조함. 한국 정책의 일본어 번역만으로 일본 대상 제공의 요건 충족을 인정하지 않음.
- 개인 운영자에게 법인의 대표자 항목을 그대로 강제하지 않음. 제32조는 성명 또는 명칭·주소, 법인인 경우 대표자 성명을 구분함. 본인의 요구에 지체 없이 답하는 방식도 ‘알 수 있는 상태’에 포함하므로 주거 주소를 무조건 웹에 공개하라고 단정하지 않음. 실제 응답 절차와 주소 확인은 필요함.
- 이용목적 통지, 개시, 정정·추가·삭제, 이용정지·소거·제3자 제공정지, 해당 제공기록 개시, 대리인·불만 접수 절차는 현재 일반 이메일 안내만으로 운영 준비 완료라고 볼 수 없음.
- [PPC 국외 위탁 FAQ](https://www.ppc.go.jp/all_faq_index/faq1-q12-1/): 위탁이라는 이유만으로 국외 제공 규정이 항상 제외되지 않음. 적용 예외 또는 동의 근거와 보호체계를 확인해야 함.

### 영어 및 iOS

영어 지원은 미국·영국·EU 전체 법규 준수 선언이 아님. 실제 App Store 판매 국가가 확정되지 않아 해당 국가별 심사는 아직 완료하지 않음. 영어본은 한국어본과 같은 데이터 흐름·기간으로 정정함.

[Apple 심사 지침 5.1.1·5.1.2](https://developer.apple.com/app-store/review/guidelines/#privacy)에 따라 보유·삭제와 외부 AI 전송 고지·명시적 허락을 구분해야 함. `WardrobePhotoRegistration.tsx`는 사진 선택 후 분석을 호출함. 사진 접근 권한만으로 Cloudflare Workers AI 전송의 명시적 허락까지 증명하지 못함. 별도 전송 전 안내·허락 경로 검증은 남아 있음.

## 남은 실제 운영 불일치

| 경로 | 미완료 내용 |
|---|---|
| `apps/server/migrations/0002_app_integrity.sql` | 무결성 이벤트의 계정·세션 참조는 삭제 시 NULL 처리. 이벤트 보유기간·정기 파기 미확정. NULL 처리가 완전 익명화라는 근거 없음 |
| `apps/server/src/authCore.mjs` | 기본 세션 유효기간 30일은 DB 행 파기기간이 아님. 만료·철회 행의 삭제 주기 필요 |
| `apps/server/src/departurePushCore.mjs` | Durable Objects 푸시 예약은 계정 삭제와 별도. 성공·무효 토큰 처리 또는 출발 1시간 후 만료를 확인하는 alarm에서 삭제. 즉시·정확한 시각의 물리 삭제 보장 아님 |
| D1·DO 복구·외부 제공자 | 계정 삭제 후 복구·재전송 방지 절차, DO 복구 이력, APNs 등 제공자 보존기간 미확정 |
| 공개 정책 | 데이터 항목별 완결된 기간·국외이전 표·권리행사 운영 절차 미완료. 내부 표현 제거와 번역 완료만으로 출시 적법성 판단 불가 |

## Cloudflare에 확인할 정확한 항목

[Self-Serve 약관 6.1](https://www.cloudflare.com/terms/)에는 특정 개인정보 범위에 DPA를 편입하는 조항이 있음. 별도 서명 문서가 없다는 사실만으로 DPA 미적용이라고 단정하지 않음. 다만 한국·일본 이용자 데이터에 적용되는 계약 범위를 현재 공개 문구만으로 확정하지 않음. [DPA](https://www.cloudflare.com/cloudflare-customer-dpa/)와 [하위처리자 목록](https://www.cloudflare.com/gdpr/subprocessors/)을 실제 상품 범위와 대조해야 함.

다음 질문은 준비만 했으며 외부 전송하지 않음:

1. Workers Free의 APAC·jurisdiction 미지정 D1에 대해 본 데이터·복구 이력·지원 접근이 가능한 국가 목록과 국가 고정 가능 여부는 무엇인지?
2. Workers, Workers AI 이미지 입력·출력, SQLite Durable Objects의 실행·저장·복구·하위처리 국가와 적용 하위처리자는 누구인지?
3. Workers Logs·Traces·Logpush가 꺼진 상태에서도 URL 쿼리·IP·보안 메타데이터를 처리하는지, 항목별 목적·기간·삭제 예외는 무엇인지?
4. 이미지 입력·출력의 일시 처리 종료 시점과 보안·운영 로그 포함 여부, DO 삭제 후 복구 이력 보존기간은 무엇인지?
5. 한국 PIPA·일본 APPI 대상 이용자 데이터에 현재 계정의 Self-Serve 약관 및 DPA가 어떻게 적용되는지?

국가·기간이 확인되면 세 언어 정책과 앱 요약을 함께 갱신할 것. ‘전 세계’, ‘미국’, ‘즉시 파기’를 근거 없이 채우지 말 것. `0005_consent_records.sql`은 기존 지시대로 다음 서버 배포 직전에 적용하며 이번 조회에서는 실행하지 않음.

## 이번 반영 및 검증

- 한국어·영어·일본어 웹 정책: D1 APAC, 읽기 복제 미사용, D1 복구 이력 7일, 운영 로그 비활성 상태, WeatherKit 및 DO/APNs 데이터 흐름 반영.
- 앱 정책·영어·일본어 번역 및 번역 생성 원본: D1 지역·복구 이력과 미확인 로그 가림 완료 주장 정정.
- 기존 작업 보존. 공개 배포·계정 설정 변경·사용자 데이터 수정 없음.
- 검증: `check:mobile-localization` 2,035개 메시지, `check:android-release`, 모바일 TypeScript 검사, `git diff --check` 통과. In-app browser에서 영문·일문 본문과 언어 전환 확인. 네이티브 앱·국가별 출시 심사·물리적 백업 삭제 검증은 아님.
