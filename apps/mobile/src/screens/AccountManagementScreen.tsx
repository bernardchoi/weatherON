import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { cardShadow, radius, spacing } from "../theme/tokens";

export function AccountManagementScreen({
  accountLinked,
  termsRequiredAccepted,
  onNavigate,
  onRequireAccount,
  onSignOutAccount,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [dangerConfirm, setDangerConfirm] = useState<"none" | "unlink">("none");
  const accountReady = accountLinked && termsRequiredAccepted;
  const needsTerms = accountLinked && !termsRequiredAccepted;
  const profileTitle = accountReady ? "연결된 계정" : needsTerms ? "약관 동의 필요" : "게스트 모드";
  const profileMeta = accountReady ? "WeatherON ID" : needsTerms ? "필수 약관 대기" : "연결 전";
  const statusLabel = accountReady ? "연결됨" : needsTerms ? "확인" : "게스트";
  const primaryLabel = accountReady ? "정책 보기" : needsTerms ? "약관 동의" : "계정 연결";
  const primaryAccessibilityLabel = accountReady ? "정책 및 법적 고지 보기" : needsTerms ? "필수 약관 동의 이어가기" : "계정 연결";
  const primaryTone = accountReady ? theme.clear : needsTerms ? theme.gold : theme.sky;

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

        <View style={[styles.profileCard, { minHeight: layout.accountHeroMinHeight, padding: layout.accountPanelPadding, backgroundColor: theme.card, borderColor: accountReady ? theme.clear : needsTerms ? theme.gold : theme.border }, cardShadow(theme)]}>
          <View style={[styles.profileVisual, { backgroundColor: theme.cardStrong }]}>
            <View style={[styles.avatar, layout.isShort || layout.isNarrow ? styles.avatarShort : null, { borderColor: primaryTone }]}>
              <PersonGlyph color={primaryTone} />
            </View>
            <View style={[styles.statusDot, { backgroundColor: primaryTone }]} />
          </View>
          <View style={styles.profileCopy}>
            <View style={[styles.statusPill, { borderColor: primaryTone, backgroundColor: `${primaryTone}18` }]}>
              <Text style={[styles.statusPillText, { color: primaryTone }]}>{statusLabel}</Text>
            </View>
            <Text style={[styles.profileTitle, { color: theme.text }]} numberOfLines={1}>{profileTitle}</Text>
            <Text style={[styles.profileMeta, { color: theme.subtle }]} numberOfLines={1}>{profileMeta}</Text>
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

        {accountLinked ? (
          <View style={[styles.dangerPanel, { padding: layout.accountPanelPadding, backgroundColor: theme.cardStrong, borderColor: dangerConfirm === "unlink" ? theme.alert : theme.border }, cardShadow(theme)]}>
            <Text style={[styles.dangerTitle, { color: dangerConfirm === "none" ? theme.text : theme.warm }]}>
              {dangerConfirm === "none" ? "계정 연결 해제" : "연결 해제 확인"}
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
  profileVisual: {
    width: 74,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
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
  statusDot: {
    position: "absolute",
    right: 9,
    bottom: 9,
    width: 14,
    height: 14,
    borderRadius: radius.pill,
  },
  profileCopy: {
    flex: 1,
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  statusPill: {
    minHeight: 28,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  statusPillText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  profileTitle: {
    fontSize: 20,
    lineHeight: 25,
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
