# WeatherON Layered Brand Signal v1

선택된 3번 방향을 Icon Composer에서 재구성하기 위한 제작 소스다. 이미지 생성 시안의 광택과 그림자를 래스터에 굽지 않고, 기존 라이트·다크·모노 아이콘의 좌표와 브랜드 색을 유지한 3개 깊이 그룹으로 분리했다.

## 파일

- `layers/l1-background.svg`: 라이트 모드 Snow White 풀블리드 기준면
- `layers/l2-mid.svg`: 라이트 모드 Brand Blue 트랙·구름과 Snow White OFF 마크
- `layers/l3-foreground.svg`: 라이트 모드 Rust Orange 태양 노브와 정확히 3개 광선
- `WeatherON-App-Icon.icon`: iOS 전용 Icon Composer 문서
- `preview-composite.svg`: 레이어 정합 확인용 합성본. Icon Composer 가져오기 금지
- `manifest.json`: 팔레트, 레이어 순서, 재질 의도, 검증 제약

모든 레이어는 1024×1024 캔버스와 `0 0 120 120` 뷰박스를 공유한다. L1은 플랫폼 마스크를 포함하지 않는 풀블리드 사각형이다. 외곽 모양은 Icon Composer와 iOS가 적용한다.

## Icon Composer 가져오기

1. Xcode의 `Open Developer Tool > Icon Composer`를 연다.
2. `WeatherON-App-Icon.icon`을 연다.
3. L1은 `01-background.svg` 후면 그룹에 Default Snow White와 Dark Night Navy를 appearance 색상으로 둔다.
4. L2는 트랙·OFF 마크·구름 마스크를 한 중간 그룹에 두고 각 마스크에 Default·Dark 색상을 지정한다. L3는 `03-foreground.svg` 전면 그룹이다. JSON 배열은 L3→L2→L1 순서가 전면→후면이다.
5. Default는 `icon-light-v2.svg`, Dark는 `icon-dark.svg` 팔레트를 유지하고, Mono는 같은 글리프와 레이어 순서로 시스템 틴트에 반응한다.
6. 32px, 64px, 실제 홈 화면 크기에서 구름·OFF 마크·3개 광선이 합쳐지거나 사라지지 않는지 확인한다.

## 제작 원칙

- 브랜드 색은 각 도형 면적의 90% 이상 유지한다.
- 블러, 그림자, 굴절, 스페큘러 하이라이트를 SVG에 굽지 않는다.
- 구름은 L2, 태양 노브와 3개 광선은 L3에 둔다.
- L1에는 라운드 사각형 마스크를 넣지 않는다.
- L1 후면 그룹과 문서 Fill은 플랫폼 외곽 마스크를 포함하지 않으며 iOS가 최종 마스크를 적용한다.
- 이 폴더의 SVG는 제작 원본이다. iOS 앱 타깃은 동일한 `WeatherON-App-Icon.icon` 사본을 `apps/mobile/ios/WeatherON/`에서 컴파일한다.

## 2026-08-23 검증

- Apple `ictool` 렌더: Default·Dark·Mono/Tinted Dark가 서로 구분되는 1024px 결과로 통과
- 소형 렌더: Default 32px·64px, Dark 32px, Mono/Tinted Dark 32px에서 OFF 마크와 3개 광선 식별 통과
- `actool`·`assetutil`: `Assets.car`에 Any·Dark·Tintable 아이콘과 Light·Dark·Tintable 다층 IconGroup 포함 확인
- Xcode 27 Release 실기기 빌드: `WeatherON-App-Icon`을 기본 앱 아이콘으로 컴파일하고 `CFBundleIconName` 연결 통과
- Default는 Snow White·Brand Blue·Rust Orange, Dark는 Night Navy·Stone·Mist Blue·Warm Gold 팔레트 적용 확인
- iPhone 16 Pro Max, iOS 27.0: Release 설치·콜드 실행 통과, 기기가 생성한 1024px 라이트 앱 아이콘 시각 확인
- 다크·모노는 Apple 렌더와 실기기용 `Assets.car` 포함까지 확인했으며 홈 화면 appearance 선택별 실기기 시각 확인은 수행하지 않음
- EAS 빌드와 TestFlight 업로드는 수행하지 않음
