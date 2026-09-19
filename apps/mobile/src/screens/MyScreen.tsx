import { pageStyles } from "../theme/pageStyles";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "../localization/react-native";
import { uiIconAssets } from "../assets";
import { AppListGroup, AppListRow } from "../components/AppListRow";
import { FeedbackPressable } from "../components/FeedbackPressable";
import type { P0ScreenProps } from "../navigation/types";
import type { AccountProvider } from "../providers/accountAuth";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, spacing } from "../theme/tokens";

type MenuTone = "clear" | "gold" | "sky" | "warm";

export function MyScreen({
  accountLinked,
  accountProfile,
  termsRequiredAccepted,
  locationReady,
  weatherLocationMode,
  permissionReady,
  permissionGateResult,
  smartCareEnabled,
  temperatureUnit,
  distanceUnit,
  themeMode,
  onNavigate,
  onRequireAccount,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const isAccountReady = accountLinked && termsRequiredAccepted;
  const needsTerms = accountLinked && !termsRequiredAccepted;
  const profileTitle = isAccountReady ? "연결된 계정" : needsTerms ? "약관 동의 필요" : "게스트 모드";
  const profileBody = isAccountReady ? `${getProviderLabel(accountProfile?.provider)} 연결됨` : needsTerms ? "필수 약관 확인 필요" : "연결 후 저장 기능 사용";
  const profileAction = isAccountReady ? "관리" : needsTerms ? "약관 동의" : "계정 연결";
  const alertState = getAlertState(smartCareEnabled, permissionReady, permissionGateResult);
  const locationState = getLocationState(locationReady, weatherLocationMode);
  const permissionTone: MenuTone =
    locationState.tone === "warm" ? "warm" : locationState.tone === "clear" && alertState.tone === "clear" ? "clear" : "sky";
  const globalSettingsSummary = getGlobalSettingsSummary(temperatureUnit, distanceUnit, themeMode);
  const recommendation = locationState.tone === "warm"
    ? { title: "날씨 위치 선택", body: "현재 위치를 허용하거나 수동 위치를 선택해요", action: "권한에서 설정", route: "M4" as const }
    : smartCareEnabled && !permissionReady
      ? { title: "알림 권한 켜기", body: "스마트 알림은 켜졌지만 기기 권한이 필요해요", action: "알림에서 설정", route: "M2" as const }
      : null;

  const openProfile = () => {
    if (!isAccountReady) {
      onRequireAccount("account-connect", "M1");
      return;
    }
    onNavigate("A4");
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            width: "100%",
            maxWidth: layout.contentMaxWidth,
            gap: layout.settingsContentGap,
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingTop: layout.weatherTopPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <View style={[styles.header, { minHeight: 44, paddingTop: 0, justifyContent: "center" }]}>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                fontSize: layout.screenTitleFontSize,
                lineHeight: layout.screenTitleLineHeight,
              },
              pageStyles.title,
            ]}
          >
            마이
          </Text>
        </View>

        <FeedbackPressable
          accessibilityLabel={isAccountReady ? "계정 관리" : needsTerms ? "약관 동의 이어가기" : "계정 연결"}
          accessibilityRole="button"
          onPress={openProfile}
          style={[
            styles.profileCard,
            {
              minHeight: layout.myProfileMinHeight,
              gap: layout.isShort ? spacing.sm : spacing.md,
              padding: layout.settingsPanelPadding,
              backgroundColor: theme.card,
              borderColor: isAccountReady ? theme.clear : theme.border,
            },
            cardShadow(theme),
        pageStyles.card,
          ]}
        >
          <View
            style={[
              styles.avatar,
              layout.isShort ? styles.avatarShort : null,
              { backgroundColor: theme.card, borderColor: isAccountReady ? theme.clear : theme.sky },
              pageStyles.quietIcon,
            ]}
          >
            <PersonGlyph color={isAccountReady ? theme.clear : theme.sky} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.profileName, pageStyles.sectionTitle, { color: theme.text }]} numberOfLines={1}>{profileTitle}</Text>
            <Text style={[styles.profileEmail, pageStyles.caption, { color: theme.subtle }]} numberOfLines={1}>{profileBody}</Text>
          </View>
          <View style={[styles.profilePill, { backgroundColor: "transparent", borderColor: theme.border }]}>
            <Text style={[styles.profilePillText, pageStyles.caption, { color: theme.text }]}>{profileAction}</Text>
          </View>
          <Chevron color={theme.subtle} />
        </FeedbackPressable>

        {recommendation ? (
          <FeedbackPressable
            accessibilityLabel={`${recommendation.title}, ${recommendation.action}`}
            accessibilityRole="button"
            onPress={() => onNavigate(recommendation.route)}
            style={[styles.recommendationCard, pageStyles.card, { minHeight: layout.myReadinessMinHeight, padding: layout.settingsPanelPadding, backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}
          >
            <View style={styles.recommendationCopy}>
              <Text style={[styles.readinessTitle, pageStyles.sectionTitle, { color: theme.text }]}>{recommendation.title}</Text>
              <Text style={[styles.readinessMeta, pageStyles.compactCaption, { color: theme.subtle }]}>{recommendation.body}</Text>
            </View>
            <Text style={[styles.recommendationAction, { color: theme.sky }]}>{recommendation.action}</Text>
            <Chevron color={theme.subtle} />
          </FeedbackPressable>
        ) : null}

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>관리</Text>

        <AppListGroup>
          <AppListRow
            icon={uiIconAssets.myPermissions}
            title="앱 권한 관리"
            subtitle={`위치 ${locationState.status} · 알림 ${alertState.status}`}
            value={permissionTone === "clear" ? "정상" : permissionTone === "warm" ? "확인" : "설정"}
            tone={permissionTone}
            onPress={() => onNavigate("M4")}
          />
          <AppListRow
            icon={uiIconAssets.myAlerts}
            title="스마트 알림 설정"
            subtitle={alertState.meta}
            value={alertState.status}
            tone={alertState.tone}
            divider
            onPress={() => onNavigate("M2")}
          />
          <AppListRow
            icon={uiIconAssets.myDisplay}
            title="표시 설정"
            subtitle={globalSettingsSummary}
            value="관리"
            tone="sky"
            divider
            onPress={() => onNavigate("M3")}
          />
        </AppListGroup>

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>정보</Text>

        <AppListGroup>
          <AppListRow
            icon={uiIconAssets.myPolicy}
            title="정책 및 법적 고지"
            subtitle="개인정보 · 약관 · 오픈소스"
            value="보기"
            tone="sky"
            onPress={() => onNavigate("R1")}
          />
        </AppListGroup>

        <Text style={[styles.appVersion, { color: theme.subtle }]}>WeatherON v1.0.0</Text>

      </ScrollView>
    </View>
  );
}

function getAlertState(
  smartCareEnabled: boolean,
  permissionReady: boolean,
  permissionGateResult: P0ScreenProps["permissionGateResult"],
): { summary: string; meta: string; status: string; tone: MenuTone } {
  const skippedPermission =
    permissionGateResult?.reason === "notification" &&
    permissionGateResult.outcome !== "allowed";
  if (!smartCareEnabled) {
    return {
      summary: "알림 일시 중지",
      meta: "스마트 알림 꺼짐 · 앱 안 판단 유지",
      status: "중지",
      tone: "sky",
    };
  }
  if (permissionReady) {
    return {
      summary: "알림 허용됨",
      meta: "권한 정상 · 스마트 알림 관리",
      status: "허용됨",
      tone: "clear",
    };
  }
  return {
    summary: skippedPermission ? "알림 나중에 설정" : "알림 권한 필요",
    meta: skippedPermission ? "푸시는 대기 · 앱 안 판단 유지" : "권한 확인 필요 · 스마트 알림 관리",
    status: skippedPermission ? "대기" : "설정",
    tone: "sky",
  };
}

function getLocationState(
  locationReady: boolean,
  weatherLocationMode: P0ScreenProps["weatherLocationMode"],
): { summary: string; meta: string; status: string; tone: MenuTone } {
  if (locationReady && weatherLocationMode === "auto") {
    return { summary: "위치 허용됨", meta: "현재 위치 기준 날씨 사용", status: "허용됨", tone: "clear" };
  }
  if (weatherLocationMode === "manual") {
    return { summary: "수동 위치", meta: "직접 선택한 위치 기준", status: "수동", tone: "sky" };
  }
  return { summary: "확인 필요", meta: "현재 위치 또는 수동 위치 설정", status: "확인", tone: "warm" };
}

function getGlobalSettingsSummary(
  temperatureUnit: P0ScreenProps["temperatureUnit"],
  distanceUnit: P0ScreenProps["distanceUnit"],
  themeMode: P0ScreenProps["themeMode"],
) {
  const temperatureLabel = temperatureUnit === "celsius" ? "°C" : "°F";
  const distanceLabel = distanceUnit === "meter" ? "m" : "mi";
  return `${temperatureLabel} · ${distanceLabel} · ${getThemeModeLabel(themeMode)}`;
}

function getThemeModeLabel(mode: P0ScreenProps["themeMode"]) {
  if (mode === "light") return "라이트";
  if (mode === "dark") return "다크";
  return "시스템";
}

function getProviderLabel(provider?: AccountProvider) {
  if (provider === "kakao") return "카카오";
  if (provider === "naver") return "네이버";
  if (provider === "line") return "LINE";
  if (provider === "google") return "Google";
  if (provider === "apple") return "Apple";
  return "계정";
}

function PersonGlyph({ color }: { color: string }) {
  return (
    <View style={styles.personGlyph} accessibilityElementsHidden>
      <View style={[styles.personHead, { borderColor: color }]} />
      <View style={[styles.personBody, { borderColor: color }]} />
    </View>
  );
}

function Chevron({ color }: { color: string }) {
  return (
    <View style={styles.chevron} accessibilityElementsHidden>
      <View style={[styles.chevronTop, { backgroundColor: color }]} />
      <View style={[styles.chevronBottom, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    minHeight: "100%",
    paddingBottom: spacing.xl,
    alignSelf: "center",
  },
  atmosphere: {
    position: "absolute",
    left: -32,
    right: -32,
    top: 180,
    height: 480,
    opacity: 0.34,
    borderRadius: 78,
  },
  header: {
    gap: 8,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  profilePill: {
    minHeight: 28,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  profilePillText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  groupLabel: {
    marginBottom: -6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 2,
  },
  avatarShort: {
    width: 44,
    height: 44,
  },
  personGlyph: {
    width: 26,
    height: 26,
    alignItems: "center",
  },
  personHead: {
    width: 10,
    height: 10,
    borderWidth: 1.7,
    borderRadius: 999,
  },
  personBody: {
    position: "absolute",
    bottom: 1,
    width: 20,
    height: 12,
    borderWidth: 1.7,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomWidth: 0,
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  profileEmail: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },
  recommendationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  recommendationCopy: {
    flex: 1,
    gap: 4,
  },
  readinessTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },
  readinessMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  recommendationAction: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  appVersion: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  chevron: {
    width: 14,
    height: 18,
  },
  chevronTop: {
    position: "absolute",
    right: 2,
    top: 5,
    width: 8,
    height: 1.6,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  chevronBottom: {
    position: "absolute",
    right: 2,
    top: 10,
    width: 8,
    height: 1.6,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }],
  },
});
