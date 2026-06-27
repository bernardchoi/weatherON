# WeatherON Place Category Illustrations

목적지/장소 카테고리 화면에서 쓸 수 있는 복합 일러스트 애셋.

## Current Set

- `weatheron-place-baseball-v1.png`: 야구장/스포츠 관람.
- `weatheron-place-mountain-v1.png`: 산/등산/아웃도어.
- `weatheron-place-beach-v1.png`: 해변/바다.
- `weatheron-place-baseball-light-v2.png`: 라이트모드 P2/P3 야구장 카드용 와이드 이미지.
- `weatheron-place-mountain-light-v2.png`: 라이트모드 P2/P3 산/등산 카드용 와이드 이미지.
- `weatheron-place-beach-light-v2.png`: 라이트모드 P2/P3 해변 카드용 와이드 이미지.
- `weatheron-place-airport-v1.png`: 공항/여행.
- `weatheron-place-hotel-v1.png`: 숙소/여행 체류.

`place-category-assets.json`은 목적지 카테고리별 사용처를 관리하는 개발 manifest.

## Design Direction

- 작은 이모지 대체가 아니라, P2/P3의 카테고리 준비 가이드에 쓸 카드형 이미지 기준.
- 텍스트와 로고 없이 유지해 한국/일본/글로벌 화면에 재사용 가능하게 함.
- O6/P1의 작은 라벨은 현재 SVG 아이콘을 유지하고, 상세/가이드 영역에서 본 일러스트를 사용.
- 라이트모드는 밝은 배경과 와이드 슬롯에 맞는 `*-light-v2.png`를 우선 사용하고, 다크모드는 기존 `*-v1.png`를 유지.
