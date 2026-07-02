import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type MenuTone = "clear" | "gold" | "sky" | "warm";

export function MyScreen({
  accountLinked,
  termsRequiredAccepted,
  locationReady,
  weatherLocationMode,
  permissionReady,
  permissionGateResult,
  smartCareEnabled,
  savedDestinations,
  temperatureUnit,
  distanceUnit,
  themeMode,
  onNavigate,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const isAccountReady = accountLinked && termsRequiredAccepted;
  const needsTerms = accountLinked && !termsRequiredAccepted;
  const profileTitle = isAccountReady ? "데모 계정" : needsTerms ? "약관 동의 필요" : "게스트 모드";
  const profileBody = isAccountReady ? "저장 상태 데모 연결됨" : needsTerms ? "필수 약관 동의 후 저장·동기화 가능" : "계정 연결 후 저장·동기화 가능";
  const profileAction = isAccountReady ? "관리" : needsTerms ? "약관 동의" : "계정 연결";
  const savedDestinationCount = savedDestinations.length;
  const savedDestinationLabel = savedDestinationCount > 0 ? `목적지 ${savedDestinationCount}곳 저장` : "목적지 저장 전";
  const alertState = getAlertState(smartCareEnabled, permissionReady, permissionGateResult);
  const locationState = getLocationState(locationReady, weatherLocationMode);
  const permissionSummary = `${locationState.summary} · ${alertState.summary}`;
  const permissionTone: MenuTone = locationState.tone === "warm" || alertState.tone === "warm" ? "warm" : locationState.tone === "gold" || alertState.tone === "gold" ? "gold" : "clear";
  const globalSettingsSummary = getGlobalSettingsSummary(temperatureUnit, distanceUnit, themeMode);
  const summaryItems: SummaryItem[] = [
    { label: "목적지", value: savedDestinationLabel, tone: savedDestinationCount > 0 ? "clear" : "gold" },
    { label: "위치", value: locationState.summary, tone: locationState.tone },
    { label: "알림", value: alertState.summary, tone: alertState.tone },
  ];

  const openProfile = () => {
    onNavigate("A4");
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>마이</Text>
        </View>

        <Pressable
          accessibilityLabel={isAccountReady ? "계정 관리" : needsTerms ? "약관 동의 이어가기" : "계정 연결"}
          accessibilityRole="button"
          onPress={openProfile}
          style={[styles.profileCard, { backgroundColor: theme.card, borderColor: isAccountReady ? "rgba(103,232,208,0.36)" : theme.gold }]}
        >
          <View style={[styles.avatar, { backgroundColor: theme.card, borderColor: isAccountReady ? theme.clear : theme.gold }]}>
            <PersonGlyph color={isAccountReady ? theme.clear : theme.gold} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.profileName, { color: theme.text }]}>{profileTitle}</Text>
            <Text style={[styles.profileEmail, { color: theme.subtle }]}>{profileBody}</Text>
          </View>
          <View style={[styles.profilePill, { backgroundColor: theme.cardStrong }]}>
            <Text style={[styles.profilePillText, { color: theme.text }]}>{profileAction}</Text>
          </View>
          <Chevron color={theme.subtle} />
        </Pressable>

        <StatusOverview items={summaryItems} theme={theme} />

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>앱 권한</Text>

        <View style={styles.menuList}>
          <MenuRow
            icon="shield"
            title="앱 권한 관리"
            meta={`위치 ${locationState.status} · 알림 ${alertState.status}`}
            status={permissionTone === "clear" ? "정상" : "확인"}
            tone={permissionTone}
            onPress={() => onNavigate("M4")}
            theme={theme}
          />
        </View>

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>알림</Text>

        <View style={styles.menuList}>
          <MenuRow
            icon="bell"
            title="스마트 알림 설정"
            meta={alertState.meta}
            status={alertState.status}
            tone={alertState.tone}
            onPress={() => onNavigate("M2")}
            theme={theme}
          />
        </View>

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>표시</Text>

        <View style={styles.menuList}>
          <MenuRow
            icon="gear"
            title="표시 설정"
            meta={globalSettingsSummary}
            status="관리"
            tone="sky"
            onPress={() => onNavigate("M3")}
            theme={theme}
          />
        </View>

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>정보</Text>

        <View style={styles.menuList}>
          <MenuRow
            icon="shield"
            title="정책 및 법적 고지"
            meta="개인정보 · 약관 · 오픈소스"
            status="보기"
            tone="sky"
            onPress={() => onNavigate("R1")}
            theme={theme}
          />
        </View>

        <Text style={[styles.appVersion, { color: theme.subtle }]}>WeatherON v0.1.0</Text>

        <View style={styles.bottomSpacer} />
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
    permissionGateResult.message.includes("나중에");
  if (!smartCareEnabled) {
    return {
      summary: "알림 일시 중지",
      meta: "스마트 알림 꺼짐 · 앱 안 판단 유지",
      status: "중지",
      tone: "gold",
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
    status: skippedPermission ? "대기" : "확인",
    tone: skippedPermission ? "sky" : "warm",
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

function MenuRow({
  icon,
  title,
  meta,
  status,
  tone,
  onPress,
  theme,
}: {
  icon: "pin" | "bell" | "gear" | "shield";
  title: string;
  meta: string;
  status: string;
  tone: MenuTone;
  onPress: () => void;
  theme: AppTheme;
}) {
  const color = getToneColor(theme, tone);
  return (
    <Pressable accessibilityLabel={title} accessibilityRole="button" onPress={onPress} style={[styles.menuRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
      <View style={[styles.menuIcon, { borderColor: `${color}66`, backgroundColor: "rgba(255,255,255,0.06)" }]}>
        <MenuIcon type={icon} color={color} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={[styles.menuTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.menuMeta, { color: theme.subtle }]} numberOfLines={1}>{meta}</Text>
      </View>
      <View style={[styles.statusPill, { backgroundColor: `${color}22` }]}>
        <Text style={[styles.statusTextSmall, { color }]}>{status}</Text>
      </View>
      <Chevron color={theme.subtle} />
    </Pressable>
  );
}

type SummaryItem = {
  label: string;
  value: string;
  tone: MenuTone;
};

function StatusOverview({ items, theme }: { items: SummaryItem[]; theme: AppTheme }) {
  return (
    <View style={[styles.statusOverview, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
      <View style={styles.statusHeader}>
        <Text style={[styles.statusHeaderTitle, { color: theme.text }]}>오늘 준비</Text>
        <Text style={[styles.statusHeaderMeta, { color: theme.subtle }]}>사용 전 확인</Text>
      </View>
      <View style={styles.statusGrid}>
        {items.map((item) => (
          <StatusTile key={item.label} item={item} theme={theme} />
        ))}
      </View>
    </View>
  );
}

function StatusTile({ item, theme }: { item: SummaryItem; theme: AppTheme }) {
  const color = getToneColor(theme, item.tone);
  return (
    <View style={[styles.statusTile, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusTileLabel, { color: theme.subtle }]}>{item.label}</Text>
      <Text style={[styles.statusTileValue, { color: theme.text }]} numberOfLines={1}>{item.value}</Text>
    </View>
  );
}

function MenuIcon({ type, color }: { type: "pin" | "bell" | "gear" | "shield"; color: string }) {
  if (type === "pin") return <PinGlyph color={color} />;
  if (type === "gear") return <GearGlyph color={color} />;
  if (type === "shield") return <ShieldGlyph color={color} />;
  return <BellGlyph color={color} />;
}

function PersonGlyph({ color }: { color: string }) {
  return (
    <View style={styles.personGlyph} accessibilityElementsHidden>
      <View style={[styles.personHead, { borderColor: color }]} />
      <View style={[styles.personBody, { borderColor: color }]} />
    </View>
  );
}

function BellGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.bellCup, { borderColor: color }]} />
      <View style={[styles.bellBase, { backgroundColor: color }]} />
    </View>
  );
}

function PinGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.pinHead, { borderColor: color }]} />
      <View style={[styles.pinPoint, { backgroundColor: color }]} />
    </View>
  );
}

function GearGlyph({ color }: { color: string }) {
  return (
    <View style={[styles.gearOuter, { borderColor: color }]} accessibilityElementsHidden>
      <View style={[styles.gearInner, { borderColor: color }]} />
    </View>
  );
}

function ShieldGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.shieldGlyph, { borderColor: color }]} />
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

function getToneColor(theme: AppTheme, tone: MenuTone) {
  if (tone === "gold") return theme.gold;
  if (tone === "sky") return theme.sky;
  if (tone === "warm") return theme.warm;
  return theme.clear;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    minHeight: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 116,
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
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  profileCard: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  profilePill: {
    minHeight: 28,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
  },
  profilePillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  groupLabel: {
    marginBottom: -6,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 2,
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
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  profileEmail: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  menuList: {
    gap: spacing.sm,
  },
  menuRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  menuIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  menuCopy: {
    flex: 1,
    gap: 3,
  },
  menuTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  menuMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  statusPill: {
    minHeight: 26,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: 8,
  },
  statusTextSmall: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  statusOverview: {
    gap: spacing.sm,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  statusHeaderTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  statusHeaderMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  statusTile: {
    width: "48%",
    minHeight: 58,
    gap: 3,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
  },
  statusTileLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  statusTileValue: {
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
  iconFrame: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  bellCup: {
    width: 13,
    height: 12,
    borderWidth: 1.6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0,
  },
  bellBase: {
    width: 12,
    height: 1.8,
    borderRadius: 2,
    marginTop: 1,
  },
  pinHead: {
    width: 12,
    height: 12,
    borderWidth: 1.6,
    borderRadius: radius.pill,
  },
  pinPoint: {
    width: 2,
    height: 6,
    borderRadius: 2,
    marginTop: -1,
  },
  gearOuter: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.8,
    borderRadius: 999,
  },
  gearInner: {
    width: 7,
    height: 7,
    borderWidth: 1.4,
    borderRadius: 999,
  },
  shieldGlyph: {
    width: 14,
    height: 16,
    borderWidth: 1.6,
    borderRadius: 5,
    transform: [{ rotate: "45deg" }],
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
  bottomSpacer: {
    height: 18,
  },
});
