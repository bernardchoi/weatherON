import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import type { AgeBand, FitPreference, StyleGender } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";

const genderOptions: { value: StyleGender; label: string }[] = [
  { value: "all", label: "공통" },
  { value: "women", label: "여성" },
  { value: "men", label: "남성" },
];
const ageOptions: AgeBand[] = ["10-20", "20-30", "30-40", "40-50", "50+"];
const fitOptions: { value: FitPreference; label: string }[] = [
  { value: "standard", label: "스탠다드" },
  { value: "relaxed", label: "릴랙스" },
  { value: "formal", label: "포멀" },
  { value: "outdoor", label: "아웃도어" },
];
const styleTags = ["미니멀", "캐주얼", "스트릿", "포멀", "아웃도어", "페미닌", "스포티", "클래식"];

export function StyleProfileScreen({
  styleProfileSaved,
  styleGender,
  ageBand,
  fitPreference,
  selectedStyles,
  onboardingCompleted,
  onSetStyleGender,
  onSetAgeBand,
  onSetFitPreference,
  onToggleStyleTag,
  onSaveStyleProfile,
  onNavigate,
  onGoBack,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const topTags = selectedStyles.slice(0, 2);
  const isEditing = onboardingCompleted;
  const primarySaveLabel = isEditing ? "저장하고 코디로" : "다음";
  const primaryReturnTo = onboardingCompleted ? "C1" : "O5";

  return (
    <AppScreen
      title={isEditing ? "코디 기준 수정" : "코디 추천 기준을 골라주세요"}
      subtitle={isEditing ? "저장하면 코디 추천에 바로 반영" : "스타일은 복수 선택 가능 · 성별과 연령대는 추천 보정에만 사용"}
      badge={isEditing ? undefined : "1 / 3"}
      onBack={isEditing ? onGoBack : undefined}
      footer={
        <View style={styles.actions}>
          <AppButton label={primarySaveLabel} onPress={() => onSaveStyleProfile(primaryReturnTo)} tone="warning" />
          {isEditing ? <AppButton label="취소" onPress={() => onNavigate("C1")} tone="secondary" /> : null}
        </View>
      }
    >
      {!isEditing ? (
        <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.gold }]} />
        </View>
      ) : null}

      <Section title="스타일 태그" caption="오늘 입을 옷의 무드를 정함" accent="gold">
        <OptionGrid>
          {styleTags.slice(0, 5).map((item) => (
            <ChoiceButton key={item} label={item} selected={selectedStyles.includes(item)} onPress={() => onToggleStyleTag(item)} />
          ))}
        </OptionGrid>
      </Section>

      <Section title="추천 기준" caption="추천 보정에 쓰는 성별·연령대·핏 기준">
        <View style={styles.criteriaStack}>
          <CriterionGroup label="성별 기준">
            {genderOptions.map((item) => (
              <ChoiceButton key={item.value} label={item.label} selected={item.value === styleGender} onPress={() => onSetStyleGender(item.value)} />
            ))}
          </CriterionGroup>
          <CriterionGroup label="연령대">
            {ageOptions.map((item) => (
              <ChoiceButton key={item} label={item} selected={item === ageBand} onPress={() => onSetAgeBand(item)} />
            ))}
          </CriterionGroup>
          <CriterionGroup label="핏">
            {fitOptions.map((item) => (
              <ChoiceButton key={item.value} label={item.label} selected={item.value === fitPreference} onPress={() => onSetFitPreference(item.value)} />
            ))}
          </CriterionGroup>
        </View>
      </Section>

      <Section title="현재 선택 기준" caption={`${selectedStyles.length}개 태그 · ${getGenderLabel(styleGender)} · ${ageBand}`} accent="clear">
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.title, { color: theme.text }]}>
              {topTags.length ? topTags.join(" · ") : "스타일 미선택"}
            </Text>
            <StatusPill label={styleProfileSaved ? "저장됨" : "편집중"} tone={styleProfileSaved ? "clear" : "gold"} />
          </View>
          <View style={styles.pillRow}>
            <StatusPill label={getGenderLabel(styleGender)} tone="clear" />
            <StatusPill label={getFitLabel(fitPreference)} tone="sky" />
            <StatusPill label={ageBand} tone="gold" />
          </View>
        </View>
      </Section>

    </AppScreen>
  );
}

function OptionGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.optionGrid}>{children}</View>;
}

function CriterionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={styles.criterionGroup}>
      <Text style={[styles.criterionLabel, { color: theme.subtle }]}>{label}</Text>
      <OptionGrid>{children}</OptionGrid>
    </View>
  );
}

function ChoiceButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.choice,
        { backgroundColor: selected ? theme.gold : theme.cardMuted, borderColor: selected ? theme.gold : theme.border },
      ]}
    >
      <Text style={[styles.choiceText, { color: selected ? theme.onAccent : theme.muted }]}>{label}</Text>
    </Pressable>
  );
}

function getFitLabel(value: FitPreference) {
  return fitOptions.find((item) => item.value === value)?.label ?? "스탠다드";
}

function getGenderLabel(value: StyleGender) {
  return genderOptions.find((item) => item.value === value)?.label ?? "공통";
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 4,
    overflow: "hidden",
    borderRadius: radius.pill,
  },
  progressFill: {
    width: "34%",
    height: "100%",
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 15,
    fontWeight: "900",
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  criteriaStack: {
    gap: spacing.md,
  },
  criterionGroup: {
    gap: spacing.xs,
  },
  criterionLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  choice: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  choiceText: {
    fontSize: 13,
    fontWeight: "900",
  },
  summaryCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
  },
});
