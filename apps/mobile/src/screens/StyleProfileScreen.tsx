import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import type { AgeBand, FitPreference, StyleGender } from "../state/useWeatherOnAppState";
import { appColors, radius, spacing } from "../theme/tokens";

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
  return (
    <AppScreen title="스타일 기준" subtitle="성별·연령대·스타일 태그·핏 기준을 Settings State에 저장" badge="O4">
      <Section title="프로필 상태" caption="C1 추천과 MY 설정에서 같은 기준을 공유">
        <View style={styles.statusCard}>
          <View style={styles.copy}>
            <Text style={styles.title}>{styleProfileSaved ? "스타일 기준 저장됨" : "스타일 기준 선택 중"}</Text>
            <Text style={styles.body}>{selectedStyles.length}개 태그 · {getFitLabel(fitPreference)} · {ageBand}</Text>
          </View>
          <StatusPill label={styleProfileSaved ? "SAVED" : "편집"} tone={styleProfileSaved ? "clear" : "gold"} />
        </View>
      </Section>

      <Section title="성별 기준" caption="추천 필터 기준이며 가입 정보가 아님">
        <OptionGrid>
          {genderOptions.map((item) => (
            <ChoiceButton key={item.value} label={item.label} selected={item.value === styleGender} onPress={() => onSetStyleGender(item.value)} />
          ))}
        </OptionGrid>
      </Section>

      <Section title="연령대" caption="코디 톤과 아이템 우선순위에만 사용">
        <OptionGrid>
          {ageOptions.map((item) => (
            <ChoiceButton key={item} label={item} selected={item === ageBand} onPress={() => onSetAgeBand(item)} />
          ))}
        </OptionGrid>
      </Section>

      <Section title="스타일 태그" caption="최대 4개까지 선택">
        <OptionGrid>
          {styleTags.map((item) => (
            <ChoiceButton key={item} label={item} selected={selectedStyles.includes(item)} onPress={() => onToggleStyleTag(item)} />
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

      <Section title="저장" caption="온보딩에서는 O5로, 설정 진입에서는 MY로 복귀 가능">
        <View style={styles.actions}>
          <AppButton label="저장하고 알림 기준" onPress={() => onSaveStyleProfile("O5")} />
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
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.choice, selected ? styles.choiceSelected : null]}>
      <Text style={[styles.choiceText, selected ? styles.choiceTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

function getFitLabel(value: FitPreference) {
  return fitOptions.find((item) => item.value === value)?.label ?? "스탠다드";
}

const styles = StyleSheet.create({
  statusCard: {
    minHeight: 78,
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
    fontSize: 15,
    fontWeight: "900",
  },
  body: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
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
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  choiceSelected: {
    backgroundColor: "rgba(103,232,208,0.16)",
    borderColor: appColors.clear,
  },
  choiceText: {
    color: appColors.muted,
    fontSize: 13,
    fontWeight: "900",
  },
  choiceTextSelected: {
    color: appColors.clear,
  },
  actions: {
    gap: spacing.sm,
  },
});
