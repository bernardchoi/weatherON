import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { radius, spacing } from "../theme/tokens";

export function FilterRow({
  values,
  activeValue,
  onSelect,
  renderLabel,
}: {
  values: readonly string[];
  activeValue: string;
  onSelect: (value: string) => void;
  renderLabel: (value: string) => string;
}) {
  const theme = useAppTheme();
  return (
    <View style={styles.filterRow}>
      {values.map((value) => (
        <Pressable
          key={value}
          accessibilityRole="button"
          accessibilityState={{ selected: activeValue === value }}
          onPress={() => onSelect(value)}
          style={[
            styles.filterButton,
            {
              backgroundColor: activeValue === value ? theme.gold : theme.cardMuted,
              borderColor: activeValue === value ? theme.gold : theme.border,
            },
          ]}
        >
          <Text style={[styles.filterText, { color: activeValue === value ? theme.onAccent : theme.muted }]}>{renderLabel(value)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterButton: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "900",
  },
});
