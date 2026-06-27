import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { AccountGateState } from "../state/useWeatherOnAppState";
import { appColors, radius, spacing } from "../theme/tokens";

type AccountConnectScreenProps = {
  gate: AccountGateState | null;
  onComplete: () => void;
  onCancel: () => void;
};

export function AccountConnectScreen({ gate, onComplete, onCancel }: AccountConnectScreenProps) {
  const gateLabel = gate?.resumeLabel ?? "코디 저장";

  return (
    <AppScreen title="계정 연결" subtitle="저장과 동기화가 필요한 순간에만 계정 연결을 요청함" badge="A2">
      <Section title="추천 로그인 방법" caption="국가 선택 없이 지역과 기기 기준으로 자동 추천">
        <View style={styles.providerList}>
          {["Kakao", "Naver", "LINE", "Apple", "Google", "Email"].map((provider) => (
            <View key={provider} style={styles.providerRow}>
              <Text style={styles.provider}>{provider}</Text>
              {provider === "Kakao" ? <StatusPill label="추천" tone="gold" /> : null}
            </View>
          ))}
        </View>
      </Section>

      <Section title="복귀 위치" caption={`${gateLabel} 완료 후 ${gate?.returnTo ?? "H1"} 화면으로 돌아감`}>
        <View style={styles.gateBox}>
          <Text style={styles.gateTitle}>{gateLabel}</Text>
          <Text style={styles.gateCopy}>대기 액션 {gateLabel} · 복귀 화면 {gate?.returnTo ?? "H1"}</Text>
          {gate?.selectedDestinationName ? <Text style={styles.gateCopy}>선택 목적지 유지 · {gate.selectedDestinationName}</Text> : null}
          {gate?.outfitVariant ? <Text style={styles.gateCopy}>코디 variant 유지 · {gate.outfitVariant}</Text> : null}
        </View>
        <View style={styles.actions}>
          <AppButton label="계정 연결 완료" onPress={onComplete} />
          <AppButton label="취소" onPress={onCancel} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  providerList: {
    gap: spacing.sm,
  },
  providerRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  provider: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  gateBox: {
    gap: 4,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(103,232,208,0.12)",
    borderWidth: 1,
    borderColor: "rgba(103,232,208,0.26)",
  },
  gateTitle: {
    color: appColors.clear,
    fontSize: 15,
    fontWeight: "900",
  },
  gateCopy: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
