import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type PlanId = "monthly" | "yearly";

const premiumRows = [
  { feature: "알림", free: "1개 고정", premium: "한도 확대" },
  { feature: "코디 추천", free: "오늘 기본", premium: "7일 플래닝" },
  { feature: "도보여행", free: "기본 체크", premium: "AI 종주 플래너" },
  { feature: "목적지", free: "1개", premium: "즐겨찾기 확대" },
];

const plans = [
  { id: "monthly" as const, label: "월간", price: "₩2,900", period: "/월", recommended: false },
  { id: "yearly" as const, label: "연간", price: "₩19,900", period: "/년 · ₩1,658/월", recommended: true },
];

export function PremiumScreen({ onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("yearly");
  const selectedPlanLabel = selectedPlan === "yearly" ? "연간" : "월간";

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.statusBar}>
          <Text style={[styles.statusText, { color: theme.text }]}>9:41</Text>
          <Text style={[styles.statusText, { color: theme.subtle }]}>••• 5G</Text>
        </View>

        <View style={styles.closeRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={() => onNavigate("G1")} style={[styles.closeButton, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
            <CloseGlyph color={theme.subtle} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <StarMark color="#B894FF" />
          <Text style={[styles.heroTitle, { color: theme.text }]}>WeatherON 프리미엄</Text>
          <Text style={[styles.heroCopy, { color: theme.subtle }]}>기능 분리가 아닌 깊이 분리{"\n"}같은 기능을 더 깊게, 더 자유롭게</Text>
        </View>

        <View style={[styles.compareCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.compareTitle, { color: theme.text }]}>무료와 프리미엄 비교</Text>
          {premiumRows.map((row, index) => (
            <View key={row.feature} style={[styles.compareRow, { borderBottomColor: index === premiumRows.length - 1 ? "transparent" : theme.border }]}>
              <Text style={[styles.featureText, { color: theme.text }]}>{row.feature}</Text>
              <Text style={[styles.freeText, { color: theme.subtle }]}>{row.free}</Text>
              <ArrowGlyph color={theme.subtle} />
              <Text style={[styles.premiumText, { color: theme.warm }]}>{row.premium}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.stateCard, { backgroundColor: theme.cardStrong, borderColor: "rgba(196,181,253,0.36)" }]}>
          <Text style={[styles.stateLabel, { color: "#C4B5FD" }]}>프리미엄</Text>
          <Text style={[styles.stateText, { color: theme.text }]}>미구독 · 플랜 선택 후 프리미엄 기능 활성</Text>
        </View>

        <View style={styles.priceRow}>
          {plans.map((plan) => {
            const selected = plan.id === selectedPlan;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                style={[
                  styles.priceCard,
                  {
                    backgroundColor: selected ? theme.gold : theme.cardStrong,
                    borderColor: selected ? "rgba(244,182,63,0.78)" : theme.border,
                  },
                ]}
              >
                {plan.recommended ? (
                  <View style={[styles.saveBadge, { backgroundColor: theme.warm }]}>
                    <Text style={[styles.saveBadgeText, { color: theme.onAccent }]}>추천 · 43% 절약</Text>
                  </View>
                ) : null}
                <Text style={[styles.priceLabel, { color: selected ? theme.onAccent : theme.subtle }]}>{plan.label}</Text>
                <Text style={[styles.price, { color: selected ? theme.onAccent : theme.text }]}>{plan.price}</Text>
                <Text style={[styles.period, { color: selected ? theme.onAccent : theme.subtle }]}>{plan.period}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.flexSpacer} />

        <Pressable accessibilityRole="button" onPress={() => onNavigate("G5")} style={[styles.startButton, { backgroundColor: theme.gold }]}>
          <Text style={[styles.startText, { color: theme.onAccent }]}>{selectedPlanLabel} 플랜 시작하기</Text>
        </Pressable>
        <Text style={[styles.footnote, { color: theme.subtle }]}>언제든 해지 가능 · Apple 인앱결제</Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function CloseGlyph({ color }: { color: string }) {
  return (
    <View style={styles.closeGlyph} accessibilityElementsHidden>
      <View style={[styles.closeLineOne, { backgroundColor: color }]} />
      <View style={[styles.closeLineTwo, { backgroundColor: color }]} />
    </View>
  );
}

function StarMark({ color }: { color: string }) {
  return (
    <View style={styles.starMark} accessibilityElementsHidden>
      <Text style={[styles.starText, { color }]}>★</Text>
    </View>
  );
}

function ArrowGlyph({ color }: { color: string }) {
  return (
    <View style={styles.arrowGlyph} accessibilityElementsHidden>
      <View style={[styles.arrowLine, { backgroundColor: color }]} />
      <View style={[styles.arrowTop, { backgroundColor: color }]} />
      <View style={[styles.arrowBottom, { backgroundColor: color }]} />
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
    gap: spacing.md,
    minHeight: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 112,
  },
  atmosphere: {
    position: "absolute",
    left: -34,
    right: -34,
    bottom: -108,
    height: 360,
    opacity: 0.82,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
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
  closeRow: {
    minHeight: 42,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  closeGlyph: {
    width: 16,
    height: 16,
  },
  closeLineOne: {
    position: "absolute",
    left: 2,
    top: 7,
    width: 12,
    height: 1.8,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  closeLineTwo: {
    position: "absolute",
    left: 2,
    top: 7,
    width: 12,
    height: 1.8,
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }],
  },
  hero: {
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: 2,
    paddingBottom: 6,
  },
  starMark: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  starText: {
    fontSize: 31,
    lineHeight: 34,
    fontWeight: "900",
  },
  heroTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0,
  },
  heroCopy: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  compareCard: {
    gap: 2,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: radius.lg,
  },
  compareTitle: {
    marginBottom: 2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  compareRow: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderBottomWidth: 1,
  },
  featureText: {
    width: 73,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  freeText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    textAlign: "right",
  },
  arrowGlyph: {
    width: 13,
    height: 12,
  },
  arrowLine: {
    position: "absolute",
    left: 0,
    top: 5,
    width: 12,
    height: 1.3,
    borderRadius: 2,
  },
  arrowTop: {
    position: "absolute",
    right: 1,
    top: 3,
    width: 5,
    height: 1.3,
    borderRadius: 2,
    transform: [{ rotate: "42deg" }],
  },
  arrowBottom: {
    position: "absolute",
    right: 1,
    bottom: 3,
    width: 5,
    height: 1.3,
    borderRadius: 2,
    transform: [{ rotate: "-42deg" }],
  },
  premiumText: {
    width: 90,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    textAlign: "right",
  },
  stateCard: {
    gap: 5,
    minHeight: 62,
    justifyContent: "center",
    paddingHorizontal: 16,
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
  priceRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: 18,
  },
  priceCard: {
    flex: 1,
    minHeight: 94,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  saveBadge: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  saveBadgeText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "900",
  },
  priceLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  price: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
  },
  period: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  flexSpacer: {
    flex: 1,
    minHeight: 42,
  },
  startButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  startText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  footnote: {
    marginTop: -4,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  bottomSpacer: {
    height: 8,
  },
});
