import React from "react";
import { Image, type ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
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

export function Section({ title, caption, accent, compact = false, contentGap, children }: SectionProps) {
  const theme = useAppTheme();
  const accentColor = accent ? getAccentColor(theme, accent) : undefined;
  const icon = getSectionIcon(title);
  return (
    <View style={[styles.shadowWrap, { backgroundColor: theme.card }, cardShadow(theme)]}>
      <View
        style={[
          styles.section,
          compact ? styles.sectionCompact : null,
          contentGap === undefined ? null : { gap: contentGap },
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        {accentColor ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}
        <View style={[styles.header, compact ? styles.headerCompact : null]}>
          <View style={[styles.iconFrame, compact ? styles.iconFrameCompact : null, { backgroundColor: `${accentColor ?? theme.sky}18` }]}>
            <Image source={icon} style={[styles.icon, compact ? styles.iconCompact : null, { tintColor: accentColor ?? theme.skyLite }]} resizeMode="contain" />
          </View>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, compact ? styles.titleCompact : null, { color: theme.text }]}>{title}</Text>
            {caption ? <Text style={[styles.caption, compact ? styles.captionCompact : null, { color: theme.muted }]} numberOfLines={compact ? 1 : 2}>{caption}</Text> : null}
          </View>
        </View>
        {children}
      </View>
    </View>
  );
}

function getSectionIcon(title: string): ImageSourcePropType {
  if (/(비|강수|우산|날씨|제보)/u.test(title)) return uiIconAssets.rain;
  if (/(코디|옷|스타일|프리셋|착장)/u.test(title)) return uiIconAssets.shirt;
  if (/(목적지|장소|위치|핀|도시)/u.test(title)) return uiIconAssets.pin;
  if (/(알림|출발|이동|다음)/u.test(title)) return uiIconAssets.depart;
  if (/(시간|이력|최근)/u.test(title)) return uiIconAssets.clock;
  if (/(정책|문서|동의|계정|저장)/u.test(title)) return uiIconAssets.myPolicy;
  if (/(설정|기준|필터|상태|정보)/u.test(title)) return uiIconAssets.settings;
  return uiIconAssets.check;
}

function getAccentColor(theme: ReturnType<typeof useAppTheme>, accent: NonNullable<SectionProps["accent"]>) {
  if (accent === "gold") return theme.gold;
  if (accent === "sky") return theme.skyLite;
  if (accent === "warm") return theme.warm;
  return theme.clear;
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
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
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
  iconFrame: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  iconFrameCompact: {
    width: 32,
    height: 32,
  },
  icon: {
    width: 19,
    height: 19,
  },
  iconCompact: {
    width: 17,
    height: 17,
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
