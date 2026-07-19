import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { outfitImageAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { FilterRow } from "../components/FilterRow";
import { Section } from "../components/Section";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing, type AppTheme } from "../theme/tokens";
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
  recentlyRemovedWardrobeItemId,
  onNavigate,
  onOpenWardrobeItem,
  onRemoveWardrobeItem,
  onRestoreRemovedWardrobeItem,
  accountLinked,
  onGoBack,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const [categoryFilter, setCategoryFilter] = React.useState<WardrobeCategoryFilter>("all");
  const [seasonFilter, setSeasonFilter] = React.useState<WardrobeSeasonFilter>("all");
  const [purposeFilter, setPurposeFilter] = React.useState<WardrobePurposeFilter>("all");

  const ownedItems = wardrobeItems.filter((item) => item.owned);
  const removedItem = recentlyRemovedWardrobeItemId
    ? wardrobeItems.find((item) => item.id === recentlyRemovedWardrobeItemId)
    : undefined;

  const filteredItems = ownedItems.filter((item) => {
    const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;
    const seasonMatch = seasonFilter === "all" || item.seasons.includes(seasonFilter);
    const purposeMatch = purposeFilter === "all" || item.purposes.includes(purposeFilter);
    return categoryMatch && seasonMatch && purposeMatch;
  });

  return (
    <AppScreen title="내 옷장" subtitle="보유한 옷을 확인하고 정리" badge={`${ownedItems.length}개 보유`} onBack={onGoBack} showWordmark={false}>
      <View style={styles.topBar}>
        <FilterRow
          values={categories}
          activeValue={categoryFilter}
          onSelect={(value) => setCategoryFilter(value as WardrobeCategoryFilter)}
          renderLabel={(value) => (value === "all" ? "전체" : getWardrobeCategoryLabel(value))}
        />
      </View>

      {removedItem ? (
        <RemovedItemBanner itemName={removedItem.name} onRestore={onRestoreRemovedWardrobeItem} theme={theme} />
      ) : null}

      <Section title="옷장" caption={accountLinked ? "저장 상태 계정 연결됨" : "저장 시 계정 연결 필요"} accent="gold">
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.gold }]}>내 옷장 {ownedItems.length}개 보유 중</Text>
            <Text style={[styles.itemMeta, { color: theme.muted }]}>추천으로 복귀하거나 프리셋을 내 옷장에 추가 가능</Text>
          </View>
          <AppButton label="추천으로 복귀" onPress={() => onNavigate("C1")} tone="secondary" />
        </View>
        <View style={styles.heroActions}>
          <AppButton label="아이템 추가" onPress={() => onNavigate("C3")} tone="warning" />
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
        {ownedItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.muted }]}>아직 추가한 옷이 없음 · 프리셋에서 골라 추가해줘</Text>
            <AppButton label="아이템 추가" onPress={() => onNavigate("C3")} tone="warning" />
          </View>
        ) : filteredItems.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.muted }]}>조건에 맞는 옷이 없음 · 필터를 초기화해줘</Text>
        ) : (
          <View style={styles.grid}>
            {filteredItems.map((item) => (
              <WardrobeItemCard
                key={item.id}
                item={item}
                onOpen={() => onOpenWardrobeItem(item.id)}
                onRemove={() => onRemoveWardrobeItem(item.id)}
              />
            ))}
            <Pressable accessibilityRole="button" onPress={() => onNavigate("C3")} style={[styles.addTile, { borderColor: theme.border }]}>
              <Text style={[styles.addMark, { color: theme.subtle }]}>+</Text>
              <Text style={[styles.itemMeta, { color: theme.subtle }]}>추가</Text>
            </Pressable>
          </View>
        )}
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
  onRemove,
}: {
  item: WardrobeItem;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const theme = useAppTheme();
  const imageSource = item.imageUrl ? outfitImageAssets[item.imageUrl] : undefined;
  return (
    <View style={[styles.card, { backgroundColor: theme.cardMuted, borderColor: theme.clear }]}>
      <Pressable accessibilityRole="button" onPress={onOpen} style={styles.cardMain}>
        <View style={[styles.imageWell, { backgroundColor: theme.cardStrong }]}>
          {imageSource ? <Image source={imageSource} style={styles.itemImage} resizeMode="contain" /> : <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>}
        </View>
        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.itemMeta, { color: theme.muted }]} numberOfLines={1}>{getWardrobeCategoryLabel(item.category)}</Text>
      </Pressable>
      <AppButton
        label="삭제"
        accessibilityLabel={`${item.name} 내 옷장에서 삭제`}
        onPress={onRemove}
        tone="warning"
        variant="outlined"
        size="sm"
      />
    </View>
  );
}

function RemovedItemBanner({
  itemName,
  onRestore,
  theme,
}: {
  itemName: string;
  onRestore: () => void;
  theme: AppTheme;
}) {
  return (
    <View style={[styles.removedBanner, { backgroundColor: theme.cardStrong, borderColor: theme.warm }]}>
      <View style={styles.removedCopy}>
        <Text style={[styles.removedTitle, { color: theme.warm }]}>옷 삭제됨</Text>
        <Text style={[styles.itemMeta, { color: theme.muted }]}>{itemName}을 다시 복구할 수 있어요</Text>
      </View>
      <Pressable
        accessibilityLabel={`${itemName} 복구`}
        accessibilityRole="button"
        onPress={onRestore}
        style={[styles.restoreButton, { backgroundColor: theme.gold }]}
      >
        <Text style={[styles.restoreButtonText, { color: theme.onAccent }]}>복구</Text>
      </Pressable>
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
    minHeight: 150,
    gap: spacing.sm,
    padding: spacing.sm,
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
  emptyState: {
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
  },
  removedBanner: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  removedCopy: {
    flex: 1,
    gap: 3,
  },
  removedTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  restoreButton: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  restoreButtonText: {
    fontSize: 13,
    fontWeight: "900",
  },
});
