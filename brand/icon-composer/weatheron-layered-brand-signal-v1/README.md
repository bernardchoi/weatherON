# WeatherON Layered Brand Signal v1

선택된 3번 방향을 Icon Composer에서 재구성하기 위한 제작 소스다. 이미지 생성 시안의 광택과 그림자를 래스터에 굽지 않고, 원본 `icon-primary.svg`의 좌표와 브랜드 색을 유지한 3개 벡터 레이어로 분리했다.

## 파일

- `layers/l1-background.svg`: Clear Navy 풀블리드 기준면
- `layers/l2-mid.svg`: Cream 트랙, Clear Navy OFF 마크, Paper White 구름
- `layers/l3-foreground.svg`: Warm Gold 태양 노브와 정확히 3개 광선
- `WeatherON-App-Icon.icon`: iOS 전용 Icon Composer 문서
- `preview-composite.svg`: 레이어 정합 확인용 합성본. Icon Composer 가져오기 금지
- `manifest.json`: 팔레트, 레이어 순서, 재질 의도, 검증 제약

모든 레이어는 1024×1024 캔버스와 `0 0 120 120` 뷰박스를 공유한다. L1은 플랫폼 마스크를 포함하지 않는 풀블리드 사각형이다. 외곽 모양은 Icon Composer와 iOS가 적용한다.

## Icon Composer 가져오기

1. Xcode의 `Open Developer Tool > Icon Composer`를 연다.
2. `WeatherON-App-Icon.icon`을 연다.
3. L1은 `01-background.svg` 후면 그룹에 Default·Dark Clear Navy를 주석하고, 문서 Fill에도 같은 색을 둔다.
4. L2와 L3는 각각 `02-mid.svg`, `03-foreground.svg` 그룹으로 구성된다. JSON 배열은 L3→L2→L1 순서가 전면→후면이다.
5. Default와 Dark는 원본 브랜드색을 유지하고, Mono는 같은 글리프와 레이어 순서로 시스템 틴트를 확인한다.
6. 32px, 64px, 실제 홈 화면 크기에서 구름·OFF 마크·3개 광선이 합쳐지거나 사라지지 않는지 확인한다.

## 제작 원칙

- 브랜드 색은 각 도형 면적의 90% 이상 유지한다.
- 블러, 그림자, 굴절, 스페큘러 하이라이트를 SVG에 굽지 않는다.
- 구름은 L2, 태양 노브와 3개 광선은 L3에 둔다.
- L1에는 라운드 사각형 마스크를 넣지 않는다.
- L1 후면 그룹과 문서 Fill은 플랫폼 외곽 마스크를 포함하지 않으며 iOS가 최종 마스크를 적용한다.
- 이 폴더의 SVG는 제작 원본이다. iOS 앱 타깃은 동일한 `WeatherON-App-Icon.icon` 사본을 `apps/mobile/ios/WeatherON/`에서 컴파일한다.

## 2026-08-23 검증

- Apple `ictool` 렌더: Default·Dark·Mono/Tinted Dark 1024px 통과
- 소형 렌더: Default 32px·64px, Dark 32px, Mono/Tinted Dark 32px에서 OFF 마크와 3개 광선 식별 통과
- `actool`: iOS 16.4, iPhone·iPad 대상으로 `Assets.car`와 앱 아이콘 PNG 생성 통과
- Xcode Debug 시뮬레이터 빌드: `WeatherON-App-Icon`을 기본 앱 아이콘으로 컴파일하고 `CFBundleIconName` 연결 통과
- iOS 26.5 시뮬레이터: 설치 후 라이트·다크 홈 화면에서 Clear Navy, Cream, Paper White, Warm Gold 유지 확인
- 앱 프로세스 실행은 성공했으나 Debug 산출물에 Metro/JS 번들이 없어 앱 화면 QA는 범위 외로 남김
- EAS 빌드, TestFlight 업로드, 실기기 홈 화면 검증은 수행하지 않음
