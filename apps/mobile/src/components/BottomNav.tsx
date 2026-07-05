import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { uiIconAssets } from "../assets";
import { bottomNavRoutes, type P0RouteId } from "../navigation/routes";
import { useAppTheme } from "../theme/AppThemeContext";
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
      ]}
    >
      {bottomNavRoutes.map((route) => {
        const active = route.id === activeTabRoute;
        return (
          <Pressable
            accessibilityLabel={`${route.label} 탭`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={route.id}
            onPress={() => onNavigate(route.id)}
            style={({ pressed }) => [styles.item, pressed ? { backgroundColor: theme.cardMuted } : null]}
          >
            <View style={[styles.activeDot, { backgroundColor: active ? theme.gold : "transparent" }]} />
            <TabIcon route={route.id} color={active ? theme.gold : theme.subtle} />
            <Text style={[styles.label, { color: active ? theme.gold : theme.subtle }]}>{route.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function getActiveTabRoute(route: P0RouteId): P0RouteId {
  if (route === "C1" || route === "C2" || route === "C3" || route === "C4") return "H1";
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
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 14,
    marginVertical: 4,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginBottom: 1,
  },
  label: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "600",
  },
  iconImage: {
    width: 21,
    height: 21,
  },
});
