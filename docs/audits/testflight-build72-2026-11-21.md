# WeatherON 1.0.0 (72) 내부 TestFlight 배포

- 저장소 bernardchoi/weatherON, 호스트 Daehyeons-Laptop.local. 배포 소스는 원격 main과 동일한 `1fe790bbca86609cbd8310082abb00951f95fbd5`.
- 코디 프리셋 20종과 사진 선택판은 main의 `36e94575`, 프로필 캐릭터·홈 카드 변경은 fix/profile-character-caption-20261121의 `dc787be5`. 두 커밋 모두 빌드 소스의 직접 부모임.
- fetch 후 main 미병합 브랜치와 stash 없음. 마스코트·프로필 작업 폴더는 깨끗함. 별도 작업 폴더의 Android 작은 화면 검사와 미추적 .agents/state/는 배포 범위 밖임. 삭제된 임시 작업 폴더 등록 1건 있음.
- 모바일 TypeScript, 옷장 레이아웃, 공통 규칙, 프로필 캐릭터 레이아웃, 홈 카드 너비·뷰포트 검사 통과.
- Xcode Cloud Default의 Archive - iOS 성공. Cloud 상세 화면에서 전체 소스 SHA를 대조함. [Cloud 빌드 72](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/apps/6789612592/ci/builds/e823a2ff-55a2-4d99-b8ff-2279a920af8e)
- App Store Connect에서 빌드 72에 내부 Team (Expo)만 지정함. 그룹 빌드 목록에서 1.0.0 (72) ‘테스트 중’, 내부 테스터 1명 확인. 실기기 설치와 화면 확인은 미실시.

## 외부 TestFlight 배포

- 내부 배포와 동일한 빌드 1.0.0 (72)를 사용함. 외부 배포 시점의 원격 main은 `16bdb7bd`이며 빌드 소스 `1fe790bb` 이후 변경은 내부 배포 기록 한 파일임.
- 기존 외부테스트 그룹에 한국어 테스트 안내와 자동 공지를 설정해 제출함. 해당 그룹(테스터 6명)의 빌드 목록에서 1.0.0 (72) ‘테스트 중’을 확인함. 외부 기기의 설치·실행은 미확인.

## 다국어 카탈로그 정리 후 재배포 판단

빌드 72 소스 `1fe790bb`와 카탈로그 정리 커밋 `5df68d5f`를 비교함. 배포 기록을 제외한 차이는 영어·일본어 카탈로그에서 이전 옷장 UI의 미사용 키를 각각 9개 삭제한 것뿐임. 빌드 72와 정리 후 커밋의 앱 로직과 화면에서 사용하는 번역은 동일하므로 내부·외부 TestFlight 모두 빌드 72로 테스트를 계속하며 재배포는 필요 없음.

기존 다국어 검사는 카탈로그에만 남은 키 때문에 실패했음. 정리 후 소스 메시지 2,300개와 카탈로그의 키가 일치했고 GitHub 검사도 통과함. [Source checks 실행 결과](https://github.com/bernardchoi/weatherON/actions/runs/44889432282)
