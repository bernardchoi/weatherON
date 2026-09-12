# Project Wind v1.1 Experimental Add-on 품질 기준

## 자동 확인

- v1.1 manifest와 entrypoint 파일 존재
- JSON 산출물 파싱 가능
- v1.1 metadata가 `1.1.0-experimental` 또는 experimental 상태를 선언
- v1.0 reference 파일 존재
- React starter TypeScript 진입점 존재
- SwiftUI starter 파일 존재
- WeatherON adoption scope가 전체 교체 금지와 experimental layer 전략을 명시

## 제품 검증 전제

- v1.0 stable token/component 계약을 깨지 않아야 함
- density/lumen/flow는 데이터 매핑으로 설명 가능해야 함
- alert/critical은 action copy와 text-first fallback을 가져야 함
- 사용성 테스트 전에는 WeatherON 현행 MVP UI를 대체하지 않음

## WeatherON 설계 게이트 — 2026-09-12

- 현재 제품 기준은 `docs/01_experimental_direction_brief.md`와 `docs/06_weatheron_adoption_scope.md`임.
- 실제 공급 데이터로만 날씨를 표현함. 현재 없는 풍향·AQI·실내 센서 값을 생성하지 않음.
- 현재 날씨/미래 예보, 테마/지역 낮밤, 결측/정상을 구분함.
- 5초 준비 판단과 로고·모션 없는 화면군 인식은 `docs/05_usability_test_plan.md`로 검증함.
- 중요 정보의 접근성 모드 손실은 0이어야 함. 정적 검사 통과는 사용자·기기 검증을 대신하지 않음.
- 7월 범용 mapper와 새 WeatherON 설계의 차이가 해소되기 전 제품 연결을 보류함.

## 수동 검증 필요

- React starter 실제 빌드
- SwiftUI preview compile
- VoiceOver/TalkBack 보조공학 테스트
- Android/iOS low-power/reduced-motion 성능 확인
- WeatherON mockup-to-device 시각 QA
