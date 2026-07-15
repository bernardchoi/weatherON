# Project Wind v1.0 품질 기준

## 자동 통과 항목

- token/component JSON 파싱과 버전 메타데이터
- 모든 token alias의 실제 경로 존재
- 컴포넌트 token 참조 무결성
- CSS custom property 참조 무결성
- stable 컴포넌트 10종 존재
- 9개 환경·접근성 mode 존재
- skip link, live region, pressed/current state, 44px target, focus, reduced motion/transparency 존재

## v1.0에 포함된 시각 검증 기준

- 무광 표면이 유리 굴절이나 강한 광택보다 우선함.
- density는 정보 상태와 연결된 경우에만 사용함.
- lumen은 상태 피드백이며 장식 glow로 사용하지 않음.
- alert/critical은 텍스트와 행동을 시각 효과보다 우선함.
- Day/Dusk/Rainy/Night에서 같은 정보 구조와 조작 순서를 유지함.

## 제품 채택 전 추가 기준

- VoiceOver/TalkBack/NVDA 중 목표 플랫폼 보조공학 수동 테스트
- React Native 토큰 변환 결과와 참조 CSS의 semantic parity
- Android/iOS 실제 기기에서 low-power·reduced-motion 성능 확인
- WeatherON 핵심 화면별 목업 승인과 mockup-to-device 시각 QA
