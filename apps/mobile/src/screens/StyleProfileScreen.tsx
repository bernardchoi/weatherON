import React from "react";
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "../localization/react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import type { P0ScreenProps } from "../navigation/types";
import type { AgeBand, FitPreference, StyleGender } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, semanticColor, spacing } from "../theme/tokens";

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
  const { fontScale } = useWindowDimensions();
  const isEditing = onboardingCompleted;
  const primarySaveLabel = isEditing ? "저장하고 코디로" : "다음";
  const primaryReturnTo = onboardingCompleted ? "C1" : "O5";

  return (
    <AppScreen
      title={isEditing ? "코디 기준 수정" : "코디 추천 기준을 골라주세요"}
      subtitle={isEditing ? "저장하면 코디 추천에 바로 반영" : "스타일은 복수 선택 가능 · 성별과 연령대는 추천 보정에만 사용"}
      badge={isEditing ? undefined : "1 / 3"}
      onBack={isEditing ? onGoBack : undefined}
      showWordmark={false}
      compactHeader={isEditing}
      stackedHeader={fontScale > 1.3}
      contentGap={spacing.xs}
      footer={
        <View style={[styles.actions, fontScale > 1.3 && { flexDirection: "column" }]}>
          {isEditing ? <View style={styles.cancelAction}><AppButton label="취소" onPress={() => onNavigate("C1")} tone="secondary" variant="text" size="sm" /></View> : null}
          <View style={styles.saveAction}><AppButton label={primarySaveLabel} onPress={() => onSaveStyleProfile(primaryReturnTo)} tone="warning" /></View>
        </View>
      }
    >
      {!isEditing ? (
        <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.gold }]} />
        </View>
      ) : null}

      <Section title="스타일 태그" caption="오늘 입을 옷의 무드를 정함" accent="gold">
        <OptionGrid columns={3}>
          {styleTags.slice(0, 5).map((item) => (
            <ChoiceButton key={item} label={item} selected={selectedStyles.includes(item)} onPress={() => onToggleStyleTag(item)} />
          ))}
        </OptionGrid>
      </Section>

      <View style={{ gap: spacing.xl }}>
        <CriterionGroup label="성별 기준" columns={3}>
          {genderOptions.map((item) => (
            <ChoiceButton key={item.value} label={item.label} selected={item.value === styleGender} onPress={() => onSetStyleGender(item.value)} />
          ))}
        </CriterionGroup>
        <CriterionGroup label="연령대" columns={3}>
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
    </AppScreen>
  );
}

function OptionGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: 2 | 3 }) {
  const { width, fontScale } = useWindowDimensions();
  const threeColumns = columns === 3 && width >= 360 && fontScale <= 1.3;
  return <View style={styles.optionGrid}>{React.Children.map(children, child => (
    <View style={{ width: threeColumns ? "33.333333%" : "50%", paddingHorizontal: spacing.xs / 2 }}>{child}</View>
  ))}</View>;
}

function CriterionGroup({ label, children, columns }: { label: string; children: React.ReactNode; columns?: 2 | 3 }) {
  const theme = useAppTheme();
  return (
    <View style={styles.criterionGroup}>
      <Text style={[styles.criterionLabel, { color: theme.muted }]}>{label}</Text>
      <OptionGrid columns={columns}>{children}</OptionGrid>
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
        { backgroundColor: selected ? semanticColor(theme, "accentTint") : semanticColor(theme, "surfacePassive"), borderColor: selected ? theme.gold : theme.border },
      ]}
    >
      <Text style={[[styles.choiceText, { color: selected ? theme.text : theme.muted }], Platform.OS === "ios" && ambientVisual.choiceText]}>{label}</Text>
    </Pressable>
  );
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
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.xs,
    marginHorizontal: -spacing.xs / 2,
  },
  criterionGroup: {
    gap: spacing.sm,
  },
  criterionLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  choice: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    paddingVertical: spacing.sm,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  choiceText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cancelAction: { flex: 1, width: "100%", justifyContent: "center" },
  saveAction: { flex: 2, width: "100%" },
});

const ambientVisual = StyleSheet.create({
  choiceText: { fontSize: 15, lineHeight: 22, fontWeight: "600" },
});
