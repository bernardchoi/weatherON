import React from "react";
import { Animated, Easing, Platform, Image, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import { ambientUiIcons } from "../ambientAssets";
import { uiIconAssets } from "../assets";
import { formatOutfitTags, getOutfitTagLabel, getWardrobeCategoryLabel } from "../utils/outfitLabels";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";
import { BottomSheet } from "./BottomSheet";
import { AmbientControlSurface } from "./AmbientControlSurface";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { triggerConfirmedSelectionHaptic } from "../utils/confirmedInteractionFeedback";
import { FeedbackPressable } from "./FeedbackPressable";

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
    if (Platform.OS === "ios" && openFilter && value !== filterConfig.activeValue) pendingSelection.current = { filter: openFilter, value };
    if (openFilter === "category") onCategoryChange(value as WardrobeCategoryFilter);
    if (openFilter === "season") onSeasonChange(value as WardrobeSeasonFilter);
    if (openFilter === "purpose") onPurposeChange(value as WardrobePurposeFilter);
    setOpenFilter(null);
  };

  return (
    <>
      <AmbientControlSurface style={{ padding: 5 }}>
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
      </AmbientControlSurface>

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
            return (
              <FeedbackPressable
                key={value}
                accessibilityLabel={`${filterConfig.renderLabel(value)} 필터${selected ? ", 현재 선택됨" : ""}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                hapticFeedback={Platform.OS === "ios" ? "none" : "automatic"}
                onPress={() => selectFilterValue(value)}
                style={[[
                  styles.filterOption,
                  index < filterConfig.values.length - 1 ? { borderBottomColor: theme.border, borderBottomWidth: 1 } : null,
                  selected ? { backgroundColor: theme.cardMuted } : null,
                ], Platform.OS === "ios" && ambientVisual.filterOption]}
              >
                <Text style={[[styles.filterOptionText, { color: selected ? theme.clear : theme.text }], Platform.OS === "ios" && ambientVisual.filterOptionText]}>
                  {filterConfig.renderLabel(value)}
                </Text>
                {selected ? (
                  <Image source={Platform.OS === "ios" ? ambientUiIcons.check : uiIconAssets.check} style={[styles.filterCheckIcon, { tintColor: theme.clear }]} resizeMode="contain" />
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
        Platform.OS === "ios" && { borderWidth: 0, flexDirection: "row", alignItems: "center", gap: 6 }]}
    >
      {Platform.OS === "ios" ? <FilterSelectionMark value={value} active={active} /> : null}
      <View style={styles.filterSelectCopy}>
        <Text style={[[styles.filterSelectLabel, { color: theme.subtle }], Platform.OS === "ios" && ambientVisual.filterSelectLabel]}>{label}</Text>
        <Text style={[[styles.filterSelectValue, { color: active ? theme.clear : theme.text }], Platform.OS === "ios" && ambientVisual.filterSelectValue]} numberOfLines={Platform.OS === "ios" ? undefined : 1}>{value}</Text>
      </View>
    </FeedbackPressable>
  );
}

function FilterSelectionMark({ value, active }: { value: string; active: boolean }) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const progress = React.useRef(new Animated.Value(1)).current;
  const previous = React.useRef(value);
  React.useEffect(() => {
    const changed = previous.current !== value;
    previous.current = value;
    progress.stopAnimation();
    if (!changed || reducedMotion !== false) { progress.setValue(1); return; }
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    return () => progress.stopAnimation();
  }, [value, reducedMotion, progress]);
  return <Animated.View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={{ width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: active ? theme.clear : "transparent", borderWidth: 1, borderColor: active ? theme.clear : theme.border, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [4, 0] }) }] }}>
    {active ? <Image source={ambientUiIcons.check} style={{ width: 13, height: 13, tintColor: theme.onAccent }} /> : null}
  </Animated.View>;
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
    "minHeight": 52,
    "borderRadius": 16
  },
  "filterSelectLabel": {
    "fontSize": 14,
    "lineHeight": 21,
    "fontWeight": "400"
  },
  "filterSelectValue": {
    "fontSize": 15,
    "lineHeight": 22,
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
    "paddingVertical": 16
  },
  "filterOptionText": {
    "fontSize": 16,
    "lineHeight": 24,
    "fontWeight": "500"
  }
});
