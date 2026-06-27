import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";

export function OutfitDetailScreen({ state, accountLinked, termsRequiredAccepted, outfitSaved, accountGateResult, onNavigate, onRequireAccount }: P0ScreenProps) {
  const items = Object.entries(state.outfit.items).filter((entry) => Boolean(entry[1]));
  const canSaveDirectly = accountLinked && termsRequiredAccepted;

  return (
    <AppScreen title="코디 상세" subtitle="아이템별 근거와 저장 전 계정 gate 위치를 분리함" badge="C4">
      <Section title="착장 구성" caption={state.outfit.decisionText}>
        {items.map(([slot, item]) =>
          item ? (
            <View key={slot} style={styles.itemRow}>
              <View style={styles.thumb}>
                <Text style={styles.thumbText}>{slot.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.purposes.join(" · ")} · {item.weatherTags.join(" · ")}
                </Text>
              </View>
            </View>
          ) : null,
        )}
      </Section>

      <Section title="추천 근거" caption={`매칭률 ${state.outfit.matchPct}%`}>
        {state.outfit.reasons.map((reason) => (
          <Text key={reason} style={styles.reason}>· {reason}</Text>
        ))}
      </Section>

      <Section title="저장 흐름" caption={outfitSaved ? "코디 저장 완료. C1/C4에서 같은 상태를 공유함" : "Guest는 저장 시 계정 연결 화면으로 이동해야 함"}>
        {accountGateResult?.returnTo === "C4" && accountGateResult.pendingAction === "save-outfit" ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{accountGateResult.message}</Text>
            <Text style={styles.resultCopy}>계정 연결과 약관 동의 후 C4 저장 상태로 복귀함</Text>
          </View>
        ) : null}
        <View style={styles.pillRow}>
          <StatusPill label={accountLinked ? "계정 연결됨" : "계정 gate 필요"} tone={accountLinked ? "clear" : "gold"} />
          <StatusPill label={termsRequiredAccepted ? "약관 완료" : "필수 약관 대기"} tone={termsRequiredAccepted ? "clear" : "warm"} />
          <StatusPill label={outfitSaved ? "저장 완료" : "저장 전"} tone={outfitSaved ? "clear" : "sky"} />
        </View>
        <View style={styles.actions}>
          <AppButton
            label={outfitSaved ? "저장 완료" : canSaveDirectly ? "코디 저장" : "계정 연결 후 저장"}
            onPress={() => onRequireAccount("save-outfit", "C4")}
            tone={outfitSaved ? "secondary" : "warning"}
          />
          <AppButton label="코디로 돌아가기" onPress={() => onNavigate("C1")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  thumb: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: "rgba(103,232,208,0.14)",
    borderWidth: 1,
    borderColor: "rgba(103,232,208,0.32)",
  },
  thumbText: {
    color: appColors.clear,
    fontSize: 12,
    fontWeight: "900",
  },
  itemCopy: {
    flex: 1,
  },
  itemName: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  itemMeta: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  reason: {
    color: appColors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
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
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
