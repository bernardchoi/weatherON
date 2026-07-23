import React, { useEffect, useRef } from "react";
import { Animated, Image, Platform, Pressable, StyleSheet, Text, type ColorValue, View } from "react-native";
import { uiIconAssets } from "../assets";
import { bottomNavRoutes, type P0RouteId } from "../navigation/routes";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialColor, androidMaterialRipple, androidMaterialSurface } from "../theme/androidMaterial";
import { iosGlassSurface } from "../theme/iosGlass";
import { colorWithAlpha, type AppTheme } from "../theme/tokens";
import { hasNativeLiquidGlassNavigationSurface, LiquidGlassNavigationSurface } from "./LiquidGlassNavigationSurface";

type BottomNavProps = {
  activeRoute: P0RouteId;
  onNavigate: (route: P0RouteId) => void;
};

export function BottomNav({ activeRoute, onNavigate }: BottomNavProps) {
  const theme = useAppTheme();
  const isIos = Platform.OS === "ios";
  const activeTabRoute = getActiveTabRoute(activeRoute);
  const activeIndex = Math.max(0, bottomNavRoutes.findIndex((route) => route.id === activeTabRoute));
  const iosColors = getIosTabColors(theme);
  const activeColor = isIos ? iosColors.activeIcon : androidMaterialColor(theme, "primary");
  const materialNavigationSurface = androidMaterialSurface(theme, "navigation") ?? {
    backgroundColor: theme.cardStrong,
    borderColor: theme.border,
  };
  return (
    <View style={[styles.dockWrap, isIos ? styles.iosDockWrap : styles.androidDockWrap]}>
      <View
        style={[
          styles.dock,
          isIos ? styles.iosDock : styles.androidDock,
          isIos
            ? iosGlassSurface(theme, "dock", { nativeBackdrop: true })
            : materialNavigationSurface,
        ]}
      >
        {isIos ? <LiquidGlassNavigationSurface activeIndex={activeIndex} theme={theme} /> : null}
        {bottomNavRoutes.map((route) => {
          const active = route.id === activeTabRoute;
          const iconColor = isIos ? (active ? iosColors.activeIcon : iosColors.inactiveIcon) : active ? activeColor : theme.subtle;
          const labelColor = isIos ? (active ? iosColors.activeLabel : iosColors.inactiveLabel) : active ? activeColor : theme.subtle;
          return (
            <TabButton
              key={route.id}
              label={route.label}
              active={active}
              onPress={() => onNavigate(route.id)}
              ripple={isIos ? undefined : androidMaterialRipple(theme)}
            >
              {isIos && active && !hasNativeLiquidGlassNavigationSurface ? (
                <View
                  pointerEvents="none"
                  style={[
                    styles.iosActivePill,
                    {
                      backgroundColor: iosColors.activeBackground,
                      borderColor: iosColors.activeBorder,
                    },
                  ]}
                />
              ) : null}
              {isIos ? <View style={[styles.activeDot, { backgroundColor: active ? iosColors.activeDot : "transparent" }]} /> : null}
              <TabContent
                route={route.id}
                active={active}
                isIos={isIos}
                iconColor={iconColor}
                labelColor={labelColor}
                theme={theme}
              />
            </TabButton>
          );
        })}
      </View>
    </View>
  );
}

function TabContent({
  route,
  active,
  isIos,
  iconColor,
  labelColor,
  theme,
}: {
  route: P0RouteId;
  active: boolean;
  isIos: boolean;
  iconColor: ColorValue;
  labelColor: ColorValue;
  theme: AppTheme;
}) {
  const transition = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    if (!isIos) {
      transition.setValue(active ? 1 : 0);
      return;
    }

    Animated.spring(transition, {
      toValue: active ? 1 : 0,
      stiffness: 280,
      damping: 22,
      mass: 0.72,
      useNativeDriver: true,
    }).start();
  }, [active, isIos, transition]);

  const iconMotion = {
    opacity: transition.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }),
    transform: [
      { translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [1, -1] }) },
      { scale: transition.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] }) },
    ],
  };
  const labelMotion = {
    opacity: transition.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] }),
    transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }],
  };

  return (
    <>
      <Animated.View
        style={[
          styles.iconContainer,
          !isIos ? styles.androidIconContainer : null,
          !isIos && active ? { backgroundColor: androidMaterialColor(theme, "secondaryContainer") } : null,
          iconMotion,
        ]}
      >
        <TabIcon route={route} color={iconColor} />
      </Animated.View>
      <Animated.Text
        style={[styles.label, !isIos ? styles.androidLabel : null, { color: labelColor }, labelMotion]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.9}
        allowFontScaling={false}
      >
        {bottomNavRoutes.find((item) => item.id === route)?.label}
      </Animated.Text>
    </>
  );
}

function TabButton({
  label,
  active,
  onPress,
  ripple,
  children,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  ripple?: ReturnType<typeof androidMaterialRipple>;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label} 탭`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      android_ripple={ripple}
      onPress={onPress}
      style={styles.item}
    >
      {children}
    </Pressable>
  );
}

function getActiveTabRoute(route: P0RouteId): P0RouteId {
  if (route === "C1" || route === "C2" || route === "C3" || route === "C4") return "C1";
  if (route === "H3" || route === "H4" || route === "H5" || route === "H6") return "H1";
  if (route === "G2" || route === "G3" || route === "G4" || route === "G5" || route === "G6" || route === "P1" || route === "P2" || route === "P3") return "G1";
  if (route === "M2" || route === "M3" || route === "M4") return "M1";
  return route;
}

function getIosTabColors(theme: AppTheme) {
  if (theme.name === "dark") {
    return {
      activeIcon: theme.text,
      activeLabel: theme.text,
      activeDot: theme.clear,
      inactiveIcon: colorWithAlpha(theme.text, 0.78),
      inactiveLabel: colorWithAlpha(theme.text, 0.74),
      activeBackground: colorWithAlpha(theme.clear, theme.reducedTransparency ? 0.2 : 0.16),
      activeBorder: colorWithAlpha(theme.clear, 0.36),
    };
  }

  return {
    activeIcon: theme.clear,
    activeLabel: theme.text,
    activeDot: theme.clear,
    inactiveIcon: colorWithAlpha(theme.text, 0.62),
    inactiveLabel: colorWithAlpha(theme.text, 0.58),
    activeBackground: colorWithAlpha(theme.clear, theme.reducedTransparency ? 0.14 : 0.1),
    activeBorder: colorWithAlpha(theme.clear, 0.24),
  };
}

function TabIcon({ route, color }: { route: P0RouteId; color: ColorValue }) {
  const source = getTabIconSource(route);
  return <Image source={source} style={[styles.iconImage, { tintColor: color }]} resizeMode="contain" />;
}

function getTabIconSource(route: P0RouteId) {
  if (route === "H1") return uiIconAssets.tabHome;
  if (route === "C1") return uiIconAssets.tabOutfit;
  if (route === "G1") return uiIconAssets.tabDepart;
  if (route === "M1") return uiIconAssets.tabMy;
  return uiIconAssets.tabSocial;
}

const styles = StyleSheet.create({
  dockWrap: {
    marginTop: 8,
  },
  iosDockWrap: {
    height: 64,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  androidDockWrap: {
    height: 72,
    marginBottom: 0,
  },
  dock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 32,
    borderWidth: 1,
    overflow: "hidden",
  },
  iosDock: {
    borderRadius: 32,
  },
  androidDock: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: 58,
    position: "relative",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  androidIconContainer: {
    width: 64,
    height: 32,
    borderRadius: 16,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginBottom: 1,
  },
  iosActivePill: {
    position: "absolute",
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
    borderWidth: 1,
    borderRadius: 28,
  },
  label: {
    minWidth: 42,
    maxWidth: 54,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "600",
    textAlign: "center",
    includeFontPadding: false,
  },
  androidLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
  },
  iconImage: {
    width: 21,
    height: 21,
  },
});
