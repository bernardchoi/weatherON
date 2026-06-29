import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type AccountTone = "clear" | "gold" | "sky" | "warm";

export function AccountManagementScreen({
  accountLinked,
  termsRequiredAccepted,
  savedDestinations,
  outfitSaved,
  onNavigate,
  onRequireAccount,
  onSignOutAccount,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const [dangerConfirm, setDangerConfirm] = useState<"none" | "signout" | "delete">("none");
  const [exportReady, setExportReady] = useState(false);
  const dataCount = savedDestinations.length + (outfitSaved ? 1 : 0);
  const statusLabel = accountLinked ? "계정 연결됨" : "게스트 모드";
  const profileMeta = accountLinked ? "저장 · 동기화 사용 가능" : "저장 · 동기화는 계정 연결 필요";
  const accountState = `${accountLinked ? "계정 연결됨" : "게스트 모드"} · ${termsRequiredAccepted ? "약관 완료" : "비회원 상태"}`;

  const requestConnect = () => onRequireAccount("notification", "A4");

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.statusBar}>
          <Text style={[styles.statusText, { color: theme.text }]}>9:41</Text>
          <Text style={[styles.statusText, { color: theme.subtle }]}>••• 5G</Text>
        </View>

        <View style={styles.header}>
          <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={() => onNavigate("M1")} style={[styles.backButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <ChevronLeft color={theme.muted} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>마이페이지</Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatar, { borderColor: accountLinked ? theme.clear : theme.gold }]}>
            <PersonGlyph color={accountLinked ? theme.clear : theme.gold} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.profileTitle, { color: theme.text }]}>{statusLabel}</Text>
            <Text style={[styles.profileMeta, { color: theme.subtle }]}>{profileMeta}</Text>
          </View>
        </View>

        <View style={[styles.menuPanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MenuRow
            icon="star"
            title="구독 관리"
            tone="sky"
            onPress={() => onNavigate("G6")}
            theme={theme}
            divider
          />
          <MenuRow
            icon="link"
            title="연결된 계정 관리"
            tone={accountLinked ? "clear" : "sky"}
            onPress={accountLinked ? () => setDangerConfirm("signout") : requestConnect}
            theme={theme}
            divider
          />
          <MenuRow
            icon="export"
            title="데이터 내보내기"
            tone={dataCount ? "clear" : "sky"}
            onPress={accountLinked ? () => setExportReady(true) : requestConnect}
            theme={theme}
          />
        </View>

        {exportReady ? (
          <View style={[styles.resultStrip, { backgroundColor: theme.cardStrong, borderColor: theme.clear }]}>
            <Text style={[styles.resultText, { color: theme.text }]}>내보낼 데이터 {dataCount}개 준비됨</Text>
            <Text style={[styles.resultMeta, { color: theme.subtle }]}>목적지와 코디 저장 데이터 기준</Text>
          </View>
        ) : null}

        <View style={[styles.stateCard, { backgroundColor: theme.cardStrong, borderColor: theme.gold }]}>
          <Text style={[styles.stateLabel, { color: theme.gold }]}>계정</Text>
          <Text style={[styles.stateText, { color: theme.text }]}>{accountState}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={accountLinked ? () => setDangerConfirm("signout") : requestConnect}
          style={[styles.primaryRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
        >
          <View style={styles.actionIcon}>
            <DoorGlyph color={accountLinked ? theme.warm : theme.sky} />
          </View>
          <Text style={[styles.primaryText, { color: theme.text }]}>{accountLinked ? "로그아웃" : "계정 연결"}</Text>
          <ChevronRight color={theme.subtle} />
        </Pressable>

        {accountLinked ? (
          <View style={[styles.dangerPanel, { backgroundColor: theme.cardStrong, borderColor: dangerConfirm === "delete" ? theme.alert : theme.border }]}>
            <Text style={[styles.dangerTitle, { color: dangerConfirm === "none" ? theme.text : theme.warm }]}>
              {dangerConfirm === "none" ? "위험 액션" : dangerConfirm === "signout" ? "로그아웃 확인" : "회원 탈퇴 확인"}
            </Text>
            <Text style={[styles.dangerBody, { color: theme.subtle }]}>
              {dangerConfirm === "none"
                ? "로그아웃과 회원 탈퇴는 확인 후 실행"
                : "확정 시 계정 기반 저장 데이터가 비회원 상태로 초기화됨"}
            </Text>
            <View style={styles.dangerActions}>
              <Pressable
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
                <Pressable accessibilityRole="button" onPress={() => setDangerConfirm("none")} style={[styles.smallButton, { backgroundColor: "transparent", borderColor: theme.border }]}>
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

function MenuRow({
  icon,
  title,
  tone,
  onPress,
  theme,
  divider,
}: {
  icon: "star" | "link" | "export";
  title: string;
  tone: AccountTone;
  onPress: () => void;
  theme: AppTheme;
  divider?: boolean;
}) {
  const color = getToneColor(theme, tone);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.menuRow, divider ? { borderBottomColor: theme.border, borderBottomWidth: 1 } : null]}
    >
      <View style={styles.menuIcon}>
        <AccountIcon type={icon} color={color} />
      </View>
      <Text style={[styles.menuTitle, { color: theme.text }]}>{title}</Text>
      <ChevronRight color={theme.subtle} />
    </Pressable>
  );
}

function AccountIcon({ type, color }: { type: "star" | "link" | "export"; color: string }) {
  if (type === "link") return <LinkGlyph color={color} />;
  if (type === "export") return <ExportGlyph color={color} />;
  return <StarGlyph color={color} />;
}

function PersonGlyph({ color }: { color: string }) {
  return (
    <View style={styles.personGlyph} accessibilityElementsHidden>
      <View style={[styles.personHead, { borderColor: color }]} />
      <View style={[styles.personBody, { borderColor: color }]} />
    </View>
  );
}

function StarGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.starArmA, { backgroundColor: color }]} />
      <View style={[styles.starArmB, { backgroundColor: color }]} />
      <View style={[styles.starDot, { borderColor: color }]} />
    </View>
  );
}

function LinkGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.linkA, { borderColor: color }]} />
      <View style={[styles.linkB, { borderColor: color }]} />
    </View>
  );
}

function ExportGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.exportTray, { borderColor: color }]} />
      <View style={[styles.exportStem, { backgroundColor: color }]} />
      <View style={[styles.exportHeadA, { backgroundColor: color }]} />
      <View style={[styles.exportHeadB, { backgroundColor: color }]} />
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

function getToneColor(theme: AppTheme, tone: AccountTone) {
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
  statusBar: {
    minHeight: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: 0,
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
  menuPanel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: 16,
  },
  menuIcon: {
    width: 24,
    alignItems: "center",
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  resultStrip: {
    gap: 4,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  resultText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  resultMeta: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  stateCard: {
    gap: 6,
    minHeight: 76,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  stateLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  stateText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
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
  starArmA: {
    position: "absolute",
    width: 16,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  starArmB: {
    position: "absolute",
    width: 16,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }],
  },
  starDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.4,
  },
  linkA: {
    position: "absolute",
    left: 2,
    width: 10,
    height: 7,
    borderWidth: 1.7,
    borderRadius: 5,
    transform: [{ rotate: "-38deg" }],
  },
  linkB: {
    position: "absolute",
    right: 2,
    width: 10,
    height: 7,
    borderWidth: 1.7,
    borderRadius: 5,
    transform: [{ rotate: "-38deg" }],
  },
  exportTray: {
    position: "absolute",
    bottom: 2,
    width: 16,
    height: 7,
    borderBottomWidth: 1.7,
    borderLeftWidth: 1.7,
    borderRightWidth: 1.7,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  exportStem: {
    position: "absolute",
    top: 2,
    width: 2,
    height: 11,
    borderRadius: 2,
  },
  exportHeadA: {
    position: "absolute",
    top: 2,
    width: 7,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }, { translateX: -2 }],
  },
  exportHeadB: {
    position: "absolute",
    top: 2,
    width: 7,
    height: 2,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }, { translateX: 2 }],
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
