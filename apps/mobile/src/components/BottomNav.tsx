import React, { useRef } from "react";
import { Animated, Easing, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { bottomNavRoutes, type P0RouteId } from "../navigation/routes";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialActiveIndicator, androidMaterialRipple, androidMaterialSurface } from "../theme/androidMaterial";
import { iosGlassSurface } from "../theme/iosGlass";
import { radius, spacing } from "../theme/tokens";

type BottomNavProps = {
  activeRoute: P0RouteId;
  onNavigate: (route: P0RouteId) => void;
};

// UI Design Spec v1.0 §10: floating tab bar — bottom 18, left/right 16, height 64,
// radius 24, active 5px dot + Gold icon/text, inactive Mist, icon 21px, press tint 0.12.
export function BottomNav({ activeRoute, onNavigate }: BottomNavProps) {
  const theme = useAppTheme();
  const activeTabRoute = getActiveTabRoute(activeRoute);
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.name === "light" ? theme.card : theme.cardStrong,
          borderColor: theme.navBorder,
          shadowColor: theme.shadow,
        },
        androidMaterialSurface(theme, "navigation"),
        iosGlassSurface(theme, "bar"),
      ]}
    >
      {bottomNavRoutes.map((route) => {
        const active = route.id === activeTabRoute;
        return (
          <TabButton
            key={route.id}
            routeId={route.id}
            label={route.label}
            active={active}
            tintColor={theme.cardMuted}
            ripple={androidMaterialRipple(theme)}
            onPress={() => onNavigate(route.id)}
          >
            <View pointerEvents="none" style={[styles.androidActiveIndicator, androidMaterialActiveIndicator(theme, active)]} />
            <View style={[styles.activeDot, { backgroundColor: active ? theme.gold : "transparent" }]} />
            <TabIcon route={route.id} color={active ? theme.gold : theme.subtle} />
            <Text
              style={[styles.label, { color: active ? theme.gold : theme.subtle }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.9}
              allowFontScaling={false}
            >
              {route.label}
            </Text>
          </TabButton>
        );
      })}
    </View>
  );
}

// UI Design Spec v1.0 §10: 프레스 tint overlay opacity 0.12, 120ms.
function TabButton({
  routeId,
  label,
  active,
  tintColor,
  ripple,
  onPress,
  children,
}: {
  routeId: P0RouteId;
  label: string;
  active: boolean;
  tintColor: string;
  ripple?: ReturnType<typeof androidMaterialRipple>;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const tint = useRef(new Animated.Value(0)).current;
  const usesNativeRipple = Platform.OS === "android" && Boolean(ripple);

  const animateTo = (toValue: number) => {
    Animated.timing(tint, {
      toValue,
      duration: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      accessibilityLabel={`${label} 탭`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      android_ripple={ripple}
      onPress={onPress}
      onPressIn={() => {
        if (!usesNativeRipple) animateTo(0.12);
      }}
      onPressOut={() => {
        if (!usesNativeRipple) animateTo(0);
      }}
      style={styles.item}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.itemTint, { backgroundColor: tintColor, opacity: tint }]} />
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

function TabIcon({ route, color }: { route: P0RouteId; color: string }) {
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
  wrap: {
    marginHorizontal: 16,
    marginBottom: 18,
    marginTop: 6,
    height: 64,
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 4,
    borderRadius: radius.tab,
    borderWidth: 1,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 14,
    marginVertical: 4,
    overflow: "hidden",
  },
  itemTint: {
    borderRadius: 14,
  },
  androidActiveIndicator: {
    position: "absolute",
    top: 6,
    left: "50%",
    width: 64,
    marginLeft: -32,
    height: 32,
    borderRadius: 16,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginBottom: 1,
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
  iconImage: {
    width: 21,
    height: 21,
  },
});
