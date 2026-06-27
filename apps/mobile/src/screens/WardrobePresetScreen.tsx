import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, spacing } from "../theme/tokens";

export function WardrobePresetScreen({
  wardrobeItems,
  selectedWardrobeItemId,
  accountLinked,
  onSetWardrobeItemOwned,
  onNavigate,
}: P0ScreenProps) {
  const activeItem = wardrobeItems.find((item) => item.id === selectedWardrobeItemId);

  if (!activeItem) {
    return (
      <AppScreen title="옷장 프리셋" subtitle="선택된 프리셋이 없음" badge="C3">
        <Section title="준비 상태" caption="옷장에서 항목을 먼저 선택해줘야 함">
          <Text style={styles.empty}>목록에서 상세 보기를 눌러 다시 접근</Text>
          <AppButton label="옷장으로" onPress={() => onNavigate("C2")} />
        </Section>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="옷장 프리셋" subtitle="프리셋 추가가 코디 추천에 반영됨" badge="C3">
      <Section
        title={activeItem.name}
        caption={`${activeItem.category} · source ${activeItem.source} · ${activeItem.owned ? "내 옷장" : "프리셋"}`}
      >
        <Text style={styles.copy}>시즌: {activeItem.seasons.join(", ")}</Text>
        <Text style={styles.copy}>목적: {activeItem.purposes.join(", ")}</Text>
        <Text style={styles.copy}>날씨 태그: {activeItem.weatherTags.join(", ")}</Text>
        <View style={styles.pillRow}>
          <StatusPill label={activeItem.owned ? "보유중" : "미보유"} tone={activeItem.owned ? "clear" : "sky"} />
          <StatusPill label={accountLinked ? "계정 연동됨" : "Guest 미리보기"} tone={accountLinked ? "clear" : "warm"} />
        </View>
      </Section>

      <Section title="옷장 반영" caption={activeItem.source === "preset" ? "프리셋에서 기본 경로로 추가하는 화면" : "직접 등록은 C3 연동 확장점검 구간"}>
        <View style={styles.actions}>
          <AppButton
            label={activeItem.owned ? "내 옷장 해제" : "옷장에 추가"}
            onPress={() => onSetWardrobeItemOwned(activeItem.id, !activeItem.owned)}
          />
          <AppButton label="직접 촬영(준비중)" tone="secondary" onPress={() => onNavigate("C2")} />
        </View>
      </Section>

      <Section title="다음 동작" caption="옷장 반영 후 C1/C4에서 결과 확인">
        <View style={styles.actions}>
          <AppButton label="코디 보기" onPress={() => onNavigate("C1")} />
          <AppButton label="옷장 목록" onPress={() => onNavigate("C2")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  copy: {
    color: appColors.text,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  empty: {
    color: appColors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
