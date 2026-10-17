import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, View, type GestureResponderEvent } from "../localization/react-native";
import { HomeAmbientHost } from "./HomeAmbientHost";
import { createAmbientTouchController, type AmbientContact } from "../utils/ambientTouch";

// One canvas for the active route; this observer never acquires a responder.
export function AppAmbientSurface({ routeId, children, ...environment }: React.ComponentProps<typeof HomeAmbientHost> & { routeId: string }) {
  const root = useRef<View>(null);
  const point = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [contact, setContact] = useState<AmbientContact>({ id: 0, phase: "cancel" });
  const controller = useRef(createAmbientTouchController((x, y) => point.setValue({ x, y }), setContact)).current;
  const start = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { controller.cancel(); start.current = null; }, [routeId, controller]);
  const sample = (event: GestureResponderEvent) => {
    const first = event.nativeEvent.touches[0] ?? event.nativeEvent.changedTouches[0] ?? event.nativeEvent;
    return { identifier: Number(first.identifier), pageX: first.pageX, pageY: first.pageY, count: event.nativeEvent.touches.length || event.nativeEvent.changedTouches.length };
  };
  const observe = Platform.OS === "ios" && routeId !== "H1";
  return <View ref={root} collapsable={false} style={{ flex: 1 }} {...(observe ? {
    onTouchStartCapture: (event: GestureResponderEvent) => {
      const input = sample(event); start.current = { x: input.pageX, y: input.pageY };
      controller.down(input, done => root.current?.measureInWindow(done));
    },
    onTouchMoveCapture: (event: GestureResponderEvent) => {
      const input = sample(event);
      // A vertical scroll cancels local feedback without consuming the native gesture.
      if (start.current && Math.abs(input.pageY - start.current.y) > 12 && Math.abs(input.pageY - start.current.y) > Math.abs(input.pageX - start.current.x)) { controller.cancel(); start.current = null; return; }
      controller.move(input);
    },
    onTouchEndCapture: () => { controller.up(); start.current = null; },
    onTouchCancelCapture: () => { controller.cancel(); start.current = null; },
  } : {})}>
    <HomeAmbientHost {...environment} homeActive={routeId === "H1"} fallbackInteraction={{ touchPulse: 0, touchContact: contact, touchPoint: point }}>{children}</HomeAmbientHost>
  </View>;
}
