import { pageStyles } from "../theme/pageStyles";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BackButton } from "./BackButton";
import { IosGlassBackdrop } from "./IosGlassBackdrop";
import { StatusPill } from "./StatusPill";
import { useAppTheme } from "../theme/AppThemeContext";
import { iosGlassSurface } from "../theme/iosGlass";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { spacing } from "../theme/tokens";

// AppNavigator에서 BottomNav는 스크롤 영역과 겹치지 않는 별도 레이아웃(flex:1 형제)이라
// 탭바를 가릴 걱정 없이 스크롤 끝의 시각적 여유만 담당하면 된다.
// (과거 이 값을 탭바 높이+마진만큼(112)으로 키운 적이 있는데, 콘텐츠가 짧은 화면(예: 코디)에서
// 불필요한 스크롤을 만드는 부작용이 있어 다시 최소 여백으로 되돌림.)
const navClearancePadding = spacing.xl;

type AppScreenProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  heroAction?: React.ReactNode;
  onBack?: () => void;
  showWordmark?: boolean;
  compactHeader?: boolean;
  // 스크롤 밖에 고정하는 하단 영역. 저장/취소처럼 화면 어디서든 바로 눌러야 하는 주요 액션을 담는다 —
  // children으로 넣으면 콘텐츠가 많은 화면에서 스크롤 맨 끝까지 가야만 보이는 문제가 생긴다.
  footer?: React.ReactNode;
  contentGap?: number;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
  headerBottomSpacing?: number;
  children: React.ReactNode;
};

export function AppScreen({
  title,
  subtitle,
  badge,
  heroAction,
  onBack,
  footer,
  contentGap,
  contentPaddingTop,
  contentPaddingBottom,
  headerBottomSpacing,
  compactHeader = false,
  children,
}: AppScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const barGlass = iosGlassSurface(theme, "bar", { nativeBackdrop: true });
  const inlineHeader = compactHeader && Boolean(onBack);
  return (
    <View style={styles.shell}>
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.content,
          {
            maxWidth: layout.contentMaxWidth,
            paddingHorizontal: layout.screenHorizontalPadding,
            paddingBottom: contentPaddingBottom ?? navClearancePadding,
            paddingTop: contentPaddingTop ?? (inlineHeader ? 0 : spacing.sm),
            gap: contentGap ?? layout.screenContentGap,
          },
        ]}
      >

        <View
          style={[
            styles.hero,
            compactHeader ? styles.compactHero : null,
            inlineHeader ? styles.inlineHero : null,
            pageStyles.header,
            {
              gap: inlineHeader ? spacing.xs : compactHeader ? spacing.sm : layout.screenHeaderGap,
              marginBottom: headerBottomSpacing,
            },
          ]}
        >
          {onBack ? (
            <View style={compactHeader ? styles.compactBackButtonSlot : styles.backButtonSlot}>
              <BackButton onPress={onBack} />
            </View>
          ) : null}
          <View style={styles.heroText}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.text,
                  fontSize: layout.screenTitleFontSize,
                  lineHeight: layout.screenTitleLineHeight,
                },
                pageStyles.title,
              ]}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, pageStyles.caption, compactHeader ? styles.compactSubtitle : null, { color: theme.muted }]} numberOfLines={compactHeader ? 1 : undefined}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {badge || heroAction ? (
            <View style={styles.heroMeta}>
              {badge ? <StatusPill label={badge} tone="gold" /> : null}
              {heroAction}
            </View>
          ) : null}
        </View>
        {children}
      </ScrollView>
      {footer ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.border,
              paddingTop: layout.footerPaddingTop,
              paddingBottom: layout.footerPaddingBottom,
            },
            barGlass,
          ]}
        >
          {barGlass ? <IosGlassBackdrop theme={theme} role="bar" /> : null}
          <View
            style={[
              styles.footerContent,
              {
                maxWidth: layout.contentMaxWidth,
                paddingHorizontal: layout.screenHorizontalPadding,
              },
            ]}
          >
            {footer}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    overflow: "hidden",
  },
  footerContent: {
    width: "100%",
    alignSelf: "center",
  },
  content: {
    paddingTop: spacing.sm,
    flexGrow: 1,
    width: "100%",
    alignSelf: "center",
  },
  atmosphere: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 420,
    opacity: 0.42,
  },
  hero: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
  compactHero: {
    minHeight: 44,
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  inlineHero: {
    minHeight: 44,
  },
  heroPlatformSurface: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "transparent",
    overflow: "hidden",
  },
  heroGlassBackdrop: {
    borderRadius: 22,
  },
  backButtonSlot: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
  },
  compactBackButtonSlot: {
    alignSelf: "center",
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroMeta: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  wordmark: {
    width: 118,
    height: 24,
    marginBottom: spacing.xs,
  },
  title: {
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  compactSubtitle: {
    marginTop: 1,
  },
});
