import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { appColors, radius, spacing } from "../theme/tokens";

type SectionProps = {
  title: string;
  caption?: string;
  children: React.ReactNode;
};

export function Section({ title, caption, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: appColors.panel,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  header: {
    gap: 3,
  },
  title: {
    color: appColors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  caption: {
    color: appColors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
});
