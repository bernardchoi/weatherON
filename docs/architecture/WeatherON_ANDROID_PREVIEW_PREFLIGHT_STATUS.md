# WeatherON Android Preview Preflight Status

> 생성일: 2026-07-02
> 목적: EAS preview build 재시도 전 native package, version, archive 제외 설정을 로컬에서 점검한다.

## 1. 요약

| 항목 | 값 |
|---|---|
| 상태 | 통과 |
| issue 수 | 0 |
| 소스 기준 Version | `0.1.0 (5)` |
| Expo android.package | `com.weatheron.mobile` |
| Native applicationId | `com.weatheron.mobile` |
| Native versionCode | `5` |
| Native versionName | `0.1.0` |
| Weather client | `proxy` |
| Weather proxy URL | `https://weatheron-api.weatheron.workers.dev` |
| KMA key | `set` |

## 2. 체크

| 체크 | 상태 | 근거 |
|---|---|---|
| Expo package | 통과 | `com.weatheron.mobile` |
| Native applicationId | 통과 | `com.weatheron.mobile` |
| Native versionCode | 통과 | `5` |
| Native versionName | 통과 | `0.1.0` |
| Weather client mode | 통과 | `proxy` |
| Weather proxy base URL | 통과 | `https://weatheron-api.weatheron.workers.dev` |
| Weather proxy public URL | 통과 | `https://weatheron-api.weatheron.workers.dev` |
| KMA service key | 통과 | `set` |
| Root .easignore .git | 통과 | `.git` |
| Root .easignore .git/ | 통과 | `.git/` |
| Root .easignore node_modules/ | 통과 | `node_modules/` |
| Root .easignore .npm-cache/ | 통과 | `.npm-cache/` |
| Root .easignore apps/mobile/dist/ | 통과 | `apps/mobile/dist/` |
| Root .easignore apps/mobile/dist-web/ | 통과 | `apps/mobile/dist-web/` |
| Root .easignore apps/mobile/web-build/ | 통과 | `apps/mobile/web-build/` |
| Root .easignore apps/mobile/android/.gradle/ | 통과 | `apps/mobile/android/.gradle/` |
| Root .easignore apps/mobile/android/build/ | 통과 | `apps/mobile/android/build/` |
| Root .easignore apps/mobile/android/**/build/ | 통과 | `apps/mobile/android/**/build/` |
| Root .easignore docs/ | 통과 | `docs/` |
| Root .easignore mockups/ | 통과 | `mockups/` |
| Root .easignore brand/ | 통과 | `brand/` |
| Root .easignore assets/store/ | 통과 | `assets/store/` |
| Mobile .easignore .git | 통과 | `.git` |
| Mobile .easignore .git/ | 통과 | `.git/` |
| Mobile .easignore node_modules/ | 통과 | `node_modules/` |
| Mobile .easignore .expo/ | 통과 | `.expo/` |
| Mobile .easignore dist/ | 통과 | `dist/` |
| Mobile .easignore dist-web/ | 통과 | `dist-web/` |
| Mobile .easignore web-build/ | 통과 | `web-build/` |
| Mobile .easignore android/.gradle/ | 통과 | `android/.gradle/` |
| Mobile .easignore android/build/ | 통과 | `android/build/` |
| Mobile .easignore android/**/build/ | 통과 | `android/**/build/` |
| Mobile .easignore ios/build/ | 통과 | `ios/build/` |

## 3. 큰 로컬 산출물

| 경로 | 존재 | 크기 | 제외 규칙 |
|---|---|---|---|
| `apps/mobile/android/app/build` | 예 | 3.0 GB | 있음 |
| `apps/mobile/android/.gradle` | 예 | 19 MB | 있음 |
| `apps/mobile/android/build` | 예 | 148 KB | 있음 |
| `apps/mobile/dist` | 아니오 | 없음 | 있음 |
| `apps/mobile/dist-web` | 예 | 587 KB | 있음 |
| `node_modules` | 예 | 5.7 GB | 있음 |
| `.git` | 예 | 625 MB | 있음 |
| `.npm-cache` | 예 | 883 MB | 있음 |

## 4. 다음 명령

```bash
npm run check:android-preview-preflight
npm run build:android:preview:no-wait
```
