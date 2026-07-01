import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "../components/AppScreen";
import type { P0ScreenProps } from "../navigation/types";
import type { PolicyDocumentType } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

const policyRows: { type: PolicyDocumentType; icon: string; title: string; body: string }[] = [
  { type: "privacy", icon: "방패", title: "개인정보처리방침", body: "위치·목적지·앱 사용 데이터" },
  { type: "terms", icon: "문서", title: "이용약관", body: "게스트·계정 연결·저장 기능 기준" },
  { type: "location", icon: "위치", title: "위치기반서비스 이용약관", body: "현재 위치와 목적지 기반 안내" },
  { type: "open-source", icon: "OSS", title: "오픈소스 라이선스", body: "Expo·React Native·SDK 고지" },
];

export function PolicyHubScreen({ onOpenPolicyDocument }: P0ScreenProps) {
  const theme = useAppTheme();
  return (
    <AppScreen title="정책" subtitle="약관과 데이터 기준을 확인" badge="문서">
      <View style={[styles.documentPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        {policyRows.map((item, index) => (
          <Pressable
            accessibilityLabel={`${item.title}, ${item.body}`}
            accessibilityRole="button"
            key={item.type}
            onPress={() => onOpenPolicyDocument(item.type)}
            style={[styles.documentRow, index < policyRows.length - 1 ? { borderBottomColor: theme.border, borderBottomWidth: 1 } : null]}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
              <Text style={[styles.iconText, { color: theme.sky }]}>{item.icon}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.body, { color: theme.muted }]}>{item.body}</Text>
            </View>
            <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
  iconText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
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
