import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, View, type ImageProps, type ImageSourcePropType, type LayoutChangeEvent } from "../localization/react-native";
import { AmbientMotionContext } from "./AmbientReveal";
import { ambientMotion } from "../theme/ambientMotion";

type Rect = { x: number; y: number; width: number; height: number };
type NaturalSize = { width: number; height: number };
type RegisteredImage = { ref: React.RefObject<React.ElementRef<typeof Image> | null>; source: ImageSourcePropType; imageKey: string; natural: () => NaturalSize | undefined };
type Transfer = { revision: number; fromScene: string; toScene: string; itemId: string; imageKey: string; source: ImageSourcePropType; natural: NaturalSize; from: Rect; to?: Rect };
type MotionContext = {
  register: (scene: string, itemId: string, image: RegisteredImage) => () => void;
  layout: (scene: string, itemId: string) => void;
  open: (scene: string, itemId: string, targetScene: string, navigate: () => void) => void;
  transfer: Transfer | null;
};
export const OutfitMotionContext = createContext<MotionContext>({ register: () => () => {}, layout: () => {}, open: (_scene, _id, _target, navigate) => navigate(), transfer: null });

export function fitOutfitImage(bounds: Rect, natural: NaturalSize): Rect | null {
  if (![bounds.x, bounds.y, bounds.width, bounds.height, natural.width, natural.height].every(Number.isFinite)
    || Math.min(bounds.width, bounds.height, natural.width, natural.height) <= 0) return null;
  const scale = Math.min(bounds.width / natural.width, bounds.height / natural.height);
  const width = natural.width * scale, height = natural.height * scale;
  return { x: bounds.x + (bounds.width - width) / 2, y: bounds.y + (bounds.height - height) / 2, width, height };
}
function inside(rect: Rect, host: Rect) {
  return rect.x >= host.x - 1 && rect.y >= host.y - 1 && rect.x + rect.width <= host.x + host.width + 1 && rect.y + rect.height <= host.y + host.height + 1;
}

export function useOutfitTransitionHost(route: string, enabled: boolean) {
  const root = useRef<View>(null);
  const images = useRef(new Map<string, RegisteredImage>());
  const revision = useRef(0);
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const current = useRef(transfer); current.current = transfer;
  const environment = useRef({ route, enabled }); environment.current = { route, enabled };
  const measurement = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waiting = useRef<ReturnType<typeof setTimeout> | null>(null);
  const measuringTarget = useRef<number | null>(null);
  const hostSize = useRef<NaturalSize | null>(null);
  const clearTimers = () => { if (measurement.current) clearTimeout(measurement.current); if (waiting.current) clearTimeout(waiting.current); };
  const finish = (expected = revision.current) => {
    if (expected !== revision.current) return;
    if (waiting.current) clearTimeout(waiting.current);
    current.current = null; setTransfer(null);
  };
  const target = (scene: string, itemId: string) => {
    const pending = current.current;
    const image = images.current.get(`${scene}:${itemId}`);
    if (!pending || pending.to || pending.toScene !== scene || pending.itemId !== itemId || pending.imageKey !== image?.imageKey
      || !image.ref.current || !root.current || measuringTarget.current === pending.revision) return;
    measuringTarget.current = pending.revision;
    image.ref.current.measureInWindow((x, y, width, height) => root.current?.measureInWindow((hx, hy, hw, hh) => {
      measuringTarget.current = null;
      if (current.current?.revision !== pending.revision || environment.current.route !== scene) return;
      if (images.current.get(`${scene}:${itemId}`) !== image) { finish(pending.revision); return; }
      const fitted = fitOutfitImage({ x, y, width, height }, pending.natural);
      if (!fitted || !inside(fitted, { x: hx, y: hy, width: hw, height: hh })) { finish(pending.revision); return; }
      if (waiting.current) clearTimeout(waiting.current);
      const next = { ...pending, to: { ...fitted, x: fitted.x - hx, y: fitted.y - hy } };
      current.current = next; setTransfer(next);
    }));
  };
  const context: MotionContext = {
    transfer,
    register(scene, itemId, image) {
      const key = `${scene}:${itemId}`; images.current.set(key, image);
      return () => { if (images.current.get(key) === image) images.current.delete(key); };
    },
    layout: target,
    open(scene, itemId, toScene, navigate) {
      clearTimers(); const nextRevision = ++revision.current; measuringTarget.current = null;
      // A collection has no single selected item: never fly just its first image
      // across the screen or wait for image measurement before opening the grid.
      if (toScene === "C1") { finish(nextRevision); navigate(); return; }
      const image = images.current.get(`${scene}:${itemId}`), natural = image?.natural();
      if (!environment.current.enabled || environment.current.route !== scene || !image?.ref.current || !root.current || !natural) { finish(nextRevision); navigate(); return; }
      let delivered = false;
      const deliver = (next?: Transfer) => {
        if (delivered || nextRevision !== revision.current) return;
        delivered = true; if (measurement.current) clearTimeout(measurement.current);
        if (environment.current.route !== scene) return;
        const accepted = environment.current.enabled && images.current.get(`${scene}:${itemId}`) === image ? next ?? null : null;
        current.current = accepted; setTransfer(accepted); navigate();
        if (accepted) waiting.current = setTimeout(() => finish(nextRevision), 300);
      };
      // Missing native measurement must never trap a navigation action.
      measurement.current = setTimeout(() => deliver(), 80);
      image.ref.current.measureInWindow((x, y, width, height) => root.current?.measureInWindow((hx, hy, hw, hh) => {
        const fitted = fitOutfitImage({ x, y, width, height }, natural);
        if (!fitted || !inside(fitted, { x: hx, y: hy, width: hw, height: hh })) { deliver(); return; }
        deliver({ revision: nextRevision, fromScene: scene, toScene, itemId, imageKey: image.imageKey, source: image.source, natural,
          from: { ...fitted, x: fitted.x - hx, y: fitted.y - hy } });
      }));
    },
  };
  useLayoutEffect(() => {
    if (!enabled || transfer && route !== transfer.fromScene && route !== transfer.toScene) finish();
    else if (transfer && route === transfer.toScene) target(route, transfer.itemId);
  }, [enabled, route, transfer?.revision]);
  useEffect(() => () => { ++revision.current; clearTimers(); }, []);
  return { root, context, pendingRoute: transfer?.toScene,
    onLayout(event: LayoutChangeEvent) {
      const { width, height } = event.nativeEvent.layout, old = hostSize.current;
      hostSize.current = { width, height };
      if (old && (old.width !== width || old.height !== height)) finish();
    },
    overlay: transfer ? <OutfitFlight key={transfer.revision} transfer={transfer} onComplete={() => finish(transfer.revision)} /> : null,
  };
}

function OutfitFlight({ transfer, onComplete }: { transfer: Transfer; onComplete: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!transfer.to) return;
    const animation = Animated.timing(progress, { toValue: 1, duration: ambientMotion.outfitTransfer, easing: Easing.bezier(0.3, 0.2, 0.2, 1), useNativeDriver: true, isInteraction: false });
    animation.start(({ finished }) => { if (finished) onComplete(); });
    return () => animation.stop();
  }, [transfer.to, progress]);
  const { from, to = from } = transfer;
  // Detail copy occupies the old image position; keep expansion inside the target image.
  if (transfer.toScene === "C4") {
    if (!transfer.to) return null;
    return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", left: to.x, top: to.y, width: to.width, height: to.height, overflow: "hidden" }}>
      <Animated.Image testID="outfit-detail-reveal" source={transfer.source} resizeMode="contain" onError={onComplete}
        style={[StyleSheet.absoluteFill, { opacity: progress, transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [Math.min(1, from.width / to.width), 1] }) }] }]} />
    </View>;
  }
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
    <Animated.Image testID="outfit-flight" source={transfer.source} resizeMode="contain" onError={onComplete} style={{ position: "absolute", left: from.x, top: from.y, width: from.width, height: from.height, transform: [
      { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, to.x + to.width / 2 - from.x - from.width / 2] }) },
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, to.y + to.height / 2 - from.y - from.height / 2] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, to.width / from.width] }) },
    ] }} />
  </View>;
}

export function useOutfitNavigation() {
  const { scene } = useContext(AmbientMotionContext), motion = useContext(OutfitMotionContext);
  return (itemId: string | undefined, targetScene: string, navigate: () => void) => itemId ? motion.open(scene, itemId, targetScene, navigate) : navigate();
}

export function OutfitMotionImage({ outfitItemId, imageKey = outfitItemId, style, source, onLayout, onLoad, ...props }: ImageProps & { outfitItemId: string; imageKey?: string }) {
  const { scene, active, motionAllowed } = useContext(AmbientMotionContext), motion = useContext(OutfitMotionContext);
  const ref = useRef<React.ElementRef<typeof Image>>(null);
  const natural = useRef<NaturalSize | undefined>(undefined);
  const bounds = useRef<Rect | null>(null);
  const identity = `${outfitItemId}:${imageKey}`;
  const previous = useRef({ identity, source });
  const [old, setOld] = useState<{ source: ImageProps["source"]; bounds: Rect } | null>(null);
  const change = useRef(new Animated.Value(1)).current;
  const changeRevision = useRef(0);
  useLayoutEffect(() => {
    natural.current = source ? Image.resolveAssetSource?.(source) : undefined;
    if (!source) return;
    return motion.register(scene, outfitItemId, { ref, source, imageKey, natural: () => natural.current });
  }, [scene, outfitItemId, imageKey]);
  useLayoutEffect(() => {
    const before = previous.current; previous.current = { identity, source };
    const revision = ++changeRevision.current;
    change.stopAnimation();
    if (before.identity === identity || !active || !motionAllowed || !before.source || !bounds.current) { setOld(null); change.setValue(1); return; }
    setOld({ source: before.source, bounds: bounds.current }); change.setValue(0);
    const animation = Animated.timing(change, { toValue: 1, duration: ambientMotion.change, easing: Easing.bezier(0.3, 0.2, 0.2, 1), useNativeDriver: true, isInteraction: false });
    animation.start(({ finished }) => { if (finished && revision === changeRevision.current) setOld(null); });
    return () => animation.stop();
  }, [identity, active, motionAllowed, change]);
  const hidden = motion.transfer?.itemId === outfitItemId && motion.transfer.imageKey === imageKey
    && (motion.transfer.fromScene === scene || motion.transfer.toScene === scene);
  const transform = StyleSheet.flatten(style)?.transform;
  return <>
    <Animated.Image {...props} ref={ref} source={source} onLayout={event => { bounds.current = event.nativeEvent.layout; onLayout?.(event); motion.layout(scene, outfitItemId); }}
      onLoad={event => { natural.current = event.nativeEvent.source; onLoad?.(event); motion.layout(scene, outfitItemId); }}
      style={[style, { opacity: hidden ? 0 : change, transform: [...(Array.isArray(transform) ? transform : []), { translateY: change.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }]} />
    {old && !hidden ? <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", left: old.bounds.x, top: old.bounds.y, width: old.bounds.width, height: old.bounds.height }}>
      <Animated.Image source={old.source} resizeMode={props.resizeMode} style={[StyleSheet.absoluteFill, {
        opacity: change.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ translateY: change.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
      }]} />
    </View> : null}
  </>;
}
