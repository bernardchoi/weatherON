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

export function BottomNav({ activeRoute, onNavigate }: BottomNavProps) {
  const theme = useAppTheme();
  const activeTabRoute = getActiveTabRoute(activeRoute);
  return (
    <View style={[styles.wrap, { backgroundColor: theme.nav, borderTopColor: theme.navBorder }]}>
      <View style={styles.nav}>
        {bottomNavRoutes.map((route) => {
          const active = route.id === activeTabRoute;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={route.id}
              onPress={() => onNavigate(route.id)}
              style={[
                styles.item,
                active
                  ? { backgroundColor: theme.cardStrong, borderColor: theme.gold }
                  : { backgroundColor: "transparent", borderColor: "transparent" },
              ]}
            >
              <TabIcon route={route.id} color={active ? theme.gold : theme.subtle} />
              <Text style={[styles.label, { color: active ? theme.gold : theme.subtle }]}>{route.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getActiveTabRoute(route: P0RouteId): P0RouteId {
  if (route === "C2" || route === "C3" || route === "C4") return "C1";
  if (route === "H3" || route === "H4" || route === "H5") return "H1";
  if (route === "G2" || route === "G3" || route === "G4" || route === "G5" || route === "G6" || route === "P1" || route === "P2" || route === "P3") return "G1";
  if (route === "M2" || route === "M3") return "M1";
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
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
  },
  nav: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    gap: 3,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "900",
  },
  iconImage: {
    width: 23,
    height: 23,
  },
});
