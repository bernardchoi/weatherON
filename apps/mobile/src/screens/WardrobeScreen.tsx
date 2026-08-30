import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { outfitImageAssets, uiIconAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { Section } from "../components/Section";
import {
  WardrobeFilterControls,
  type WardrobeCategoryFilter,
  type WardrobePurposeFilter,
  type WardrobeSeasonFilter,
} from "../components/WardrobeFilterControls";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { radius, spacing, type AppTheme } from "../theme/tokens";
import { getWardrobeCategoryLabel } from "../utils/outfitLabels";
import type { WardrobeItem } from "@weatheron/shared";

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
  const layout = useResponsiveLayout();
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
  const wardrobeItemWidth = layout.isTablet ? layout.wardrobeGridItemWidth : "30.8%";

  return (
    <AppScreen
      title="내 옷장"
      subtitle="보유한 옷을 확인하고 정리"
      badge={`${ownedItems.length}개 보유`}
      onBack={onGoBack}
      showWordmark={false}
      compactHeader
      contentPaddingTop={layout.weatherTopPadding + spacing.sm}
      contentGap={layout.destinationContentGap}
    >
      {removedItem ? (
        <RemovedItemBanner itemName={removedItem.name} onRestore={onRestoreRemovedWardrobeItem} theme={theme} />
      ) : null}

      <Section title="내 옷장" caption={`${filteredItems.length}개 항목 · ${selectedStyles.join(" · ")}`} accent="clear">
        <View
          style={[
            styles.infoCard,
            layout.isShort || layout.isNarrow ? styles.infoCardShort : null,
            { backgroundColor: theme.cardMuted, borderColor: theme.border },
          ]}
        >
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.clear }]}>{ownedItems.length}개 보유 중</Text>
            <Text style={[styles.itemMeta, { color: theme.muted }]} numberOfLines={1}>
              {accountLinked ? "계정 연결됨 · 코디 추천에 반영" : "계정 연결 전 · 프리셋 추가 가능"}
            </Text>
          </View>
          <AppButton label="코디 보기" onPress={() => onNavigate("C1")} tone="secondary" size="sm" />
        </View>

        <WardrobeFilterControls
          categoryFilter={categoryFilter}
          seasonFilter={seasonFilter}
          purposeFilter={purposeFilter}
          onCategoryChange={setCategoryFilter}
          onSeasonChange={setSeasonFilter}
          onPurposeChange={setPurposeFilter}
        />
        {ownedItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.muted }]}>아직 추가한 옷이 없음 · 프리셋에서 골라 추가해줘</Text>
            <AppButton label="내 옷장에 추가" onPress={() => onNavigate("C3")} tone="warning" />
          </View>
        ) : filteredItems.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.muted }]}>조건에 맞는 옷이 없음 · 필터를 초기화해줘</Text>
        ) : (
          <View style={[styles.grid, { gap: layout.outfitCardGap }]}>
            {filteredItems.map((item) => (
              <WardrobeItemCard
                key={item.id}
                item={item}
                onOpen={() => onOpenWardrobeItem(item.id)}
                onRemove={() => onRemoveWardrobeItem(item.id)}
              />
            ))}
            <Pressable
              accessibilityLabel="내 옷장에 추가"
              accessibilityRole="button"
              onPress={() => onNavigate("C3")}
              style={[
                styles.addTile,
                {
                  width: wardrobeItemWidth,
                  minHeight: layout.wardrobeCardMinHeight,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.addMark, { color: theme.subtle }]}>+</Text>
              <Text style={[styles.itemMeta, { color: theme.subtle }]}>추가</Text>
            </Pressable>
          </View>
        )}
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
  const layout = useResponsiveLayout();
  const imageSource = item.imageUrl ? outfitImageAssets[item.imageUrl] : undefined;
  const wardrobeItemWidth = layout.isTablet ? layout.wardrobeGridItemWidth : "30.8%";
  return (
    <View
      style={[
        styles.card,
        {
          width: wardrobeItemWidth,
          minHeight: layout.wardrobeCardMinHeight,
          backgroundColor: theme.cardMuted,
          borderColor: theme.clear,
        },
      ]}
    >
      <Pressable accessibilityLabel={`${item.name} 상세 보기`} accessibilityRole="button" onPress={onOpen} style={styles.cardMain}>
        <View style={[styles.imageWell, { height: layout.wardrobeImageHeight, backgroundColor: theme.cardStrong }]}>
          {imageSource ? <Image source={imageSource} style={styles.itemImage} resizeMode="contain" /> : <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>}
        </View>
        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.itemMeta, styles.cardMeta, { color: theme.muted }]} numberOfLines={1}>{getWardrobeCategoryLabel(item.category)}</Text>
      </Pressable>
      <FeedbackPressable
        accessibilityLabel={`${item.name} 내 옷장에서 삭제`}
        accessibilityRole="button"
        onPress={onRemove}
        hitSlop={2}
        style={styles.deleteButton}
      >
        <View style={[styles.deleteButtonSurface, { backgroundColor: theme.cardStrong, borderColor: theme.border }]}>
          <Image source={uiIconAssets.trash} style={[styles.deleteIcon, { tintColor: theme.warm }]} resizeMode="contain" />
        </View>
      </FeedbackPressable>
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
  infoCard: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  infoCardShort: {
    alignItems: "stretch",
    flexDirection: "column",
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 13,
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    minHeight: 118,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardMain: {
    gap: 4,
    padding: 7,
  },
  imageWell: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  itemImage: {
    width: "86%",
    height: "86%",
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
  cardMeta: {
    paddingRight: 36,
  },
  deleteButton: {
    position: "absolute",
    zIndex: 2,
    bottom: 2,
    right: 2,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  deleteButtonSurface: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  deleteIcon: {
    width: 13,
    height: 13,
  },
  addTile: {
    minHeight: 118,
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
    minHeight: 44,
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
