# WeatherON Ambient B · 플랫폼별 독립 애셋

제작일: 2026-10-08. 기존 애셋을 교체하지 않는 별도 제작본입니다.

## 이번에 제작한 것

- 공통 SVG path 원본: 구름, 열린 해 고리, 하단 옷자락 곡면. 선택 B를 시각적으로 참고해 새 벡터로 저작했습니다. 원래 생성 PNG를 자동 추적하거나 픽셀 편집한 파일이 아닙니다. 기존의 사진 같은 질감보다 면과 윤곽을 정돈한 벡터 해석입니다.
- iOS: 라이트/다크 1024×1024 RGB 합성 참고 PNG/SVG, 투명 전경 합성 PNG/SVG, 배경·해·구름·접힘 뒷면·옷자락 5개 SVG/PNG 레이어 각 모드별 제공.
- Android: 108dp VectorDrawable 전경·배경·monochrome, API26 및 API33 adaptive-icon XML. 서로 구분되는 리소스 이름으로 보관.
- Google Play: 512×512, 32-bit RGBA PNG, sRGB. 전체 불투명, 18,344 bytes. 스토어가 적용하는 바깥 마스크/그림자는 이미지에 구워 넣지 않았습니다.
- 비교 미리보기: iOS 라이트/다크, Android 마스크 및 monochrome 예시.

## 적용 상태

제작 파일은 준비했지만 앱에 연결하거나 빌드·배포하지 않았습니다. Xcode Icon Composer에서 `.icon` 파일로 구성·컴파일하지 않았으므로 현재 합성 미리보기를 실제 Liquid Glass 효과라고 해석하면 안 됩니다. Android XML 파싱 검사는 통과했지만 Android 리소스 컴파일이나 실기기 실행을 뜻하지 않습니다.

## 확인한 사항

- 라이트/다크 iOS 레이어의 path가 동일함을 자동 확인했습니다. 색만 다릅니다.
- iOS 합성 PNG: 1024×1024 RGB, 알파 채널 없음. 전경/분리 레이어는 투명 PNG입니다.
- Android 전경을 1080px로 렌더해 모든 비투명 픽셀을 검사했습니다. 중심에서 최대 거리 32.367dp(컬러), 32.732dp(monochrome)로 반경33dp 안에 들어옵니다. 전경 경계 크기는62.7×48.5dp입니다. 수치는 래스터 근사 검사이며 기기 결과를 대신하지 않습니다.
- XML/SVG 파싱, 파일 체크섬, Play PNG 크기·색상 타입·용량을 확인했습니다.

## 아직 검증하지 않은 사항

- Xcode `.icon` 제작 및 appearance별 시스템 렌더링
- Xcode/Android 리소스 빌드, OS 버전별 fallback
- 실제 기기의 작은 크기, 확대 표시, Dark/Tinted/Clear, OEM별 마스크/모션
- 앱스토어 제출 검증

## 보관·연결 원칙

기존 `AppIcon`, `ic_launcher`, 프로젝트 설정을 덮어쓰지 않습니다. 이 패키지의 고유 이름으로 후보를 추가하고 별도 승인된 적용 작업에서만 연결합니다. `source/build_assets.py`는 새 SVG/XML을 저작하고 Inkscape로 렌더링하는 재생성 스크립트입니다. `source/validate_and_preview.py`의 Pillow 사용은 픽셀 읽기 검증만 하며 이미지를 편집하지 않습니다.

상세 사용법과 공식 출처는 docs/platform-handoff.md, 검사결과는 docs/validation.json을 참고하세요.
