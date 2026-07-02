import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

export function AccountManagementScreen({
  accountLinked,
  termsRequiredAccepted,
  onNavigate,
  onRequireAccount,
  onSignOutAccount,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const [dangerConfirm, setDangerConfirm] = useState<"none" | "signout" | "delete">("none");
  const accountReady = accountLinked && termsRequiredAccepted;
  const needsTerms = accountLinked && !termsRequiredAccepted;
  const profileTitle = accountReady ? "데모 계정" : needsTerms ? "약관 동의" : "계정 연결";
  const profileMeta = accountReady ? "실제 제공자 인증 전 저장 상태 데모" : needsTerms ? "필수 약관 확인 후 계속" : "저장·동기화를 시작하려면 연결";
  const primaryLabel = accountReady ? "로그아웃" : needsTerms ? "약관 동의 완료" : "계정 연결";
  const primaryAccessibilityLabel = accountReady ? "로그아웃 확인" : needsTerms ? "필수 약관 동의 이어가기" : "계정 연결";
  const primaryTone = accountReady ? theme.warm : needsTerms ? theme.gold : theme.sky;

  const requestConnect = () => onRequireAccount("notification", "A4");
  const handlePrimaryAccountAction = () => {
    if (accountReady) {
      setDangerConfirm("signout");
      return;
    }
    requestConnect();
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={() => onNavigate("M1")} style={[styles.backButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <ChevronLeft color={theme.muted} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>계정 관리</Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatar, { borderColor: accountReady ? theme.clear : theme.gold }]}>
            <PersonGlyph color={accountReady ? theme.clear : theme.gold} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.profileTitle, { color: theme.text }]}>{profileTitle}</Text>
            <Text style={[styles.profileMeta, { color: theme.subtle }]}>{profileMeta}</Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel={primaryAccessibilityLabel}
          accessibilityRole="button"
          onPress={handlePrimaryAccountAction}
          style={[styles.primaryRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
        >
          <View style={styles.actionIcon}>
            <DoorGlyph color={primaryTone} />
          </View>
          <Text style={[styles.primaryText, { color: theme.text }]}>{primaryLabel}</Text>
          <ChevronRight color={theme.subtle} />
        </Pressable>

        {accountLinked ? (
          <View style={[styles.dangerPanel, { backgroundColor: theme.cardStrong, borderColor: dangerConfirm === "delete" ? theme.alert : theme.border }]}>
            <Text style={[styles.dangerTitle, { color: dangerConfirm === "none" ? theme.text : theme.warm }]}>
              {dangerConfirm === "none" ? "로그아웃 및 탈퇴" : dangerConfirm === "signout" ? "로그아웃 확인" : "회원 탈퇴 확인"}
            </Text>
            <Text style={[styles.dangerBody, { color: theme.subtle }]}>
              {dangerConfirm === "none"
                ? "필요할 때만 확인 후 실행"
                : "확정 시 계정 기반 저장 데이터가 비회원 상태로 초기화됨"}
            </Text>
            <View style={styles.dangerActions}>
              <Pressable
                accessibilityLabel={dangerConfirm === "signout" ? "로그아웃 확정" : "로그아웃"}
                accessibilityRole="button"
                onPress={() => {
                  if (dangerConfirm === "signout") onSignOutAccount();
                  else setDangerConfirm("signout");
                }}
                style={[styles.smallButton, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}
              >
                <Text style={[styles.smallButtonText, { color: theme.text }]}>{dangerConfirm === "signout" ? "로그아웃 확정" : "로그아웃"}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={dangerConfirm === "delete" ? "회원 탈퇴 확정" : "회원 탈퇴"}
                accessibilityRole="button"
                onPress={() => {
                  if (dangerConfirm === "delete") onSignOutAccount();
                  else setDangerConfirm("delete");
                }}
                style={[styles.smallButton, { backgroundColor: dangerConfirm === "delete" ? `${theme.alert}22` : theme.cardMuted, borderColor: theme.border }]}
              >
                <Text style={[styles.smallButtonText, { color: dangerConfirm === "delete" ? theme.alert : theme.subtle }]}>
                  {dangerConfirm === "delete" ? "탈퇴 확정" : "회원 탈퇴"}
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

function ChevronLeft({ color }: { color: string }) {
  return (
    <View style={styles.chevronLeft} accessibilityElementsHidden>
      <View style={[styles.chevronLeftTop, { backgroundColor: color }]} />
      <View style={[styles.chevronLeftBottom, { backgroundColor: color }]} />
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
    gap: spacing.sm,
    minHeight: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 116,
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
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  profileCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: 16,
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
  dangerPanel: {
    gap: spacing.sm,
    padding: 16,
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
    minHeight: 34,
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
  chevronLeft: {
    width: 16,
    height: 16,
    justifyContent: "center",
  },
  chevronLeftTop: {
    position: "absolute",
    left: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }, { translateY: -3 }],
  },
  chevronLeftBottom: {
    position: "absolute",
    left: 4,
    width: 9,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }, { translateY: 3 }],
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
