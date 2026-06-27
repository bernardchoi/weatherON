# WeatherON 알림 이력 Sync API 메모

> 목적: H3/M2 알림 읽음·이동 이력을 계정 연결 후 서버에 동기화하기 위한 추후 API 범위 정리.

## 현재 구현

- 앱 로컬 상태: `readNotificationIds`, `notificationHistory`.
- Web/IAB 검증용 로컬 영속화: `localStorage` key `weatheron.notificationState.v1`.
- 저장 범위는 최근 알림 이력 6개, 읽음 id 최대 40개로 제한한다.
- 저장 실패 또는 비지원 환경에서는 메모리 상태만 유지한다.

## 서버 Sync 필요 시점

- 계정 연결 후 기기 간 H3/M2 읽음 상태를 맞춰야 할 때.
- FCM/APNs 푸시 탭, 앱 내 딥링크, 읽음 처리를 같은 이력으로 합쳐야 할 때.
- 알림 강화 프리미엄에서 조건 변경, 재알림, 캘린더 연동과 연결할 때.

## 필요한 API

### 1. 알림 상태 조회

- `GET /me/notifications/state`
- 인증: Firebase ID Token.
- 응답:
  - `readNotificationIds: string[]`
  - `history: NotificationHistoryItem[]`
  - `updatedAt: string`

### 2. 알림 읽음 처리

- `POST /me/notifications/read`
- 인증: Firebase ID Token.
- 요청:
  - `notificationId: string`
  - `title: string`
  - `source: "in-app" | "push"`
- 동작:
  - 사용자별 read set에 upsert.
  - history에 `action="read"` 이벤트 upsert.

### 3. 알림 딥링크 열림 기록

- `POST /me/notifications/open`
- 인증: Firebase ID Token.
- 요청:
  - `notificationId: string`
  - `title: string`
  - `route: P0RouteId`
  - `source: "in-app" | "push"`
- 동작:
  - read set에 upsert.
  - history에 `action="open"` 이벤트 upsert.

## Firestore 초안

- `users/{uid}/notification_state/current`
  - `readNotificationIds: string[]`
  - `updatedAt`
- `users/{uid}/notification_history/{eventId}`
  - `notificationId`
  - `title`
  - `action`
  - `route`
  - `source`
  - `createdAt`

## 보안/운영 기준

- 클라이언트는 Firebase Auth 이후에만 서버 sync를 호출한다.
- 알림 이력에 정밀 좌표, 원문 API 응답, provider token을 저장하지 않는다.
- 목적지명이 포함될 수 있으므로 Firestore Security Rules로 본인만 접근 가능하게 한다.
- Guest 상태는 로컬 최소 저장만 허용하고, 계정 연결 전 서버 전송은 하지 않는다.
- App Check 적용 후 Cloud Functions 경유로만 쓰기 처리한다.

## 남은 결정

- 네이티브 앱 로컬 저장소: `expo-secure-store` 또는 민감도 낮은 앱 전용 storage 중 선택 필요.
- 로컬 이력과 서버 이력 merge 정책: 최신 이벤트 우선, 동일 `notificationId + action` dedupe 권장.
- 푸시 수신 이벤트와 앱 내 H3 이벤트의 source taxonomy 확정 필요.
