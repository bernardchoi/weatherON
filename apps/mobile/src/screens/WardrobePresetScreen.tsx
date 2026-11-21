import React from "react";
import { Image, Platform, StyleSheet, Text, TextInput, useWindowDimensions, View } from "../localization/react-native";
import { BottomSheet } from "../components/BottomSheet";
import { translateText } from "../localization/localization";
import { outfitImageAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { FeedbackPressable } from "../components/FeedbackPressable";
import { useWardrobeMotion } from "../components/useWardrobeMotion";
import { Section } from "../components/Section";
import { WardrobePhotoRegistration } from "../components/WardrobePhotoRegistration";
import {
  WardrobeFilterControls,
  type WardrobePurposeFilter,
  type WardrobeSeasonFilter,
} from "../components/WardrobeFilterControls";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { radius, spacing } from "../theme/tokens";
import { formatOutfitTags, getWardrobeCategoryLabel } from "../utils/outfitLabels";
import type { WardrobeItem } from "@weatheron/shared";

const wardrobeCategories = ["outer", "top", "bottom", "shoes", "accessory"] as const;

type WardrobeCategory = (typeof wardrobeCategories)[number];

let lastCategory: WardrobeCategory = "outer";

export function WardrobePresetScreen({
  wardrobeItems,
  selectedWardrobeItemId,
  onSetWardrobeItemOwned,
  onSavePhotoWardrobeItem,
  onRequireAccount,
  accountLinked,
  onNavigate,
  onGoBack,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const changeWardrobe = useWardrobeMotion();
  const { fontScale } = useWindowDimensions();
  const toggleOwned = (id: string, owned: boolean) => changeWardrobe(() => onSetWardrobeItemOwned(id, owned));
  const presetItems = React.useMemo(() => wardrobeItems.filter((item) => item.source === "preset"), [wardrobeItems]);
  const selectedItem = wardrobeItems.find((item) => item.id === selectedWardrobeItemId);
  const selectedPhotoItem = selectedItem?.source === "photo" ? selectedItem : undefined;
  const [query, setQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<WardrobeCategory>(lastCategory);
  const [seasonFilter, setSeasonFilter] = React.useState<WardrobeSeasonFilter>("all");
  const [purposeFilter, setPurposeFilter] = React.useState<WardrobePurposeFilter>("all");
  const [previewId, setPreviewId] = React.useState<string | null>(selectedItem?.source === "preset" ? selectedItem.id : null);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [photoMode, setPhotoMode] = React.useState(Boolean(selectedPhotoItem));

  const ownedCount = presetItems.filter((item) => item.owned).length;
  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = React.useMemo(
    () => presetItems.filter((item) => {
      const categoryMatch = Boolean(normalizedQuery) || item.category === categoryFilter;
      const seasonMatch = seasonFilter === "all" || item.seasons.includes(seasonFilter);
      const purposeMatch = purposeFilter === "all" || item.purposes.includes(purposeFilter);
      const queryMatch = normalizedQuery.length === 0 || translateText(item.name).toLowerCase().includes(normalizedQuery) || item.name.toLowerCase().includes(normalizedQuery);
      return categoryMatch && seasonMatch && purposeMatch && queryMatch;
    }),
    [categoryFilter, normalizedQuery, presetItems, purposeFilter, seasonFilter],
  );
  const previewItem = presetItems.find(item => item.id === previewId);
  const tileWidth = fontScale > 1.8 ? "100%" : fontScale > 1.3 ? "50%" : "33.33%";

  React.useEffect(() => {
    if (selectedPhotoItem) setPhotoMode(true);
  }, [selectedPhotoItem]);

  if (photoMode) {
    return (
      <WardrobePhotoRegistration
        existingItem={selectedPhotoItem}
        onSave={onSavePhotoWardrobeItem}
        onCancel={() => {
          if (selectedPhotoItem) onNavigate("C2");
          else setPhotoMode(false);
        }}
      />
    );
  }

  const openPhotoRegistration = () => {
    if (!accountLinked) {
      onRequireAccount("account-connect", "C3");
      return;
    }
    setPhotoMode(true);
  };

  return (
    <AppScreen
      title="아이템 추가"
      subtitle={Platform.OS === "ios" ? undefined : "프리셋에서 골라 내 옷장에 추가"}
      badge={Platform.OS === "ios" ? undefined : `${ownedCount}/${presetItems.length}`}
      onBack={onGoBack}
      showWordmark={false}
      compactHeader
      contentPaddingTop={layout.weatherTopPadding}
      contentGap={Platform.OS === "ios" ? 12 : layout.destinationContentGap}
    >
      <Section compact={Platform.OS === "ios"} title="내 옷 사진" caption={Platform.OS === "ios" ? undefined : "내 옷으로 완성하는 오늘의 코디"} accent="clear">
        <View style={[[styles.photoEntryCard, { backgroundColor: theme.cardMuted, borderColor: theme.border }], Platform.OS === "ios" && ambientVisual.photoEntryCard, Platform.OS === "ios" && (fontScale > 1.3 || layout.width < 360) && { flexDirection: "column", alignItems: "stretch" }]}>
          <View style={styles.copy}>
            <Text style={[[styles.title, { color: theme.text }], Platform.OS === "ios" && ambientVisual.title]}>사진 한 장으로 옷장에 쏙</Text>
            {Platform.OS !== "ios" ? <Text style={[styles.copyText, { color: theme.muted }]}>
              {accountLinked ? "옷 정보는 확인하고 바꿀 수 있어요" : "로그인하고 내 옷을 추가해 보세요"}
            </Text> : null}
          </View>
          <AppButton label={accountLinked ? "사진으로 추가" : "로그인하고 추가"} onPress={openPhotoRegistration} tone="warning" size="sm" />
        </View>
      </Section>

      <View style={[[styles.searchBox, { backgroundColor: theme.cardMuted, borderColor: theme.border }], Platform.OS === "ios" && ambientVisual.searchBox]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="아이템 이름 검색"
          placeholderTextColor={theme.subtle}
          style={[[styles.searchInput, { color: theme.text }], Platform.OS === "ios" && ambientVisual.searchInput]}
          accessibilityLabel="아이템 이름 검색"
          returnKeyType="search"
        />
      </View>

      <FeedbackPressable accessibilityRole="button" accessibilityState={{ expanded: filtersOpen }}
        onPress={() => setFiltersOpen(!filtersOpen)} style={styles.filterButton}>
        <Text style={{ color: theme.text }}>{["필터", ...[seasonFilter, purposeFilter].filter(value => value !== "all").map(value => formatOutfitTags([value]))].map(value => translateText(value)).join(" · ")}</Text>
      </FeedbackPressable>
      {filtersOpen && <WardrobeFilterControls categoryFilter="all" seasonFilter={seasonFilter} purposeFilter={purposeFilter}
        onSeasonChange={setSeasonFilter} onPurposeChange={setPurposeFilter} />}

      {!normalizedQuery && <View accessibilityRole="tablist" style={styles.tabs}>
        {wardrobeCategories.map(category => (
          <FeedbackPressable key={category} accessibilityRole="tab" accessibilityState={{ selected: categoryFilter === category }}
            onPress={() => { lastCategory = category; setCategoryFilter(category); }}
            style={[styles.tab, { borderColor: categoryFilter === category ? theme.clear : theme.border }]}>
            <Text style={{ color: categoryFilter === category ? theme.clear : theme.text }}>{getWardrobeCategoryLabel(category)}</Text>
          </FeedbackPressable>
        ))}
      </View>}
      <View style={!normalizedQuery && styles.grid}>
        {filteredItems.length === 0 && <Text style={{ color: theme.muted }}>조건에 맞는 아이템이 없음 · 필터를 초기화해줘</Text>}
        {filteredItems.map(item => normalizedQuery ? (
          <PresetRow key={item.id} item={item} selected={previewId === item.id}
            onPreview={() => setPreviewId(item.id)} onToggleOwned={() => toggleOwned(item.id, !item.owned)} />
        ) : (
          <View key={item.id} style={[styles.tile, { width: tileWidth }]}>
            <FeedbackPressable accessibilityRole="button" accessibilityLabel={`${item.name} 상세 보기`}
              onPress={() => setPreviewId(item.id)} style={[styles.tileBody, { backgroundColor: theme.cardMuted }]}>
              <Image source={outfitImageAssets[item.imageUrl]} resizeMode="contain" style={styles.tilePhoto} />
              <Text style={[styles.tileName, { color: theme.text }]}>{item.name}</Text>
            </FeedbackPressable>
            <FeedbackPressable accessibilityRole="button" accessibilityState={{ selected: item.owned }}
              accessibilityLabel={`${item.name} ${item.owned ? "내 옷장에서 해제" : "내 옷장에 추가"}`}
              onPress={() => toggleOwned(item.id, !item.owned)} style={styles.tileAction}>
              <Text style={[styles.mark, { color: item.owned ? theme.onAccent : theme.text, backgroundColor: item.owned ? theme.clear : theme.card }]}>{item.owned ? "✓" : "+"}</Text>
            </FeedbackPressable>
          </View>
        ))}
      </View>
      <BottomSheet visible={Boolean(previewItem)} onClose={() => setPreviewId(null)} accessibilityLabel={previewItem?.name ?? "미리보기"}>
        {previewItem && <View style={styles.detail}>
          <Text style={[styles.title, { color: theme.text }]}>{previewItem.name}</Text>
          <Image source={outfitImageAssets[previewItem.imageUrl]} resizeMode="contain" style={styles.detailPhoto} />
          <Text style={{ color: theme.text }}>{formatOutfitTags(previewItem.seasons)}</Text>
          <Text style={{ color: theme.text }}>{formatOutfitTags(previewItem.purposes)}</Text>
          <Text style={{ color: theme.text }}>{formatOutfitTags(previewItem.weatherTags)}</Text>
          <AppButton label={previewItem.owned ? "내 옷장에서 해제" : "내 옷장에 추가"} onPress={() => toggleOwned(previewItem.id, !previewItem.owned)} />
          <AppButton label="닫기" tone="secondary" onPress={() => setPreviewId(null)} />
        </View>}
      </BottomSheet>

      <Section compact={Platform.OS === "ios"} title="빠른 이동" caption="옷장 반영은 코디 추천과 상세에도 반영됨">
        <View style={styles.actions}>
          <AppButton label="코디 보기" onPress={() => onNavigate("C1")} tone="secondary" />
          <AppButton label="내 옷장" onPress={() => onNavigate("C2")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function PresetRow({
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
    <View style={[styles.presetRow, { borderColor: theme.border }]}>
      <FeedbackPressable
        accessibilityLabel={`${item.name} 상세 보기`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPreview}
        style={styles.presetMain}
      >
        {imageSource ? <Image source={imageSource} style={styles.thumbnail} resizeMode="contain" resizeMethod="resize" /> : null}
        <Text style={[styles.presetName, { color: selected ? theme.gold : theme.text }]}>{item.name}</Text>
      </FeedbackPressable>
      <AppButton
        label={item.owned ? "해제" : "추가"}
        accessibilityLabel={`${item.name} ${item.owned ? "내 옷장에서 해제" : "내 옷장에 추가"}`}
        onPress={onToggleOwned}
        tone="secondary"
        variant={item.owned ? "outlined" : undefined}
        size="sm"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  photoEntryCard: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchBox: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  searchInput: {
    minHeight: 44,
    fontSize: 14,
    fontWeight: "800",
    padding: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
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
  filterButton: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start", paddingHorizontal: 12 },
  tabs: { flexDirection: "row", flexWrap: "wrap" },
  tab: { flexGrow: 1, minHeight: 44, paddingHorizontal: 6, justifyContent: "center", alignItems: "center", borderBottomWidth: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  tile: { padding: 3 },
  tileBody: { flex: 1, padding: 6, borderRadius: radius.md },
  tilePhoto: { width: "100%", height: 94 },
  tileName: { fontSize: 13, fontWeight: "600", paddingVertical: 4 },
  tileAction: { position: "absolute", top: 3, right: 3, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  mark: { overflow: "hidden", borderRadius: 14, minWidth: 28, textAlign: "center", fontSize: 18, lineHeight: 28 },
  detail: { gap: spacing.sm },
  detailPhoto: { width: "100%", height: 190 },
  presetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  presetMain: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 4,
  },
  thumbnail: { width: 38, height: 38 },
  presetName: { flex: 1, fontSize: 15, fontWeight: "600" },
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

// iOS Ambient image-led wardrobe; original Android layout is retained.
const ambientVisual = StyleSheet.create({
  "photoEntryCard": {
    "backgroundColor": "transparent",
    "borderWidth": 0,
    "borderRadius": 0,
    "shadowOpacity": 0,
    "elevation": 0,
    "paddingHorizontal": 0,
    "paddingVertical": 4,
    "gap": 16
  },
  "searchInput": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "searchBox": {
    "minHeight": 52,
    "borderRadius": 20
  },
  "title": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  },
  "copyText": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  }
});
