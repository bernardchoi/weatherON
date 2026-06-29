import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import { getRouteLabel } from "../navigation/routeLabels";
import type { AccountGateState } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";

type TermsConsentScreenProps = {
  gate: AccountGateState | null;
  onComplete: () => void;
  onCancel: () => void;
};

type ConsentKey = "age" | "terms" | "privacy" | "location" | "marketing";

const consentItems: { key: ConsentKey; label: string; meta: string; required?: boolean }[] = [
  { key: "age", label: "만 14세 이상입니다", meta: "서비스 이용 가능 연령 확인", required: true },
  { key: "terms", label: "이용약관 동의", meta: "게스트·계정 연결·저장 기능 기준", required: true },
  { key: "privacy", label: "개인정보 수집·이용 동의", meta: "위치·광고 식별자·앱 사용 데이터", required: true },
  { key: "location", label: "위치기반서비스 이용약관", meta: "현재 위치와 목적지 기반 안내", required: true },
  { key: "marketing", label: "마케팅 정보 수신 동의", meta: "선택 항목 · 언제든 철회 가능" },
];

export function TermsConsentScreen({ gate, onComplete, onCancel }: TermsConsentScreenProps) {
  const theme = useAppTheme();
  const [accepted, setAccepted] = useState<Record<ConsentKey, boolean>>({
    age: false,
    terms: false,
    privacy: false,
    location: false,
    marketing: false,
  });
  const gateLabel = gate?.resumeLabel ?? "코디 저장";
  const returnLabel = getRouteLabel(gate?.returnTo);
  const requiredItems = consentItems.filter((item) => item.required);
  const requiredCount = requiredItems.filter((item) => accepted[item.key]).length;
  const requiredAccepted = requiredCount === requiredItems.length;
  const totalAccepted = consentItems.filter((item) => accepted[item.key]).length;
  const allAccepted = totalAccepted === consentItems.length;

  const statusLabel = useMemo(() => {
    if (requiredAccepted) return "필수 항목이 준비됐어요";
    return `필수 ${requiredCount}/${requiredItems.length}`;
  }, [requiredAccepted, requiredCount, requiredItems.length]);

  const toggleItem = (key: ConsentKey) => {
    setAccepted((current) => ({ ...current, [key]: !current[key] }));
  };

  const toggleAll = () => {
    const next = !allAccepted;
    setAccepted({
      age: next,
      terms: next,
      privacy: next,
      location: next,
      marketing: next,
    });
  };

  return (
    <AppScreen title="약관 동의" subtitle="약관 확인 후 바로 이어서 진행해요" badge="4/4">
      <View style={[styles.progressCard, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        <View style={styles.copy}>
          <Text style={[styles.kicker, { color: theme.clear }]}>약관 상태</Text>
          <Text style={[styles.headline, { color: theme.text }]}>{statusLabel}</Text>
          <Text style={[styles.body, { color: theme.muted }]}>동의 후 사용자가 하던 저장·알림 흐름으로 이어짐</Text>
        </View>
        <View style={[styles.countBubble, { backgroundColor: theme.cardMuted }]}>
          <Text style={[styles.countText, { color: theme.clear }]}>{requiredCount}/{requiredItems.length}</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
          <View style={[styles.progressFill, { width: `${(requiredCount / requiredItems.length) * 100}%`, backgroundColor: theme.clear }]} />
        </View>
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: allAccepted }}
        onPress={toggleAll}
        style={[styles.allRow, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}
      >
        <CheckBox checked={allAccepted} theme={theme} />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>전체 동의</Text>
          <Text style={[styles.body, { color: theme.muted }]}>필수와 선택 항목을 한 번에 변경</Text>
        </View>
      </Pressable>

      <View style={[styles.listPanel, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
        {consentItems.map((item, index) => (
          <ConsentRow
            key={item.key}
            item={item}
            checked={accepted[item.key]}
            onPress={() => toggleItem(item.key)}
            theme={theme}
            withDivider={index < consentItems.length - 1}
          />
        ))}
      </View>

      <Section title="계정 연결 결과" caption={`${gateLabel} 완료 후 ${returnLabel} 화면으로 복귀`} accent="gold">
        <View style={styles.pillRow}>
          <StatusPill label={requiredAccepted ? "필수 완료" : "필수 미완료"} tone={requiredAccepted ? "clear" : "warm"} />
          <StatusPill label={`복귀 ${returnLabel}`} tone="gold" />
          <StatusPill label={gateLabel} tone="sky" />
        </View>
        <View style={[styles.gateBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
          <Text style={[styles.gateTitle, { color: theme.clear }]}>{gateLabel}</Text>
          <Text style={[styles.body, { color: theme.muted }]}>필수 약관 완료 후 원래 화면에서 액션 상태를 이어감</Text>
          {gate?.selectedDestinationName ? <Text style={[styles.body, { color: theme.muted }]}>선택 목적지 유지 · {gate.selectedDestinationName}</Text> : null}
          {gate?.outfitVariant ? <Text style={[styles.body, { color: theme.muted }]}>코디 유형 유지 · {getOutfitVariantLabel(gate.outfitVariant)}</Text> : null}
        </View>
        <View style={styles.actions}>
          <AppButton
            label={requiredAccepted ? "동의하고 계정 연결 계속" : "필수 동의 필요"}
            onPress={() => {
              if (requiredAccepted) onComplete();
            }}
            tone={requiredAccepted ? "warning" : "secondary"}
          />
          <AppButton label="취소" onPress={onCancel} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function ConsentRow({
  item,
  checked,
  onPress,
  theme,
  withDivider,
}: {
  item: (typeof consentItems)[number];
  checked: boolean;
  onPress: () => void;
  theme: AppTheme;
  withDivider: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={[styles.consentRow, withDivider ? { borderBottomColor: theme.border, borderBottomWidth: 1 } : null]}
    >
      <CheckBox checked={checked} theme={theme} />
      <View style={styles.consentCopy}>
        <View style={styles.titleLine}>
          <Text style={[styles.requireLabel, { color: item.required ? theme.gold : theme.subtle }]}>{item.required ? "필수" : "선택"}</Text>
          <Text style={[styles.consentTitle, { color: theme.text }]}>{item.label}</Text>
        </View>
        <Text style={[styles.body, { color: theme.muted }]}>{item.meta}</Text>
      </View>
      {item.key !== "age" ? <Text style={[styles.chevron, { color: theme.subtle }]}>›</Text> : null}
    </Pressable>
  );
}

function CheckBox({ checked, theme }: { checked: boolean; theme: AppTheme }) {
  return (
    <View style={[styles.checkbox, { borderColor: checked ? theme.gold : theme.border, backgroundColor: checked ? theme.gold : theme.cardMuted }]}>
      <Text style={[styles.check, { color: checked ? theme.onAccent : "transparent" }]}>✓</Text>
    </View>
  );
}

function getOutfitVariantLabel(variant: string) {
  if (variant === "rain") return "비 대비";
  if (variant === "cold") return "보온";
  if (variant === "heat") return "더위 대비";
  if (variant === "wind") return "바람 대비";
  return "기본";
}

const styles = StyleSheet.create({
  progressCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  kicker: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  headline: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  body: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  countBubble: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    minWidth: 48,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  countText: {
    fontSize: 13,
    fontWeight: "900",
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
  },
  allRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  listPanel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  consentRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  checkbox: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  check: {
    fontSize: 17,
    fontWeight: "900",
  },
  consentCopy: {
    flex: 1,
    gap: 4,
  },
  titleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  requireLabel: {
    width: 28,
    fontSize: 11,
    fontWeight: "900",
  },
  consentTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  chevron: {
    fontSize: 20,
    fontWeight: "800",
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
    borderWidth: 1,
  },
  gateTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
