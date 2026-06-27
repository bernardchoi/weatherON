import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function OnboardingDestinationScreen({ selectedDestinationPlace, savedDestinations, onSaveDestination, onNavigate, onCompleteOnboarding }: P0ScreenProps) {
  const saved = savedDestinations.some((item) => item.place.id === selectedDestinationPlace.id);

  return (
    <AppScreen title="목적지 등록" subtitle="선택 설정. 건너뛰어도 Mode A 자동 케어는 계속 작동" badge="O6">
      <Section title="현재 후보" caption="P1 장소 검색에서 같은 목적지 상태를 공유">
        <View style={styles.destinationCard}>
          <View style={styles.copy}>
            <Text style={styles.title}>{selectedDestinationPlace.name}</Text>
            <Text style={styles.body}>{selectedDestinationPlace.address} · {selectedDestinationPlace.provider.toUpperCase()}</Text>
          </View>
          <StatusPill label={saved ? "저장됨" : "선택"} tone={saved ? "clear" : "gold"} />
        </View>
      </Section>

      <Section title="목적지 케어" caption="등록 시 G1/G2/P3와 같은 저장 목록으로 연결">
        <Text style={styles.body}>목적지 날씨 비교, 출발 전 급변 알림, 준비 가이드가 활성화됨</Text>
        <View style={styles.actions}>
          <AppButton label={saved ? "G1에서 보기" : "목적지 등록"} onPress={() => (saved ? onNavigate("G1") : onSaveDestination("G1"))} />
          <AppButton label="장소 검색" onPress={() => onNavigate("P1")} tone="secondary" />
        </View>
      </Section>

      <Section title="건너뛰기" caption="목적지는 MY나 출발 탭에서 나중에 추가 가능">
        <View style={styles.actions}>
          <AppButton label="홈으로 완료" onPress={() => onCompleteOnboarding("H1")} tone="secondary" />
          <AppButton label="목적지 목록" onPress={() => onNavigate("G1")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  destinationCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  body: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    gap: spacing.sm,
  },
});
