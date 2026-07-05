import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { onboardingAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

const recommendationLabels = ["회사", "학교", "공항", "숙소"];

export function OnboardingDestinationScreen({
  selectedDestinationPlace,
  destinationSelectionReady,
  savedDestinations,
  onSaveDestination,
  onNavigate,
  onCompleteOnboarding,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const saved = savedDestinations.some((item) => item.place.id === selectedDestinationPlace.id);
  const canUseSelection = saved || destinationSelectionReady;

  return (
    <AppScreen title="자주 가는 곳을 등록하면 목적지에 맞춰 챙겨드려요" subtitle="등록하면 날씨·출발·강수 알림을 이동 상황에 맞춰 받아볼 수 있음" badge="3 / 3">
      <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.gold }]} />
      </View>

      <View style={[styles.heroFrame, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Image source={onboardingAssets.destinationCare} style={styles.heroImage} resizeMode="cover" />
      </View>

      <View style={styles.benefitRow}>
        <StatusPill label="목적지 날씨 비교" tone="sky" />
        <StatusPill label="출발 시각" tone="gold" />
        <StatusPill label="강수 알림" tone="clear" />
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.cardMuted }]}>
        <Text style={[styles.searchText, { color: theme.subtle }]}>회사, 학교, 공항, 숙소 검색</Text>
      </View>

      <Section title="추천 라벨" caption="자주 쓰는 목적지 유형" accent="sky">
        <View style={styles.labelRow}>
          {recommendationLabels.map((item) => (
            <View key={item} style={[styles.labelChip, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.labelText, { color: theme.text }]}>{item}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title={canUseSelection ? "현재 후보" : "목적지 선택 필요"} caption="장소 검색에서 같은 목적지 상태를 공유" accent="clear">
        <View style={[styles.destinationCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.text }]}>{canUseSelection ? selectedDestinationPlace.name : "장소 검색 후 선택"}</Text>
            <Text style={[styles.body, { color: theme.muted }]}>
              {canUseSelection ? selectedDestinationPlace.address : "검색 결과에서 장소를 고르면 홈 비교와 출발 탭에 저장됨"}
            </Text>
          </View>
          <StatusPill label={saved ? "저장됨" : canUseSelection ? "선택" : "대기"} tone={saved ? "clear" : canUseSelection ? "gold" : "sky"} />
        </View>
        <View style={[styles.noticeBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
          <Text style={[styles.noticeText, { color: theme.muted }]}>
            {canUseSelection ? "목적지를 선택하면 더 정확하게 시작할 수 있음" : "기본 후보는 저장하지 않음 · 직접 검색한 장소만 등록"}
          </Text>
        </View>
        <View style={styles.actions}>
          <AppButton
            label={saved ? "목적지 비교 보기" : canUseSelection ? "목적지 등록하고 비교" : "장소 검색"}
            accessibilityLabel={saved ? "등록된 목적지 비교 보기" : canUseSelection ? "목적지 등록하고 비교 화면으로 이동" : "목적지 장소 검색"}
            onPress={() => (saved ? onNavigate("G2") : canUseSelection ? onSaveDestination("G2") : onNavigate("P1"))}
            tone="warning"
          />
          {canUseSelection ? <AppButton label="장소 검색" accessibilityLabel="목적지 장소 검색" onPress={() => onNavigate("P1")} tone="secondary" /> : null}
        </View>
      </Section>

      <Section title="나중에 설정" caption="목적지는 출발 탭에서 나중에 추가 가능" accent="gold">
        <View style={styles.actions}>
          <AppButton label="나중에 할게요" accessibilityLabel="목적지 등록 없이 홈으로 완료" onPress={() => onCompleteOnboarding("H1")} tone="secondary" />
        </View>
      </Section>

      <View style={styles.safeBottomPad} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 4,
    overflow: "hidden",
    borderRadius: radius.pill,
  },
  progressFill: {
    width: "100%",
    height: "100%",
  },
  heroFrame: {
    height: 150,
    overflow: "hidden",
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  benefitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  searchBox: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  searchText: {
    fontSize: 14,
    fontWeight: "800",
  },
  labelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  labelChip: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  labelText: {
    fontSize: 13,
    fontWeight: "900",
  },
  destinationCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
  },
  body: {
    fontSize: 12,
    lineHeight: 18,
  },
  noticeBox: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    paddingHorizontal: spacing.md,
  },
  noticeText: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
  },
  actions: {
    gap: spacing.sm,
  },
  safeBottomPad: {
    height: spacing.lg,
  },
});
