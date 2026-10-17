import React from "react";
import { Image, RawText, StyleSheet, Text, View, type ImageSourcePropType } from "../localization/react-native";
import { ambientUiIcons } from "../ambientAssets";
import { useAppTheme } from "../theme/AppThemeContext";
import { FeedbackPressable } from "./FeedbackPressable";

// Content rows share their parent's material. Selection never creates another
// glass card. Haptics belong to the confirmed owner transition, not this row.
export function IosSelectionRow({ label, description, icon, selected, disabled = false, last = false, rawLabel = false, accessibilityLabel, onPress }: {
  label: string; description?: string; icon: ImageSourcePropType | React.ReactElement; selected: boolean;
  disabled?: boolean; last?: boolean; rawLabel?: boolean; accessibilityLabel?: string; onPress: () => void;
}) {
  const theme = useAppTheme();
  const Label = rawLabel ? RawText : Text;
  return <FeedbackPressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ selected, disabled }} disabled={disabled} hapticFeedback="none" onPress={onPress}
    style={[styles.row, { opacity: disabled ? 0.5 : 1, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
    {React.isValidElement(icon) ? icon : <Image source={icon as ImageSourcePropType} accessible={false} style={[styles.icon, { tintColor: selected ? theme.clear : theme.muted }]} />}
    <View style={styles.copy}>
      <Label style={[styles.label, { color: selected ? theme.clear : theme.text, fontWeight: selected ? "600" : "500" }]}>{label}</Label>
      {description ? <Text style={[styles.description, { color: theme.muted }]}>{description}</Text> : null}
    </View>
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.check}>
      {selected ? <Image source={ambientUiIcons.check} style={[styles.icon, { tintColor: theme.clear }]} /> : null}
    </View>
  </FeedbackPressable>;
}
const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", minHeight: 56, paddingVertical: 12, paddingHorizontal: 4, gap: 12 }, icon: { width: 22, height: 22, flexShrink: 0 }, copy: { flex: 1, minWidth: 0, gap: 4 }, label: { fontSize: 16, lineHeight: 24, flexShrink: 1 }, description: { fontSize: 13, lineHeight: 20 }, check: { width: 24, minHeight: 24, alignItems: "center", justifyContent: "center", flexShrink: 0 } });
