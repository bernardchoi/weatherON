import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, spacing, type AppTheme } from "../theme/tokens";

export function AccountManagementScreen({
  accountLinked,
  termsRequiredAccepted,
  savedDestinations,
  wardrobeItems,
  permissionReady,
  onNavigate,
  onRequireAccount,
  onSignOutAccount,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [dangerConfirm, setDangerConfirm] = useState<"none" | "unlink">("none");
  const accountReady = accountLinked && termsRequiredAccepted;
  const needsTerms = accountLinked && !termsRequiredAccepted;
  const ownedItemCount = wardrobeItems.filter((item) => item.owned).length;
  const profileTitle = accountReady ? "연결된 계정" : needsTerms ? "약관 동의 필요" : "게스트 모드";
  const profileMeta = accountReady ? "저장·동기화 사용 가능" : needsTerms ? "필수 약관 확인 후 동기화 가능" : "연결하면 저장·동기화를 사용할 수 있음";
  const primaryLabel = accountReady ? "정책 및 약관 보기" : needsTerms ? "약관 동의 이어가기" : "계정 연결";
  const primaryAccessibilityLabel = accountReady ? "정책 및 법적 고지 보기" : needsTerms ? "필수 약관 동의 이어가기" : "계정 연결";
  const primaryTone = accountReady ? theme.clear : needsTerms ? theme.gold : theme.sky;
  const providerLabel = accountLinked ? "WeatherON ID" : "게스트";
  const termsLabel = termsRequiredAccepted ? "완료" : accountLinked ? "필요" : "연결 후";
  const permissionLabel = permissionReady ? "허용됨" : "설정 가능";

  const requestConnect = () => onRequireAccount("account-connect", "A4");
  const handlePrimaryAccountAction = () => {
    if (accountReady) {
      onNavigate("R1");
      return;
    }
    requestConnect();
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
            gap: layout.accountContentGap,
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingTop: layout.weatherTopPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={[styles.header, { minHeight: layout.accountHeaderMinHeight }]}>
          <BackButton onPress={() => onNavigate("M1")} />
          <Text style={[styles.title, { color: theme.text, fontSize: layout.screenTitleFontSize, lineHeight: layout.screenTitleLineHeight }]}>계정 관리</Text>
        </View>

        <View style={[styles.profileCard, { minHeight: layout.accountProfileMinHeight, padding: layout.accountPanelPadding, backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
          <View style={[styles.avatar, layout.isShort || layout.isNarrow ? styles.avatarShort : null, { borderColor: accountReady ? theme.clear : theme.gold }]}>
            <PersonGlyph color={accountReady ? theme.clear : theme.gold} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.profileTitle, { color: theme.text }]} numberOfLines={1}>{profileTitle}</Text>
            <Text style={[styles.profileMeta, { color: theme.subtle }]} numberOfLines={2}>{profileMeta}</Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel={primaryAccessibilityLabel}
          accessibilityRole="button"
          onPress={handlePrimaryAccountAction}
          style={[styles.primaryRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}
        >
          <View style={styles.actionIcon}>
            <DoorGlyph color={primaryTone} />
          </View>
          <Text style={[styles.primaryText, { color: theme.text }]}>{primaryLabel}</Text>
          <ChevronRight color={theme.subtle} />
        </Pressable>

        <View style={styles.summaryGrid}>
          <StatusTile label="연결 방식" value={providerLabel} tone={accountLinked ? theme.clear : theme.sky} theme={theme} />
          <StatusTile label="필수 약관" value={termsLabel} tone={termsRequiredAccepted ? theme.clear : theme.gold} theme={theme} />
          <StatusTile label="저장 위치" value={`${savedDestinations.length}곳`} tone={savedDestinations.length > 0 ? theme.clear : theme.subtle} theme={theme} />
          <StatusTile label="내 옷장" value={`${ownedItemCount}개`} tone={ownedItemCount > 0 ? theme.clear : theme.subtle} theme={theme} />
        </View>

        <View style={[styles.infoPanel, { padding: layout.accountPanelPadding, backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
          <Text style={[styles.panelTitle, { color: theme.text }]}>계정으로 유지되는 항목</Text>
          <View style={styles.infoRows}>
            <InfoRow label="저장·동기화" value={accountReady ? "사용 가능" : needsTerms ? "약관 필요" : "계정 필요"} color={accountReady ? theme.clear : theme.gold} theme={theme} />
            <InfoRow label="목적지 케어" value={`${savedDestinations.length}곳 저장`} color={savedDestinations.length > 0 ? theme.clear : theme.subtle} theme={theme} />
            <InfoRow label="코디 추천" value={`내 옷장 ${ownedItemCount}개 반영`} color={ownedItemCount > 0 ? theme.clear : theme.subtle} theme={theme} />
            <InfoRow label="알림 권한" value={permissionLabel} color={permissionReady ? theme.clear : theme.sky} theme={theme} />
          </View>
        </View>

        {accountLinked ? (
          <View style={[styles.dangerPanel, { padding: layout.accountPanelPadding, backgroundColor: theme.cardStrong, borderColor: dangerConfirm === "unlink" ? theme.alert : theme.border }, cardShadow(theme)]}>
            <Text style={[styles.dangerTitle, { color: dangerConfirm === "none" ? theme.text : theme.warm }]}>
              {dangerConfirm === "none" ? "계정 연결 해제" : "연결 해제 확인"}
            </Text>
            <Text style={[styles.dangerBody, { color: theme.subtle }]}>
              {dangerConfirm === "none"
                ? "필요할 때만 확인 후 실행"
                : "확정 시 계정 기반 저장 데이터가 비회원 상태로 초기화됨"}
            </Text>
            <View style={styles.dangerActions}>
              <Pressable
                accessibilityLabel={dangerConfirm === "unlink" ? "계정 연결 해제 확정" : "계정 연결 해제"}
                accessibilityRole="button"
                onPress={() => {
                  if (dangerConfirm === "unlink") onSignOutAccount();
                  else setDangerConfirm("unlink");
                }}
                style={[styles.smallButton, { backgroundColor: dangerConfirm === "unlink" ? `${theme.alert}22` : theme.cardMuted, borderColor: theme.border }]}
              >
                <Text style={[styles.smallButtonText, { color: dangerConfirm === "unlink" ? theme.alert : theme.text }]}>
                  {dangerConfirm === "unlink" ? "해제 확정" : "연결 해제"}
                </Text>
              </Pressable>
              {dangerConfirm !== "none" ? (
                <Pressable accessibilityLabel="계정 작업 취소" accessibilityRole="button" onPress={() => setDangerConfirm("none")} style={[styles.smallButton, { backgroundColor: "transparent", borderColor: theme.border }]}>
                  <Text style={[styles.smallButtonText, { color: theme.subtle }]}>취소</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function StatusTile({ label, value, tone, theme }: { label: string; value: string; tone: string; theme: AppTheme }) {
  return (
    <View style={[styles.statusTile, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
      <Text style={[styles.statusLabel, { color: theme.subtle }]} numberOfLines={1}>{label}</Text>
      <Text style={[styles.statusValue, { color: tone }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value, color, theme }: { label: string; value: string; color: string; theme: AppTheme }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.subtle }]}>{label}</Text>
      <Text style={[styles.infoValue, { color }]}>{value}</Text>
    </View>
  );
}

function PersonGlyph({ color }: { color: string }) {
  return (
    <View style={styles.personGlyph} accessibilityElementsHidden>
      <View style={[styles.personHead, { borderColor: color }]} />
      <View style={[styles.personBody, { borderColor: color }]} />
    </View>
  );
}

function DoorGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.doorBox, { borderColor: color }]} />
      <View style={[styles.doorArrow, { backgroundColor: color }]} />
      <View style={[styles.doorArrowHeadA, { backgroundColor: color }]} />
      <View style={[styles.doorArrowHeadB, { backgroundColor: color }]} />
    </View>
  );
}

function ChevronRight({ color }: { color: string }) {
  return (
    <View style={styles.chevronRight} accessibilityElementsHidden>
      <View style={[styles.chevronRightTop, { backgroundColor: color }]} />
      <View style={[styles.chevronRightBottom, { backgroundColor: color }]} />
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
    left: 0,
    right: 0,
    top: 280,
    height: 500,
    opacity: 0.34,
    borderRadius: 78,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 2,
  },
  avatarShort: {
    width: 44,
    height: 44,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  profileTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  profileMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  primaryRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  actionIcon: {
    width: 24,
    alignItems: "center",
  },
  primaryText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statusTile: {
    minWidth: "47%",
    flex: 1,
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  statusValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  infoPanel: {
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  panelTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  infoRows: {
    gap: spacing.sm,
  },
  infoRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  infoLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  infoValue: {
    flexShrink: 1,
    textAlign: "right",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  dangerPanel: {
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  dangerTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  dangerBody: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  dangerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  smallButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  smallButtonText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  bottomSpacer: {
    height: 10,
  },
  iconFrame: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
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
    borderRadius: radius.pill,
  },
  personBody: {
    position: "absolute",
    bottom: 1,
    width: 20,
    height: 12,
    borderWidth: 1.7,
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
    borderBottomWidth: 0,
  },
  doorBox: {
    position: "absolute",
    left: 1,
    width: 11,
    height: 14,
    borderWidth: 1.6,
    borderRightWidth: 0,
    borderRadius: 2,
  },
  doorArrow: {
    position: "absolute",
    right: 1,
    width: 12,
    height: 2,
    borderRadius: 2,
  },
  doorArrowHeadA: {
    position: "absolute",
    right: 1,
    width: 6,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }, { translateY: -2 }],
  },
  doorArrowHeadB: {
    position: "absolute",
    right: 1,
    width: 6,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }, { translateY: 2 }],
  },
  chevronRight: {
    width: 16,
    height: 16,
    justifyContent: "center",
  },
  chevronRightTop: {
    position: "absolute",
    right: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }, { translateY: -3 }],
  },
  chevronRightBottom: {
    position: "absolute",
    right: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }, { translateY: 3 }],
  },
});
