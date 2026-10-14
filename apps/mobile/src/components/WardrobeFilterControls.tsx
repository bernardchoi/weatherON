import React from "react";
import { Platform, Image, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import { ambientUiIcons } from "../ambientAssets";
import { uiIconAssets } from "../assets";
import { formatOutfitTags, getOutfitTagLabel, getWardrobeCategoryLabel } from "../utils/outfitLabels";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";
import { IosSelectionRow } from "./IosSelectionRow";
import { BottomSheet } from "./BottomSheet";
import { triggerConfirmedSelectionHaptic } from "../utils/confirmedInteractionFeedback";
import { FeedbackPressable } from "./FeedbackPressable";

// Keep the SVG module outside the Android evaluation path.
const CategoryIcon = Platform.OS === "ios" ? (require("./WardrobeCategoryIcon") as typeof import("./WardrobeCategoryIcon")).WardrobeCategoryIcon : null;

const categories = ["all", "outer", "top", "bottom", "shoes", "accessory"] as const;
const seasons = ["all", "spring", "summer", "fall", "winter"] as const;
const purposes = ["all", "commute", "school", "travel", "outdoor", "formal", "daily"] as const;

export type WardrobeCategoryFilter = (typeof categories)[number];
export type WardrobeSeasonFilter = (typeof seasons)[number];
export type WardrobePurposeFilter = (typeof purposes)[number];

type WardrobeFilterId = "category" | "season" | "purpose";
type WardrobeFilterConfig = {
  label: string;
  values: readonly string[];
  activeValue: string;
  renderLabel: (value: string) => string;
};

type WardrobeFilterControlsProps = {
  categoryFilter: WardrobeCategoryFilter;
  seasonFilter: WardrobeSeasonFilter;
  purposeFilter: WardrobePurposeFilter;
  onCategoryChange: (value: WardrobeCategoryFilter) => void;
  onSeasonChange: (value: WardrobeSeasonFilter) => void;
  onPurposeChange: (value: WardrobePurposeFilter) => void;
};

export function WardrobeFilterControls({
  categoryFilter,
  seasonFilter,
  purposeFilter,
  onCategoryChange,
  onSeasonChange,
  onPurposeChange,
}: WardrobeFilterControlsProps) {
  const theme = useAppTheme();
  const [openFilter, setOpenFilter] = React.useState<WardrobeFilterId | null>(null);
  const filterConfig = getFilterConfig(openFilter, categoryFilter, seasonFilter, purposeFilter);
  const { width, fontScale } = useWindowDimensions();
  const pendingSelection = React.useRef<{ filter: WardrobeFilterId; value: string } | null>(null);
  React.useEffect(() => {
    const pending = pendingSelection.current;
    if (!pending) return;
    const actual = pending.filter === "category" ? categoryFilter : pending.filter === "season" ? seasonFilter : purposeFilter;
    if (actual !== pending.value) return;
    pendingSelection.current = null;
    triggerConfirmedSelectionHaptic();
  }, [categoryFilter, seasonFilter, purposeFilter]);

  const selectFilterValue = (value: string) => {
    pendingSelection.current = Platform.OS === "ios" && openFilter && value !== filterConfig.activeValue ? { filter: openFilter, value } : null;
    if (openFilter === "category") onCategoryChange(value as WardrobeCategoryFilter);
    if (openFilter === "season") onSeasonChange(value as WardrobeSeasonFilter);
    if (openFilter === "purpose") onPurposeChange(value as WardrobePurposeFilter);
    setOpenFilter(null);
  };

  return (
    <>
      <View style={[styles.filterSelectorRow, Platform.OS === "ios" && (width < 360 || fontScale > 1.3) && { flexDirection: "column" }]} >
        <WardrobeFilterSelect
          label="종류"
          value={getCategoryFilterLabel(categoryFilter)}
          active={categoryFilter !== "all"}
          onPress={() => setOpenFilter("category")}
        />
        <WardrobeFilterSelect
          label="계절"
          value={getSeasonFilterLabel(seasonFilter)}
          active={seasonFilter !== "all"}
          onPress={() => setOpenFilter("season")}
        />
        <WardrobeFilterSelect
          label="목적"
          value={getPurposeFilterLabel(purposeFilter)}
          active={purposeFilter !== "all"}
          onPress={() => setOpenFilter("purpose")}
        />
      </View>

      <BottomSheet
        visible={openFilter !== null}
        onClose={() => { pendingSelection.current = null; setOpenFilter(null); }}
        accessibilityLabel={`${filterConfig.label} 필터 선택 시트`}
      >
        <View style={styles.filterSheetHeader}>
          <Text style={[[styles.filterSheetTitle, { color: theme.text }], Platform.OS === "ios" && ambientVisual.filterSheetTitle]}>{filterConfig.label} 필터</Text>
          <Text style={[[styles.filterSheetCaption, { color: theme.muted }], Platform.OS === "ios" && ambientVisual.filterSheetCaption]}>1개를 선택하면 바로 목록에 반영됨</Text>
        </View>
        <View style={[[styles.filterOptionList, { borderColor: theme.border }], Platform.OS === "ios" && ambientVisual.filterOptionList]}>
          {filterConfig.values.map((value, index) => {
            const selected = filterConfig.activeValue === value;
            if (Platform.OS === "ios" && CategoryIcon) return <IosSelectionRow key={value} label={filterConfig.renderLabel(value)} icon={openFilter === "season" ? ambientUiIcons.temperature : openFilter === "purpose" ? ambientUiIcons.tabDepart : <CategoryIcon category={value as WardrobeCategoryFilter} color={selected ? theme.clear : theme.muted} />} selected={selected} last={index === filterConfig.values.length - 1} onPress={() => selectFilterValue(value)} />;
            return (
              <FeedbackPressable
                key={value}
                accessibilityLabel={`${filterConfig.renderLabel(value)} 필터${selected ? ", 현재 선택됨" : ""}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                hapticFeedback="automatic"
                onPress={() => selectFilterValue(value)}
                style={[[
                  styles.filterOption,
                  index < filterConfig.values.length - 1 ? { borderBottomColor: theme.border, borderBottomWidth: 1 } : null,
                  selected ? { backgroundColor: theme.cardMuted } : null,
                ]]}
              >
                <Text style={[[styles.filterOptionText, { color: selected ? theme.clear : theme.text }]]}>
                  {filterConfig.renderLabel(value)}
                </Text>
                {selected ? (
                  <Image source={uiIconAssets.check} style={[styles.filterCheckIcon, { tintColor: theme.clear }]} resizeMode="contain" />
                ) : null}
              </FeedbackPressable>
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
}

function WardrobeFilterSelect({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <FeedbackPressable
      accessibilityLabel={`${label} 필터, 현재 ${value}, 선택 목록 열기`}
      accessibilityHint="화면 아래에서 선택 목록이 열림"
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[[
        styles.filterSelect,
        {
          backgroundColor: active ? theme.cardStrong : theme.cardMuted,
          borderColor: active ? theme.clear : theme.border,
        },
      ], Platform.OS === "ios" && ambientVisual.filterSelect,
        Platform.OS === "ios" && { borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: active ? theme.cardStrong : "transparent" }]}
    >
      <View style={[styles.filterSelectCopy, Platform.OS === "ios" && { flexDirection: "row", alignItems: "center", gap: 3 }]}>
        <Text style={[[styles.filterSelectLabel, { color: theme.subtle }], Platform.OS === "ios" && ambientVisual.filterSelectLabel]}>{label}</Text>
        <Text style={[[styles.filterSelectValue, { color: active ? theme.clear : theme.text }], Platform.OS === "ios" && ambientVisual.filterSelectValue]} numberOfLines={Platform.OS === "ios" ? undefined : 1}>{value}</Text>
      </View>
      {Platform.OS === "ios" ? <Image source={ambientUiIcons.expand} style={{ width: 13, height: 13, tintColor: active ? theme.clear : theme.text }} /> : null}
    </FeedbackPressable>
  );
}

function getCategoryFilterLabel(value: WardrobeCategoryFilter) {
  return value === "all" ? "전체" : getWardrobeCategoryLabel(value);
}

function getSeasonFilterLabel(value: WardrobeSeasonFilter) {
  return value === "all" ? "전체" : formatOutfitTags([value]);
}

function getPurposeFilterLabel(value: WardrobePurposeFilter) {
  return value === "all" ? "전체" : getOutfitTagLabel(value);
}

function getFilterConfig(
  filter: WardrobeFilterId | null,
  categoryFilter: WardrobeCategoryFilter,
  seasonFilter: WardrobeSeasonFilter,
  purposeFilter: WardrobePurposeFilter,
): WardrobeFilterConfig {
  if (filter === "season") {
    return {
      label: "계절",
      values: seasons,
      activeValue: seasonFilter,
      renderLabel: (value) => getSeasonFilterLabel(value as WardrobeSeasonFilter),
    };
  }
  if (filter === "purpose") {
    return {
      label: "목적",
      values: purposes,
      activeValue: purposeFilter,
      renderLabel: (value) => getPurposeFilterLabel(value as WardrobePurposeFilter),
    };
  }
  return {
    label: "종류",
    values: categories,
    activeValue: categoryFilter,
    renderLabel: (value) => getCategoryFilterLabel(value as WardrobeCategoryFilter),
  };
}

const styles = StyleSheet.create({
  filterSelectorRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  filterSelect: {
    minWidth: 0,
    minHeight: 56,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 11,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  filterSelectCopy: {
    minWidth: 0,
    flex: 1,
    justifyContent: "center",
    gap: 3,
  },
  filterSelectLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  filterSelectValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  filterSheetHeader: {
    gap: 4,
  },
  filterSheetTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },
  filterSheetCaption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  filterOptionList: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  filterOption: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  filterOptionText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },
  filterCheckIcon: {
    width: 17,
    height: 17,
  },
});

// iOS Ambient image-led wardrobe; original Android layout is retained.
const ambientVisual = StyleSheet.create({
  "filterSelect": {
    "backgroundColor": "transparent",
    "minHeight": 44,
    "borderRadius": 16
  },
  "filterSelectLabel": {
    "fontSize": 13,
    "lineHeight": 20,
    "fontWeight": "500"
  },
  "filterSelectValue": {
    "fontSize": 13,
    "lineHeight": 20,
    "fontWeight": "600"
  },
  "filterSheetTitle": {
    "fontSize": 21,
    "lineHeight": 29,
    "fontWeight": "600"
  },
  "filterSheetCaption": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  },
  "filterOptionList": {
    "borderWidth": 0
  },
  "filterOption": {
    "minHeight": 56,
    "paddingVertical": 10,
    "justifyContent": "flex-start",
    "borderRadius": 18
  },
  "filterOptionText": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  }
});
