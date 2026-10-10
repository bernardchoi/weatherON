import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type ColorValue,
  type LayoutChangeEvent,
  View,
} from "../localization/react-native";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { uiIconAssets } from "../assets";
import { ambientUiIcons, ambientSelectedTabs } from "../ambientAssets";
import { ambientPalette } from "../theme/ambientSurface";
import { bottomNavRoutes, type P0RouteId } from "../navigation/routes";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialColor, androidMaterialRipple, androidMaterialSurface } from "../theme/androidMaterial";
import { useResponsiveLayout } from "../theme/responsiveLayout";
import { iosGlassSurface } from "../theme/iosGlass";
import { colorWithAlpha, type AppTheme } from "../theme/tokens";
import { IosGlassBackdrop } from "./IosGlassBackdrop";
import { hasNativeLiquidGlassNavigationSurface, LiquidGlassNavigationSurface } from "./LiquidGlassNavigationSurface";
import { LocalizationContext } from "../localization/LocalizationProvider";
import { translateText } from "../localization/localization";

type BottomNavProps = {
  activeRoute: P0RouteId;
  onNavigate: (route: P0RouteId) => void;
};

export function BottomNav({ activeRoute, onNavigate }: BottomNavProps) {
  const theme = useAppTheme();
  const { language } = React.use(LocalizationContext);
  const layout = useResponsiveLayout();
  const isIos = Platform.OS === "ios";
  const useNativeSurface = hasNativeLiquidGlassNavigationSurface && !theme.reducedTransparency;
  const activeTabRoute = getActiveTabRoute(activeRoute);
  const activeIndex = Math.max(0, bottomNavRoutes.findIndex((route) => route.id === activeTabRoute));
  const reducedMotion = useReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;
  const selectionX = useRef(new Animated.Value(0)).current;
  const [dockWidth, setDockWidth] = useState(0);
  const draggingRef = useRef(false);
  const dragStartRef = useRef(0);
  const snapSelection = (index: number) => {
    selectionX.stopAnimation();
    const toValue = index * Math.max(0, dockMetricsRef.current.width - 2) / bottomNavRoutes.length;
    if (reducedMotionRef.current !== false) selectionX.setValue(toValue);
    else Animated.spring(selectionX, { toValue, stiffness: 310, damping: 32, mass: 1, useNativeDriver: true }).start();
  };
  useEffect(() => {
    if (isIos && !draggingRef.current) snapSelection(activeIndex);
  }, [activeIndex, dockWidth, reducedMotion]);
  useEffect(() => () => selectionX.stopAnimation(), [selectionX]);
  const dockRef = useRef<View>(null);
  const dockMetricsRef = useRef({ windowX: 0, width: 0, measuredInWindow: false });
  const activeIndexRef = useRef(activeIndex);
  const navigateRef = useRef(onNavigate);
  const draggedIndexRef = useRef(activeIndex);
  const didSwitchTabRef = useRef(false);
  const iosColors = getIosTabColors(theme);
  const activeColor = ambientPalette(theme).accent;
  const navigationBackground = isIos
    ? iosGlassSurface(theme, "dock", { nativeBackdrop: useNativeSurface })
    : androidMaterialSurface(theme, "navigation");

  activeIndexRef.current = activeIndex;
  navigateRef.current = onNavigate;

  const dragResponder = useMemo(() => {
    const getEventTabIndex = (pageX: number, locationX: number) =>
      getTabIndexAtPosition(pageX, locationX, dockMetricsRef.current);

    const navigateToIndex = (nextIndex: number) => {
      if (nextIndex === draggedIndexRef.current) return;
      const nextRoute = bottomNavRoutes[nextIndex];
      if (!nextRoute) return;

      draggedIndexRef.current = nextIndex;
      didSwitchTabRef.current = true;
      navigateRef.current(nextRoute.id);
    };

    return PanResponder.create({
      onStartShouldSetPanResponderCapture: (event) => {
        const touchedIndex = getEventTabIndex(event.nativeEvent.pageX, event.nativeEvent.locationX);
        return touchedIndex === activeIndexRef.current;
      },
      onStartShouldSetPanResponder: (event) => {
        const touchedIndex = getEventTabIndex(event.nativeEvent.pageX, event.nativeEvent.locationX);
        return touchedIndex === activeIndexRef.current;
      },
      onPanResponderGrant: (event) => {
        const touchedIndex = getEventTabIndex(event.nativeEvent.pageX, event.nativeEvent.locationX);
        draggedIndexRef.current = touchedIndex ?? activeIndexRef.current;
        didSwitchTabRef.current = false;
        if (isIos) {
          draggingRef.current = true;
          selectionX.stopAnimation((value) => {
            if (draggingRef.current) dragStartRef.current = value;
          });
          dragStartRef.current = activeIndexRef.current * (dockMetricsRef.current.width - 2) / bottomNavRoutes.length;
        }
      },
      onPanResponderMove: (event, gesture) => {
        if (isIos) {
          const tabWidth = (dockMetricsRef.current.width - 2) / bottomNavRoutes.length;
          if (tabWidth <= 0) return;
          const position = Math.max(0, Math.min(tabWidth * (bottomNavRoutes.length - 1), dragStartRef.current + gesture.dx));
          selectionX.setValue(position);
          draggedIndexRef.current = Math.round(position / tabWidth);
          return;
        }
        const touchedIndex = getEventTabIndex(event.nativeEvent.pageX, event.nativeEvent.locationX);
        if (touchedIndex !== null) navigateToIndex(touchedIndex);
      },
      onPanResponderRelease: () => {
        if (isIos) {
          draggingRef.current = false;
          snapSelection(draggedIndexRef.current);
          const route = bottomNavRoutes[draggedIndexRef.current];
          if (route) navigateRef.current(route.id);
          return;
        }
        if (!didSwitchTabRef.current) {
          const selectedRoute = bottomNavRoutes[draggedIndexRef.current];
          if (selectedRoute) navigateRef.current(selectedRoute.id);
        }
        didSwitchTabRef.current = false;
      },
      onPanResponderTerminate: () => {
        if (isIos) {
          draggingRef.current = false;
          snapSelection(activeIndexRef.current);
        }
        didSwitchTabRef.current = false;
      },
      onPanResponderTerminationRequest: () => false,
    });
  }, []);

  const handleDockLayout = (event: LayoutChangeEvent) => {
    // First layout has no previous selection position to animate from.
    if (dockMetricsRef.current.width === 0) {
      selectionX.setValue(activeIndexRef.current * Math.max(0, event.nativeEvent.layout.width - 2) / bottomNavRoutes.length);
    }
    setDockWidth(event.nativeEvent.layout.width);
    dockMetricsRef.current = {
      ...dockMetricsRef.current,
      width: event.nativeEvent.layout.width,
    };
    dockRef.current?.measureInWindow((windowX, _windowY, width) => {
      dockMetricsRef.current = { windowX, width, measuredInWindow: true };
    });
  };

  return (
    <View style={[styles.dockWrap, { backgroundColor: activeTabRoute === "H1" ? ambientPalette(theme).background : theme.background }]}>
      <View
        style={[
          styles.dockFrame,
          isIos ? styles.iosDockFrame : styles.androidDockFrame,
          {
            maxWidth: layout.bottomNavMaxWidth,
            paddingHorizontal: layout.bottomNavHorizontalPadding,
          },
        ]}
      >
        <View
          ref={dockRef}
          onLayout={handleDockLayout}
          {...(useNativeSurface || !isIos ? {} : dragResponder.panHandlers)}
          style={[
            styles.dock,
            isIos ? styles.iosDock : styles.androidDock,
            navigationBackground,
            isIos ? { borderRadius: 42, borderWidth: StyleSheet.hairlineWidth, borderColor: colorWithAlpha(ambientPalette(theme).muted, 0.28), shadowOpacity: 0.1, shadowRadius: 16 } : null,
            !isIos ? { borderRadius: 20, backgroundColor: ambientPalette(theme).surface, elevation: 0 } : null,
          ]}
        >
          {isIos ? (
            <IosGlassBackdrop theme={theme} role="dock" overlayColor={theme.name === "dark" ? "#24446C55" : "#D5EAFE55"} style={styles.iosDockBackdrop} />
          ) : null}
          {useNativeSurface ? (
            <LiquidGlassNavigationSurface activeIndex={activeIndex} isDarkTheme={theme.name === "dark"}
              onSelect={({ nativeEvent }) => {
                const route = bottomNavRoutes[nativeEvent.index];
                if (route) onNavigate(route.id);
              }} />
          ) : isIos && dockWidth > 2 ? (
            <Animated.View pointerEvents="none" style={{ position: "absolute", top: 4, height: Math.min(74, (dockWidth - 2) / bottomNavRoutes.length - 8), left: ((dockWidth - 2) / bottomNavRoutes.length - Math.min(74, (dockWidth - 2) / bottomNavRoutes.length - 8)) / 2, width: Math.min(74, (dockWidth - 2) / bottomNavRoutes.length - 8), transform: [{ translateX: selectionX }] }}>
              <View style={[StyleSheet.absoluteFill, { borderRadius: 40, borderWidth: 0, backgroundColor: iosColors.activeBackground, borderColor: iosColors.activeBorder }]} />
            </Animated.View>
          ) : null}
          {bottomNavRoutes.map((route) => {
            const active = route.id === activeTabRoute;
            const label = translateText(route.label, language);
            const iconColor = active ? activeColor : ambientPalette(theme).muted;
            const labelColor = active ? ambientPalette(theme).accentLabel : ambientPalette(theme).muted;
            return (
              <TabButton
                key={route.id}
                label={label}
                accessibilityLabel={translateText(`${route.label} 탭`, language)}
                active={active}
                nativeSurface={useNativeSurface}
                onPress={() => onNavigate(route.id)}
              >
                <TabContent
                  route={route.id}
                  active={active}
                  isIos={isIos}
                  iconColor={iconColor}
                  labelColor={labelColor}
                  theme={theme}
                  label={label}
                />
              </TabButton>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function getTabIndexAtPosition(
  pageX: number,
  locationX: number,
  metrics: { windowX: number; width: number; measuredInWindow: boolean },
) {
  if (metrics.width <= 0) return null;

  const relativeX = metrics.measuredInWindow ? pageX - metrics.windowX : locationX;
  const normalizedX = Math.max(0, Math.min(relativeX, metrics.width - 1));
  return Math.floor((normalizedX / metrics.width) * bottomNavRoutes.length);
}

function TabContent({
  route,
  active,
  isIos,
  iconColor,
  labelColor,
  theme,
  label,
}: {
  route: P0RouteId;
  active: boolean;
  isIos: boolean;
  iconColor: ColorValue;
  labelColor: ColorValue;
  theme: AppTheme;
  label: string;
}) {
  const transition = useRef(new Animated.Value(active ? 1 : 0)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion !== false) {
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
    return () => transition.stopAnimation();
  }, [active, isIos, transition, reducedMotion]);

  const useHighContrastIosMotion = isIos && theme.name === "dark";
  const iconMotion = {
    opacity: transition.interpolate({
      inputRange: [0, 1],
      outputRange: [isIos ? 1 : 0.72, 1],
    }),
    transform: [
      { translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [useHighContrastIosMotion ? 0 : 1, -1] }) },
      { scale: transition.interpolate({ inputRange: [0, 1], outputRange: [useHighContrastIosMotion ? 0.96 : 0.9, 1.08] }) },
    ],
  };
  const labelMotion = {
    opacity: transition.interpolate({
      inputRange: [0, 1],
      outputRange: [isIos ? 1 : 0.78, 1],
    }),
    transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }],
  };

  return (
    <>
      <Animated.View
        style={[
          styles.iconContainer,
          isIos ? { height: 34 } : null,
          !isIos ? styles.androidIconContainer : null,
          active && !isIos ? { backgroundColor: ambientPalette(theme).selected } : null,
          iconMotion,
        ]}
      >
        <TabIcon route={route} active={active} color={iconColor} useHighContrastSize={isIos} />
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          !isIos ? styles.androidLabel : null,
          isIos ? styles.iosDarkLabel : null,
          useHighContrastIosMotion && active ? styles.iosDarkActiveLabel : null,
          { color: labelColor, fontWeight: active ? "700" : "400" },
          labelMotion,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.9}
        maxFontSizeMultiplier={1.4}
      >
        {label}
      </Animated.Text>
    </>
  );
}

function TabButton({
  nativeSurface,
  label,
  accessibilityLabel,
  active,
  onPress,
  children,
}: {
  label: string;
  nativeSurface: boolean;
  accessibilityLabel: string;
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      pointerEvents={nativeSurface ? "none" : "auto"}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      android_ripple={Platform.OS === "android" ? androidMaterialRipple(theme) : undefined}
      onPress={onPress}
      style={[
        styles.item,
        Platform.OS === "android" ? styles.androidItem : null,
      ]}
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
  const p = ambientPalette(theme);
  return { activeIcon: p.accent, activeLabel: p.accentLabel, activeDot: p.accent,
    inactiveIcon: p.muted, inactiveLabel: p.muted, activeBackground: p.selected, activeBorder: "transparent" };
}

function TabIcon({
  route,
  active,
  color,
  useHighContrastSize,
}: {
  route: P0RouteId;
  active: boolean;
  color: ColorValue;
  useHighContrastSize: boolean;
}) {
  const source = getTabIconSource(route, active);
  return (
    <Image
      source={source}
      style={[styles.iconImage, useHighContrastSize ? styles.iosDarkIconImage : null, { tintColor: color }]}
      resizeMode="contain"
    />
  );
}

function getTabIconSource(route: P0RouteId, active: boolean) {
  const icons = active ? ambientSelectedTabs : ambientUiIcons;
  if (route === "H1") return icons.tabHome;
  if (route === "C1") return icons.tabOutfit;
  if (route === "G1") return icons.tabDepart;
  if (route === "M1") return icons.tabMy;
  return uiIconAssets.tabSocial;
}

const styles = StyleSheet.create({
  dockWrap: {
    marginTop: 8,
  },
  dockFrame: {
    width: "100%",
    alignSelf: "center",
  },
  iosDockFrame: {
    height: 82,
    marginBottom: 12,
  },
  androidDockFrame: {
    height: 78,
    marginBottom: 8,
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
  iosDockBackdrop: {
    borderRadius: 42,
  },
  androidDock: {
    borderRadius: 32,
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
    width: 42,
    height: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  androidItem: {
    borderRadius: 29,
    overflow: "hidden",
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
  iosDarkActiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginBottom: 2,
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
  iosDarkLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
  iosDarkActiveLabel: {
    fontWeight: "800",
  },
  androidLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  iosDarkIconImage: {
    width: 30,
    height: 30,
  },
});
