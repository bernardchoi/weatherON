import { pageStyles } from "../theme/pageStyles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/AppThemeContext";
import { cardShadow, radius, spacing } from "../theme/tokens";

type SectionProps = {
  title: string;
  caption?: string;
  accent?: "clear" | "gold" | "sky" | "warm";
  compact?: boolean;
  contentGap?: number;
  children: React.ReactNode;
};

export function Section({ title, caption, compact = false, contentGap, children }: SectionProps) {
  const theme = useAppTheme();
  return (
    <View style={[styles.shadowWrap, { backgroundColor: theme.card }, cardShadow(theme), pageStyles.card]}>
      <View
        style={[
          styles.section,
          compact ? styles.sectionCompact : null,
          contentGap === undefined ? null : { gap: contentGap },
          { backgroundColor: theme.card, borderColor: theme.border },
          pageStyles.card,
        ]}
      >
        <View style={[styles.header, compact ? styles.headerCompact : null]}>

          <View style={styles.headerCopy}>
            <Text style={[styles.title, pageStyles.sectionTitle, compact ? styles.titleCompact : null, { color: theme.text }]}>{title}</Text>
            {caption ? <Text style={[styles.caption, pageStyles.compactCaption, compact ? styles.captionCompact : null, { color: theme.muted }]} numberOfLines={1}>{caption}</Text> : null}
          </View>
        </View>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.lg,
  },
  section: {
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionCompact: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerCompact: {
    gap: spacing.xs,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
  },
  titleCompact: {
    fontSize: 16,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  captionCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
});
