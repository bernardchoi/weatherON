import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import type { AgeBand, FitPreference, StyleGender } from "../state/useWeatherOnAppState";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

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
  onSetStyleGender,
  onSetAgeBand,
  onSetFitPreference,
  onToggleStyleTag,
  onSaveStyleProfile,
  onNavigate,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const topTags = selectedStyles.slice(0, 2);

  return (
    <AppScreen title="코디 추천 기준을 골라주세요" subtitle="스타일은 복수 선택 가능 · 성별과 연령대는 추천 보정에만 사용" badge="1 / 3">
      <View style={[styles.progressTrack, { backgroundColor: theme.cardMuted }]}>
        <View style={[styles.progressFill, { backgroundColor: theme.gold }]} />
      </View>

      <Section title="스타일 태그" caption="오늘 입을 옷의 무드를 정함" accent="gold">
        <OptionGrid>
          {styleTags.slice(0, 5).map((item) => (
            <ChoiceButton key={item} label={item} selected={selectedStyles.includes(item)} onPress={() => onToggleStyleTag(item)} />
          ))}
        </OptionGrid>
      </Section>

      <Section title="코디 및 기준" caption="가입 정보가 아니라 추천 실루엣 기준">
        <OptionGrid>
          {genderOptions.map((item) => (
            <ChoiceButton key={item.value} label={item.label} selected={item.value === styleGender} onPress={() => onSetStyleGender(item.value)} />
          ))}
        </OptionGrid>
      </Section>

      <Section title="추천 연령대" caption="코디 톤과 브랜드 무드 보정용">
        <OptionGrid>
          {ageOptions.map((item) => (
            <ChoiceButton key={item} label={item} selected={item === ageBand} onPress={() => onSetAgeBand(item)} />
          ))}
        </OptionGrid>
      </Section>

      <Section title="핏 기준" caption="오늘 코디의 기본 실루엣">
        <OptionGrid>
          {fitOptions.map((item) => (
            <ChoiceButton key={item.value} label={item.label} selected={item.value === fitPreference} onPress={() => onSetFitPreference(item.value)} />
          ))}
        </OptionGrid>
      </Section>

      <Section title="스타일" caption={`${selectedStyles.length}개 태그 · ${getGenderLabel(styleGender)} · ${ageBand}`} accent="clear">
        <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.previewIllustration}>
            <View style={[styles.clothTile, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.clothText, { color: theme.clear }]}>상의</Text>
            </View>
            <View style={[styles.clothTile, { backgroundColor: theme.cardStrong }]}>
              <Text style={[styles.clothText, { color: theme.clear }]}>하의</Text>
            </View>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            {topTags.length ? topTags.join(" · ") : "스타일"} 스타일로 추천
          </Text>
          <View style={styles.pillRow}>
            <StatusPill label={getFitLabel(fitPreference)} tone="sky" />
            <StatusPill label={ageBand} tone="gold" />
            <StatusPill label={styleProfileSaved ? "준비" : "편집"} tone={styleProfileSaved ? "clear" : "gold"} />
          </View>
        </View>
      </Section>

      <Section title="저장" caption="온보딩에서는 알림 기준으로 이어짐" accent="gold">
        <View style={styles.actions}>
          <AppButton label="다음" onPress={() => onSaveStyleProfile("O5")} tone="warning" />
          <AppButton label="MY에 저장" onPress={() => onSaveStyleProfile("M1")} tone="secondary" />
          <AppButton label="코디로" onPress={() => onNavigate("C1")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function OptionGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.optionGrid}>{children}</View>;
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
  previewCard: {
    minHeight: 168,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  previewIllustration: {
    flexDirection: "row",
    gap: spacing.md,
  },
  clothTile: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
  },
  clothText: {
    fontSize: 12,
    fontWeight: "900",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
  },
});
