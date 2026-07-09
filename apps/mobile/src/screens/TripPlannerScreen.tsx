import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

const tripDays = [
  { day: "1일차", date: "6/20", weather: "맑음", temp: "27°", plan: "성산일출봉" },
  { day: "2일차", date: "6/21", weather: "비", temp: "24°", plan: "우도 (우천 대비)" },
  { day: "3일차", date: "6/22", weather: "흐림", temp: "26°", plan: "시내 · 귀가" },
];

export function TripPlannerScreen({ onNavigate }: P0ScreenProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.header}>
          <BackButton onPress={() => onNavigate("G1")} />
          <Text style={[styles.title, { color: theme.text }]}>여행 플래너</Text>
          <View style={[styles.premiumTag, { backgroundColor: `${theme.sky}18`, borderColor: theme.sky }]}>
            <Text style={[styles.premiumText, { color: theme.sky }]}>프리미엄</Text>
          </View>
        </View>

        <View style={[styles.tripBand, { backgroundColor: theme.card, borderLeftColor: theme.sky }]}>
          <Text style={[styles.tripTitle, { color: theme.text }]}>제주 2박 3일</Text>
          <Text style={[styles.tripDate, { color: theme.subtle }]}>6/20  -  6/22</Text>
        </View>

        <View style={styles.segmentRow}>
          <View style={[styles.segmentActive, { backgroundColor: theme.gold }]}>
            <Text style={[styles.segmentActiveText, { color: theme.onAccent }]}>무료 상태</Text>
          </View>
          <View style={[styles.segmentPassive, { borderColor: theme.border, backgroundColor: "rgba(16,36,63,0.26)" }]}>
            <Text style={[styles.segmentPassiveText, { color: theme.subtle }]}>프리미엄 활성</Text>
          </View>
        </View>

        <View style={[styles.noticeCard, { backgroundColor: theme.card, borderLeftColor: theme.gold }]}>
          <View style={styles.noticeCopy}>
            <Text style={[styles.noticeLabel, { color: theme.gold }]}>여행</Text>
            <Text style={[styles.noticeText, { color: theme.text }]}>무료 사용자는 구독 후 전체 플래너 저장 가능</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => onNavigate("G6")} style={[styles.subscribeButton, { backgroundColor: theme.gold }]}>
            <Text style={[styles.subscribeText, { color: theme.onAccent }]}>구독</Text>
          </Pressable>
        </View>

        <View style={[styles.scheduleCard, { backgroundColor: theme.card }]}>
          {tripDays.map((item, index) => (
            <Pressable
              accessibilityRole="button"
              key={item.day}
              onPress={() => onNavigate(index === 1 ? "H5" : "G2")}
              style={[
                styles.dayRow,
                {
                  backgroundColor: index === 0 ? "rgba(248,251,255,0.09)" : "transparent",
                  borderBottomColor: index === tripDays.length - 1 ? "transparent" : theme.border,
                },
              ]}
            >
              <Text style={[styles.dayText, { color: index === 0 ? theme.gold : theme.text }]}>{item.day}</Text>
              <Text style={[styles.dateText, { color: theme.subtle }]}>{item.date}</Text>
              <Text style={[styles.weatherText, { color: theme.text }]}>{item.weather}</Text>
              <Text style={[styles.tempText, { color: theme.text }]}>{item.temp}</Text>
              <Text style={[styles.planText, { color: theme.subtle }]} numberOfLines={1}>{item.plan}</Text>
              <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.recommendCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.recommendTitle, { color: theme.muted }]}>코디 · 짐 추천</Text>
          <Text style={[styles.recommendText, { color: theme.text }]}>1일차 기준 · 반팔 3 · 긴팔 1 · 우비/3단 우산 · 방수 신발 · 선크림</Text>
        </View>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={() => onNavigate("G4")} style={[styles.primaryAction, { backgroundColor: theme.gold }]}>
            <Text style={[styles.primaryActionText, { color: theme.onAccent }]}>일정 추가</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => onNavigate("G6")} style={[styles.secondaryAction, { backgroundColor: theme.cardStrong }]}>
            <ShareGlyph color={theme.text} />
            <Text style={[styles.secondaryActionText, { color: theme.text }]}>구독 후 공유</Text>
          </Pressable>
        </View>

        <View style={[styles.lockBox, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <Text style={[styles.lockText, { color: theme.sky }]}>무료 사용자는 여기서 구독 안내가 노출돼요</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function ShareGlyph({ color }: { color: string }) {
  return (
    <View style={styles.shareGlyph} accessibilityElementsHidden>
      <View style={[styles.shareDotOne, { borderColor: color }]} />
      <View style={[styles.shareDotTwo, { borderColor: color }]} />
      <View style={[styles.shareDotThree, { borderColor: color }]} />
      <View style={[styles.shareLineOne, { backgroundColor: color }]} />
      <View style={[styles.shareLineTwo, { backgroundColor: color }]} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 112,
    minHeight: "100%",
  },
  atmosphere: {
    position: "absolute",
    left: -32,
    right: -32,
    bottom: -110,
    height: 300,
    opacity: 0.72,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 160,
  },
  header: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: 0,
  },
  premiumTag: {
    minHeight: 26,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  premiumText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  tripBand: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderLeftWidth: 2,
  },
  tripTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  tripDate: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  segmentActive: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  segmentPassive: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  segmentActiveText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  segmentPassiveText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  noticeCard: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: 14,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
  },
  noticeCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  noticeLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  subscribeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  subscribeText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  scheduleCard: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  dayRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  dayText: {
    width: 50,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  dateText: {
    width: 42,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  weatherText: {
    width: 30,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  tempText: {
    width: 34,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  planText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  chevron: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
  },
  recommendCard: {
    gap: spacing.sm,
    minHeight: 92,
    justifyContent: "center",
    padding: 16,
    borderRadius: radius.lg,
  },
  recommendTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  recommendText: {
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  primaryAction: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.md,
  },
  primaryActionText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  secondaryActionText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  shareGlyph: {
    width: 18,
    height: 18,
  },
  shareDotOne: {
    position: "absolute",
    left: 1,
    top: 6,
    width: 5,
    height: 5,
    borderWidth: 1.5,
    borderRadius: 3,
  },
  shareDotTwo: {
    position: "absolute",
    right: 1,
    top: 2,
    width: 5,
    height: 5,
    borderWidth: 1.5,
    borderRadius: 3,
  },
  shareDotThree: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 5,
    height: 5,
    borderWidth: 1.5,
    borderRadius: 3,
  },
  shareLineOne: {
    position: "absolute",
    left: 6,
    top: 6,
    width: 9,
    height: 1.4,
    borderRadius: 2,
    transform: [{ rotate: "-24deg" }],
  },
  shareLineTwo: {
    position: "absolute",
    left: 6,
    bottom: 6,
    width: 9,
    height: 1.4,
    borderRadius: 2,
    transform: [{ rotate: "24deg" }],
  },
  lockBox: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  lockText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  bottomSpacer: {
    height: 8,
  },
});
