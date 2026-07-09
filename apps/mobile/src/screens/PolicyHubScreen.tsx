import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { BackButton } from "../components/BackButton";
import type { P0ScreenProps } from "../navigation/types";
import type { PolicyDocumentType } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";

const policyRows: { type: PolicyDocumentType; icon: number; title: string; body: string }[] = [
  { type: "privacy", icon: uiIconAssets.policyPrivacy, title: "개인정보처리방침", body: "위치·목적지·앱 사용 데이터" },
  { type: "terms", icon: uiIconAssets.policyTerms, title: "이용약관", body: "게스트·계정 연결·저장 기능 기준" },
  { type: "location", icon: uiIconAssets.policyLocation, title: "위치기반서비스 이용약관", body: "현재 위치와 목적지 기반 안내" },
  { type: "open-source", icon: uiIconAssets.policyOss, title: "오픈소스 라이선스", body: "Expo·React Native·SDK 고지" },
];

export function PolicyHubScreen({ onOpenPolicyDocument, onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();
  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <BackButton accessibilityLabel="MY로 돌아가기" onPress={() => onNavigate("M1")} />
          <Text style={[styles.screenTitle, { color: theme.text }]}>정책</Text>
        </View>

        <View style={[styles.documentPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }, cardShadow(theme)]}>
          {policyRows.map((item, index) => (
            <Pressable
              accessibilityLabel={`${item.title}, ${item.body}`}
              accessibilityRole="button"
              key={item.type}
              onPress={() => onOpenPolicyDocument(item.type)}
              style={[styles.documentRow, index < policyRows.length - 1 ? { borderBottomColor: theme.border, borderBottomWidth: 1 } : null]}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
                <Image source={item.icon} style={[styles.iconImage, { tintColor: theme.sky }]} resizeMode="contain" />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.body, { color: theme.muted }]}>{item.body}</Text>
              </View>
              <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
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
  screenTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0,
  },
  documentPanel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  documentRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  iconBox: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  iconImage: {
    width: 22,
    height: 22,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  body: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  chevron: {
    fontSize: 22,
    fontWeight: "800",
  },
});
