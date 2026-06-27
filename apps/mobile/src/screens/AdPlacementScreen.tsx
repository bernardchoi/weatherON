import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

const allowedPlacements = ["홈 하단 네이티브 광고 1개", "목적지 상세 하단 보조 슬롯", "세션 제한 전면 광고"];
const blockedPlacements = ["알림 푸시 내부 광고", "앱 시작 즉시 전면 광고", "화면 전환마다 반복 광고"];

export function AdPlacementScreen({ onNavigate }: P0ScreenProps) {
  return (
    <AppScreen title="광고 배치 기준" subtitle="AdMob 승인 전 앱 내 정책과 금지 배치를 명확히 표시" badge="R4">
      <Section title="허용 배치" caption="콘텐츠와 명확히 구분되는 슬롯만 사용">
        {allowedPlacements.map((item) => (
          <PlacementRow key={item} label={item} tone="clear" />
        ))}
      </Section>

      <Section title="금지 배치" caption="사용자 신뢰와 알림 피로를 해치는 방식 제외">
        {blockedPlacements.map((item) => (
          <PlacementRow key={item} label={item} tone="warm" />
        ))}
      </Section>

      <Section title="이동" caption="광고 동의 관리와 정책 허브로 복귀">
        <View style={styles.actions}>
          <AppButton label="광고 동의" onPress={() => onNavigate("R3")} />
          <AppButton label="R1 복귀" onPress={() => onNavigate("R1")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function PlacementRow({ label, tone }: { label: string; tone: "clear" | "warm" }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <StatusPill label={tone === "clear" ? "허용" : "금지"} tone={tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  label: {
    flex: 1,
    color: appColors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800",
  },
  actions: {
    gap: spacing.sm,
  },
});
