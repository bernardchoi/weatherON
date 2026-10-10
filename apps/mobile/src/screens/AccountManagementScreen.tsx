import React, { useState } from "react";
import { Platform, ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from "../localization/react-native";
import { uiIconAssets } from "../assets";
import { ambientUiIcons } from "../ambientAssets";
import { AppScreen } from "../components/AppScreen";
import { FeedbackPressable } from "../components/FeedbackPressable";
import type { P0ScreenProps } from "../navigation/types";
import type { AccountProvider } from "../providers/accountAuth";
import { useAppTheme } from "../theme/AppThemeContext";
import { pageStyles } from "../theme/pageStyles";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { radius, spacing } from "../theme/tokens";

const screenIcons = Platform.OS === "ios" ? { ...uiIconAssets, uv: ambientUiIcons.temperature, clearNight: ambientUiIcons.temperature, pin: ambientUiIcons.location, shirt: ambientUiIcons.tabOutfit, depart: ambientUiIcons.tabDepart, rain: ambientUiIcons.umbrella, umbrella: ambientUiIcons.umbrella, myAlerts: ambientUiIcons.notifications, myDisplay: ambientUiIcons.settings, settings: ambientUiIcons.settings, tabMy: ambientUiIcons.tabMy, check: ambientUiIcons.check } : uiIconAssets;

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
  const [dangerConfirm, setDangerConfirm] = useState<"logout" | "delete" | null>(null);
  const accountReady = accountLinked && termsRequiredAccepted;
  const needsTerms = accountLinked && !termsRequiredAccepted;
  const provider = accountProfile?.provider ?? "apple";
  const profileTitle = accountReady ? getProviderConnectedTitle(provider) : needsTerms ? "약관 동의가 필요해요" : "게스트 모드";
  const profileMeta = accountReady ? "이 기기의 계정 연결과 저장 상태를 관리해요" : needsTerms ? "필수 약관 확인 후 계정 연결을 완료해요" : "계정을 연결하면 저장 기능을 사용할 수 있어요";
  const statusLabel = accountAuthStatus === "offline" ? "오프라인" : accountReady ? "연결 완료" : needsTerms ? "확인 필요" : "게스트";
  const primaryLabel = needsTerms ? "약관 동의" : "계정 연결";
  const primaryAccessibilityLabel = needsTerms ? "필수 약관 동의 이어가기" : "계정 연결";
  const primaryTone = accountReady ? theme.clear : needsTerms ? theme.gold : theme.sky;
  const showPrimaryAction = accountLinked && !accountReady;
  const isProcessing = accountAuthStatus === "signing-out" || accountAuthStatus === "signing-in";

  const requestConnect = () => onRequireAccount("account-connect", "A4");
  const handlePrimaryAccountAction = () => {
    requestConnect();
  };

  const confirmDangerAction = async () => {
    if (!dangerConfirm || isProcessing) return;
    if (dangerConfirm === "logout") await onSignOutAccount();
    else await onDeleteAccount();
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
          style={[[
            styles.profileCard,
            pageStyles.card,
            {
              minHeight: layout.accountProfileMinHeight,
              paddingHorizontal: layout.accountPanelPadding,
              paddingVertical: layout.isShort ? 10 : 12,
              backgroundColor: theme.card,
              borderColor: accountReady ? theme.clear : needsTerms ? theme.gold : theme.border,
            },
          ], Platform.OS === "ios" && ambientVisual.profileCard]}
        >
          <View style={[[styles.profileVisual, { backgroundColor: theme.cardStrong }], Platform.OS === "ios" && ambientVisual.profileVisual]}>
            <Image source={screenIcons.tabMy} style={[[styles.accountIcon, { tintColor: theme.sky }], Platform.OS === "ios" && ambientVisual.accountIcon]} resizeMode="contain" accessibilityElementsHidden importantForAccessibility="no" />
            <View style={[styles.statusDot, { backgroundColor: primaryTone }]} />
          </View>
          <View style={[styles.profileCopy, Platform.OS === "ios" && ambientVisual.profileCopy]}>
            <View style={[styles.profileTitleRow, Platform.OS === "ios" && ambientVisual.profileTitleRow]}>
              <Text style={[[styles.profileTitle, pageStyles.sectionTitle, { color: theme.text }], Platform.OS === "ios" && ambientVisual.profileTitle]} numberOfLines={1}>{profileTitle}</Text>
              <View style={[[styles.statusPill, { borderColor: primaryTone, backgroundColor: `${primaryTone}18` }], Platform.OS === "ios" && ambientVisual.statusPill]}>
                <Text style={[[styles.statusPillText, { color: primaryTone }], Platform.OS === "ios" && ambientVisual.statusPillText]}>{statusLabel}</Text>
              </View>
            </View>
            <Text style={[[styles.profileMeta, pageStyles.caption, { color: theme.subtle }], Platform.OS === "ios" && ambientVisual.profileMeta]} numberOfLines={2}>{profileMeta}</Text>
            {accountAuthMessage ? <Text accessibilityLiveRegion="polite" selectable style={[[styles.profileMeta, pageStyles.caption, { color: accountAuthStatus === "error" ? theme.alert : theme.subtle }], Platform.OS === "ios" && ambientVisual.profileMeta]} numberOfLines={2}>{accountAuthMessage}</Text> : null}
          </View>
        </View>

        {showPrimaryAction ? (
          <Pressable
            accessibilityLabel={primaryAccessibilityLabel}
            accessibilityRole="button"
            onPress={handlePrimaryAccountAction}
            style={({ pressed }) => [[styles.primaryRow, pageStyles.card, { backgroundColor: theme.cardStrong, borderColor: theme.border, opacity: pressed ? 0.72 : 1 }], Platform.OS === "ios" && ambientVisual.primaryRow]}
          >
            <View style={[[styles.actionIcon, { backgroundColor: `${primaryTone}18` }], Platform.OS === "ios" && ambientVisual.actionIcon]}>
              <Image source={screenIcons.policyTerms} style={[styles.actionIconImage, { tintColor: primaryTone }]} resizeMode="contain" />
            </View>
            <Text style={[[styles.primaryText, pageStyles.sectionTitle, { color: theme.text }], Platform.OS === "ios" && ambientVisual.primaryText]}>{primaryLabel}</Text>
            <ChevronRight color={theme.subtle} />
          </Pressable>
        ) : null}

        {accountLinked ? (
          <Pressable
            accessibilityLabel="정책 및 법적 고지 보기"
            accessibilityRole="button"
            onPress={() => onNavigate("R1")}
            style={({ pressed }) => [[styles.policyRow, { opacity: pressed ? 0.72 : 1 }], Platform.OS === "ios" && ambientVisual.policyRow]}
          >
            <Image source={screenIcons.myPolicy} style={[[styles.policyIcon, { tintColor: theme.sky }], Platform.OS === "ios" && ambientVisual.policyIcon]} resizeMode="contain" />
            <Text style={[[styles.policyText, { color: theme.muted }], Platform.OS === "ios" && ambientVisual.policyText]}>정책 및 법적 고지</Text>
            <ChevronRight color={theme.subtle} />
          </Pressable>
        ) : null}

        {accountLinked ? (
          <View style={styles.accountActions}>
            <FeedbackPressable
              accessibilityLabel="로그아웃"
              accessibilityRole="button"
              disabled={isProcessing}
              onPress={() => setDangerConfirm("logout")}
              style={[styles.logoutButton, { backgroundColor: theme.cardMuted, borderColor: theme.border, opacity: isProcessing ? 0.55 : 1 }]}
            >
              <Text style={[[styles.smallButtonText, { color: theme.text }], Platform.OS === "ios" && ambientVisual.smallButtonText]}>로그아웃</Text>
            </FeedbackPressable>
            <Pressable
              accessibilityLabel="회원 탈퇴"
              accessibilityRole="button"
              disabled={isProcessing}
              onPress={() => setDangerConfirm("delete")}
              style={({ pressed }) => [styles.deleteButton, { opacity: isProcessing ? 0.55 : pressed ? 0.72 : 1 }]}
            >
              <Text style={[[styles.deleteButtonText, { color: theme.alert }], Platform.OS === "ios" && ambientVisual.deleteButtonText]}>회원 탈퇴</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />

        <Modal visible={dangerConfirm !== null} transparent animationType="fade" onRequestClose={() => { if (!isProcessing) setDangerConfirm(null); }}>
          <View style={styles.modalBackdrop}>
            <View accessibilityViewIsModal style={[styles.confirmDialog, pageStyles.card, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
              <Text style={[[styles.confirmTitle, { color: theme.text }], Platform.OS === "ios" && ambientVisual.confirmTitle]}>{dangerConfirm === "delete" ? "회원 탈퇴" : "로그아웃"}</Text>
              <Text selectable style={[[styles.confirmBody, { color: theme.muted }], Platform.OS === "ios" && ambientVisual.confirmBody]}>
                {dangerConfirm === "delete"
                  ? "서버 계정 데이터와 이 기기의 저장 목적지·코디 상태·옷장 사진이 삭제돼요. 되돌릴 수 없어요."
                  : "이 기기의 저장 목적지·코디 상태·옷장 사진이 삭제되고 계정 연결이 해제돼요. 서버 계정은 유지돼요."}
              </Text>
              {accountAuthMessage ? (
                <Text accessibilityLiveRegion="polite" selectable style={[[styles.confirmError, { color: theme.alert }], Platform.OS === "ios" && ambientVisual.confirmError]}>{accountAuthMessage}</Text>
              ) : null}
              <View style={styles.confirmActions}>
                <Pressable accessibilityRole="button" disabled={isProcessing} onPress={() => setDangerConfirm(null)} style={[styles.dialogButton, { borderColor: theme.border, opacity: isProcessing ? 0.5 : 1 }]}>
                  <Text style={[[styles.dialogButtonText, { color: theme.text }], Platform.OS === "ios" && ambientVisual.dialogButtonText]}>취소</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityState={{ busy: isProcessing, disabled: isProcessing }} disabled={isProcessing} onPress={() => void confirmDangerAction()} style={[styles.dialogButton, { backgroundColor: theme.alert, borderColor: theme.alert }]}>
                  {isProcessing ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.confirmButtonText}>{dangerConfirm === "delete" ? "탈퇴하기" : "로그아웃"}</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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

function ChevronRight({ color }: { color: string }) {
  return (
    <View style={[styles.chevronRight, Platform.OS === "ios" && ambientVisual.chevronRight]} accessibilityElementsHidden>
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
    width: 54,
    height: 54,
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
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  actionIconImage: { width: 20, height: 20 },
  accountIcon: { width: 26, height: 26 },
  primaryText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  policyRow: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.sm },
  policyIcon: { width: 20, height: 20 },
  policyText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: "800" },
  accountActions: { alignItems: "center", gap: spacing.sm },
  logoutButton: {
    width: "100%",
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
  deleteButton: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md },
  deleteButtonText: { fontSize: 13, lineHeight: 18, fontWeight: "900" },
  bottomSpacer: {
    height: 10,
  },
  modalBackdrop: { flex: 1, justifyContent: "center", padding: spacing.xl, backgroundColor: "rgba(0,0,0,0.56)" },
  confirmDialog: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  confirmTitle: { fontSize: 20, lineHeight: 26, fontWeight: "900" },
  confirmBody: { fontSize: 14, lineHeight: 22, fontWeight: "600" },
  confirmError: { fontSize: 13, lineHeight: 19, fontWeight: "800" },
  confirmActions: { flexDirection: "row", gap: spacing.sm },
  dialogButton: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: 1 },
  dialogButtonText: { fontSize: 14, lineHeight: 19, fontWeight: "900" },
  confirmButtonText: { color: "#FFFFFF", fontSize: 14, lineHeight: 19, fontWeight: "900" },
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

// Approved iOS Ambient hierarchy; Android retains its existing presentation.
const ambientVisual = StyleSheet.create({
  "profileCard": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "borderRadius": 0,
    "shadowOpacity": 0,
    "elevation": 0,
    "paddingHorizontal": 0,
    "paddingVertical": 18,
    "gap": 16
  },
  "profileVisual": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "shadowOpacity": 0,
    "width": 64,
    "height": 64
  },
  "accountIcon": {
    "width": 44,
    "height": 44
  },
  "profileTitleRow": {
    "flexWrap": "wrap",
    "gap": 10
  },
  "profileTitle": {
    "fontSize": 21,
    "lineHeight": 28,
    "fontWeight": "700"
  },
  "profileMeta": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "profileCopy": {
    "gap": 10
  },
  "statusPill": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "shadowOpacity": 0
  },
  "statusPillText": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  },
  "policyRow": {
    "paddingVertical": 22,
    "minHeight": 64,
    "gap": 16
  },
  "policyIcon": {
    "width": 30,
    "height": 30
  },
  "policyText": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "primaryRow": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "borderRadius": 0,
    "shadowOpacity": 0,
    "elevation": 0,
    "paddingHorizontal": 0,
    "paddingVertical": 18,
    "gap": 16
  },
  "primaryText": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "actionIcon": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "shadowOpacity": 0
  },
  "smallButtonText": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "deleteButtonText": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "chevronRight": {
    "display": "none"
  },
  "confirmTitle": {
    "fontSize": 21,
    "lineHeight": 28,
    "fontWeight": "700"
  },
  "confirmBody": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "confirmError": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  },
  "dialogButtonText": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  }
});
