import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { AccountGateState } from "../state/useWeatherOnAppState";
import { appColors, radius, spacing } from "../theme/tokens";

type TermsConsentScreenProps = {
  gate: AccountGateState | null;
  onComplete: () => void;
  onCancel: () => void;
};

export function TermsConsentScreen({ gate, onComplete, onCancel }: TermsConsentScreenProps) {
  const [requiredAccepted, setRequiredAccepted] = useState(true);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const gateLabel = gate?.resumeLabel ?? "코디 저장";

  return (
    <AppScreen title="약관 동의" subtitle="필수 항목만 동의하면 저장 액션을 이어서 완료함" badge="A3">
      <Section title="필수 동의" caption={`${gateLabel} 완료 후 ${gate?.returnTo ?? "H1"} 화면으로 복귀`}>
        <ConsentRow label="서비스 이용약관" required checked={requiredAccepted} onPress={() => setRequiredAccepted((value) => !value)} />
        <ConsentRow label="개인정보 처리방침" required checked={requiredAccepted} onPress={() => setRequiredAccepted((value) => !value)} />
        <ConsentRow label="마케팅 수신 동의" checked={marketingAccepted} onPress={() => setMarketingAccepted((value) => !value)} />
      </Section>

      <Section title="계정 gate 결과" caption="저장/동기화 액션은 약관 완료 뒤 원래 화면에서 상태로 표시">
        <View style={styles.pillRow}>
          <StatusPill label={requiredAccepted ? "필수 완료" : "필수 대기"} tone={requiredAccepted ? "clear" : "warm"} />
          <StatusPill label={`복귀 ${gate?.returnTo ?? "H1"}`} tone="gold" />
          <StatusPill label={gateLabel} tone="sky" />
        </View>
        <View style={styles.gateBox}>
          <Text style={styles.gateTitle}>{gateLabel}</Text>
          <Text style={styles.gateCopy}>필수 약관 완료 후 원래 화면에서 액션 상태를 이어감</Text>
          {gate?.selectedDestinationName ? <Text style={styles.gateCopy}>선택 목적지 유지 · {gate.selectedDestinationName}</Text> : null}
          {gate?.outfitVariant ? <Text style={styles.gateCopy}>코디 variant 유지 · {gate.outfitVariant}</Text> : null}
        </View>
        <View style={styles.actions}>
          <AppButton label={requiredAccepted ? "동의하고 계속" : "필수 동의 필요"} onPress={() => {
            if (requiredAccepted) onComplete();
          }} />
          <AppButton label="취소" onPress={onCancel} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

type ConsentRowProps = {
  label: string;
  checked: boolean;
  required?: boolean;
  onPress: () => void;
};

function ConsentRow({ label, checked, required, onPress }: ConsentRowProps) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={styles.consentRow}>
      <View style={[styles.checkbox, checked ? styles.checkboxOn : null]}>
        <Text style={styles.check}>{checked ? "✓" : ""}</Text>
      </View>
      <View style={styles.consentCopy}>
        <Text style={styles.consentTitle}>{label}</Text>
        <Text style={styles.consentMeta}>{required ? "필수" : "선택"}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  consentRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  checkbox: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  checkboxOn: {
    borderColor: appColors.clear,
    backgroundColor: appColors.clear,
  },
  check: {
    color: appColors.navy,
    fontSize: 17,
    fontWeight: "900",
  },
  consentCopy: {
    flex: 1,
  },
  consentTitle: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  consentMeta: {
    color: appColors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
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
