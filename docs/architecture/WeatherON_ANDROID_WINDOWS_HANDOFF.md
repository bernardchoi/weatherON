# WeatherON Android Windows 개발·빌드 이전

> 기준일: 2026-07-25
> 목적: Android 개발, 로컬 빌드, ADB 및 실기기 QA의 실행 환경을 Windows 노트북으로 이전한다.

## 1. 소스 기준

Git에 유지하는 Android 기준 파일:

- `apps/mobile/app.json`
- `apps/mobile/app.config.js`
- `apps/mobile/eas.json`
- `apps/mobile/plugins/withWeatheronAndroidDarkIcon.js`
- `apps/mobile/plugins/withWeatheronAndroidReleaseConfig.js`
- `apps/mobile/src/**/*.android.*`
- `apps/mobile/src/theme/androidMaterial.ts`
- `assets/icon/android/`
- `assets/store/android-*`
- `assets/store/android-screenshots/`
- `scripts/*android*`

`apps/mobile/android/`의 대부분은 로컬 생성 폴더다. 현재 정적 검사 기준으로
`app/build.gradle`, `app/proguard-rules.pro`, `gradle.properties`만 Git에 남아 있다.
실제 Windows 네이티브 프로젝트는 아래 명령으로 다시 만든다.

```powershell
Set-Location apps/mobile
npx expo prebuild --clean --platform android --no-install
```

## 2. Windows 권장 위치

한글·공백·긴 경로로 인한 Gradle/CMake 문제를 줄이기 위해 짧은 영문 경로를 사용한다.

```text
C:\src\weatheron
C:\WeatherON-Secrets\android
C:\WeatherON-Artifacts\android
```

서명키와 환경변수 파일은 저장소 밖의 `C:\WeatherON-Secrets\android`에 둔다.

## 3. 이전 필수 비공개 파일

Mac에서 Windows로 직접 안전하게 이전할 파일:

| 파일 | SHA-256 |
|---|---|
| `weatheron-upload.jks` | `6075790b11cee50c617fdee9cf32110046318123958e9af9708c9aad8f016646` |
| `weatheron-upload-cert.pem` | `a999007762ef67b1e077b8ade47f2f15661cc39167ac827641b8ff2b7b144da4` |
| `eas-upload.env` | Mac 원본과 Windows 복사본의 해시가 같은지 로컬에서만 확인 |

주의:

- 위 파일을 Git, 메신저, 일반 이메일에 첨부하지 않는다.
- 암호화된 저장장치나 암호화 전송 수단을 사용한다.
- Windows 이전과 별도로 암호화 백업 1개를 유지한다.
- 비밀번호나 환경변수 값은 문서와 Git에 기록하지 않는다.

Windows 해시 확인:

```powershell
Get-FileHash C:\WeatherON-Secrets\android\weatheron-upload.jks -Algorithm SHA256
Get-FileHash C:\WeatherON-Secrets\android\weatheron-upload-cert.pem -Algorithm SHA256
```

## 4. Windows 개발 환경

필수 항목:

- Git
- Node.js와 npm
- JDK 17
- Android SDK Platform 36
- Android SDK Build Tools
- Android Platform Tools
- USB 기기 드라이버와 ADB

환경변수:

```text
JAVA_HOME=<JDK 17 경로>
ANDROID_HOME=<Android SDK 경로>
ANDROID_SDK_ROOT=<Android SDK 경로>
```

설치 후 저장소 루트에서:

```powershell
npm ci
Set-Location apps/mobile
npx expo prebuild --clean --platform android --no-install
Set-Location android
.\gradlew.bat assembleRelease
```

## 5. release 서명

서명 값은 현재 셸에만 주입한다. 실제 값은 `eas-upload.env`를 참고하되 출력하거나 커밋하지 않는다.

```powershell
$env:WEATHERON_UPLOAD_KEYSTORE_PATH = "C:\WeatherON-Secrets\android\weatheron-upload.jks"
$env:WEATHERON_UPLOAD_KEYSTORE_PASSWORD = "<비공개 값>"
$env:WEATHERON_UPLOAD_KEY_ALIAS = "<비공개 값>"
$env:WEATHERON_UPLOAD_KEY_PASSWORD = "<비공개 값>"
```

로컬 결과:

```powershell
.\gradlew.bat assembleRelease
.\gradlew.bat bundleRelease
```

기본 출력 위치:

```text
apps\mobile\android\app\build\outputs\apk\release\
apps\mobile\android\app\build\outputs\bundle\release\
```

완성된 APK/AAB는 `C:\WeatherON-Artifacts\android`로 복사하고 저장소에는 넣지 않는다.

## 6. 이전 완료 조건

- 클린 Git 체크아웃 완료
- `npm ci` 완료
- Android `prebuild --clean` 완료
- `assembleRelease` 완료
- 실제 기기 설치 및 실행 완료
- release 서명 인증서 SHA-1이 Play Console 업로드 인증서와 일치
- APK/AAB가 저장소 밖 산출물 폴더에 보관됨
- Mac의 서명키 원본 제거 전 Windows 복사본과 암호화 백업 확인

## 7. Mac 정리 상태

2026-07-25 기준:

- Android 네이티브 필수 설정을 Expo config plugin으로 소스화함
- 깨끗한 소스의 Android prebuild 재생성 확인함
- Mac에는 JDK가 없어 Gradle release 빌드는 Windows 확인 대상으로 넘김
- Mac의 Gradle/CMake/build 캐시와 임시 검사 산출물은 제거 대상으로 분류함
- 서명키는 Windows 이전 및 백업 확인 전까지 제거하지 않음
