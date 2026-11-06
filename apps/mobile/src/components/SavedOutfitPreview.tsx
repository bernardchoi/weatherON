import React from "react";
import { Image, RawText, StyleSheet, Text, View, useWindowDimensions } from "../localization/react-native";
import { getOutfitImageSource, uiIconAssets } from "../assets";
import { formatDisplayDate } from "../localization/localization";
import { useAppTheme } from "../theme/AppThemeContext";
import { pageStyles } from "../theme/pageStyles";
import { radius, semanticColor, spacing } from "../theme/tokens";
import { getOutfitSlotLabel } from "../utils/outfitLabels";
import type { SavedOutfitSnapshot } from "../utils/savedOutfit";
import { AmbientMotionContext } from "./AmbientReveal";
import { AppButton } from "./AppButton";
import { BottomSheet } from "./BottomSheet";

// Read only the durable snapshot, never the latest recommendation or wardrobe.
// Mount this only while a snapshot exists so account cleanup removes sheet content too.
export function SavedOutfitPreview({ snapshot }: { snapshot: SavedOutfitSnapshot }) {
  const theme = useAppTheme();
  const { fontScale } = useWindowDimensions();
  const { active } = React.useContext(AmbientMotionContext);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => { if (!active) setOpen(false); }, [active]);

  return <>
    <AppButton label="저장한 코디 보기" onPress={() => setOpen(true)} tone="secondary" variant="outlined" size="sm" />
    <BottomSheet visible={open && active} onClose={() => setOpen(false)} accessibilityLabel="저장한 코디">
      <Text accessibilityRole="header" style={[pageStyles.sectionTitle, { color: theme.text }]}>저장한 코디</Text>
      <View style={styles.copy}>
        <RawText style={[pageStyles.body, { color: theme.text }]}>{snapshot.weather.locationName}</RawText>
        <Text style={[pageStyles.compactCaption, { color: theme.muted }]}>저장 {formatDisplayDate(snapshot.savedAt, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</Text>
        <Text style={[pageStyles.compactCaption, { color: theme.muted }]}>저장 당시의 추천이에요. 현재 날씨·옷장 상태와 다를 수 있어요.</Text>
      </View>
      <Text style={[pageStyles.body, { color: theme.text }]}>{snapshot.outfit.decisionText}</Text>
      <View style={styles.copy}>
        {Object.entries(snapshot.outfit.items).map(([slot, item]) => {
          if (!item) return null;
          const imageSource = getOutfitImageSource(item.imageUrl);
          return <View key={slot} style={[styles.item, { borderColor: theme.border }, fontScale > 1.5 && styles.stackedItem]}>
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.imageFrame, { backgroundColor: semanticColor(theme, "outfitImageSurface") }]}>
              <Image source={imageSource ?? uiIconAssets.shirt} resizeMode="contain" style={[styles.image, !imageSource && { tintColor: theme.clear }]} />
            </View>
            <View style={[styles.itemCopy, fontScale > 1.5 && styles.stackedItemCopy]}>
              <Text style={[pageStyles.compactCaption, { color: theme.clear }]}>{getOutfitSlotLabel(slot)}</Text>
              {item.source === "photo" ? <RawText style={[pageStyles.body, { color: theme.text }]}>{item.name}</RawText> : <Text style={[pageStyles.body, { color: theme.text }]}>{item.name}</Text>}
              <Text style={[pageStyles.compactCaption, { color: theme.muted }]}>{item.owned ? "저장 당시 보유" : "저장 당시 추가 준비"}</Text>
            </View>
          </View>;
        })}
      </View>
      {snapshot.outfit.reasons.length ? <View style={styles.copy}>
        <Text accessibilityRole="header" style={[pageStyles.body, { color: theme.text }]}>저장 당시 추천 이유</Text>
        {snapshot.outfit.reasons.map((reason, index) => <Text key={index} style={[pageStyles.compactCaption, { color: theme.muted }]}>{reason}</Text>)}
      </View> : null}
      <AppButton label="닫기" onPress={() => setOpen(false)} tone="secondary" size="sm" />
    </BottomSheet>
  </>;
}

const styles = StyleSheet.create({
  copy: { gap: spacing.xs },
  item: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  stackedItem: { flexDirection: "column", alignItems: "stretch" },
  imageFrame: { width: 84, height: 84, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  image: { width: 76, height: 76 },
  itemCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
  stackedItemCopy: { flex: 0, width: "100%" },
});
