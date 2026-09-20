import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "../localization/react-native";
import { AppButton } from "../components/AppButton";
import { BackButton } from "../components/BackButton";
import type { P0ScreenProps } from "../navigation/types";
import type { PolicyDocumentType } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { pageStyles } from "../theme/pageStyles";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { radius, spacing } from "../theme/tokens";

type PolicyDocument = {
  title: string;
  summary: string;
  effectiveDate?: string;
  points: string[];
};

const policyDocuments: Record<Exclude<PolicyDocumentType, "open-source">, PolicyDocument> = {
  privacy: {
    title: "개인정보처리방침",
    summary: "개인정보 수집·이용과 이용자 권리",
    effectiveDate: "2026.09.19",
    points: [
      "수집 항목: 로그인 식별자와 계정 프로필, 위치정보와 저장 위치, 기기정보와 앱 사용 로그, 사용자가 선택한 옷장 사진과 설정 정보",
      "이용 목적: 계정 관리, 위치 기반 날씨와 출발 안내, 코디·우산·신발 추천, 옷장 사진 등록 적합성 확인, 서비스 품질 개선",
      "현재 위치 좌표는 날씨·장소·경로 조회 시 WeatherON의 Cloudflare Worker를 거쳐 기상청·Apple WeatherKit·Open-Meteo·Kakao·Google 등 해당 기능 제공자에 전달됨. D1·R2에는 저장하지 않으며 Worker 요청 로그의 쿼리 문자열은 가림 처리",
      "옷장 사진 처리: 분석용 축소 JPEG를 Cloudflare Workers AI에 전송하며 등록 가능 여부와 분류 확인 후 WeatherON 서버 저장소에 보관하지 않음",
      "승인된 옷장 사진은 기기에 저장되며 iOS에서는 iCloud 백업 제외와 잠금 시 파일 보호를 적용. 로그아웃 또는 계정 데이터 초기화 시 함께 삭제",
      "보유기간: 계정 정보·동의 기록·서버 저장 데이터는 계정 삭제 시까지, 기기 저장 데이터는 앱에서 삭제하거나 앱을 제거할 때까지 보관. 법령상 별도 보관 의무가 확인된 정보는 해당 기간 분리 보관",
      "파기 절차·방법: 계정 삭제 요청이 완료되면 운영 데이터베이스의 계정 행과 연결 데이터를 삭제하고, 기기 데이터베이스 기록과 옷장 사진 파일을 삭제. 복구용 사본의 보존·삭제 주기는 인프라 설정 확인 후 공개본에 명시 필요",
      "처리위탁: Cloudflare Workers·D1·Workers AI를 인증, 서버 기능, 계정 데이터 저장, 옷장 사진 분석에 사용. 실제 계약상 수탁관계, 처리 국가와 보존기간은 확인 전이므로 공개본 확정 필요",
      "외부 제공: 로그인 제공자와 날씨·장소·경로 제공자에는 이용자가 요청한 인증 또는 조회에 필요한 토큰, 검색어, 좌표를 전송할 수 있음. 업체별 제3자 제공·위탁 구분과 국외이전 항목은 운영 구성 확인 후 공개본 확정 필요",
      "이용자는 앱의 계정 관리 또는 support@weatheron.app을 통해 개인정보 열람·정정·삭제·처리정지와 동의 철회를 요청할 수 있으며, 본인 확인 후 지체 없이 처리 결과를 안내받을 수 있음",
      "안전조치: 전송 구간 암호화, 세션 토큰 해시 저장, 로그인 제공자 토큰 암호화, 앱 무결성 확인, 요청 크기·횟수 제한, 접근 범위 제한을 적용",
      "광고 식별자 기반 광고와 마케팅 발송 기능은 현재 앱에 적용하지 않으며, 도입 전 별도 고지와 필요한 동의를 적용",
      "개인정보 보호책임자: 최대현 · support@weatheron.app",
      "사업자 법적 명칭·주소·전화번호와 Cloudflare 처리지역·위탁관계가 확인되지 않아 해당 정보는 임의 기재하지 않았으며, 외부 공개 전 반드시 보완 필요",
    ],
  },
  terms: {
    title: "이용약관",
    summary: "WeatherON 사용과 계정 기능 기준",
    points: [
      "게스트는 계정 연결 없이 기본 날씨·코디·우산 추천 기능을 이용할 수 있음",
      "저장, 동기화, 목적지 케어 등 계정이 필요한 기능은 지원 로그인 수단으로 계정을 연결한 뒤 이용",
      "날씨, 코디, 출발시간 등 안내는 참고 정보이며 외부 데이터 오류·지연에 따라 달라질 수 있음",
      "회원은 계정 관리에서 언제든 탈퇴를 요청할 수 있으며, 관련 법령상 보관 의무가 있는 정보를 제외한 개인정보는 파기",
    ],
  },
  location: {
    title: "위치기반서비스 이용약관",
    summary: "현재 위치와 목적지 기반 서비스 기준",
    effectiveDate: "2026.09.19",
    points: [
      "현재 위치 날씨, 출발지·목적지 비교, 출발시간 안내를 위해 GPS·Wi-Fi·기지국 또는 사용자가 입력한 위치를 이용",
      "현재 위치 권한을 허용하지 않아도 사용자가 직접 선택한 수동 위치와 목적지 검색을 이용할 수 있음",
      "현재 위치 좌표는 이용자가 요청한 날씨·장소·경로 조회를 위해 WeatherON의 Cloudflare Worker를 거쳐 해당 기능 제공자에 전달되며 D1·R2에는 저장하지 않음",
      "실시간 위치는 요청한 날씨·장소·경로 조회에 사용하며 WeatherON 서버 저장소에 별도 보관하지 않음. 저장 위치는 이용자가 삭제하거나 계정을 삭제할 때까지 보관",
      "위치정보는 현재 위치 날씨, 출발지·목적지 날씨 비교, 출발 시각 계산, 준비 알림과 사용자가 요청한 장소·경로 검색에만 이용",
      "이용자는 기기 설정에서 위치 권한을 변경하고 앱에서 수동 위치로 전환하거나 저장 위치를 삭제할 수 있으며, 계정 관리 또는 support@weatheron.app을 통해 이용·제공 내역 확인과 동의 철회를 요청할 수 있음",
      "위치 동의를 거부하거나 철회할 수 있으며 자동 현재 위치 기능은 제한되지만 수동 위치와 목적지 검색은 계속 이용 가능",
      "위치정보 이용·제공사실 확인자료의 별도 기록과 법정 보관기간 적용 기능은 현재 코드에서 확인되지 않아 위치기반서비스 외부 제공 전 구현과 검증 필요",
      "사업자 법적 명칭·주소·전화번호, 위치정보관리책임자, 확인자료의 정확한 보관기간은 확인되지 않아 임의 기재하지 않았으며 외부 공개 전 반드시 보완 필요",
    ],
  },
};

const openSourceGroups = [
  "React 19.2.3 · React Native 0.86.0 — Meta Platforms, Inc. — MIT",
  "Expo 57.0.8 · Apple Authentication · Blur · Clipboard · Crypto · File System · Font · Haptics · Image Manipulator · Image Picker · Location · Navigation Bar · Notifications · Secure Store · Splash Screen · SQLite · Status Bar · Web Browser · Metro Runtime — Expo / 650 Industries, Inc. — MIT",
  "React Native Safe Area Context 5.7.0 — AppAndFlow — MIT",
  "React Native Screens 4.26.2 — Software Mansion — MIT",
  "React Native Web 0.21.2 — Nicolas Gallagher — MIT",
];

const mitLicense = `MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

export function PolicyDocumentScreen({ selectedPolicyDocument, policyDocumentReturnRoute, onReturnFromPolicyDocument, onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [licenseExpanded, setLicenseExpanded] = useState(false);
  const isOpenSource = selectedPolicyDocument === "open-source";
  const document = policyDocuments[selectedPolicyDocument === "open-source" ? "terms" : selectedPolicyDocument];
  const title = isOpenSource ? "오픈소스 라이선스" : document.title;
  const returnLabel = policyDocumentReturnRoute === "A3" ? "약관 동의로 돌아가기" : "정책 목록으로 돌아가기";

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { width: "100%", maxWidth: layout.contentMaxWidth, gap: layout.settingsContentGap, paddingHorizontal: layout.screenHorizontalPadding, paddingTop: layout.weatherTopPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { minHeight: layout.settingsHeaderMinHeight }, pageStyles.header]}>
          <BackButton accessibilityLabel={returnLabel} onPress={onReturnFromPolicyDocument} />
          <Text style={[styles.screenTitle, pageStyles.title, { color: theme.text, fontSize: layout.screenTitleFontSize, lineHeight: layout.screenTitleLineHeight }]} numberOfLines={2}>{title}</Text>
        </View>

        <View style={[styles.documentMeta, { borderBottomColor: theme.border }]}>
          <Text style={[styles.summary, { color: theme.muted }]}>{isOpenSource ? "현재 앱의 직접 런타임 의존성" : document.summary}</Text>
          {!isOpenSource && document.effectiveDate ? <Text style={[styles.date, { color: theme.subtle }]}>시행일 {document.effectiveDate}</Text> : null}
        </View>

        <View style={[styles.documentBody, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          {(isOpenSource ? openSourceGroups : document.points).map((point, index) => (
            <View key={point} style={[styles.paragraph, index > 0 ? { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth } : null]}>
              <Text style={[styles.paragraphNumber, { color: theme.gold }]}>{index + 1}</Text>
              <Text selectable style={[styles.paragraphText, { color: theme.text }]}>{point}</Text>
            </View>
          ))}
        </View>

        {isOpenSource ? (
          <View style={[styles.licensePanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: licenseExpanded }} onPress={() => setLicenseExpanded((current) => !current)} style={styles.licenseButton}>
              <Text style={[styles.licenseButtonText, { color: theme.sky }]}>{licenseExpanded ? "MIT 라이선스 전문 닫기" : "MIT 라이선스 전문 보기"}</Text>
            </Pressable>
            {licenseExpanded ? <Text selectable style={[styles.licenseText, { color: theme.muted }]}>{mitLicense}</Text> : null}
          </View>
        ) : null}

        <View style={styles.actions}>
          <AppButton label={returnLabel} accessibilityLabel={returnLabel} onPress={onReturnFromPolicyDocument} />
          <AppButton label="MY로 이동" accessibilityLabel="MY로 이동" onPress={() => onNavigate("M1")} tone="secondary" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  scroll: { flex: 1 },
  content: { minHeight: "100%", paddingBottom: spacing.xl, alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  screenTitle: { flex: 1, fontSize: 20, lineHeight: 25, fontWeight: "900" },
  documentMeta: { gap: 4, paddingHorizontal: 2, paddingBottom: spacing.md, borderBottomWidth: 1 },
  summary: { fontSize: 14, lineHeight: 21, fontWeight: "600" },
  date: { fontSize: 12, lineHeight: 18, fontWeight: "700" },
  documentBody: { borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
  paragraph: { flexDirection: "row", gap: spacing.sm, padding: spacing.md },
  paragraphNumber: { width: 22, fontSize: 13, lineHeight: 23, fontWeight: "900" },
  paragraphText: { flex: 1, fontSize: 15, lineHeight: 24, fontWeight: "500" },
  licensePanel: { borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
  licenseButton: { minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md },
  licenseButtonText: { fontSize: 14, lineHeight: 19, fontWeight: "900" },
  licenseText: { padding: spacing.md, paddingTop: 0, fontSize: 13, lineHeight: 20, fontWeight: "500" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
