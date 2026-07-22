import React from "react";
import { Image, Pressable, StyleSheet, Text, type ColorValue, View } from "react-native";
import { uiIconAssets } from "../assets";
import { bottomNavRoutes, type P0RouteId } from "../navigation/routes";
import { useAppTheme } from "../theme/AppThemeContext";
import { androidMaterialColor } from "../theme/androidMaterial";
import { LiquidGlassNavigationSurface } from "./LiquidGlassNavigationSurface";

type BottomNavProps = {
  activeRoute: P0RouteId;
  onNavigate: (route: P0RouteId) => void;
};

// 앱 표면 위에 떠 있는 단일 glass capsule. Instagram/Meta처럼 활성 탭만 내부에서
// 은은하게 구분하고 개별 버튼에 blur를 겹치지 않아 아이콘과 라벨이 선명하게 유지된다.
export function BottomNav({ activeRoute, onNavigate }: BottomNavProps) {
  const theme = useAppTheme();
  const activeTabRoute = getActiveTabRoute(activeRoute);
  const activeColor = androidMaterialColor(theme, "primary");
  const activeIndex = Math.max(0, bottomNavRoutes.findIndex((route) => route.id === activeTabRoute));
  return (
    <View style={styles.dockWrap}>
      <View style={[styles.dock, { borderColor: theme.name === "light" ? "rgba(20,32,51,0.10)" : "rgba(246,251,255,0.22)" }]}>
        <LiquidGlassNavigationSurface activeIndex={activeIndex} theme={theme} />
        {bottomNavRoutes.map((route) => {
          const active = route.id === activeTabRoute;
          return (
            <TabButton key={route.id} label={route.label} active={active} onPress={() => onNavigate(route.id)}>
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
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
  children,
}: {
  label: string;
  active: boolean;
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
  dockWrap: {
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
    height: 64,
  },
  dock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 32,
    borderWidth: 1,
    overflow: "hidden",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: 58,
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
