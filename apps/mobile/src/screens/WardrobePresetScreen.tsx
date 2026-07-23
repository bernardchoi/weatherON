import React from "react";
import { AccessibilityInfo, Animated, Image, LayoutAnimation, Platform, Pressable, StyleSheet, Text, TextInput, UIManager, View } from "react-native";
import { outfitImageAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { FilterRow } from "../components/FilterRow";
import { Section } from "../components/Section";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";
import { formatOutfitTags, getOutfitTagLabel, getWardrobeCategoryLabel } from "../utils/outfitLabels";
import type { WardrobeItem } from "@weatheron/shared";

const categories = ["all", "outer", "top", "bottom", "shoes", "accessory"] as const;
const wardrobeCategories = ["outer", "top", "bottom", "shoes", "accessory"] as const;
const seasons = ["all", "spring", "summer", "fall", "winter"] as const;
const purposes = ["all", "commute", "school", "travel", "outdoor", "formal", "daily"] as const;

type CategoryFilter = (typeof categories)[number];
type WardrobeCategory = (typeof wardrobeCategories)[number];
type SeasonFilter = (typeof seasons)[number];
type PurposeFilter = (typeof purposes)[number];

const accordionLayout = {
  duration: 180,
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

export function WardrobePresetScreen({
  wardrobeItems,
  selectedWardrobeItemId,
  onSetWardrobeItemOwned,
  onNavigate,
  onGoBack,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const [query, setQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>("all");
  const [seasonFilter, setSeasonFilter] = React.useState<SeasonFilter>("all");
  const [purposeFilter, setPurposeFilter] = React.useState<PurposeFilter>("all");
  const [previewId, setPreviewId] = React.useState(selectedWardrobeItemId || wardrobeItems[0]?.id || "");
  const [expandedCategory, setExpandedCategory] = React.useState<WardrobeCategory | null>("outer");
  const [reduceMotionEnabled, setReduceMotionEnabled] = React.useState(false);

  const ownedCount = wardrobeItems.filter((item) => item.owned).length;
  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = React.useMemo(
    () => wardrobeItems.filter((item) => {
      const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;
      const seasonMatch = seasonFilter === "all" || item.seasons.includes(seasonFilter);
      const purposeMatch = purposeFilter === "all" || item.purposes.includes(purposeFilter);
      const queryMatch = normalizedQuery.length === 0 || item.name.toLowerCase().includes(normalizedQuery);
      return categoryMatch && seasonMatch && purposeMatch && queryMatch;
    }),
    [categoryFilter, normalizedQuery, purposeFilter, seasonFilter, wardrobeItems],
  );
  const groupedItems = React.useMemo(
    () => Object.fromEntries(
      wardrobeCategories.map((category) => [category, filteredItems.filter((item) => item.category === category)]),
    ) as Record<WardrobeCategory, WardrobeItem[]>,
    [filteredItems],
  );

  const previewItem = wardrobeItems.find((item) => item.id === previewId) ?? filteredItems[0];

  React.useEffect(() => {
    if (categoryFilter !== "all") return;
    if (expandedCategory === null || groupedItems[expandedCategory].length > 0) return;
    setExpandedCategory(wardrobeCategories.find((category) => groupedItems[category].length > 0) ?? null);
  }, [categoryFilter, expandedCategory, groupedItems]);

  React.useEffect(() => {
    if (Platform.OS === "android") UIManager.setLayoutAnimationEnabledExperimental?.(true);
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotionEnabled(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotionEnabled);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const toggleCategory = (category: WardrobeCategory) => {
    if (!reduceMotionEnabled) LayoutAnimation.configureNext(accordionLayout);
    setExpandedCategory((current) => current === category ? null : category);
  };

  return (
    <AppScreen
      title="아이템 추가"
      subtitle="프리셋에서 골라 내 옷장에 추가"
      badge={`${ownedCount}/${wardrobeItems.length} 보유`}
      onBack={onGoBack}
      showWordmark={false}
    >
      <View style={[styles.searchBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="아이템 이름 검색"
          placeholderTextColor={theme.subtle}
          style={[styles.searchInput, { color: theme.text }]}
          accessibilityLabel="아이템 이름 검색"
          returnKeyType="search"
        />
      </View>

      <Section title="필터" caption="아이템·계절·목적 기준" accent="sky">
        <View style={styles.filterStack}>
          <FilterRow
            values={categories}
            activeValue={categoryFilter}
            onSelect={(value) => setCategoryFilter(value as CategoryFilter)}
            renderLabel={(value) => (value === "all" ? "전체" : getWardrobeCategoryLabel(value))}
          />
          <FilterRow
            values={seasons}
            activeValue={seasonFilter}
            onSelect={(value) => setSeasonFilter(value as SeasonFilter)}
            renderLabel={(value) => (value === "all" ? "계절 전체" : formatOutfitTags([value]))}
          />
          <FilterRow
            values={purposes}
            activeValue={purposeFilter}
            onSelect={(value) => setPurposeFilter(value as PurposeFilter)}
            renderLabel={(value) => (value === "all" ? "목적 전체" : getOutfitTagLabel(value))}
          />
        </View>
      </Section>

      {previewItem ? (
        <Section
          title="미리보기"
          caption={`${getWardrobeCategoryLabel(previewItem.category)} · ${formatOutfitTags(previewItem.seasons)} · ${formatOutfitTags(previewItem.purposes)}`}
          accent="clear"
        >
          <View style={[styles.selectedCard, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow(theme)]}>
            <View style={[styles.selectedImageWrap, { backgroundColor: theme.cardMuted }]}>
              {outfitImageAssets[previewItem.imageUrl] ? (
                <Image source={outfitImageAssets[previewItem.imageUrl]} style={styles.selectedImage} resizeMethod="resize" resizeMode="contain" />
              ) : null}
            </View>
            <View style={styles.copy}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{previewItem.name}</Text>
              <Text style={[styles.copyText, { color: theme.muted }]} numberOfLines={1}>{formatOutfitTags(previewItem.weatherTags)}</Text>
            </View>
            <AppButton
              label={previewItem.owned ? "해제" : "추가"}
              accessibilityLabel={`${previewItem.name} ${previewItem.owned ? "내 옷장에서 해제" : "내 옷장에 추가"}`}
              onPress={() => onSetWardrobeItemOwned(previewItem.id, !previewItem.owned)}
              tone="warning"
              size="sm"
            />
          </View>
        </Section>
      ) : null}

      <Section
        title="프리셋 전체"
        caption={categoryFilter === "all" ? `${filteredItems.length}개 · 카테고리를 열어 확인` : `${filteredItems.length}개 · 카드를 눌러 미리보고 바로 추가`}
        accent="gold"
      >
        {filteredItems.length === 0 ? (
          <Text style={[styles.empty, { color: theme.muted }]}>조건에 맞는 아이템이 없음 · 필터를 초기화해줘</Text>
        ) : categoryFilter === "all" ? (
          <View style={styles.categoryList}>
            {wardrobeCategories.map((category) => (
              <PresetCategory
                key={category}
                category={category}
                items={groupedItems[category]}
                expanded={expandedCategory === category}
                selectedItemId={previewItem?.id}
                onToggle={() => toggleCategory(category)}
                onPreview={setPreviewId}
                onToggleOwned={onSetWardrobeItemOwned}
              />
            ))}
          </View>
        ) : (
          <View style={styles.presetGrid}>
            {filteredItems.map((item) => (
              <PresetCard
                key={item.id}
                item={item}
                selected={item.id === previewItem?.id}
                onPreview={() => setPreviewId(item.id)}
                onToggleOwned={() => onSetWardrobeItemOwned(item.id, !item.owned)}
              />
            ))}
          </View>
        )}
      </Section>

      <Section title="빠른 이동" caption="옷장 반영은 코디 추천과 상세에도 반영됨">
        <View style={styles.actions}>
          <AppButton label="코디 보기" onPress={() => onNavigate("C1")} tone="secondary" />
          <AppButton label="내 옷장" onPress={() => onNavigate("C2")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function PresetCategory({
  category,
  items,
  expanded,
  selectedItemId,
  onToggle,
  onPreview,
  onToggleOwned,
}: {
  category: WardrobeCategory;
  items: WardrobeItem[];
  expanded: boolean;
  selectedItemId?: string;
  onToggle: () => void;
  onPreview: (itemId: string) => void;
  onToggleOwned: (itemId: string, owned: boolean) => void;
}) {
  const theme = useAppTheme();
  const categoryLabel = getWardrobeCategoryLabel(category);
  const contentOpacity = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;

  React.useEffect(() => {
    if (!expanded) {
      contentOpacity.stopAnimation();
      contentOpacity.setValue(0);
      return;
    }
    contentOpacity.setValue(0);
    const animation = Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [contentOpacity, expanded]);

  return (
    <View style={[styles.categoryCard, { backgroundColor: theme.cardMuted, borderColor: expanded ? theme.gold : theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${categoryLabel} ${items.length}개 ${expanded ? "접기" : "펼치기"}`}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={styles.categoryHeader}
      >
        <View style={styles.categoryCopy}>
          <Text style={[styles.categoryTitle, { color: theme.text }]}>{categoryLabel}</Text>
          <Text style={[styles.categoryCount, { color: theme.muted }]}>{items.length}개</Text>
        </View>
        <Text style={[styles.categoryToggle, { color: theme.gold }]}>{expanded ? "접기" : "펼치기"}</Text>
      </Pressable>
      {expanded ? (
        items.length > 0 ? (
          <Animated.View style={{ opacity: contentOpacity }}>
          <View style={styles.presetGrid}>
            {items.map((item) => (
              <PresetCard
                key={item.id}
                item={item}
                selected={item.id === selectedItemId}
                onPreview={() => onPreview(item.id)}
                onToggleOwned={() => onToggleOwned(item.id, !item.owned)}
              />
            ))}
          </View>
          </Animated.View>
        ) : (
          <Text style={[styles.categoryEmpty, { color: theme.muted }]}>현재 조건에 맞는 아이템 없음</Text>
        )
      ) : null}
    </View>
  );
}

function PresetCard({
  item,
  selected,
  onPreview,
  onToggleOwned,
}: {
  item: WardrobeItem;
  selected: boolean;
  onPreview: () => void;
  onToggleOwned: () => void;
}) {
  const theme = useAppTheme();
  const imageSource = outfitImageAssets[item.imageUrl];
  return (
    <View
      style={[
        styles.presetCard,
        { backgroundColor: theme.cardMuted, borderColor: item.owned ? theme.clear : selected ? theme.gold : theme.border },
      ]}
    >
      <Pressable accessibilityRole="button" onPress={onPreview} style={styles.presetMain}>
        <View style={[styles.presetImageWrap, { backgroundColor: theme.cardStrong }]}>
          {imageSource ? <Image source={imageSource} style={styles.presetImage} resizeMethod="resize" resizeMode="contain" /> : null}
        </View>
        <Text style={[styles.presetName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.presetMeta, { color: theme.muted }]} numberOfLines={1}>{getWardrobeCategoryLabel(item.category)}</Text>
      </Pressable>
      <AppButton
        label={item.owned ? "해제" : "추가"}
        accessibilityLabel={`${item.name} ${item.owned ? "내 옷장에서 해제" : "내 옷장에 추가"}`}
        onPress={onToggleOwned}
        tone="secondary"
        size="sm"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  searchInput: {
    fontSize: 14,
    fontWeight: "800",
    padding: 0,
  },
  filterStack: {
    gap: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
  },
  copyText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
  },
  selectedCard: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  selectedImageWrap: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  selectedImage: {
    width: "92%",
    height: "92%",
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  categoryList: {
    gap: spacing.sm,
  },
  categoryCard: {
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  categoryHeader: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: 2,
  },
  categoryCopy: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  categoryTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  categoryCount: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  categoryToggle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  categoryEmpty: {
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
    fontSize: 12,
    fontWeight: "700",
  },
  presetCard: {
    width: "31.5%",
    minHeight: 162,
    justifyContent: "space-between",
    gap: 8,
    padding: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  presetMain: {
    gap: 6,
  },
  presetImageWrap: {
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  presetImage: {
    width: "92%",
    height: "92%",
  },
  presetName: {
    minHeight: 32,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
  },
  presetMeta: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  empty: {
    fontSize: 13,
    lineHeight: 19,
  },
});
