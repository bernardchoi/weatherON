import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import ts from "typescript";

const root = process.cwd();
const sourceRoots = ["apps/mobile/src", "packages/shared/src/rules", "packages/shared/src/fixtures/presetWardrobe.ts"];
const outputDir = path.join(root, "apps/mobile/src/localization/locales");
const languages = ["en", "ja"];
const korean = /[가-힣]/u;
const preservedKoreanTargets = new Set(["개인정보 보호책임자: 최대현 · support@weatheron.app"]);
const overrides = {
  en: {
    "집": "Home",
    "목적지 라벨": "Destination label",
    "집 또는 회사를 지정": "Set Home or Company",
    "라벨 없음": "No label",
    "목적지는 최대 3개까지 등록할 수 있어요.": "You can save up to 3 destinations.",
    "기존 목적지를 삭제한 뒤 추가해 주세요.": "Delete an existing destination before adding another.",
    "목적지는 최대 3개까지 등록할 수 있어요. 기존 목적지를 삭제한 뒤 추가해 주세요.": "You can save up to 3 destinations. Delete an existing destination before adding another.",
    "목적지는 최대 3개까지 등록할 수 있어요.\n기존 목적지를 삭제한 뒤 추가해 주세요.": "You can save up to 3 destinations.\nDelete an existing destination before adding another.",
    "개인정보처리방침": "Privacy Policy",
    "개인정보 수집·이용과 이용자 권리": "How we collect and use personal information, and your rights",
    "수집 항목: 로그인 식별자와 계정 프로필, 위치정보와 저장 위치, 기기정보와 앱 사용 로그, 사용자가 선택한 옷장 사진과 설정 정보": "Information we collect: login identifiers and account profile information; location information and saved locations; device information and app usage logs; wardrobe photos selected by the user; and settings information",
    "이용 목적: 계정 관리, 위치 기반 날씨와 출발 안내, 코디·우산·신발 추천, 옷장 사진 등록 적합성 확인, 서비스 품질 개선": "Purposes of use: account management; location-based weather and departure guidance; outfit, umbrella, and footwear recommendations; checking whether wardrobe photos can be registered and classifying them; and improving service quality",
    "현재 위치 좌표는 날씨·장소·경로 조회 시 WeatherON의 Cloudflare Worker를 거쳐 기상청·Apple WeatherKit·Open-Meteo·Kakao·Google 등 해당 기능 제공자에 전달됨. 실시간 좌표는 D1·R2에 저장하지 않으나 메모리 캐시에 일시 포함될 수 있음. 제공자 측 로그·백업은 WeatherON 애플리케이션 저장소와 구분됨": "Current-location coordinates are sent through WeatherON's Cloudflare Worker to the provider needed for the requested weather, place, or route lookup, such as the Korea Meteorological Administration, Apple WeatherKit, Open-Meteo, Kakao, or Google. Real-time coordinates are not stored in D1 or R2 but may temporarily appear in memory caches. Provider-side logs and backups are separate from WeatherON application storage",
    "옷장 사진 처리: 분석용 축소 JPEG를 Cloudflare Workers AI에 전송하며 등록 가능 여부와 분류 확인 후 WeatherON 서버 저장소에 보관하지 않음": "Wardrobe photo processing: We send a reduced-size JPEG to Cloudflare Workers AI for analysis. After checking whether it can be registered and classifying it, we do not retain the image in WeatherON server storage",
    "승인된 옷장 사진은 기기에 저장되며 iOS에서는 iCloud 백업 제외와 잠금 시 파일 보호를 적용. 로그아웃 또는 계정 데이터 초기화 시 함께 삭제": "Approved wardrobe photos are stored on the device. On iOS, they are excluded from iCloud backup and protected while the device is locked. They are deleted when the user signs out or resets account data",
    "회원 정보와 저장 데이터는 회원 탈퇴 또는 삭제 요청 시 지체 없이 파기하며, 법령상 보관 의무가 있는 정보는 정해진 기간 동안 보관": "Account information and saved data are deleted without delay when the account is deleted or deletion is requested. Information subject to statutory retention obligations is retained for the legally required period",
    "이용자는 앱의 계정 관리 또는 support@weatheron.app을 통해 개인정보 열람·정정·삭제·처리정지를 요청할 수 있음": "Users may request access to, correction or deletion of, or suspension of processing of their personal information through Account Management in the app or at support@weatheron.app",
    "개인정보 보호책임자: 최대현 · support@weatheron.app": "Chief Privacy Officer: 최대현 · support@weatheron.app",
    "보유기간: 계정 정보와 연결된 동의 기록은 계정 삭제 시까지 보관. 운영 데이터베이스에서 삭제된 데이터는 D1 시점 복구 이력에 최대 7일간 남을 수 있음. 기기 저장 데이터는 앱에서 삭제하거나 앱을 제거할 때까지 보관": "Retention: Account information and linked consent records are retained until account deletion. Data deleted from the production database may remain in D1 point-in-time recovery history for up to 7 days. Device data is retained until deleted in the app or the app is removed",
    "파기 절차·방법: 계정 삭제 요청이 완료되면 운영 데이터베이스의 계정 행과 연결 데이터를 삭제하고, 기기 데이터베이스 기록과 옷장 사진 파일을 삭제": "Deletion procedure and method: When an account-deletion request is completed, the account row and linked data are deleted from the production database, and records in the device database and wardrobe-photo files are deleted",
    "처리위탁: Cloudflare Workers·D1·Workers AI를 인증, 서버 기능, 계정 데이터 저장, 옷장 사진 분석에 사용. D1은 APAC 지역에서 실행되며 읽기 복제를 사용하지 않음. APAC은 국가명이 아니며 Workers·Workers AI 처리 국가를 제한하지 않음": "Processing service providers: Cloudflare Workers, D1, and Workers AI are used for authentication, server functions, account-data storage, and wardrobe-photo analysis. D1 runs in APAC without read replication. APAC is not a country and does not restrict the processing countries for Workers or Workers AI",
    "외부 제공: 로그인 제공자와 날씨·장소·경로 제공자에는 이용자가 요청한 인증 또는 조회에 필요한 토큰, 검색어, 좌표를 전송할 수 있음": "External disclosures: Tokens, search terms, and coordinates needed for authentication or a lookup requested by the user may be sent to sign-in, weather, place, and route providers",
    "이용자는 앱의 계정 관리 또는 support@weatheron.app을 통해 개인정보 열람·정정·삭제·처리정지와 동의 철회를 요청할 수 있으며, 본인 확인 후 지체 없이 처리 결과를 안내받을 수 있음": "Users may request access to, correction or deletion of, or suspension of processing of their personal information, or withdraw consent, through Account Management in the app or at support@weatheron.app. After identity verification, the result will be provided without undue delay",
    "안전조치: 전송 구간 암호화, 세션 토큰 해시 저장, 로그인 제공자 토큰 암호화, 앱 무결성 확인, 요청 크기·횟수 제한, 접근 범위 제한을 적용": "Security measures: Encryption in transit, hashed session-token storage, encryption of sign-in provider tokens, app-integrity verification, request size and rate limits, and access restrictions are applied",
    "광고 식별자 기반 광고와 마케팅 발송 기능은 현재 앱에 적용하지 않으며, 도입 전 별도 고지와 필요한 동의를 적용": "Advertising based on advertising identifiers and marketing-message delivery are not currently implemented in the app. Separate notice and any required consent will be provided before they are introduced",
    "이용약관": "Terms of Use",
    "WeatherON 사용과 계정 기능 기준": "Rules for using WeatherON and account features",
    "게스트는 계정 연결 없이 기본 날씨·코디·우산 추천 기능을 이용할 수 있음": "Guests may use basic weather, outfit, and umbrella recommendations without linking an account",
    "저장, 동기화, 목적지 케어 등 계정이 필요한 기능은 지원 로그인 수단으로 계정을 연결한 뒤 이용": "Features that require an account—including saving, syncing, and destination care—are available after linking an account using a supported sign-in method",
    "날씨, 코디, 출발시간 등 안내는 참고 정보이며 외부 데이터 오류·지연에 따라 달라질 수 있음": "Weather, outfit, and departure-time guidance is provided for reference only and may be affected by errors or delays in third-party data",
    "회원은 계정 관리에서 언제든 탈퇴를 요청할 수 있으며, 관련 법령상 보관 의무가 있는 정보를 제외한 개인정보는 파기": "Users may request account deletion at any time in Account Management. Personal information will be deleted, except information that must be retained under applicable law",
    "위치기반서비스 이용약관": "Terms and Conditions for Location-Based Services",
    "현재 위치와 목적지 기반 서비스 기준": "Rules for services based on current location and destinations",
    "실시간 위치는 요청한 날씨·장소·경로 조회에 사용하며 WeatherON 서버 저장소에 별도 보관하지 않음. 저장 위치는 이용자가 삭제하거나 계정을 삭제할 때까지 보관": "Real-time location is used for weather, place, and route lookups requested by the user and is not separately retained in WeatherON server storage. Saved locations are retained until the user deletes them or deletes the account",
    "위치정보는 현재 위치 날씨, 출발지·목적지 날씨 비교, 출발 시각 계산, 준비 알림과 사용자가 요청한 장소·경로 검색에만 이용": "Location information is used only for current-location weather, origin and destination weather comparisons, departure-time calculations, preparation alerts, and place or route searches requested by the user",
    "이용자는 기기 설정에서 위치 권한을 변경하고 앱에서 수동 위치로 전환하거나 저장 위치를 삭제할 수 있으며, 계정 관리 또는 support@weatheron.app을 통해 이용·제공 내역 확인과 동의 철회를 요청할 수 있음": "Users can change location access in device settings, switch to a manually selected location in the app, or delete saved locations. They may request access to location-use and disclosure records or withdraw consent through Account Management or at support@weatheron.app",
    "위치 동의를 거부하거나 철회할 수 있으며 자동 현재 위치 기능은 제한되지만 수동 위치와 목적지 검색은 계속 이용 가능": "Users may refuse or withdraw location consent. Automatic current-location features will be limited, but manually selected locations and destination search will remain available",
    "위치정보 이용·제공사실 확인자료의 별도 기록과 법정 보관기간 적용 기능은 현재 코드에서 확인되지 않아 위치기반서비스 외부 제공 전 구현과 검증 필요": "The current code does not contain a separate record of location-information use and disclosure or enforcement of its statutory retention period. This must be implemented and verified before the location-based service is offered externally",
    "사업자 법적 명칭·주소·전화번호, 위치정보관리책임자, 확인자료의 정확한 보관기간은 확인되지 않아 임의 기재하지 않았으며 외부 공개 전 반드시 보완 필요": "The operator's legal name, address, and telephone number, the location-information manager, and the exact retention period for verification records have not been confirmed. These details have not been invented and must be completed before external publication",
    "현재 위치 날씨, 출발지·목적지 비교, 출발시간 안내를 위해 GPS·Wi-Fi·기지국 또는 사용자가 입력한 위치를 이용": "We use GPS, Wi-Fi, cellular base stations, or locations entered by the user to provide weather for the current location, origin–destination comparisons, and departure-time guidance",
    "현재 위치 권한을 허용하지 않아도 사용자가 직접 선택한 수동 위치와 목적지 검색을 이용할 수 있음": "Users can still use a manually selected location and destination search without granting access to the current location",
    "현재 위치 좌표는 이용자가 요청한 날씨·장소·경로 조회를 위해 WeatherON의 Cloudflare Worker를 거쳐 해당 기능 제공자에 전달되며 D1·R2에는 저장하지 않음": "Current-location coordinates are sent through WeatherON's Cloudflare Worker to the provider needed for a weather, place, or route lookup requested by the user and are not stored in D1 or R2",
    "실시간 위치정보는 서비스 제공에 필요한 범위에서 처리하며 저장 위치는 회원 탈퇴 또는 삭제 요청 시까지 보관": "Real-time location information is processed only to the extent necessary to provide the service. Saved locations are retained until the account is deleted or deletion is requested",
    "이용자는 기기 설정에서 위치 권한을 변경하거나 앱에서 수동 위치로 전환할 수 있음": "Users can change location access in device settings or switch to a manually selected location in the app",
    "정책 및 법적 고지": "Policies and Legal Notices",
    "시행일 {0}": "Effective date: {0}",
    "위치·목적지·앱 사용 데이터": "Location, destination, and app usage data",
    "게스트·계정 연결·저장 기능 기준": "Rules for guest use, account linking, and saved features",
    "현재 위치와 목적지 기반 안내": "Guidance based on current location and destinations",
    "계정 관리와 저장·동기화 기능 제공": "Account management and saved-data synchronization",
    "거부할 수 있으나 계정 연결과 계정이 필요한 저장·동기화 기능은 이용할 수 없음": "You may refuse, but account linking and account-required saving and synchronization features will not be available",
    "목적: 로그인·계정 관리, 저장 데이터 동기화, 날씨·출발·코디 기능 제공": "Purpose: Sign-in and account management, saved-data synchronization, and weather, departure, and outfit features",
    "항목: 로그인 식별자, 이메일·프로필, 동의 기록, 저장 위치·목적지, 설정, 사용자가 선택한 옷장 사진": "Data: Login identifier, email and profile, consent records, saved locations and destinations, settings, and wardrobe photos selected by the user",
    "보유: 계정 정보와 서버 저장 데이터는 계정 삭제 시까지. 옷장 분석 사진은 WeatherON 서버 저장소에 보관하지 않음": "Retention: Account information and server-stored data are retained until account deletion. Wardrobe photos submitted for analysis are not retained in WeatherON server storage",
    "목적: 현재 위치 날씨, 출발지·목적지 비교, 출발 시각과 준비 알림 제공": "Purpose: Current-location weather, origin and destination comparisons, departure times, and preparation alerts",
    "항목·방법: GPS·Wi-Fi·기지국 기반 현재 위치 또는 사용자가 직접 입력한 위치": "Data and method: Current location based on GPS, Wi-Fi, or cellular base stations, or a location entered directly by the user",
    "보유: 실시간 위치는 요청 처리 후 WeatherON 서버 저장소에 보관하지 않음. 저장 위치는 삭제 또는 계정 삭제 시까지": "Retention: Real-time location is not retained in WeatherON server storage after the request is processed. Saved locations are retained until deleted or the account is deleted",
    "거부할 수 있으며 자동 현재 위치 기능은 제한되지만 수동 위치와 목적지 검색은 이용 가능": "You may refuse. Automatic current-location features will be limited, but manually selected locations and destination search will remain available",
    "필수 4개를 함께 변경": "Select or clear all four required items",
    "만 14세 이상입니다": "I am 14 years of age or older",
    "서비스 이용 가능 연령 확인": "Confirm eligibility based on age",
    "이용약관 동의": "Agree to the Terms of Use",
    "개인정보 수집·이용 동의": "Consent to the collection and use of personal information",
    "마케팅 정보 수신 동의": "Consent to receive marketing communications",
    "선택 항목 · 언제든 철회 가능": "Optional · You can withdraw consent at any time",
    "약관 동의": "Review and agree",
    "전체 동의": "Agree to all",
    "전체 동의 해제": "Clear all selections",
    "필수 4개와 선택 마케팅 1개를 함께 변경": "Select all four required items and the optional marketing item",
    "필수 동의 필요": "Required consents needed",
    "동의하고 계속": "Agree and continue",
    "동의하고 계정 연결 계속": "Agree and continue linking the account",
    "내용 보기": "View details",
    "회원 탈퇴": "Delete account",
    "탈퇴하기": "Delete account",
    "서버 계정 데이터와 이 기기의 저장 목적지·코디 상태·옷장 사진이 삭제돼요. 되돌릴 수 없어요.": "Your server account data and this device's saved destinations, outfit state, and wardrobe photos will be deleted. This cannot be undone.",
    "이 기기의 저장 목적지·코디 상태·옷장 사진이 삭제되고 계정 연결이 해제돼요. 서버 계정은 유지돼요.": "This device's saved destinations, outfit state, and wardrobe photos will be deleted, and the account will be unlinked. Your server account will remain.",
    "기본 위치 서울": "Default location · Seoul",
    "날씨와 출발 시간을 맞춰드림": "Weather and departure guidance, together",
    "더운 날이에요 · 가볍게": "Hot day · Dress light",
    "더운 날이에요. 바람 잘 통하는 차림이 좋아요": "It's hot today. Choose breathable clothing.",
    "다시 시도": "Try again",
    "다음": "Next",
    "뒤로": "Back",
    "맑음": "Clear",
    "바람 잘 통하는 차림이 좋아요": "Choose breathable clothing",
    "나중에": "Later",
    "오늘 나갈 준비, WeatherON이 가볍게 챙겨드려요": "WeatherON helps you get ready for the day.",
    "오늘 날씨에 맞춰, 나갈 준비를 함께해요.": "Get ready for the day with today's weather.",
    "오늘 입기 좋은 코디": "Today's outfit",
    "오늘은 가볍게 나가요": "Keep it light today",
    "완료": "Done",
    "저장": "Save",
    "직접 고른 지역": "Manually selected region",
    "체감 {0} · 강수 {1}%": "Feels like {0} · Precipitation {1}%",
    "최고 {0} · 최저 {1}": "High {0} · Low {1}",
    "홈": "Home",
    "홈 탭": "Home tab",
    "코디": "Outfit",
    "코디 탭": "Outfit tab",
    "출발": "Depart",
    "출발 탭": "Depart tab",
    "{0}개": "plural:{0} item|{0} items",
    "{0}건": "plural:{0} item|{0} items",
    "{0}곳": "plural:{0} location|{0} locations",
    "{0}곳 검색됨": "plural:{0} location found|{0} locations found",
    "{0}곳 저장됨": "plural:{0} location saved|{0} locations saved",
    "{0}개 보유": "plural:{0} item owned|{0} items owned",
    "{0}개 보유 중": "plural:{0} item owned|{0} items owned",
    "내 옷장 {0}개 보기": "plural:View {0} wardrobe item|View {0} wardrobe items",
    "알림 열기, 읽지 않음 {0}개": "plural:Open notifications, {0} unread notification|Open notifications, {0} unread notifications",
    "예약 {0}건": "plural:{0} scheduled notification|{0} scheduled notifications",
    "예약 확인 {0}건": "plural:{0} scheduled notification checked|{0} scheduled notifications checked",
    "남은 예약 {0}건": "plural:{0} scheduled notification remaining|{0} scheduled notifications remaining",
    "저장 위치 {0}곳": "plural:{0} saved location|{0} saved locations",
    "저장한 {0}곳 · 눌러서 바꿔보기": "plural:{0} saved location · Tap to change|{0} saved locations · Tap to change",
  },
  ja: {
    "집": "自宅",
    "목적지 라벨": "目的地ラベル",
    "집 또는 회사를 지정": "自宅または会社を指定",
    "라벨 없음": "ラベルなし",
    "목적지는 최대 3개까지 등록할 수 있어요.": "目的地は最大3件まで登録できます。",
    "기존 목적지를 삭제한 뒤 추가해 주세요.": "既存の目的地を削除してから追加してください。",
    "목적지는 최대 3개까지 등록할 수 있어요. 기존 목적지를 삭제한 뒤 추가해 주세요.": "目的地は最大3件まで登録できます。既存の目的地を削除してから追加してください。",
    "목적지는 최대 3개까지 등록할 수 있어요.\n기존 목적지를 삭제한 뒤 추가해 주세요.": "目的地は最大3件まで登録できます。\n既存の目的地を削除してから追加してください。",
    "개인정보처리방침": "プライバシーポリシー（個人情報保護方針）",
    "개인정보 수집·이용과 이용자 권리": "個人情報の取得・利用と利用者の権利",
    "수집 항목: 로그인 식별자와 계정 프로필, 위치정보와 저장 위치, 기기정보와 앱 사용 로그, 사용자가 선택한 옷장 사진과 설정 정보": "取得する情報：ログイン識別子およびアカウントのプロフィール情報、位置情報および保存済みの場所、端末情報およびアプリの利用ログ、利用者が選択したワードローブ写真、設定情報",
    "이용 목적: 계정 관리, 위치 기반 날씨와 출발 안내, 코디·우산·신발 추천, 옷장 사진 등록 적합성 확인, 서비스 품질 개선": "利用目的：アカウント管理、位置情報に基づく天気・出発案内、コーデ・傘・靴のおすすめ、ワードローブ写真の登録可否確認および分類、サービス品質の改善",
    "현재 위치 좌표는 날씨·장소·경로 조회 시 WeatherON의 Cloudflare Worker를 거쳐 기상청·Apple WeatherKit·Open-Meteo·Kakao·Google 등 해당 기능 제공자에 전달됨. 실시간 좌표는 D1·R2에 저장하지 않으나 메모리 캐시에 일시 포함될 수 있음. 제공자 측 로그·백업은 WeatherON 애플리케이션 저장소와 구분됨": "現在地の座標は、天気・場所・経路の照会時にWeatherONのCloudflare Workerを経由し、韓国気象庁、Apple WeatherKit、Open-Meteo、Kakao、Googleなど、その機能に必要な提供事業者へ送信されます。リアルタイムの座標はD1またはR2に保存しませんが、メモリキャッシュに一時的に含まれる場合があります。提供事業者側のログとバックアップは、WeatherONアプリケーションのストレージとは別のものです",
    "옷장 사진 처리: 분석용 축소 JPEG를 Cloudflare Workers AI에 전송하며 등록 가능 여부와 분류 확인 후 WeatherON 서버 저장소에 보관하지 않음": "ワードローブ写真の取扱い：分析用に縮小したJPEGをCloudflare Workers AIへ送信します。登録可否の確認と分類後、画像をWeatherONのサーバー保存領域には保管しません",
    "승인된 옷장 사진은 기기에 저장되며 iOS에서는 iCloud 백업 제외와 잠금 시 파일 보호를 적용. 로그아웃 또는 계정 데이터 초기화 시 함께 삭제": "登録が承認されたワードローブ写真は端末に保存されます。iOSではiCloudバックアップの対象外とし、端末のロック中はファイル保護を適用します。ログアウトまたはアカウントデータの初期化時に削除されます",
    "회원 정보와 저장 데이터는 회원 탈퇴 또는 삭제 요청 시 지체 없이 파기하며, 법령상 보관 의무가 있는 정보는 정해진 기간 동안 보관": "アカウント情報および保存データは、アカウント削除または削除の申し出を受けた場合、遅滞なく削除します。法令により保存が義務付けられる情報は、所定の期間保存します",
    "이용자는 앱의 계정 관리 또는 support@weatheron.app을 통해 개인정보 열람·정정·삭제·처리정지를 요청할 수 있음": "利用者は、アプリのアカウント管理またはsupport@weatheron.appを通じて、個人情報の開示、訂正、削除または利用停止を請求できます",
    "개인정보 보호책임자: 최대현 · support@weatheron.app": "個人情報保護責任者：최대현 · support@weatheron.app",
    "보유기간: 계정 정보와 연결된 동의 기록은 계정 삭제 시까지 보관. 운영 데이터베이스에서 삭제된 데이터는 D1 시점 복구 이력에 최대 7일간 남을 수 있음. 기기 저장 데이터는 앱에서 삭제하거나 앱을 제거할 때까지 보관": "保存期間：アカウント情報および関連する同意記録はアカウント削除まで保存します。本番データベースから削除したデータがD1のポイントインタイムリカバリー履歴に最大7日間残る場合があります。端末データはアプリ内で削除するかアプリを削除するまで保存します",
    "파기 절차·방법: 계정 삭제 요청이 완료되면 운영 데이터베이스의 계정 행과 연결 데이터를 삭제하고, 기기 데이터베이스 기록과 옷장 사진 파일을 삭제": "削除の手続および方法：アカウント削除の申出が完了すると、本番データベースのアカウント行および関連データを削除し、端末データベースの記録およびワードローブ写真ファイルを削除します",
    "처리위탁: Cloudflare Workers·D1·Workers AI를 인증, 서버 기능, 계정 데이터 저장, 옷장 사진 분석에 사용. D1은 APAC 지역에서 실행되며 읽기 복제를 사용하지 않음. APAC은 국가명이 아니며 Workers·Workers AI 처리 국가를 제한하지 않음": "取扱いの委託：認証、サーバー機能、アカウントデータの保存およびワードローブ写真の分析にCloudflare Workers、D1およびWorkers AIを使用します。D1はAPAC地域で稼働し、読み取りレプリケーションは使用していません。APACは国名ではなく、Workers・Workers AIの処理国を制限するものでもありません",
    "외부 제공: 로그인 제공자와 날씨·장소·경로 제공자에는 이용자가 요청한 인증 또는 조회에 필요한 토큰, 검색어, 좌표를 전송할 수 있음": "外部提供：利用者が求めた認証または照会に必要なトークン、検索語および座標を、ログイン、天気、場所および経路の提供事業者へ送信する場合があります",
    "이용자는 앱의 계정 관리 또는 support@weatheron.app을 통해 개인정보 열람·정정·삭제·처리정지와 동의 철회를 요청할 수 있으며, 본인 확인 후 지체 없이 처리 결과를 안내받을 수 있음": "利用者は、アプリのアカウント管理またはsupport@weatheron.appを通じて、個人情報の開示、訂正、削除、利用停止または同意の撤回を請求できます。本人確認後、遅滞なく処理結果を案内します",
    "안전조치: 전송 구간 암호화, 세션 토큰 해시 저장, 로그인 제공자 토큰 암호화, 앱 무결성 확인, 요청 크기·횟수 제한, 접근 범위 제한을 적용": "安全管理措置：通信の暗号化、セッショントークンのハッシュ保存、ログイン提供事業者トークンの暗号化、アプリの完全性確認、リクエストのサイズ・回数制限およびアクセス範囲の制限を実施します",
    "광고 식별자 기반 광고와 마케팅 발송 기능은 현재 앱에 적용하지 않으며, 도입 전 별도 고지와 필요한 동의를 적용": "広告識別子に基づく広告およびマーケティングメッセージ配信は、現在のアプリには実装していません。導入前に別途通知し、必要な同意を取得します",
    "이용약관": "利用規約",
    "WeatherON 사용과 계정 기능 기준": "WeatherONの利用およびアカウント機能に関するルール",
    "게스트는 계정 연결 없이 기본 날씨·코디·우산 추천 기능을 이용할 수 있음": "ゲストは、アカウントを連携せずに基本の天気、コーデ、傘のおすすめ機能を利用できます",
    "저장, 동기화, 목적지 케어 등 계정이 필요한 기능은 지원 로그인 수단으로 계정을 연결한 뒤 이용": "保存、同期、目的地ケアなどアカウントが必要な機能は、対応するログイン方法でアカウントを連携した後に利用できます",
    "날씨, 코디, 출발시간 등 안내는 참고 정보이며 외부 데이터 오류·지연에 따라 달라질 수 있음": "天気、コーデ、出発時刻などの案内は参考情報であり、外部データの誤りや遅延により内容が変わる場合があります",
    "회원은 계정 관리에서 언제든 탈퇴를 요청할 수 있으며, 관련 법령상 보관 의무가 있는 정보를 제외한 개인정보는 파기": "利用者は、アカウント管理からいつでもアカウント削除を申し出ることができます。法令により保存が義務付けられる情報を除き、個人情報は削除されます",
    "위치기반서비스 이용약관": "位置情報サービス利用規約",
    "현재 위치와 목적지 기반 서비스 기준": "現在地と目的地に基づくサービスのルール",
    "실시간 위치는 요청한 날씨·장소·경로 조회에 사용하며 WeatherON 서버 저장소에 별도 보관하지 않음. 저장 위치는 이용자가 삭제하거나 계정을 삭제할 때까지 보관": "リアルタイムの位置情報は、利用者が求めた天気、場所および経路の照会に使用し、WeatherONのサーバー保存領域には別途保存しません。保存済みの場所は、利用者が削除するかアカウントを削除するまで保存します",
    "위치정보는 현재 위치 날씨, 출발지·목적지 날씨 비교, 출발 시각 계산, 준비 알림과 사용자가 요청한 장소·경로 검색에만 이용": "位置情報は、現在地の天気、出発地と目的地の天気比較、出発時刻の計算、準備通知ならびに利用者が求めた場所・経路検索にのみ利用します",
    "이용자는 기기 설정에서 위치 권한을 변경하고 앱에서 수동 위치로 전환하거나 저장 위치를 삭제할 수 있으며, 계정 관리 또는 support@weatheron.app을 통해 이용·제공 내역 확인과 동의 철회를 요청할 수 있음": "利用者は、端末設定で位置情報へのアクセスを変更し、アプリで手動選択の場所へ切り替え、または保存済みの場所を削除できます。アカウント管理またはsupport@weatheron.appを通じて、利用・提供記録の確認または同意の撤回を請求できます",
    "위치 동의를 거부하거나 철회할 수 있으며 자동 현재 위치 기능은 제한되지만 수동 위치와 목적지 검색은 계속 이용 가능": "位置情報への同意は拒否または撤回できます。現在地の自動取得機能は制限されますが、手動選択の場所および目的地検索は引き続き利用できます",
    "위치정보 이용·제공사실 확인자료의 별도 기록과 법정 보관기간 적용 기능은 현재 코드에서 확인되지 않아 위치기반서비스 외부 제공 전 구현과 검증 필요": "現在のコードには、位置情報の利用・提供事実に関する確認記録を別途作成し、法定保存期間を適用する機能が確認できません。位置情報サービスを外部提供する前に実装および検証が必要です",
    "사업자 법적 명칭·주소·전화번호, 위치정보관리책임자, 확인자료의 정확한 보관기간은 확인되지 않아 임의 기재하지 않았으며 외부 공개 전 반드시 보완 필요": "事業者の法的名称、住所および電話番号、位置情報管理責任者ならびに確認記録の正確な保存期間は未確認です。これらを推測で記載しておらず、外部公開前に必ず補完する必要があります",
    "현재 위치 날씨, 출발지·목적지 비교, 출발시간 안내를 위해 GPS·Wi-Fi·기지국 또는 사용자가 입력한 위치를 이용": "現在地の天気、出発地と目的地の比較、出発時刻の案内を提供するため、GPS、Wi-Fi、携帯電話基地局または利用者が入力した場所を使用します",
    "현재 위치 권한을 허용하지 않아도 사용자가 직접 선택한 수동 위치와 목적지 검색을 이용할 수 있음": "現在地へのアクセスを許可しなくても、利用者が手動で選択した場所と目的地検索を利用できます",
    "현재 위치 좌표는 이용자가 요청한 날씨·장소·경로 조회를 위해 WeatherON의 Cloudflare Worker를 거쳐 해당 기능 제공자에 전달되며 D1·R2에는 저장하지 않음": "現在地の座標は、利用者が求めた天気・場所・経路の照会のためにWeatherONのCloudflare Workerを経由して必要な提供事業者へ送信され、D1またはR2には保存されません",
    "실시간 위치정보는 서비스 제공에 필요한 범위에서 처리하며 저장 위치는 회원 탈퇴 또는 삭제 요청 시까지 보관": "リアルタイムの位置情報は、サービス提供に必要な範囲でのみ取り扱います。保存済みの場所は、アカウント削除または削除の申し出があるまで保存します",
    "이용자는 기기 설정에서 위치 권한을 변경하거나 앱에서 수동 위치로 전환할 수 있음": "利用者は、端末の設定で位置情報へのアクセスを変更するか、アプリで手動選択の場所に切り替えることができます",
    "정책 및 법적 고지": "ポリシーおよび法的通知",
    "시행일 {0}": "施行日：{0}",
    "위치·목적지·앱 사용 데이터": "位置情報、目的地、アプリの利用データ",
    "게스트·계정 연결·저장 기능 기준": "ゲスト利用、アカウント連携、保存機能のルール",
    "현재 위치와 목적지 기반 안내": "現在地と目的地に基づく案内",
    "계정 관리와 저장·동기화 기능 제공": "アカウント管理および保存・同期機能の提供",
    "거부할 수 있으나 계정 연결과 계정이 필요한 저장·동기화 기능은 이용할 수 없음": "同意を拒否できますが、アカウント連携およびアカウントが必要な保存・同期機能は利用できません",
    "목적: 로그인·계정 관리, 저장 데이터 동기화, 날씨·출발·코디 기능 제공": "目的：ログインおよびアカウント管理、保存データの同期、天気・出発・コーデ機能の提供",
    "항목: 로그인 식별자, 이메일·프로필, 동의 기록, 저장 위치·목적지, 설정, 사용자가 선택한 옷장 사진": "項目：ログイン識別子、メールアドレス・プロフィール、同意記録、保存済みの場所・目的地、設定、利用者が選択したワードローブ写真",
    "보유: 계정 정보와 서버 저장 데이터는 계정 삭제 시까지. 옷장 분석 사진은 WeatherON 서버 저장소에 보관하지 않음": "保存：アカウント情報およびサーバー保存データはアカウント削除まで保存します。分析用ワードローブ写真はWeatherONのサーバー保存領域には保存しません",
    "목적: 현재 위치 날씨, 출발지·목적지 비교, 출발 시각과 준비 알림 제공": "目的：現在地の天気、出発地と目的地の比較、出発時刻および準備通知の提供",
    "항목·방법: GPS·Wi-Fi·기지국 기반 현재 위치 또는 사용자가 직접 입력한 위치": "項目・方法：GPS、Wi-Fiもしくは携帯電話基地局に基づく現在地、または利用者が直接入力した場所",
    "보유: 실시간 위치는 요청 처리 후 WeatherON 서버 저장소에 보관하지 않음. 저장 위치는 삭제 또는 계정 삭제 시까지": "保存：リアルタイムの位置情報は、リクエスト処理後にWeatherONのサーバー保存領域へ保存しません。保存済みの場所は、削除またはアカウント削除まで保存します",
    "거부할 수 있으며 자동 현재 위치 기능은 제한되지만 수동 위치와 목적지 검색은 이용 가능": "同意を拒否できます。現在地の自動取得機能は制限されますが、手動選択の場所および目的地検索は利用できます",
    "필수 4개를 함께 변경": "必須4項目をまとめて選択または解除",
    "만 14세 이상입니다": "私は14歳以上です",
    "서비스 이용 가능 연령 확인": "利用可能年齢の確認",
    "이용약관 동의": "利用規約に同意する",
    "개인정보 수집·이용 동의": "個人情報の取得・利用に同意する",
    "마케팅 정보 수신 동의": "マーケティング情報の受信に同意する",
    "선택 항목 · 언제든 철회 가능": "任意・同意はいつでも撤回できます",
    "약관 동의": "確認して同意",
    "전체 동의": "すべてに同意",
    "전체 동의 해제": "すべての選択を解除",
    "필수 4개와 선택 마케팅 1개를 함께 변경": "必須4項目と任意のマーケティング項目をまとめて選択",
    "필수 동의 필요": "必須項目への同意が必要です",
    "동의하고 계속": "同意して続ける",
    "동의하고 계정 연결 계속": "同意してアカウント連携を続ける",
    "내용 보기": "内容を確認",
    "회원 탈퇴": "アカウントを削除",
    "탈퇴하기": "アカウントを削除",
    "서버 계정 데이터와 이 기기의 저장 목적지·코디 상태·옷장 사진이 삭제돼요. 되돌릴 수 없어요.": "サーバー上のアカウントデータと、この端末に保存された目的地、コーデ状態、ワードローブ写真が削除されます。この操作は取り消せません。",
    "이 기기의 저장 목적지·코디 상태·옷장 사진이 삭제되고 계정 연결이 해제돼요. 서버 계정은 유지돼요.": "この端末に保存された目的地、コーデ状態、ワードローブ写真が削除され、アカウント連携が解除されます。サーバー上のアカウントは保持されます。",
    "기본 위치 서울": "デフォルト地点・ソウル",
    "날씨와 출발 시간을 맞춰드림": "天気と出発時刻をまとめて案内",
    "더운 날이에요 · 가볍게": "暑い日・軽めの服装で",
    "더운 날이에요. 바람 잘 통하는 차림이 좋아요": "暑い日は、通気性のよい服がおすすめです",
    "다음": "次へ",
    "바람 잘 통하는 차림이 좋아요": "通気性のよい服がおすすめです",
    "오늘 나갈 준비, WeatherON이 가볍게 챙겨드려요": "今日のお出かけ準備を、WeatherONがサポートします",
    "오늘 입기 좋은 코디": "今日のおすすめコーデ",
    "오늘은 가볍게 나가요": "今日は軽めの服装で",
    "직접 고른 지역": "手動で選んだ地域",
    "체감 {0} · 강수 {1}%": "体感 {0}・降水確率 {1}%",
    "최고 {0} · 최저 {1}": "最高 {0}・最低 {1}",
    "홈": "ホーム",
    "홈 탭": "ホームタブ",
    "코디": "コーデ",
    "코디 탭": "コーデタブ",
    "출발": "出発",
    "출발 탭": "出発タブ",
    "개": "件",
  },
};

const files = (await Promise.all(sourceRoots.map(collectSourceFiles))).flat()
  .filter((file) => !file.includes(`${path.sep}localization${path.sep}`));
const messages = new Set();

for (const file of files) {
  const source = await fs.readFile(file, "utf8");
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  visit(sourceFile);
}

const orderedMessages = [...messages].filter(isTranslatable).sort((a, b) => a.localeCompare(b, "ko"));
await fs.mkdir(outputDir, { recursive: true });

const messageOutput = process.argv.find((argument) => argument.startsWith("--messages="))?.slice("--messages=".length);
if (messageOutput) {
  await fs.writeFile(messageOutput, `${JSON.stringify(orderedMessages, null, 2)}\n`);
  process.exit(0);
}

if (process.argv.includes("--check")) {
  const catalogs = Object.fromEntries(await Promise.all(languages.map(async (language) => [language, await readCatalog(path.join(outputDir, `${language}.json`))])));
  for (const language of languages) {
    assert.deepEqual(Object.keys(catalogs[language]).sort(), [...orderedMessages].sort(), `${language} catalog keys must match source messages`);
    for (const [source, target] of Object.entries(catalogs[language])) {
      assert.ok(target.trim(), `${language} translation is empty: ${source}`);
      const targets = target.startsWith("plural:") ? target.slice("plural:".length).split("|") : [target];
      targets.forEach((variant) => assert.deepEqual(placeholders(variant).sort(), placeholders(source).sort(), `${language} placeholders differ: ${source}`));
      if (!preservedKoreanTargets.has(source)) assert.doesNotMatch(target, korean, `${language} translation still contains Korean: ${source}`);
    }
    for (const [source, target] of Object.entries(overrides[language])) {
      if (messages.has(source)) assert.equal(catalogs[language][source], target, `${language} reviewed translation changed: ${source}`);
    }
  }
  const policySource = await fs.readFile(path.join(root, "apps/mobile/src/localization/localePolicy.ts"), "utf8");
  const policyModule = ts.transpileModule(policySource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const { resolveLocalePolicy } = await import(`data:text/javascript;base64,${Buffer.from(policyModule).toString("base64")}`);
  const cases = [
    [[{ languageTag: "ko-KR", languageCode: "ko", regionCode: "KR" }], ["ko", "ko-KR", "KR"]],
    [[{ languageTag: "en-US", languageCode: "en", regionCode: "US" }], ["en", "en-US", "US"]],
    [[{ languageTag: "en-GB", languageCode: "en", regionCode: "GB" }], ["en", "en-GB", "GB"]],
    [[{ languageTag: "ja-JP", languageCode: "ja", regionCode: "JP" }], ["ja", "ja-JP", "JP"]],
    [[{ languageTag: "ko-US", languageCode: "ko", regionCode: "US" }], ["ko", "ko-US", "US"]],
    [[{ languageTag: "en-KR", languageCode: "en", regionCode: "KR" }], ["en", "en-KR", "KR"]],
    [[{ languageTag: "fr-FR", languageCode: "fr", regionCode: "FR" }, { languageTag: "ja-JP", languageCode: "ja", regionCode: "JP" }], ["ja", "ja-JP", "FR"]],
    [[{ languageTag: "fr-DE", languageCode: "fr", regionCode: "DE" }], ["en", "en-US", "DE"]],
  ];
  for (const [preferences, expected] of cases) {
    const policy = resolveLocalePolicy(preferences);
    assert.deepEqual([policy.language, policy.languageTag, policy.regionCode], expected);
  }
  const sourceText = (await Promise.all(files.map((file) => fs.readFile(file, "utf8")))).join("\n");
  for (const word of ["취소", "나중에", "우산", "바람", "예약 완료"]) {
    assert.doesNotMatch(sourceText, new RegExp(`(?:includes\\(|[=!]==?\\s*)["'](?:[^"']*)${word}`, "u"), `display string controls logic: ${word}`);
  }
  console.log(`mobile localization check passed (${orderedMessages.length} messages)`);
  process.exit(0);
}

for (const language of languages) {
  const outputPath = path.join(outputDir, `${language}.json`);
  const existing = process.argv.includes("--refresh") ? {} : await readCatalog(outputPath);
  Object.assign(existing, overrides[language]);
  const missing = orderedMessages.filter((message) => !existing[message]);
  let completed = 0;
  for (const batch of chunks(missing, 16)) {
    const translated = await translateBatch(batch, language);
    batch.forEach((message, index) => { existing[message] = translated[index]; });
    completed += batch.length;
    if (completed % 60 === 0 || completed === missing.length) {
      await writeCatalog(outputPath, existing);
      process.stdout.write(`${language}: ${completed}/${missing.length}\n`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  Object.assign(existing, overrides[language]);
  const current = Object.fromEntries(orderedMessages.map((message) => [message, existing[message] ?? message]));
  await writeCatalog(outputPath, current);
}

function visit(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) add(node.text);
  if (ts.isTemplateExpression(node)) {
    let message = node.head.text;
    node.templateSpans.forEach((span, index) => { message += `{${index}}${span.literal.text}`; });
    add(message);
  }
  if (ts.isJsxText(node)) add(node.text.replace(/\s+/gu, " "));
  if (ts.isJsxElement(node) && getJsxTagName(node.openingElement.tagName) === "Text") {
    const composite = getCompositeJsxMessage(node.children);
    if (composite) add(composite);
  }
  ts.forEachChild(node, visit);
}

function getCompositeJsxMessage(children) {
  let message = "";
  let expressionIndex = 0;
  for (const child of children) {
    if (ts.isJsxText(child)) message += child.text.replace(/\s+/gu, " ");
    else if (ts.isJsxExpression(child) && child.expression) message += `{${expressionIndex++}}`;
    else return null;
  }
  return expressionIndex > 0 && korean.test(message) ? message.trim() : null;
}

function getJsxTagName(tagName) {
  return ts.isIdentifier(tagName) ? tagName.text : null;
}

function add(value) {
  const normalized = value.trim().replace(/\r\n/gu, "\n");
  if (normalized) messages.add(normalized);
}

function isTranslatable(value) {
  return korean.test(value) && value.length <= 700 && !/^weatheron[:.]/iu.test(value) && !/^[\w.-]+@[\w.-]+$/u.test(value);
}

async function collectSourceFiles(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const stat = await fs.stat(absolutePath);
  if (stat.isFile()) return [absolutePath];
  const entries = await fs.readdir(absolutePath, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const child = path.join(absolutePath, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path.relative(root, child));
    return /\.tsx?$/u.test(entry.name) ? [child] : [];
  }));
  return nested.flat();
}

async function translateBatch(messages, language) {
  const separator = "<<<WONSEP>>>";
  const protectedMessage = messages.map((message) => message.replace(/\{(\d+)\}/gu, "__WON_$1__")).join(`\n${separator}\n`);
  const params = new URLSearchParams({ client: "dict-chrome-ex", sl: "ko", tl: language, q: protectedMessage });
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(`https://clients5.google.com/translate_a/t?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const translated = typeof payload?.[0] === "string" ? payload[0].split(/\s*<{3}WONSEP>{3}\s*/u) : [];
      if (translated.length !== messages.length) throw new Error(`expected ${messages.length} messages, received ${translated.length}`);
      return translated.map((value) => value.trim().replace(/__\s*WON\s*_\s*(\d+)\s*__/giu, "{$1}"));
    } catch (error) {
      if (attempt === 3) throw new Error(`${language} translation failed for batch starting ${JSON.stringify(messages[0])}: ${String(error)}`);
      await new Promise((resolve) => setTimeout(resolve, 2_000 * (attempt + 1)));
    }
  }
  return message;
}

async function readCatalog(file) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch { return {}; }
}

async function writeCatalog(file, catalog) {
  const ordered = Object.fromEntries(Object.entries(catalog).sort(([left], [right]) => left.localeCompare(right, "ko")));
  await fs.writeFile(file, `${JSON.stringify(ordered, null, 2)}\n`);
}

function chunks(items, size) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}

function placeholders(value) {
  return [...value.matchAll(/\{(\d+)\}/gu)].map((match) => match[1]);
}
