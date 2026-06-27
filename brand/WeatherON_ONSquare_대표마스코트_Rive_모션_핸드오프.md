# WeatherON ON Square 대표 마스코트 — Rive 모션 핸드오프

기준일: 2026-06-22  
상태: 모션 시스템 확정 · CSS 프로토타입 검증 단계

## 1. 목표

- 2D 캐릭터 원형 유지
- 날씨 변화와 미션 성과를 작은 움직임으로 전달
- 장시간 노출해도 피로하지 않은 Living Mascot 구현
- 런칭 범위는 대표 마스코트 1종. 컴패니언 6종은 동일 State Machine을 축소 재사용

## 2. Rive 구조

아트보드: `HeroMascot` / 기준 크기 512×512 / 원점 중앙 하단.

레이어 순서:

1. `SCENE_BG`
2. `AURA_FX_BACK`
3. `BODY`
4. `HEAD`
5. `FACE`
6. `HANDS`
7. `KNOB`
8. `AURA_FX_FRONT`

State Machine: `HeroLivingState`

| 입력 | 타입 | 값 |
|---|---|---|
| `weather` | Number | 0 clear, 1 cloud, 2 rain, 3 heat, 4 cold, 5 storm, 6 night |
| `checkIn` | Trigger | 체크인 완료 |
| `missionComplete` | Trigger | 일반 미션 완료 |
| `missionAction` | Number | 0 jump, 1 clap, 2 thumbsUp |
| `rareReward` | Trigger | 희귀 보상 획득 |
| `reducedMotion` | Boolean | 감소 모션 적용 |
| `isVisible` | Boolean | 화면 노출 여부 |

## 3. 레이어와 우선순위

- `Base`: 호흡 3.2초, 눈 깜빡임 4~7초 랜덤, 노브 흔들림 ±2°.
- `Weather`: 현재 날씨 표정·포즈·AURA 지속 상태. Base 위에 합성.
- `Event`: 1회 재생 후 Weather로 복귀. 미션 완료는 `missionAction` 값에 따라 점프·박수·엄지 포즈 중 하나를 재생.
- 우선순위: `rareReward > missionComplete > checkIn > weather > idle`.
- 이벤트 큐는 1개만 허용. 동일 트리거 연타는 1.2초 동안 무시.

## 4. 모션 스펙

| 상태 | 동작 | 시간·범위 |
|---|---|---|
| Idle | 호흡 + 눈 깜빡임 + 노브 미동 | 3.2s loop · Y ±1.5% · ±2° |
| Clear | 젬/림라이트 펄스 | 2.8s loop · opacity 0.25→0.55 |
| Cloud | 느린 호흡, 채도 감소 | 4.2s loop · saturation 0.9 |
| Rain | 작은 우산/빗방울 FX, 고개 1회 기울임 | 3.6s loop · ±2° |
| Heat | 늘어짐 + 땀방울 | 3.8s loop · Y +1.5% |
| Cold | 짧은 떨림 + 입김 | 2.6s loop · X ±1% |
| Storm | 바람 흔들림 + 저강도 번개 | 3.0s loop · ±3° |
| Night | 느린 호흡 + 별빛 | 4.8s loop · Y ±1% |
| Check-in | 작은 점프 + 착지 | 720ms · 높이 7% 이하 |
| Mission Jump | 기쁜 작은 점프 + 착지 + 젬 발광 | 860ms · 높이 7% 이하 |
| Mission Clap | 손 2회 박수 + 가슴 젬 발광 | 1,020ms |
| Mission Thumbs-up | 한 손 엄지 내밀기 + 고개 끄덕임 + 젬 발광 | 1,080ms |
| Rare reward | 3/4 기울임 + 윙크 + 골드 파티클 | 1,250ms · 파티클 24개 이하 |

Easing: 등장/이벤트 `cubic-bezier(0.34,1.56,0.64,1)`, idle `ease-in-out`.

미션 완료 액션 운용:

- 기본값은 `missionAction=1 clap`. 반복 노출 피로도를 줄이기 위해 동일 미션 타입 연속 2회 이상이면 jump/clap/thumbsUp을 순환.
- 가벼운 일일 미션: `jump` 우선. 누적/연속 달성: `clap` 우선. 난이도 높거나 사용자가 직접 완료 버튼을 누른 미션: `thumbsUp` 우선.
- 엄지 동작은 최종 Rive에서 `HANDS` 파츠 교체로 구현. CSS 프로토타입은 비트맵 검증용이라 Event/Weather+Event PNG 스왑으로 표시.
- 날씨 소품이 있는 상태에서는 이벤트 반응도 해당 소품을 유지한다. 예: `rain` 상태에서 점프/박수/엄지 반응 시 우산과 빗방울이 사라지지 않아야 한다.

## 5. 앱 연결 규칙

```ts
type HeroWeather = 'clear' | 'cloud' | 'rain' | 'heat' | 'cold' | 'storm' | 'night';
type HeroEvent = 'checkIn' | 'missionComplete' | 'rareReward';
type HeroMissionAction = 'jump' | 'clap' | 'thumbsUp';

interface HeroMascotMotionProps {
  weather: HeroWeather;
  event?: HeroEvent;
  missionAction?: HeroMissionAction;
  reducedMotion: boolean;
  isVisible: boolean;
}
```

- 기상 API 값은 앱의 H1 날씨 토큰에서 `HeroWeather`로 단일 변환.
- 화면 진입 시 현재 `weather`로 200ms 크로스페이드.
- 앱 백그라운드·탭 이탈·뷰포트 밖에서는 `isVisible=false`로 루프 정지.
- `event='missionComplete'`가 들어오면 `missionAction`을 읽고 미지정 시 `clap`을 재생.
- 이벤트 완료 콜백 후 현재 Weather 상태로 복귀.

## 6. 접근성·성능

- OS `prefers-reduced-motion`을 `reducedMotion` 기본값으로 사용.
- 감소 모션에서는 상시 루프 정지. 이벤트는 150ms 젬 발광과 표정 스왑만 사용.
- 30fps 목표, Rive 파일 500KB 이하 권장, 동시 파티클 24개 이하.
- 저전력 모드에서는 파티클 제거, Base Idle만 15fps로 운용.

## 7. 제작·검수 순서

1. 원본 파츠 분리: HEAD/BODY/FACE/HANDS/KNOB/AURA.
2. Idle + Check-in 리그로 실루엣 변형 여부 검수.
3. 7개 Weather 상태 연결.
4. Mission Jump/Clap/Thumbs-up/Rare Reward 이벤트 연결.
5. 120px·160px 앱 실크기, Reduced Motion, 백그라운드 정지 검수.
6. 대표 마스코트 통과 후 컴패니언 6종에 축소 골격으로 전개.

검증 프로토타입: `brand/WeatherON_ONSquare_대표마스코트_2D모션_프로토타입.html`  
시각 기준: `brand/ON Square 대표마스코트_날씨반응·모션_기준시트-v2.png`

앱 적용용 투명 PNG:

- 기본: `brand/ON Square 대표마스코트_기본_투명-v1.png`
- 날씨: `brand/ON Square 대표마스코트_날씨-{clear|cloud|rain|heat|cold|storm|night}-v1.png`
- 이벤트: `brand/ON Square 대표마스코트_이벤트-{idle|mission-jump|mission-clap|mission-thumbsUp}-v1.png`
- 날씨+이벤트 조합: `brand/ON Square 대표마스코트_날씨이벤트-{rain-mission-jump|rain-mission-clap|rain-mission-thumbsUp|cold-mission-clap|night-mission-clap|storm-mission-thumbsUp}-v1.png`
- CSS 프로토타입은 날씨 버튼 선택 시 Weather PNG를 표시하고, 이벤트 버튼 선택 시 Weather+Event PNG가 있으면 우선 표시한다. 조합 에셋이 없을 때만 기본 Event PNG를 잠깐 표시한 뒤 현재 Weather PNG로 복귀한다.
