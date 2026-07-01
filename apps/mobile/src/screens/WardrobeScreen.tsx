import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { outfitImageAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";
import { formatOutfitTags, getOutfitTagLabel, getWardrobeCategoryLabel } from "../utils/outfitLabels";
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
  const theme = useAppTheme();
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
    <AppScreen title="내 옷장" subtitle="보유 옷과 추천 프리셋을 한곳에서 관리" badge="옷장">
      <View style={styles.topBar}>
        <FilterRow
          values={categories}
          activeValue={categoryFilter}
          onSelect={(value) => setCategoryFilter(value as WardrobeCategoryFilter)}
          renderLabel={(value) => (value === "all" ? "전체" : getWardrobeCategoryLabel(value))}
        />
      </View>

      <Section title="옷장" caption={accountLinked ? "저장 상태 계정 연결됨" : "저장 시 계정 연결 필요"} accent="gold">
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.gold }]}>옷장 확인 가능 · 저장 시 계정 연결</Text>
            <Text style={[styles.itemMeta, { color: theme.muted }]}>추천으로 복귀하거나 프리셋을 내 옷장에 추가 가능</Text>
          </View>
          <AppButton label="보기" onPress={() => onNavigate("C3")} tone="secondary" />
        </View>
        <View style={styles.heroActions}>
          <AppButton label="추천으로 복귀" onPress={() => onNavigate("C1")} tone="secondary" />
          <AppButton label="옷 추가" onPress={() => onNavigate("C3")} tone="warning" />
        </View>
      </Section>

      <Section title="내 옷장" caption={`${filteredItems.length}개 항목 · ${selectedStyles.join(" · ")}`} accent="clear">
        <View style={styles.filterStack}>
          <FilterRow
            values={seasons}
            activeValue={seasonFilter}
            onSelect={(value) => setSeasonFilter(value as WardrobeSeasonFilter)}
            renderLabel={(value) => (value === "all" ? "계절 전체" : formatOutfitTags([value]))}
          />
          <FilterRow
            values={purposes}
            activeValue={purposeFilter}
            onSelect={(value) => setPurposeFilter(value as WardrobePurposeFilter)}
            renderLabel={(value) => (value === "all" ? "목적 전체" : getOutfitTagLabel(value))}
          />
        </View>
        <View style={styles.grid}>
          {filteredItems.map((item) => (
            <WardrobeItemCard
              key={item.id}
              item={item}
              onOpen={() => onOpenWardrobeItem(item.id)}
              onToggleOwned={() => onSetWardrobeItemOwned(item.id, !item.owned)}
              badge={item.owned ? "내 옷장" : "프리셋"}
            />
          ))}
          <Pressable accessibilityRole="button" onPress={() => onNavigate("C3")} style={[styles.addTile, { borderColor: theme.border }]}>
            <Text style={[styles.addMark, { color: theme.subtle }]}>+</Text>
            <Text style={[styles.itemMeta, { color: theme.subtle }]}>추가</Text>
          </Pressable>
        </View>
      </Section>

      <Section title="빠른 이동" caption="옷장 반영은 코디 추천과 상세에도 반영됨">
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
  const theme = useAppTheme();
  const imageSource = item.imageUrl ? outfitImageAssets[item.imageUrl] : undefined;
  return (
    <View style={[styles.card, { backgroundColor: theme.cardMuted, borderColor: item.owned ? theme.clear : theme.border }]}>
      <Pressable accessibilityRole="button" onPress={onOpen} style={styles.cardMain}>
        <View style={[styles.imageWell, { backgroundColor: theme.cardStrong }]}>
          {imageSource ? <Image source={imageSource} style={styles.itemImage} resizeMode="contain" /> : <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>}
        </View>
        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.itemMeta, { color: theme.muted }]} numberOfLines={1}>{getWardrobeCategoryLabel(item.category)}</Text>
      </Pressable>
      <View style={styles.cardFooter}>
        <StatusPill label={badge} tone={item.owned ? "clear" : "sky"} />
        <AppButton
          label={item.owned ? "해제" : "추가"}
          accessibilityLabel={`${item.name} ${item.owned ? "내 옷장에서 해제" : "내 옷장에 추가"}`}
          onPress={onToggleOwned}
          tone="secondary"
        />
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
  const theme = useAppTheme();
  return (
    <View style={styles.filterRow}>
      {values.map((value) => (
        <Pressable
          key={value}
          accessibilityRole="button"
          accessibilityState={{ selected: activeValue === value }}
          onPress={() => onSelect(value)}
          style={[
            styles.filterButton,
            {
              backgroundColor: activeValue === value ? theme.gold : theme.cardMuted,
              borderColor: activeValue === value ? theme.gold : theme.border,
            },
          ]}
        >
          <Text style={[styles.filterText, { color: activeValue === value ? theme.onAccent : theme.muted }]}>{renderLabel(value)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    gap: spacing.sm,
  },
  infoCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 13,
    fontWeight: "900",
  },
  heroActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterStack: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    width: "31.5%",
    minHeight: 142,
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  cardMain: {
    gap: spacing.xs,
  },
  imageWell: {
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  itemImage: {
    width: "92%",
    height: "92%",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  itemName: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  itemMeta: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
  },
  addTile: {
    width: "31.5%",
    minHeight: 142,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addMark: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "900",
  },
});
