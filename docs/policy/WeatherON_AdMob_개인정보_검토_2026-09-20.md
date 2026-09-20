# WeatherON AdMob 개인정보 검토

- 기준일: 2026-09-20
- 범위: Google Mobile Ads SDK·UMP, 한국 개인정보 보호법, Google Play Data safety, Apple App Privacy·ATT, 일본 APPI
- 한계: 법률자문 의견서가 아니며 실제 SDK 버전, AdMob 계정 설정, 광고 파트너·미디에이션, 배포 국가가 확정되면 다시 검토해야 함.

## 결론

WeatherON 서버나 자체 DB가 개인정보·위치정보를 저장하지 않더라도 AdMob SDK가 앱에서 IP 주소, 광고·기기 식별자, 앱 실행·탭·영상 시청 등 상호작용, 진단·성능 정보와 광고 노출 정보를 기기 밖으로 전송하면 앱을 통한 개인정보 처리임. Google Play도 제3자 SDK의 수집을 개발자가 직접 수집한 것처럼 취급하고 개발자가 이를 신고하도록 요구함.

개인화 광고는 과거 검색, 다른 앱·사이트 방문, 위치, 인구통계 등 기존 정보를 이용해 광고를 선택하므로 비개인화 광고보다 위험과 의무가 큼. 사용자의 광고 개인화 허용은 다음을 모두 자동 해결하지 않음.

- 한국 개인정보 수집·이용 및 제3자 제공·처리위탁·국외이전의 적법 근거와 고지
- iOS ATT 권한
- Google Play Data safety 및 App Store App Privacy 신고
- 개인정보처리방침의 SDK 수집 항목·목적·수령자·보유·국외이전·철회 방법 고지
- 일본 APPI상 이용목적 공표, 개인관련정보 결합 및 외국 제3자 제공 검토

따라서 사업자·Google 계약관계, 실제 이전 국가·보유기간, 광고 파트너가 확정되기 전에는 개인화 광고를 기본 허용하지 않는 편이 안전함. 먼저 비개인화 광고 또는 제한 광고로 시작하고, 광고 개인화는 별도 선택 동의와 플랫폼 권한·철회 경로가 완성된 뒤 켜는 방안을 권고함. 비개인화 광고도 IP 주소, 빈도 제한·집계 보고용 식별자와 진단 정보 등을 사용할 수 있어 `개인정보를 수집하지 않음`으로 신고할 수 있다는 뜻은 아님.

## 저장소 확인

현재 `apps/mobile/package.json`, 루트 `package-lock.json`, Expo 설정, iOS Podfile·Info.plist, Android Gradle·Manifest에서 Google Mobile Ads, AdMob, UMP, ATT 관련 SDK·앱 ID·권한 문자열이 확인되지 않음. 저장소 문서도 현재 APK에 광고 SDK가 미포함이라고 명시함. 즉 현재 배포 소스 기준으로는 AdMob가 아직 도입되지 않은 상태임.

## 예상 데이터 흐름

Google의 최신 Android 공개자료는 Google Mobile Ads SDK가 기본적으로 다음 데이터를 자동 수집·공유한다고 설명함.

- IP 주소: 일반 위치 추정에 사용 가능
- 앱 실행, 탭, 영상 시청 등 사용자 상호작용
- 앱 시작 시간, 정지율, 에너지 사용량 등 진단·성능 정보
- Android 광고 ID, App Set ID 및 경우에 따라 기기 계정 관련 식별자

iOS 공개자료는 IP 주소, 충돌 로그, 사용자 연계 성능 정보, 광고 식별자 등 기기 ID, 광고 노출 정보, 앱 실행·탭·영상 시청 등 상호작용을 열거함. 실제 항목은 SDK 버전, 선택 기능, 실험, 미디에이션 파트너에 따라 달라짐.

AdMob 개인화 광고는 과거 행동, 위치, 인구통계 등을 활용할 수 있음. iOS Google Mobile Ads SDK 10.14.0 이상에서는 앱 내부 데이터를 이용하는 Publisher first-party ID가 기본 활성화되므로 필요하지 않으면 명시적으로 비활성화 여부를 검토해야 함. Android 광고 ID 수집은 Manifest 설정으로 방지할 수 있음.

정밀 GPS는 AdMob가 위 기본 목록에서 자동 수집한다고 단정할 수 없음. WeatherON의 위치 권한과 GPS 좌표를 광고 요청·광고 파트너에 전달하지 않도록 분리해야 함. 정밀 위치를 광고에 사용·제공한다면 Google 정책도 목적·파트너 공유에 대한 적시 고지와 사전 명시적 동의를 요구함. 날씨용 위치 동의는 광고 개인화용 위치 동의를 대신하지 않음.

## 한국

개인정보위는 타사 앱·웹 활동기록과 GAID·IDFA 같은 기기 식별자를 결합해 맞춤형 광고에 이용하면서 명확히 고지하지 않거나 필수 동의로 강제한 사례를 제재했음. 따라서 광고 개인화는 WeatherON 핵심 기능과 분리된 선택 항목으로 설계하고, 거부해도 날씨 기능을 이용할 수 있어야 함.

Google로 전송되는 정보가 국외 제공·처리위탁·보관에 해당하면 개인정보 보호법 제28조의8상 적법 근거가 필요함. 별도 동의를 근거로 할 경우 이전 항목, 국가·시기·방법, 수령자 명칭·연락처, 목적·보유기간, 거부 방법·효과를 사전에 알려야 함. Google 공개자료만으로 WeatherON 계정의 실제 이전 국가·계약 주체·보유기간을 확정할 수 없으므로 임의 기재하면 안 됨. AdMob는 Google의 GDPR 자료에서 독립 컨트롤러 서비스로 분류되지만, 이것만으로 한국법상 제3자 제공인지 위탁인지 확정할 수는 없음.

## Google Play와 Android

Google Play Data safety에는 앱 자체 코드뿐 아니라 포함된 SDK의 수집·공유도 반영해야 함. AdMob 최신 SDK 공개자료에 따라 최소한 일반 위치로 해석될 수 있는 IP 주소, 앱 활동·상호작용, 진단, 기기 또는 기타 ID를 실제 설정과 대조해야 함. `광고 포함`도 `예`로 변경해야 함. SDK 버전·광고 ID 비활성화·미디에이션 사용 여부에 따라 신고값이 달라지므로 최종 AAB를 기준으로 확인해야 함.

## iOS

개인화 광고 또는 광고 측정을 위해 앱의 사용자·기기 정보를 다른 회사의 앱·웹 데이터와 연결하면 ATT 대상임. IDFA 접근 전에 `NSUserTrackingUsageDescription`과 ATT 시스템 요청이 필요하고, 거부 시 IDFA를 사용하거나 다른 식별자로 우회 추적하면 안 됨. UMP 동의와 ATT는 별개이며 둘 중 하나가 다른 하나를 대체하지 않음.

App Store Connect App Privacy에는 앱에 포함된 제3자 SDK의 수집도 신고해야 함. Google Mobile Ads SDK의 privacy manifest가 있더라도 개발자가 실제 데이터 흐름을 확인하고 App Privacy 응답을 갱신할 책임은 남음.

## 일본

일본 이용자를 대상으로 서비스하면서 광고 식별자·행태정보를 처리하면 APPI 역외적용 가능성이 있음. 광고 식별자나 방문·이용 기록은 상황에 따라 개인관련정보가 될 수 있고, Google 등이 이를 보유 개인데이터와 결합할 것이 예상되는 경우 본인 동의 확인 의무가 문제될 수 있음. 외국 제3자 제공이면 제공국의 제도와 수령자의 보호조치 등에 관한 정보 제공·동의 또는 동등한 보호체계 검토가 필요함.

SDK가 이용자 단말에서 Google로 직접 전송하는 구조가 WeatherON의 제3자 제공인지 Google의 직접 수집인지, Google과 WeatherON의 법적 역할이 무엇인지는 실제 약관·설정·데이터 흐름에 따라 달라짐. 일본 배포 전 현지 법률 검수 필요함.

## 도입 전 최소 조건

1. 정확한 SDK·UMP 버전, 광고 형식, 미디에이션·입찰 파트너와 배포 국가를 확정함.
2. 광고 SDK 초기화와 광고 요청을 동의 상태 확인 뒤로 미룸. UMP가 요구하는 지역은 매 실행 시 최신 상태를 확인하고 개인정보 선택을 다시 열 수 있는 메뉴를 제공함.
3. 한국 이용자의 개인화 광고는 핵심 서비스와 분리된 선택 동의로 제공하고 거부 시 비개인화 또는 제한 광고로 처리함.
4. iOS는 법률 동의와 별도로 ATT를 받고 거부를 우회하지 않음.
5. 날씨용 GPS·저장 장소·계정 이메일·로그인 ID를 광고 요청에 전달하지 않음.
6. Android 광고 ID와 iOS Publisher first-party ID가 필요하지 않다면 비활성화함.
7. 개인정보처리방침에 Google 및 실제 광고 파트너, 수집 항목, 목적, 보유기간, 국외이전, 거부·철회 방법을 사실대로 반영함.
8. Google Play Data safety, 광고 포함 여부, App Store App Privacy를 최종 바이너리와 일치시킴.
9. 동의 전 광고 요청 없음, 거부 후 개인화 없음, 철회 후 재요청 없음, 앱 재실행 후 동의 상태 갱신, 정밀 위치 미전송을 네트워크 수준에서 검증함.

## 공식 출처

- [Google Mobile Ads SDK Android Data safety 공개자료](https://developers.google.com/admob/android/privacy/play-data-disclosure)
- [Google Mobile Ads SDK iOS App Store 데이터 공개자료](https://developers.google.com/admob/ios/privacy/data-disclosure)
- [Google AdMob 개인화·비개인화 광고 설명](https://support.google.com/admob/answer/7676680)
- [Google AdMob UMP Android 구현 지침](https://developers.google.com/admob/android/privacy)
- [Google Publisher 개인정보·정밀 위치 정책](https://support.google.com/admob/answer/10502938)
- [Google AdMob iOS 개인정보 전략과 ATT](https://developers.google.com/admob/ios/privacy/strategies)
- [Google Play Data safety 지침](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple User Privacy and Data Use](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- [Apple App Store Connect App Privacy 관리](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy)
- [개인정보 보호법 제28조의8](https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1029331979)
- [개인정보위 2026년 맞춤형 광고 행태정보 제재 사례](https://m.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=12330)
- [일본 개인정보보호위원회 APPI 통칙 가이드라인](https://www.ppc.go.jp/personalinfo/legal/guidelines_tsusoku/)
- [일본 개인정보보호위원회 외국 제3자 제공 가이드라인](https://www.ppc.go.jp/personalinfo/legal/guidelines_offshore/)
