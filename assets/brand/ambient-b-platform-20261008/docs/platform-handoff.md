# 플랫폼 연결 안내

## iOS / Icon Composer

1. 기존 아이콘과 별개의 이름으로 새 Icon Composer 문서를 만듭니다. 캔버스1024×1024.
2. `ios/layers/light` SVG를 아래부터 background → sun → cloud → fold-under → fold 순으로 가져옵니다. PNG는 SVG 호환 문제가 있을 때의 후보입니다. 5개 자산은 background/sun/cloud/fold 4개 이하의 그룹으로 정리하고 fold-under와fold는 같은 그룹에 놓을 수 있습니다.
3. 원본 레이어에는 무광의 단색만 있으며 baked highlight/shadow/filter가 없습니다. Composer에서 얇은 깊이·절제된 빛을 적용하세요. 합성 참고 PNG의 그라데이션을 그대로 중복 재료로 겹치지 마세요.
4. 다크는 동일 path에 `ios/layers/dark` 색상을 참조해 appearance를 설정합니다. light/dark PNG를 서로 다른 심볼로 쌓지 않습니다.
5. `ios/composites/*foreground.png`는 배경 없는 전경 참고입니다. dark-1024는 어두운 배경 포함 비교용이지 투명 Dark 슬롯 파일이 아닙니다.
6. 시스템의 default/dark/mono/tinted/clear 지원 범위와 OS fallback을 실제 Xcode에서 확인합니다. 이 패키지는 `.icon` 파일 및 프로젝트 연결을 포함하지 않습니다.

공식:
https://developer.apple.com/documentation/xcode/creating-your-app-icon-using-icon-composer
https://developer.apple.com/documentation/xcode/configuring-your-app-icon

## Android

1. `android/res` 파일을 기존 이름과 충돌하지 않는 후보 리소스로 추가하는 것을 검토합니다. 현재 앱으로의 복사/설정 변경은 하지 않았습니다.
2. v26 XML은 foreground/background를, v33 XML은 monochrome까지 참조합니다. 필요한 경우 앱의 최소 지원 버전에 맞는 legacy bitmap fallback을 개발 단계에서 별도로 생성합니다. 현재 패키지는 API26 미만 fallback을 포함하지 않습니다.
3. 시스템 themed icon을 켰을 때 monochrome이 사용될 수 있으며 지원 여부는 OS/런처에 따라 달라집니다. 앱 내부 다크모드가 런처 아이콘 테마를 직접 결정하지는 않습니다.
4. 108dp 레이어와 중앙 안전영역을 유지합니다. 투명 foreground 전체를 확대해 크기를 맞추면 보호 영역 검증이 깨질 수 있습니다.
5. `android/store`는 스토어 전용이며 launcher XML과 구분합니다. Play 그래픽에는 최종 OS 마스크를 적용하지 않았습니다.

공식:
https://developer.android.com/develop/ui/compose/system/icon_design_adaptive
https://developer.android.com/distribute/google-play/resources/icon-design-specifications

## 디자인 경계

Ambient Surface의 구름·공기흐름·옷자락·열린 해 고리를 공통 정체성으로 유지합니다. iOS는 레이어와 절제된 깊이, Android는 tonal 면과 themed silhouette로 차이를 주었습니다. 70:30은 디자인 역할의 비유이며 플랫폼 규격의 수치가 아닙니다.
