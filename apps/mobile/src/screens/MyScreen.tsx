import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type MenuTone = "clear" | "gold" | "sky" | "warm";

export function MyScreen({
  accountLinked,
  termsRequiredAccepted,
  permissionReady,
  selectedStyles,
  styleProfileSaved,
  fitPreference,
  savedDestinations,
  notificationHistory,
  wardrobeItems,
  onNavigate,
  onRequireAccount,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const isAccountReady = accountLinked && termsRequiredAccepted;
  const ownedWardrobeCount = wardrobeItems.filter((item) => item.owned).length;
  const styleLabel = styleProfileSaved && selectedStyles.length ? selectedStyles.slice(0, 2).join(" · ") : "캐주얼 · 포멀";
  const recentMenu = styleProfileSaved ? "스타일 저장 완료" : permissionReady ? "알림 권한 준비" : "알림 설정 전";

  const openProfile = () => {
    onNavigate("A4");
  };

  const openPremium = () => {
    if (isAccountReady) onNavigate("G6");
    else onRequireAccount("notification", "M1");
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.statusBar}>
          <Text style={[styles.statusText, { color: theme.text }]}>9:41</Text>
          <Text style={[styles.statusText, { color: theme.subtle }]}>••• 5G</Text>
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>마이</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={openProfile}
          style={[styles.profileCard, { backgroundColor: theme.card, borderColor: isAccountReady ? "rgba(103,232,208,0.36)" : theme.gold }]}
        >
          <View style={[styles.avatar, { backgroundColor: theme.card, borderColor: isAccountReady ? theme.clear : theme.gold }]}>
            <PersonGlyph color={isAccountReady ? theme.clear : theme.gold} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.profileName, { color: theme.text }]}>{isAccountReady ? "연결된 계정" : "게스트 모드"}</Text>
            <Text style={[styles.profileEmail, { color: theme.subtle }]}>{isAccountReady ? "프로필 정보 동기화됨" : "계정 연결 후 저장·동기화 가능"}</Text>
          </View>
          <View style={[styles.profilePill, { backgroundColor: theme.cardStrong }]}>
            <Text style={[styles.profilePillText, { color: theme.text }]}>{isAccountReady ? "관리" : "계정 연결"}</Text>
          </View>
          <Chevron color={theme.subtle} />
        </Pressable>

        <Pressable accessibilityRole="button" onPress={openPremium} style={[styles.upgradeCard, { backgroundColor: theme.cardStrong, borderColor: "rgba(196,181,253,0.34)" }]}>
          <View style={[styles.upgradeIcon, { borderColor: "#C4B5FD" }]}>
            <StarGlyph color="#C4B5FD" />
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.upgradeTitle, { color: theme.text }]}>{isAccountReady ? "프리미엄은 MVP 이후 검증" : "계정 연결 필요"}</Text>
            <Text style={[styles.profileEmail, { color: theme.subtle }]}>{isAccountReady ? "출발 알림 반응 확인 후 구독 기능 확장" : "저장·동기화 기능은 계정 연결 후 사용"}</Text>
          </View>
          <View style={[styles.upgradePill, { borderColor: "#C4B5FD" }]}>
            <Text style={styles.upgradePillText}>업그레이드</Text>
          </View>
        </Pressable>

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>설정</Text>

        <View style={styles.menuList}>
          <MenuRow
            icon="bell"
            title="알림 설정"
            meta={permissionReady ? "권한 정상 · 스마트 알림 관리" : "권한 확인 필요 · 스마트 알림 관리"}
            status={permissionReady ? "허용됨" : "확인"}
            tone={permissionReady ? "clear" : "warm"}
            onPress={() => onNavigate("M2")}
            theme={theme}
          />
          <MenuRow
            icon="shirt"
            title="스타일 태그 변경"
            meta={`${styleLabel} · ${getFitLabel(fitPreference)}`}
            status={styleProfileSaved ? "저장됨" : "설정"}
            tone={styleProfileSaved ? "clear" : "gold"}
            onPress={() => onNavigate("O4")}
            theme={theme}
          />
          <MenuRow
            icon="gear"
            title="전역 설정"
            meta="단위 · 테마 · 위치/권한 관리"
            status="관리"
            tone="sky"
            onPress={() => onNavigate("M3")}
            theme={theme}
          />
        </View>

        <View style={[styles.profileState, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <Text style={[styles.stateLabel, { color: theme.clear }]}>PROFILE STATE</Text>
          <Text style={[styles.stateText, { color: theme.text }]}>
            {isAccountReady ? "계정 연결" : "게스트"} · {isAccountReady ? "무료 플랜" : "플랜 대기"} · 최근 선택 메뉴 {recentMenu}
          </Text>
        </View>

        <Text style={[styles.groupLabel, { color: theme.subtle }]}>정보</Text>

        <View style={styles.menuList}>
          <MenuRow
            icon="shield"
            title="개인정보처리방침"
            meta="계정 · 위치 · 목적지 데이터 기준"
            status="보기"
            tone="sky"
            onPress={() => onNavigate("R1")}
            theme={theme}
          />
          <MenuRow
            icon="info"
            title="앱 정보"
            meta="WeatherON v1.0.0"
            status="정보"
            tone="clear"
            onPress={() => onNavigate("M3")}
            theme={theme}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
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
  icon: "bell" | "shirt" | "gear" | "star" | "shield" | "info";
  title: string;
  meta: string;
  status: string;
  tone: MenuTone;
  onPress: () => void;
  theme: AppTheme;
}) {
  const color = getToneColor(theme, tone);
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.menuRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
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

function MenuIcon({ type, color }: { type: "bell" | "shirt" | "gear" | "star" | "shield" | "info"; color: string }) {
  if (type === "shirt") return <ShirtGlyph color={color} />;
  if (type === "gear") return <GearGlyph color={color} />;
  if (type === "star") return <StarGlyph color={color} />;
  if (type === "shield") return <ShieldGlyph color={color} />;
  if (type === "info") return <InfoGlyph color={color} />;
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

function ShirtGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.shirtBody, { borderColor: color }]} />
      <View style={[styles.shirtNeck, { backgroundColor: color }]} />
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

function StarGlyph({ color }: { color: string }) {
  return <Text style={[styles.starGlyph, { color }]} accessibilityElementsHidden>★</Text>;
}

function ShieldGlyph({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      <View style={[styles.shieldGlyph, { borderColor: color }]} />
    </View>
  );
}

function InfoGlyph({ color }: { color: string }) {
  return <Text style={[styles.infoGlyph, { color }]} accessibilityElementsHidden>i</Text>;
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

function getFitLabel(value: P0ScreenProps["fitPreference"]) {
  if (value === "relaxed") return "릴랙스";
  if (value === "formal") return "포멀";
  if (value === "outdoor") return "아웃도어";
  return "스탠다드";
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
  upgradeCard: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.lg,
  },
  upgradeIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  upgradeTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  upgradePill: {
    minHeight: 30,
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
  },
  upgradePillText: {
    color: "#C4B5FD",
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
  profileState: {
    gap: 6,
    padding: 15,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderLeftWidth: 2,
    borderLeftColor: "#67E8D0",
  },
  stateLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  stateText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800",
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
  shirtBody: {
    width: 16,
    height: 14,
    borderWidth: 1.6,
    borderRadius: 4,
  },
  shirtNeck: {
    position: "absolute",
    top: 2,
    width: 6,
    height: 2,
    borderRadius: 2,
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
  starGlyph: {
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "900",
  },
  shieldGlyph: {
    width: 14,
    height: 16,
    borderWidth: 1.6,
    borderRadius: 5,
    transform: [{ rotate: "45deg" }],
  },
  infoGlyph: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "900",
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
