import React from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
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
const seasons = ["all", "spring", "summer", "fall", "winter"] as const;
const purposes = ["all", "commute", "school", "travel", "outdoor", "formal", "daily"] as const;

type CategoryFilter = (typeof categories)[number];
type SeasonFilter = (typeof seasons)[number];
type PurposeFilter = (typeof purposes)[number];

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

  const ownedCount = wardrobeItems.filter((item) => item.owned).length;
  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = wardrobeItems.filter((item) => {
    const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;
    const seasonMatch = seasonFilter === "all" || item.seasons.includes(seasonFilter);
    const purposeMatch = purposeFilter === "all" || item.purposes.includes(purposeFilter);
    const queryMatch = normalizedQuery.length === 0 || item.name.toLowerCase().includes(normalizedQuery);
    return categoryMatch && seasonMatch && purposeMatch && queryMatch;
  });

  const previewItem = wardrobeItems.find((item) => item.id === previewId) ?? filteredItems[0];

  return (
    <AppScreen
      title="아이템 추가"
      subtitle="프리셋에서 골라 내 옷장에 추가"
      badge={`${ownedCount}/${wardrobeItems.length} 보유`}
      onBack={onGoBack}
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
                <Image source={outfitImageAssets[previewItem.imageUrl]} style={styles.selectedImage} resizeMode="contain" />
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

      <Section title="프리셋 전체" caption={`${filteredItems.length}개 · 카드를 눌러 미리보고 바로 추가`} accent="gold">
        {filteredItems.length === 0 ? (
          <Text style={[styles.empty, { color: theme.muted }]}>조건에 맞는 아이템이 없음 · 필터를 초기화해줘</Text>
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
          {imageSource ? <Image source={imageSource} style={styles.presetImage} resizeMode="contain" /> : null}
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
    gap: spacing.sm,
  },
  presetCard: {
    width: "31.5%",
    minHeight: 150,
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  presetMain: {
    gap: spacing.xs,
  },
  presetImageWrap: {
    height: 66,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  presetImage: {
    width: "92%",
    height: "92%",
  },
  presetName: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },
  presetMeta: {
    fontSize: 10,
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
