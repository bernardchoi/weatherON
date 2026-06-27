import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { bottomNavRoutes, type P0RouteId } from "../navigation/routes";
import { appColors, radius, spacing } from "../theme/tokens";

type BottomNavProps = {
  activeRoute: P0RouteId;
  onNavigate: (route: P0RouteId) => void;
};

export function BottomNav({ activeRoute, onNavigate }: BottomNavProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        {bottomNavRoutes.map((route) => {
          const active = route.id === activeRoute;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={route.id}
              onPress={() => onNavigate(route.id)}
              style={[styles.item, active ? styles.activeItem : null]}
            >
              <Text style={[styles.code, active ? styles.activeText : null]}>{route.id}</Text>
              <Text style={[styles.label, active ? styles.activeText : null]}>{route.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: "rgba(3,8,16,0.94)",
    borderTopWidth: 1,
    borderTopColor: appColors.border,
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
    borderRadius: radius.sm,
  },
  activeItem: {
    backgroundColor: appColors.panel,
    borderWidth: 1,
    borderColor: appColors.clear,
  },
  code: {
    color: appColors.subtle,
    fontSize: 10,
    fontWeight: "900",
  },
  label: {
    color: appColors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  activeText: {
    color: appColors.clear,
  },
});
