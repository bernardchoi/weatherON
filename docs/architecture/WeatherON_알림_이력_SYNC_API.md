# WeatherON 알림 이력 Sync API 메모

> 목적: H3/M2 알림 읽음·이동 이력을 계정 연결 후 서버에 동기화하기 위한 추후 API 범위 정리.
> 계정·인증·동기화 공통 원칙은 `docs/architecture/WeatherON_ACCOUNT_AUTH_SYNC_SPEC.md`를 따른다.

## 현재 구현

- 앱 로컬 상태: `readNotificationIds`, `notificationHistory`.
- `notificationHistory`는 읽음·열림·발송·수신 액션과 `occurredAt` 시각을 저장한다. 실제 로컬 푸시 수신은 Expo notification listener가 기록한다.
- 매일 21시 `bedtime-check`는 H7 `내일 브리핑`으로 연결한다. H7은 다음날 날씨·코디·우산 준비 전용 도착 화면이다.
- `heatwave-advisory`/`heatwave-warning`, `heavy-rain-advisory`/`heavy-rain-warning`는 H3 알림 센터로 연결한다. 예보가 기상청 특보 기준에 도달할 때만 `기준 도달 예상` 문구로 예약하며, 동일 등급은 event date 기준 하루 1회만 보관한다.
- 앱이 예보를 갱신할 때 로컬 예약을 생성한다. 앱 미실행 상태의 공식 특보 실시간 푸시는 KMA 특보 API와 서버 push worker 연결 전까지 제공하지 않는다.
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
- 인증: `Authorization: Bearer <WeatherON opaque session token>`.
- 응답:
  - `readNotificationIds: string[]`
  - `history: NotificationHistoryItem[]`
  - `updatedAt: string`

### 2. 알림 읽음 처리

- `POST /me/notifications/read`
- 인증: `Authorization: Bearer <WeatherON opaque session token>`.
- 요청:
  - `notificationId: string`
  - `title: string`
  - `source: "in-app" | "push"`
  - `occurredAt: ISO-8601 string`
- 동작:
  - 사용자별 read set에 upsert.
  - history에 `action="read"` 이벤트 upsert.

### 3. 알림 딥링크 열림 기록

- `POST /me/notifications/open`
- 인증: `Authorization: Bearer <WeatherON opaque session token>`.
- 요청:
  - `notificationId: string`
  - `title: string`
  - `route: P0RouteId`
  - `source: "in-app" | "push"`
  - `occurredAt: ISO-8601 string`
- 동작:
  - read set에 upsert.
  - history에 `action="open"` 이벤트 upsert.

## D1 초안

- `notification_state`
  - `user_id TEXT PRIMARY KEY`
  - `read_notification_ids_json TEXT NOT NULL`
  - `revision INTEGER NOT NULL`
  - `updated_at TEXT NOT NULL`
- `notification_history`
  - `event_id TEXT PRIMARY KEY`
  - `user_id TEXT NOT NULL`
  - `notification_id TEXT NOT NULL`
  - `title TEXT NOT NULL`
  - `action TEXT NOT NULL`
  - `occurred_at TEXT NOT NULL`
  - `route TEXT`
  - `source TEXT NOT NULL`
  - `created_at TEXT NOT NULL`
- 모든 조회·변경은 인증된 세션의 `user_id`를 서버에서 주입한다. 클라이언트가 보낸 사용자 id를 신뢰하지 않는다.

## 보안/운영 기준

- 클라이언트는 WeatherON 세션 발급 이후에만 서버 sync를 호출한다.
- 알림 이력에 정밀 좌표, 원문 API 응답, provider token을 저장하지 않는다.
- 목적지명이 포함될 수 있으므로 Worker가 세션의 `user_id`로 D1 쿼리를 제한한다.
- Guest 상태는 로컬 최소 저장만 허용하고, 계정 연결 전 서버 전송은 하지 않는다.
- 쓰기는 Workers API로만 처리하고 Rate Limiting과 App Attest/Play Integrity 검증을 적용한다.

## 남은 결정

- 네이티브 앱 로컬 저장소: `expo-secure-store` 또는 민감도 낮은 앱 전용 storage 중 선택 필요.
- 로컬 이력과 서버 이력 merge 정책: 최신 이벤트 우선, 동일 `notificationId + action` dedupe 권장.
- 푸시 수신 이벤트와 앱 내 H3 이벤트의 source taxonomy 확정 필요.
- KMA 기상특보 조회서비스 연동 후 `forecast-threshold`와 `official-warning` source를 이력에 구분할지 결정 필요.
