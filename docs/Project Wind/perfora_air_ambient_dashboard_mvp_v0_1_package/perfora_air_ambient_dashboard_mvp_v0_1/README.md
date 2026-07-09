# Perfora Air — Ambient Dashboard MVP v0.1

## 개요

이 MVP는 요코하마 바람의 탑에서 추출한 Perfora Air 디자인 시스템을 실제 앱 화면으로 검증하기 위한 정적 웹 프로토타입입니다.

핵심 방향은 다음 네 가지입니다.

```txt
Matte Air
Soft Density
Quiet Signal
Text First
```

Liquid Glass처럼 강한 유리 굴절과 광택을 중심에 두지 않고, Material 3처럼 컬러·elevation만으로 상태를 설명하지 않습니다. 대신 보이지 않는 맥락을 표면 밀도, 낮은 강도의 빛, 느린 흐름, 명확한 문장으로 번역합니다.

## 포함 화면

| 화면 | 설명 |
|---|---|
| Home / Ambient Dashboard | 날씨, 공기질, 일정, 실내 상태를 하나의 분위기로 요약 |
| Weather Detail / Air Flow | 풍향·풍속·습도·빛을 행동 판단으로 번역 |
| Smart Home Air | 실내 공기질과 기기 상태를 “집 안의 공기”로 요약 |
| Day Flow / Schedule | 하루의 일정 밀도와 집중 구간을 시각화 |
| Modes & Accessibility | 모션, 투명도, 대비, 저전력 모드 제어 |

## 실행 방법

의존성이 없는 정적 프로토타입입니다.

```bash
cd perfora_air_ambient_dashboard_mvp_v0_1
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 엽니다.

로컬 파일로 바로 `index.html`을 열어도 동작합니다.

## 파일 구성

```txt
index.html                  # 앱 셸
styles.css                  # 토큰 + 컴포넌트 스타일 + 반응형 레이아웃
app.js                      # 화면 렌더링, 상태 매핑, 인터랙션
manifest.webmanifest        # PWA 메타데이터
mvp_notes.md                # MVP 설계 노트
```

## 구현된 인터랙션

- 하단 Flow Dock으로 화면 전환
- Day / Dusk / Night / Rainy 분위기 모드 전환
- Reduced motion / Reduced transparency / High contrast / Low power 토글
- 환기, 자동 모드, 집중모드 액션 toast
- 실시간 token mapping 패널 업데이트

## 다음 단계

1. 실제 WeatherON 데이터 모델과 API 연결
2. Figma Variables / CSS variables 동기화
3. React 또는 SwiftUI 컴포넌트로 변환
4. 5명 내외 사용자 테스트로 “분위기 우선 이해”가 실제로 작동하는지 검증
