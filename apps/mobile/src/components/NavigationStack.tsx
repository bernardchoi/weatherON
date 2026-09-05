import React, { useRef, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { ScreenStack, ScreenStackItem } from "react-native-screens";
import type { AppRouteId } from "../navigation/routes";
import { useAppTheme } from "../theme/AppThemeContext";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { ScreenTransition } from "./ScreenTransition";

export function reconcileScreenStack(stack: AppRouteId[], route: AppRouteId, backRoute?: AppRouteId): AppRouteId[] {
  if (stack.at(-1) === route) return stack;
  const existing = stack.indexOf(route);
  if (existing >= 0) return stack.slice(0, existing + 1);
  if (!backRoute || backRoute === route) return [route];
  const parent = stack.indexOf(backRoute);
  return [...(parent >= 0 ? stack.slice(0, parent + 1) : [backRoute]), route];
}

type Props = {
  route: AppRouteId;
  backRoute?: AppRouteId;
  onGoBack: () => void;
  variant: "tab" | "detail";
  renderScreen: (route: AppRouteId) => React.ReactNode;
};

export function NavigationStack(props: Props) {
  if (Platform.OS === "ios") return <IosStack {...props} />;
  return <ScreenTransition key={props.route} canGoBack={Boolean(props.backRoute)} onGoBack={props.onGoBack} variant={props.variant}>
    {props.renderScreen(props.route)}
  </ScreenTransition>;
}

function IosStack({ route, backRoute, onGoBack, renderScreen }: Props) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const [stack, setStack] = useState<AppRouteId[]>(() => backRoute && backRoute !== route ? [backRoute, route] : [route]);
  const next = reconcileScreenStack(stack, route, backRoute);
  if (next !== stack) setStack(next);
  const routeRef = useRef(route);
  routeRef.current = route;
  return <ScreenStack style={styles.fill}>
    {next.map((id, index) => <ScreenStackItem
      key={id} screenId={id} activityState={2}
      style={styles.fill} contentStyle={{ backgroundColor: theme.background }}
      headerConfig={{ hidden: true, disableTopInsetApplication: true, disableBottomInsetApplication: true }}
      stackAnimation={reducedMotion !== false || !backRoute ? "none" : "default"}
      gestureEnabled={index > 0}
      onDismissed={() => { if (routeRef.current === id) onGoBack(); }}>
      {renderScreen(id)}
    </ScreenStackItem>)}
  </ScreenStack>;
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
