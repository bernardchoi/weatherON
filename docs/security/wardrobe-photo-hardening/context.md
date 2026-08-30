# 옷장 사진 업로드 보안 검토 근거

- 분석 ID: `hardening_20260830_wardrobe_photo`
- 소스 루트: `/Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱`
- 기준 리비전: `554bef0edb966e6d865b8eecec487ea54255843c`
- 기준 브랜치: `main`
- 소스 드리프트: 없음(`git status --porcelain=v1` 출력 없음)
- 제약 프로필: 성능·정확도·개인정보를 함께 고려하는 균형형
- 근거 컬렉션 SHA-256: `5e7e33c705d51df5eb323523513b400f156eeddca27c180acd8723e33fbee807`

## 근거 목록

| ID | 제목 | 경로 | SHA-256 |
| --- | --- | --- | --- |
| `E1` | 모바일 사진 선택·정규화·전송 | `apps/mobile/src/providers/wardrobePhoto.ts` | `561542922df33be1b554e4056c4bb3c48f2ad808bfcdd8fa712e83bbc1b3c280` |
| `E2` | 사진 등록 UI와 수동 저장 우회 | `apps/mobile/src/components/WardrobePhotoRegistration.tsx` | `05ad309d651f64bd697b5b4d21bf0e276e447733b572f36b1550f3b6dd360a8a` |
| `E3` | 서버 사진 분석 경계 | `apps/server/src/wardrobeCore.mjs` | `1e57e3cf94c01d22f37140d271acea5fb135c3ea5d9d99bedd8770047d1d0354` |
| `E4` | App Attest 검증과 모니터 모드 | `apps/server/src/integrityCore.mjs` | `6492dacd6ca73107abda58cc47af44f7d8d419693c802cd363108940d44b9f89` |
| `E5` | Cloudflare Worker 라우팅 | `apps/server/src/worker.mjs` | `4b6b54b56a9042ab3ef78b9b11384bface902efbcbf6d13a734be4383c1cb1ff` |
| `E6` | 카메라·사진 보관함 권한 선언 | `apps/mobile/app.json` | `a13e8328dc0665487e1fcd42eb53cb36a117e63813eb00e9359915071d7dd1a9` |
| `E7` | 앱 내 개인정보처리방침 요약 | `apps/mobile/src/screens/PolicyDocumentScreen.tsx` | `260b1d196d3cfb03e3db82f216c15f497fd023229612ace965e59314eabc62ce` |
| `E8` | 배포용 개인정보처리방침 | `docs/policy/weatheron_privacy_policy.html` | `b15fcdb011efd90632719dd3d84baf12aaf0bdbe8c2480d62cde20153c5b3527` |

## 외부 근거

- Cloudflare Workers AI 데이터 사용 문서: 입력 이미지는 Customer Content이며, 명시적으로 저장 서비스를 함께 쓰지 않는 한 Workers AI 때문에 저장되는 구조는 아니라고 설명함.
- Cloudflare Workers Rate Limiting 문서: 사용자 ID 같은 안정적 키를 권장하며, 빠르지만 로컬·eventually consistent라 정확한 사용량 회계 수단은 아니라고 설명함.
- 외부 문서는 2026-08-30에 공식 Cloudflare 문서로 확인함. 계약·처리 지역·국외이전 고지는 별도 법무 검토 대상임.

## 증거 한계

- 실제 의류/비의류 이미지 코퍼스의 모델 정확도, 오탐·미탐, 지연시간은 측정하지 않았음.
- iOS·Android 앱 샌드박스의 백업 제외와 파일 보호 등급은 패키지 산출물에서 확인하지 않았음.
- App Attest는 현재 `monitor` 모드라 실패 요청도 기능 호출을 계속할 수 있음.
- 본 분석은 설계 제안이며 구현 또는 취약점 해결 증거가 아님.
