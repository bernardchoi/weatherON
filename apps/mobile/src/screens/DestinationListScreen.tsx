import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function DestinationListScreen({
  state,
  accountGateResult,
  destinationSaved,
  savedDestinations,
  recentlyRemovedDestination,
  selectedDestinationPlace,
  onNavigate,
  onRemoveSavedDestination,
  onRestoreRemovedDestination,
  onSaveDestination,
  onSelectDestinationPlace,
  onToggleSavedDestinationCare,
}: P0ScreenProps) {
  const care = state.destinationCare;
  const listItems = savedDestinations.length
    ? savedDestinations.map((destination) => ({ ...destination, saved: true }))
    : [{ place: selectedDestinationPlace, careEnabled: care.careOn, savedAtLabel: "Guest 미리보기", saved: false }];

  return (
    <AppScreen title="목적지 목록" subtitle="저장 전에도 Guest 미리보기 가능, 저장은 계정 연결 후 유지" badge="G1">
      <Section title={savedDestinations.length ? "저장된 목적지" : "미리보기 목적지"} caption={`${listItems.length}개 · ${care.nextAlertText}`}>
        {accountGateResult?.returnTo === "G1" && accountGateResult.pendingAction === "destination-care" ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{accountGateResult.message}</Text>
            <Text style={styles.resultCopy}>선택 목적지와 케어 상태를 유지한 채 목록으로 복귀함</Text>
          </View>
        ) : null}
        <View style={styles.list}>
          {listItems.map((item) => {
            const active = selectedDestinationPlace.id === item.place.id;
            return (
              <View
                key={item.place.id}
                style={[styles.destinationCard, active ? styles.destinationCardActive : null]}
              >
                <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onSelectDestinationPlace(item.place)} style={styles.selectArea}>
                  <View style={styles.destinationHeader}>
                    <View style={styles.copy}>
                      <Text style={styles.name}>{item.place.name}</Text>
                      <Text style={styles.meta}>
                        {item.place.category.toUpperCase()} · {item.place.address}
                      </Text>
                    </View>
                    <StatusPill label={item.saved ? (item.careEnabled ? "케어 ON" : "케어 OFF") : "Guest"} tone={item.saved && item.careEnabled ? "clear" : "warm"} />
                  </View>
                  {active ? (
                    <View style={styles.metricRow}>
                      <Metric label="출발지" value={`${care.originWeather.current.feelsLikeC}도`} />
                      <Metric label="목적지" value={`${care.destinationWeather.current.feelsLikeC}도`} />
                      <Metric label="강수" value={`${care.destinationWeather.current.rainProbabilityPct}%`} />
                    </View>
                  ) : null}
                </Pressable>
                <View style={styles.destinationFooter}>
                  <Text style={styles.meta}>{item.savedAtLabel}</Text>
                  <View style={styles.inlineActions}>
                    <StatusPill label={item.place.provider.toUpperCase()} tone="gold" />
                    {item.saved ? (
                      <AppButton
                        label={item.careEnabled ? "케어 끄기" : "케어 켜기"}
                        onPress={() => {
                          onSelectDestinationPlace(item.place);
                          onToggleSavedDestinationCare(item.place.id);
                        }}
                        tone="secondary"
                      />
                    ) : null}
                    {item.saved ? <AppButton label="삭제" onPress={() => onRemoveSavedDestination(item.place.id)} tone="warning" /> : null}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.actions}>
          <AppButton label="케어 보기" onPress={() => onNavigate("G2")} />
          <AppButton label={destinationSaved ? "목적지 추가" : "저장"} onPress={() => (destinationSaved ? onNavigate("P1") : onSaveDestination("G1"))} tone="secondary" />
        </View>
      </Section>

      {recentlyRemovedDestination ? (
        <Section title="최근 삭제" caption="잘못 지운 목적지는 바로 복구 가능함">
          <View style={styles.restoreCard}>
            <View style={styles.copy}>
              <Text style={styles.name}>{recentlyRemovedDestination.place.name}</Text>
              <Text style={styles.meta}>
                {recentlyRemovedDestination.place.category.toUpperCase()} · {recentlyRemovedDestination.savedAtLabel}
              </Text>
            </View>
            <AppButton label="복구" onPress={onRestoreRemovedDestination} tone="secondary" />
          </View>
        </Section>
      ) : null}

      <Section title="목적지 메뉴" caption="추가, 준비 가이드, 필터 허브로 같은 목적지 상태를 공유함">
        <View style={styles.actions}>
          <AppButton label="목적지 추가" onPress={() => onNavigate("P1")} />
          <AppButton label="허브" onPress={() => onNavigate("P3")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  destinationCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  resultBox: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(103,232,208,0.12)",
    borderWidth: 1,
    borderColor: "rgba(103,232,208,0.26)",
  },
  resultTitle: {
    color: appColors.clear,
    fontSize: 14,
    fontWeight: "900",
  },
  resultCopy: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  selectArea: {
    gap: spacing.md,
  },
  destinationCardActive: {
    borderColor: appColors.clear,
    backgroundColor: "rgba(103,232,208,0.12)",
  },
  destinationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  name: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  meta: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  metricRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  destinationFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  restoreCard: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(248,196,113,0.32)",
  },
  metric: {
    flex: 1,
    minHeight: 62,
    justifyContent: "center",
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: "rgba(16,36,63,0.48)",
  },
  metricLabel: {
    color: appColors.subtle,
    fontSize: 11,
    fontWeight: "800",
  },
  metricValue: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
