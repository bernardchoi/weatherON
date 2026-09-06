import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "../components/AppScreen";
import { ProviderBrandIcon } from "../components/provider-brand-icon";
import type { P0ScreenProps } from "../navigation/types";
import type { AccountProvider } from "../providers/accountAuth";
import { useAppTheme } from "../theme/AppThemeContext";
import { pageStyles } from "../theme/pageStyles";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { radius, spacing } from "../theme/tokens";

export function AccountManagementScreen({
  accountLinked,
  accountProfile,
  accountAuthStatus,
  accountAuthMessage,
  termsRequiredAccepted,
  onNavigate,
  onRequireAccount,
  onSignOutAccount,
  onDeleteAccount,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [dangerConfirm, setDangerConfirm] = useState<"none" | "logout" | "delete">("none");
  const accountReady = accountLinked && termsRequiredAccepted;
  const needsTerms = accountLinked && !termsRequiredAccepted;
  const provider = accountProfile?.provider ?? "apple";
  const profileTitle = accountReady ? getProviderConnectedTitle(provider) : needsTerms ? "약관 동의가 필요해요" : "게스트 모드";
  const profileMeta = accountReady ? "저장한 목적지와 코디를 다음에도 편리하게 이어보세요" : needsTerms ? "필수 약관 확인 후 저장·동기화를 시작할 수 있어요" : "계정을 연결하면 저장한 정보를 계속 사용할 수 있어요";
  const statusLabel = accountAuthStatus === "offline" ? "오프라인" : accountReady ? "연결 완료" : needsTerms ? "확인 필요" : "게스트";
  const primaryLabel = accountReady ? "정책 보기" : needsTerms ? "약관 동의" : "계정 연결";
  const primaryAccessibilityLabel = accountReady ? "정책 및 법적 고지 보기" : needsTerms ? "필수 약관 동의 이어가기" : "계정 연결";
  const primaryTone = accountReady ? theme.clear : needsTerms ? theme.gold : theme.sky;
  const showPrimaryAction = accountLinked;

  const requestConnect = () => onRequireAccount("account-connect", "A4");
  const handlePrimaryAccountAction = () => {
    if (accountReady) {
      onNavigate("R1");
      return;
    }
    requestConnect();
  };

  return (
    <AppScreen
      title="계정 관리"
      subtitle="연결 상태와 계정 데이터를 관리해요"
      onBack={() => onNavigate("M1")}
      compactHeader
      contentGap={layout.accountContentGap}
      contentPaddingTop={layout.weatherTopPadding}
    >
        <View
          style={[
            styles.profileCard,
            pageStyles.card,
            {
              minHeight: layout.accountProfileMinHeight,
              paddingHorizontal: layout.accountPanelPadding,
              paddingVertical: layout.isShort ? 10 : 12,
              backgroundColor: theme.card,
              borderColor: accountReady ? theme.clear : needsTerms ? theme.gold : theme.border,
            },
          ]}
        >
          <View style={[styles.profileVisual, { backgroundColor: provider === "apple" ? "#FFFFFF" : theme.cardStrong }]}>
            <ProviderBrandIcon provider={provider} size={28} />
            <View style={[styles.statusDot, { backgroundColor: primaryTone }]} />
          </View>
          <View style={styles.profileCopy}>
            <View style={styles.profileTitleRow}>
              <Text style={[styles.profileTitle, pageStyles.sectionTitle, { color: theme.text }]} numberOfLines={1}>{profileTitle}</Text>
              <View style={[styles.statusPill, { borderColor: primaryTone, backgroundColor: `${primaryTone}18` }]}>
                <Text style={[styles.statusPillText, { color: primaryTone }]}>{statusLabel}</Text>
              </View>
            </View>
            <Text style={[styles.profileMeta, pageStyles.caption, { color: theme.subtle }]} numberOfLines={2}>{profileMeta}</Text>
            {accountAuthMessage ? <Text accessibilityLiveRegion="polite" selectable style={[styles.profileMeta, pageStyles.caption, { color: accountAuthStatus === "error" ? theme.alert : theme.subtle }]} numberOfLines={2}>{accountAuthMessage}</Text> : null}
          </View>
        </View>

        {showPrimaryAction ? (
          <Pressable
            accessibilityLabel={primaryAccessibilityLabel}
            accessibilityRole="button"
            onPress={handlePrimaryAccountAction}
            style={({ pressed }) => [styles.primaryRow, pageStyles.card, { backgroundColor: theme.cardStrong, borderColor: theme.border, opacity: pressed ? 0.72 : 1 }]}
          >
            <View style={styles.actionIcon}>
              <DoorGlyph color={primaryTone} />
            </View>
            <Text style={[styles.primaryText, pageStyles.sectionTitle, { color: theme.text }]}>{primaryLabel}</Text>
            <ChevronRight color={theme.subtle} />
          </Pressable>
        ) : null}

        {accountLinked ? (
          <View style={styles.accountActions}>
            <View style={styles.dangerActions}>
              <Pressable
                accessibilityLabel={dangerConfirm === "logout" ? "로그아웃 확정" : "로그아웃"}
                accessibilityRole="button"
                onPress={() => {
                  if (dangerConfirm === "logout") onSignOutAccount();
                  else setDangerConfirm("logout");
                }}
                style={({ pressed }) => [styles.smallButton, { backgroundColor: dangerConfirm === "logout" ? `${theme.alert}22` : theme.cardMuted, borderColor: dangerConfirm === "logout" ? theme.alert : theme.border, opacity: pressed ? 0.72 : 1 }]}
              >
                <Text style={[styles.smallButtonText, { color: dangerConfirm === "logout" ? theme.alert : theme.text }]}>
                  {dangerConfirm === "logout" ? "로그아웃 확정" : "로그아웃"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={dangerConfirm === "delete" ? "회원 탈퇴 확정" : "회원 탈퇴"}
                accessibilityRole="button"
                onPress={() => {
                  if (dangerConfirm === "delete") void onDeleteAccount();
                  else setDangerConfirm("delete");
                }}
                style={({ pressed }) => [styles.smallButton, { backgroundColor: dangerConfirm === "delete" ? `${theme.alert}22` : "transparent", borderColor: dangerConfirm === "delete" ? theme.alert : theme.border, opacity: pressed ? 0.72 : 1 }]}
              >
                <Text style={[styles.smallButtonText, { color: dangerConfirm === "delete" ? theme.alert : theme.text }]}>{dangerConfirm === "delete" ? "탈퇴 확정" : "회원 탈퇴"}</Text>
              </Pressable>
            </View>
            {dangerConfirm !== "none" ? (
              <Pressable accessibilityLabel="계정 작업 취소" accessibilityRole="button" onPress={() => setDangerConfirm("none")} style={styles.cancelButton}>
                <Text style={[styles.cancelButtonText, { color: theme.subtle }]}>취소</Text>
              </Pressable>
            ) : null}
            {dangerConfirm === "delete" ? <Text style={[styles.confirmHint, { color: theme.alert }]}>탈퇴하면 서버에 저장된 계정 데이터가 삭제됨</Text> : null}
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
    </AppScreen>
  );
}

function getProviderLabel(provider?: AccountProvider) {
  if (provider === "kakao") return "카카오";
  if (provider === "naver") return "네이버";
  if (provider === "line") return "LINE";
  if (provider === "google") return "Google";
  return "Apple";
}

function getProviderConnectedTitle(provider: AccountProvider) {
  if (provider === "line") return "LINE으로 연결됐어요";
  return `${getProviderLabel(provider)}로 연결됐어요`;
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  profileVisual: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  statusDot: {
    position: "absolute",
    right: 5,
    bottom: 5,
    width: 9,
    height: 9,
    borderRadius: radius.pill,
  },
  profileCopy: {
    flex: 1,
    alignItems: "flex-start",
    gap: 3,
  },
  profileTitleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusPill: {
    minHeight: 22,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  statusPillText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
  },
  profileTitle: {
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
  },
  profileMeta: {
    fontSize: 11,
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
  accountActions: { alignItems: "center", gap: spacing.xs },
  dangerActions: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.sm,
  },
  smallButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  smallButtonText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  cancelButton: { minHeight: 36, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md },
  cancelButtonText: { fontSize: 12, lineHeight: 16, fontWeight: "800" },
  confirmHint: { textAlign: "center", fontSize: 11, lineHeight: 15, fontWeight: "700" },
  bottomSpacer: {
    height: 10,
  },
  iconFrame: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
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
