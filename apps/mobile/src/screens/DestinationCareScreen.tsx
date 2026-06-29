import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { onboardingAssets, uiIconAssets } from "../assets";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

export function DestinationCareScreen({
  accountLinked,
  state,
  destinationCareEnabled,
  selectedDestinationPlace,
  onNavigate,
  onRequireAccount,
  onToggleDestinationCare,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const care = state.destinationCare;
  const needsAccount = !accountLinked;
  const headerTitle = selectedDestinationPlace?.name ? `회사 · ${selectedDestinationPlace.name}` : care.name;
  const departureTime = care.departureAdvice?.recommendedDepartureTime ?? "08:10";
  const targetArrivalTime = care.departureAdvice?.targetArrivalTime ?? "09:00";
  const travelMinutes = care.departureAdvice?.travelMinutes ?? 40;

  return (
    <View style={[styles.shell, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.atmosphere, { backgroundColor: theme.backgroundAlt }]} />

        <View style={styles.statusBar}>
          <Text style={[styles.statusText, { color: theme.text }]}>9:41</Text>
          <Text style={[styles.statusText, { color: theme.subtle }]}>••• 5G</Text>
        </View>

        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => onNavigate("G1")} style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.backGlyph, { color: theme.text }]}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <View style={styles.headerTitleRow}>
              <Image source={uiIconAssets.pin} style={[styles.headerIcon, { tintColor: theme.text }]} resizeMode="contain" />
              <Text style={[styles.title, { color: theme.text }]}>{headerTitle}</Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.subtle }]}>목적지 기준 알림 미리보기</Text>
          </View>
        </View>

        <View style={[styles.decisionPanel, { backgroundColor: theme.card, borderColor: theme.gold }]}>
          <View style={styles.decisionTop}>
            <View style={styles.decisionCopy}>
              <Text style={[styles.decisionEyebrow, { color: theme.gold }]}>목적지에서 바로 판단</Text>
              <Text style={[styles.decisionTitle, { color: theme.text }]}>{departureTime}에 나가면 {targetArrivalTime} 도착</Text>
              <Text style={[styles.decisionBody, { color: theme.muted }]}>
                현재 위치와 목적지 날씨 차이를 보고 출발, 우산, 신발 알림을 한 번에 맞춤
              </Text>
            </View>
            <View style={[styles.decisionImageFrame, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
              <Image source={onboardingAssets.destinationCare} style={styles.decisionImage} resizeMode="cover" />
            </View>
          </View>
          <View style={styles.decisionStats}>
            <DecisionStat icon={uiIconAssets.depart} label="출발" value={departureTime} meta={`이동 ${travelMinutes}분`} color={theme.gold} theme={theme} />
            <DecisionStat icon={uiIconAssets.drop} label="목적지 비" value="30%" meta="출발지 0%" color={theme.sky} theme={theme} />
            <DecisionStat icon={uiIconAssets.clock} label="비 그침" value="21:00" meta="알림 가능" color={theme.clear} theme={theme} />
          </View>
        </View>

        {needsAccount ? (
          <InfoPanel tone="warm" title="알아서 챙기기" pill="계정 필요" theme={theme}>
            <Text style={[styles.panelBody, { color: theme.text }]}>알림 저장과 동기화를 위해 계정 연결이 필요함</Text>
          </InfoPanel>
        ) : null}

        <View style={[styles.comparePanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>현재 위치 · 목적지 날씨 비교</Text>
          <CompareRow label="기온" from="21°" to="19°" accent={theme.text} theme={theme} />
          <CompareRow label="날씨" from="맑음" to="흐림" accent={theme.text} theme={theme} />
          <CompareRow label="출발지" from="서울 삼성동" to={selectedDestinationPlace?.name ?? "판교"} accent={theme.text} theme={theme} />
          <CompareRow label="강수" from="0%" to="30%" accent={theme.warm} theme={theme} />
        </View>

        <View style={[styles.departurePanel, { backgroundColor: theme.card, borderLeftColor: theme.gold }]}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>출발시간 역산</Text>
          <Text style={[styles.departureMeta, { color: theme.text }]}>도착 희망 {targetArrivalTime}</Text>
          <Text style={[styles.departureMeta, { color: theme.text }]}>− 소요시간 {travelMinutes}분 − 여유 10분</Text>
          <Text style={[styles.departureTime, { color: theme.gold }]}>{departureTime} <Text style={styles.departureSuffix}>출발</Text></Text>
        </View>

        <View style={[styles.flowPanel, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>출발 전 알림 흐름</Text>
          <TimelineItem time="07:30" label="외출 준비 통합 알림" icon={uiIconAssets.clock} color={theme.sky} active={false} theme={theme} />
          <TimelineItem time="08:00" label="신발 추천 — 출발 10분 전" icon={uiIconAssets.shoe} color={theme.clear} active={false} theme={theme} />
          <TimelineItem time="08:10" label="출발 시각 알림" icon={uiIconAssets.depart} color={theme.gold} active theme={theme} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => (needsAccount ? onRequireAccount("destination-care", "G2") : onToggleDestinationCare())}
          style={({ pressed }) => [styles.cta, { backgroundColor: theme.gold, opacity: pressed ? 0.86 : 1 }]}
        >
          <Text style={[styles.ctaText, { color: theme.onAccent }]}>{needsAccount ? "계정 연결하고 케어 켜기" : destinationCareEnabled ? "목적지 케어 끄기" : "목적지 케어 켜기"}</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

function DecisionStat({
  icon,
  label,
  value,
  meta,
  color,
  theme,
}: {
  icon: number;
  label: string;
  value: string;
  meta: string;
  color: string;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.decisionStat, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
      <View style={styles.decisionStatTop}>
        <Image source={icon} style={[styles.decisionStatIcon, { tintColor: color }]} resizeMode="contain" />
        <Text style={[styles.decisionStatLabel, { color }]}>{label}</Text>
      </View>
      <Text style={[styles.decisionStatValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.decisionStatMeta, { color: theme.muted }]}>{meta}</Text>
    </View>
  );
}

function InfoPanel({
  tone,
  title,
  pill,
  theme,
  children,
}: {
  tone: "clear" | "warm";
  title: string;
  pill?: string;
  theme: AppTheme;
  children: React.ReactNode;
}) {
  const accent = tone === "clear" ? theme.clear : theme.warm;
  return (
    <View style={[styles.infoPanel, { backgroundColor: theme.card, borderLeftColor: accent }]}>
      <View style={styles.infoHeader}>
        <Text style={[styles.infoTitle, { color: accent }]}>{title}</Text>
        {pill ? (
          <View style={[styles.infoPill, { backgroundColor: theme.cardStrong }]}>
            <Text style={[styles.infoPillText, { color: accent }]}>{pill}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function CompareRow({ label, from, to, accent, theme }: { label: string; from: string; to: string; accent: string; theme: AppTheme }) {
  return (
    <View style={styles.compareRow}>
      <Text style={[styles.compareLabel, { color: theme.subtle }]}>{label}</Text>
      <Text style={[styles.compareValue, { color: theme.text }]}>{from}</Text>
      <Text style={[styles.compareArrow, { color: theme.subtle }]}>→</Text>
      <Text style={[styles.compareValue, { color: accent }]}>{to}</Text>
    </View>
  );
}

function TimelineItem({
  time,
  label,
  icon,
  color,
  active,
  theme,
}: {
  time: string;
  label: string;
  icon: number;
  color: string;
  active: boolean;
  theme: AppTheme;
}) {
  const resolvedColor = active ? theme.gold : color;
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineIcon, { backgroundColor: active ? theme.gold : theme.cardStrong, borderColor: resolvedColor }]}>
        <Image source={icon} style={[styles.timelineIconImage, { tintColor: active ? theme.onAccent : resolvedColor }]} resizeMode="contain" />
      </View>
      <Text style={[styles.timelineTime, { color: resolvedColor }]}>{time}</Text>
      <Text style={[styles.timelineLabel, { color: theme.text }]}>{label}</Text>
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
    paddingBottom: 132,
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
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  backGlyph: {
    marginTop: -2,
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "300",
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  headerIcon: {
    width: 17,
    height: 17,
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  decisionPanel: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
  },
  decisionTop: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
  },
  decisionCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  decisionImageFrame: {
    width: 86,
    height: 104,
    overflow: "hidden",
    borderRadius: radius.md,
    borderWidth: 1,
  },
  decisionImage: {
    width: "100%",
    height: "100%",
  },
  decisionEyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  decisionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: 0,
  },
  decisionBody: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
  },
  decisionStats: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  decisionStat: {
    flex: 1,
    minHeight: 78,
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  decisionStatTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  decisionStatIcon: {
    width: 13,
    height: 13,
  },
  decisionStatLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  decisionStatValue: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  decisionStatMeta: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  infoPanel: {
    gap: 6,
    padding: 16,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  infoTitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  infoPill: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  infoPillText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
  },
  panelBody: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
  },
  comparePanel: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0,
  },
  compareRow: {
    minHeight: 23,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  compareLabel: {
    width: 42,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  compareValue: {
    minWidth: 42,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  compareArrow: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  departurePanel: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderLeftWidth: 2,
  },
  departureMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  departureTime: {
    marginTop: 2,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
  },
  departureSuffix: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  flowPanel: {
    gap: spacing.sm,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  timelineItem: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  timelineIconImage: {
    width: 17,
    height: 17,
  },
  timelineTime: {
    width: 46,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
  },
  timelineLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  bottomSpacer: {
    height: 24,
  },
  ctaWrap: {
    paddingTop: spacing.xs,
  },
  cta: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  ctaText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
