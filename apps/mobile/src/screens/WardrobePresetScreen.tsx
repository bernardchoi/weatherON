import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { outfitImageAssets } from "../assets";
import { AppButton } from "../components/AppButton";
import { AppScreen } from "../components/AppScreen";
import { Section } from "../components/Section";
import { StatusPill } from "../components/StatusPill";
import type { P0ScreenProps } from "../navigation/types";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";
import { formatOutfitTags, getWardrobeCategoryLabel } from "../utils/outfitLabels";

const categoryLabels = ["전체", "겉옷", "상의", "하의", "신발", "소품"];
const seasonLabels = ["전체", "봄가을", "여름", "겨울"];
const purposeLabels = ["전체", "비", "바람", "출근", "여행"];

export function WardrobePresetScreen({
  wardrobeItems,
  selectedWardrobeItemId,
  accountLinked,
  onSetWardrobeItemOwned,
  onNavigate,
}: P0ScreenProps) {
  const theme = useAppTheme();
  const activeItem = wardrobeItems.find((item) => item.id === selectedWardrobeItemId);
  const presetItems = wardrobeItems.slice(0, 6);

  if (!activeItem) {
    return (
      <AppScreen title="옷장 프리셋" subtitle="선택된 프리셋이 없음" badge="프리셋">
        <Section title="준비 상태" caption="옷장에서 항목을 먼저 선택해줘야 함">
          <Text style={styles.empty}>목록에서 상세 보기를 눌러 다시 접근</Text>
          <AppButton label="옷장으로" onPress={() => onNavigate("C2")} />
        </Section>
      </AppScreen>
    );
  }
  const activeImage = outfitImageAssets[activeItem.imageUrl];

  return (
    <AppScreen title="아이템 추가" subtitle="프리셋을 선택하거나 사진으로 등록" badge="옷장 추가">
      <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.copy}>
          <Text style={[styles.kicker, { color: theme.gold }]}>옷장 추가</Text>
          <Text style={[styles.title, { color: theme.text }]}>{activeItem.name} 선택됨</Text>
        </View>
        <StatusPill label="준비" tone="clear" />
      </View>

      <View style={[styles.segment, { backgroundColor: theme.cardMuted }]}>
        <View style={[styles.segmentActive, { backgroundColor: theme.gold }]}>
          <Text style={[styles.segmentText, { color: theme.onAccent }]}>프리셋 선택</Text>
        </View>
        <View style={styles.segmentPassive}>
          <Text style={[styles.segmentText, { color: theme.muted }]}>사진으로 등록</Text>
        </View>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.cardMuted }]}>
        <Text style={[styles.searchText, { color: theme.subtle }]}>아이템, 날씨, 목적 검색</Text>
      </View>

      <Section title="필터" caption="아이템·계절·목적 기준" accent="sky">
        <FilterPills title="아이템" values={categoryLabels} />
        <FilterPills title="계절" values={seasonLabels} />
        <FilterPills title="목적" values={purposeLabels} />
      </Section>

      <Section title="선택됨" caption={`${getWardrobeCategoryLabel(activeItem.category)} · ${formatOutfitTags(activeItem.weatherTags)}`} accent="clear">
        <View style={[styles.selectedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.selectedImageWrap, { backgroundColor: theme.cardMuted }]}>
            {activeImage ? <Image source={activeImage} style={styles.selectedImage} resizeMode="contain" /> : null}
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.text }]}>{activeItem.name}</Text>
            <Text style={[styles.copyText, { color: theme.muted }]}>
              {formatOutfitTags(activeItem.seasons)} · {formatOutfitTags(activeItem.purposes)}
            </Text>
          </View>
          <StatusPill label={activeItem.owned ? "내 옷장" : "선택됨"} tone={activeItem.owned ? "clear" : "gold"} />
        </View>
      </Section>

      <Section title="프리셋" caption={`${presetItems.length}개 미리보기`} accent="gold">
        <View style={styles.presetGrid}>
          {presetItems.map((item) => {
            const imageSource = outfitImageAssets[item.imageUrl];
            const selected = item.id === activeItem.id;
            return (
              <View
                key={item.id}
                style={[styles.presetCard, { backgroundColor: theme.cardMuted, borderColor: selected ? theme.gold : theme.border }]}
              >
                <View style={[styles.presetImageWrap, { backgroundColor: theme.cardStrong }]}>
                  {imageSource ? <Image source={imageSource} style={styles.presetImage} resizeMode="contain" /> : null}
                </View>
                <Text style={[styles.presetName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
                <Text style={[styles.presetMeta, { color: theme.muted }]} numberOfLines={1}>{formatOutfitTags(item.weatherTags)}</Text>
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="옷장 반영" caption={accountLinked ? "계정 저장 가능" : "이 기기에만 저장됨"} accent="gold">
        <View style={styles.actions}>
          <AppButton
            label={activeItem.owned ? "내 옷장 해제" : "내 옷장에 추가"}
            onPress={() => onSetWardrobeItemOwned(activeItem.id, !activeItem.owned)}
            tone="warning"
          />
          <AppButton label="코디 보기" onPress={() => onNavigate("C1")} tone="secondary" />
          <AppButton label="옷장 목록" onPress={() => onNavigate("C2")} tone="secondary" />
        </View>
      </Section>
    </AppScreen>
  );
}

function FilterPills({ title, values }: { title: string; values: string[] }) {
  const theme = useAppTheme();
  return (
    <View style={styles.filterGroup}>
      <Text style={[styles.filterTitle, { color: theme.muted }]}>{title}</Text>
      <View style={styles.pillRow}>
        {values.map((item, index) => (
          <View
            key={item}
            style={[
              styles.filterPill,
              { backgroundColor: index === 0 ? theme.gold : theme.cardMuted, borderColor: index === 0 ? theme.gold : theme.border },
            ]}
          >
            <Text style={[styles.filterText, { color: index === 0 ? theme.onAccent : theme.muted }]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    minHeight: 74,
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
    gap: 4,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "900",
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
  segment: {
    minHeight: 48,
    flexDirection: "row",
    gap: spacing.xs,
    padding: 4,
    borderRadius: radius.lg,
  },
  segmentActive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  segmentPassive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "900",
  },
  searchBox: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  searchText: {
    fontSize: 14,
    fontWeight: "800",
  },
  filterGroup: {
    gap: spacing.xs,
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: "900",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterPill: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "900",
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
    minHeight: 126,
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
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
