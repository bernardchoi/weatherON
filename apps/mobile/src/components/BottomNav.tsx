import React from "react";
import { Image, Pressable, StyleSheet, Text, type ColorValue, type StyleProp, type ViewStyle, View } from "react-native";
import { uiIconAssets } from "../assets";
import { bottomNavRoutes, type P0RouteId } from "../navigation/routes";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialColor, androidMaterialSurface } from "../theme/androidMaterial";
import { iosGlassSurface } from "../theme/iosGlass";
import { radius, semanticColor, spacing } from "../theme/tokens";

type BottomNavProps = {
  activeRoute: P0RouteId;
  onNavigate: (route: P0RouteId) => void;
};

// UI Design Spec v1.0 §10: floating tab bar — bottom 18, left/right 16, height 64,
// radius 24, active 5px dot + Gold icon/text, inactive Mist, icon 21px, press tint 0.12.
export function BottomNav({ activeRoute, onNavigate }: BottomNavProps) {
  const theme = useAppTheme();
  const activeTabRoute = getActiveTabRoute(activeRoute);
  const activeColor = androidMaterialColor(theme, "primary");
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
        const activeGlassSurface = active ? iosGlassSurface(theme, "tabItem") : null;
        return (
          <TabButton
            key={route.id}
            routeId={route.id}
            label={route.label}
            active={active}
            activeSurfaceStyle={
              activeGlassSurface
                ? [
                    styles.activeItemGlass,
                    { borderColor: semanticColor(theme, "glassBorderStrong") },
                    activeGlassSurface,
                  ]
                : null
            }
            onPress={() => onNavigate(route.id)}
          >
            <View style={[styles.activeDot, { backgroundColor: active ? activeColor : "transparent" }]} />
            <TabIcon route={route.id} color={active ? activeColor : theme.subtle} />
            <Text
              style={[styles.label, { color: active ? activeColor : theme.subtle }]}
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

function TabButton({
  routeId,
  label,
  active,
  activeSurfaceStyle,
  onPress,
  children,
}: {
  routeId: P0RouteId;
  label: string;
  active: boolean;
  activeSurfaceStyle?: StyleProp<ViewStyle>;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label} 탭`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.item}
    >
      {activeSurfaceStyle ? <View pointerEvents="none" style={activeSurfaceStyle} /> : null}
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
  activeItemGlass: {
    position: "absolute",
    left: 4,
    right: 4,
    top: 2,
    bottom: 2,
    borderRadius: 18,
    borderWidth: 1,
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
