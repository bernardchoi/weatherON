# WeatherON Onboarding Illustrations

O2/O6 온보딩 목업과 이후 앱 온보딩 화면에 적용할 수 있는 raster 일러스트 애셋.

## Current Set

- `weatheron-onboarding-o2-ready-5sec-v1.png`: O2 기능 소개용. 날씨, 코디, 우산, 신발, 출발 알림을 한 장면으로 표현.
- `weatheron-onboarding-o6-destination-care-v1.png`: O6 목적지 등록용. 목적지 기반 자동 케어 정확도 향상을 표현.

`onboarding-assets.json`은 화면, 사용처, 설명을 관리하는 개발 manifest.

## Design Direction

- 텍스트 없는 이미지로 유지해 다국어 UI에 재사용 가능하게 함.
- Hybrid Chrome 톤의 딥 네이비, 민트, 스카이 블루, 웜 골드 중심.
- 목업에서는 hero 또는 상단 시나리오 이미지로 사용.
- 현재 버전은 MVP 목업용으로 사용 가능함. 네이비 기반, 글로시한 카드 질감, 기능색 포인트가 현재 UI 컨셉과 대체로 맞음.
- 최종 출시 전에는 O2/O6 모두 조금 더 단순하고 WeatherON 전용 스타일로 정리하는 2차 polish 권장.

## Review Notes

- O2는 날씨, 코디, 우산, 신발, 알림이 한 장면에 들어가 기능 소개 목적에 적합함.
- O2는 다만 실제 앱 UI 스크린샷처럼 보일 수 있어, 최종본에서는 앱 화면과 혼동되지 않도록 더 추상화된 시나리오 일러스트로 다듬는 것이 좋음.
- O6는 목적지, 경로, 날씨 비교, 자동 케어 의미가 전달되므로 방향은 맞음.
- O6는 현재 목업 카드 높이에서 핵심 요소가 일부 잘려 보일 수 있어, 최종본에서는 경로와 자동 케어 메시지가 더 명확한 단순 구도로 재제작하는 것을 우선 검토.
