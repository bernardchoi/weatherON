import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { appColors, radius, spacing } from "../theme/tokens";
import type { WardrobeItem } from "@weatheron/shared";

const categories = ["all", "outer", "top", "bottom", "shoes", "accessory"] as const;
const seasons = ["all", "spring", "summer", "fall", "winter"] as const;
const purposes = ["all", "commute", "school", "travel", "outdoor", "formal", "daily"] as const;

type WardrobeCategoryFilter = (typeof categories)[number];
type WardrobeSeasonFilter = (typeof seasons)[number];
type WardrobePurposeFilter = (typeof purposes)[number];

export function WardrobeScreen({
  wardrobeItems,
  selectedStyles,
  onNavigate,
  onOpenWardrobeItem,
  onSetWardrobeItemOwned,
  accountLinked,
}: P0ScreenProps) {
  const [categoryFilter, setCategoryFilter] = React.useState<WardrobeCategoryFilter>("all");
  const [seasonFilter, setSeasonFilter] = React.useState<WardrobeSeasonFilter>("all");
  const [purposeFilter, setPurposeFilter] = React.useState<WardrobePurposeFilter>("all");

  const filteredItems = wardrobeItems.filter((item) => {
    const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;
    const seasonMatch = seasonFilter === "all" || item.seasons.includes(seasonFilter);
    const purposeMatch = purposeFilter === "all" || item.purposes.includes(purposeFilter);
    return categoryMatch && seasonMatch && purposeMatch;
  });

  return (
    <AppScreen title="옷장" subtitle="프리셋 기반 미리보기와 보유 반영으로 코디 추천이 바뀜" badge="C2">
      <Section title="필터" caption={`${filteredItems.length}개 항목`}
      >
        <Section title="카테고리" caption="preset/category 기반 필터">
          <FilterRow
            values={categories}
            activeValue={categoryFilter}
            onSelect={(value) => setCategoryFilter(value as WardrobeCategoryFilter)}
            renderLabel={(value) => (value === "all" ? "전체" : value)}
          />
        </Section>
        <Section title="계절" caption="spring/summer/fall/winter">
          <FilterRow
            values={seasons}
            activeValue={seasonFilter}
            onSelect={(value) => setSeasonFilter(value as WardrobeSeasonFilter)}
            renderLabel={(value) => (value === "all" ? "전체" : value)}
          />
        </Section>
        <Section title="목적" caption={selectedStyles.join(" · ")}>
          <FilterRow
            values={purposes}
            activeValue={purposeFilter}
            onSelect={(value) => setPurposeFilter(value as WardrobePurposeFilter)}
            renderLabel={(value) => (value === "all" ? "전체" : value)}
          />
        </Section>
      </Section>

      <Section title="프리셋 목록" caption={accountLinked ? "계정 연결 시 저장 상태 유지" : "Guest는 현재 기기 기준 미리보기 저장"}>
        <View style={styles.list}>
          {filteredItems.map((item) => (
            <WardrobeItemCard
              key={item.id}
              item={item}
              onOpen={() => onOpenWardrobeItem(item.id)}
              onToggleOwned={() => onSetWardrobeItemOwned(item.id, !item.owned)}
              badge={item.owned ? "내 옷장" : "프리셋"}
            />
          ))}
        </View>
      </Section>

      <Section title="빠른 이동" caption="옷장 반영은 C1/C4 추천에도 반영됨">
        <View style={styles.actions}>
          <AppButton label="코디 보기" onPress={() => onNavigate("C1")} />
          <AppButton label="코디 상세" onPress={() => onNavigate("C4")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function WardrobeItemCard({
  item,
  onOpen,
  onToggleOwned,
  badge,
}: {
  item: WardrobeItem;
  onOpen: () => void;
  onToggleOwned: () => void;
  badge: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <StatusPill label={badge} tone={item.owned ? "clear" : "sky"} />
      </View>
      <Text style={styles.itemMeta}>
        {item.category} · 시즌 {item.seasons.join(", ")} · 목적 {item.purposes.join(", ")}
      </Text>
      <Text style={styles.itemMeta}>태그 {item.weatherTags.join(", ")}</Text>
      <View style={styles.actions}>
        <AppButton label="상세" onPress={onOpen} tone="secondary" />
        <AppButton label={item.owned ? "보유 해제" : "옷장 추가"} onPress={onToggleOwned} />
      </View>
    </View>
  );
}

function FilterRow({
  values,
  activeValue,
  onSelect,
  renderLabel,
}: {
  values: readonly string[];
  activeValue: string;
  onSelect: (value: string) => void;
  renderLabel: (value: string) => string;
}) {
  return (
    <View style={styles.filterRow}>
      {values.map((value) => (
        <Pressable
          key={value}
          accessibilityRole="button"
          accessibilityState={{ selected: activeValue === value }}
          onPress={() => onSelect(value)}
          style={[styles.filterButton, activeValue === value ? styles.filterButtonActive : null]}
        >
          <Text style={[styles.filterText, activeValue === value ? styles.filterTextActive : null]}>{renderLabel(value)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  itemName: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "900",
    flex: 1,
  },
  itemMeta: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterButton: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  filterButtonActive: {
    borderColor: appColors.clear,
    backgroundColor: "rgba(103,232,208,0.14)",
  },
  filterText: {
    color: appColors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  filterTextActive: {
    color: appColors.clear,
  },
});
