/**
 * Ambient Surface Component Types v1.0
 * Stable framework-agnostic TypeScript contracts.
 * These types are framework-agnostic and can be adapted to React, SwiftUI, Compose, or Vue.
 */

export type PerforaState = 'calm' | 'normal' | 'live' | 'alert' | 'critical';
export type PerforaMode = 'day' | 'dusk' | 'night' | 'rainy';
export type PerforaSurface = 'still' | 'air' | 'signal' | 'veil' | 'nocturne';
export type PerforaDensity = 'calm' | 'normal' | 'live' | 'alert' | 'critical';
export type PerforaLumen = 'none' | 'whisper' | 'soft' | 'notice' | 'alert' | 'critical';
export type PerforaFlow = 'still' | 'drift' | 'slow' | 'medium' | 'gust';

export type AutoToken<T extends string> = T | 'auto';

export interface IconToken {
  name: string;
  ariaLabel?: string;
  decorative?: boolean;
}

export interface ActionSpec {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export interface ContextMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  state?: PerforaState;
}

export interface TimelinePoint {
  id: string;
  label: string;
  value?: number;
  state?: PerforaState;
  timestamp?: string;
  description?: string;
  missing?: boolean;
}

export interface FlowDockItem {
  id: string;
  label: string;
  icon?: IconToken;
  href?: string;
  badge?: string | number;
  state?: PerforaState;
  disabled?: boolean;
}

export interface PerforaCommonProps {
  state?: PerforaState;
  mode?: PerforaMode;
  density?: AutoToken<PerforaDensity> | 'none';
  lumen?: AutoToken<PerforaLumen> | 'none';
  flow?: AutoToken<PerforaFlow>;
  interactive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  reducedMotion?: boolean | 'system';
  reducedTransparency?: boolean | 'system';
}

export interface ResolvedPerforaTokens {
  surface: PerforaSurface;
  density: PerforaDensity;
  lumen: PerforaLumen;
  flow: PerforaFlow;
  requiresText?: boolean;
  textFirst?: boolean;
}

export const PERFORA_STATE_DEFAULTS: Record<PerforaState, ResolvedPerforaTokens> = {
  calm: { surface: 'still', density: 'calm', lumen: 'whisper', flow: 'still' },
  normal: { surface: 'air', density: 'normal', lumen: 'soft', flow: 'drift' },
  live: { surface: 'air', density: 'live', lumen: 'notice', flow: 'slow' },
  alert: { surface: 'signal', density: 'alert', lumen: 'alert', flow: 'gust', requiresText: true },
  critical: { surface: 'signal', density: 'critical', lumen: 'critical', flow: 'gust', requiresText: true, textFirst: true }
};

export function resolvePerforaTokens(props: PerforaCommonProps = {}): ResolvedPerforaTokens {
  const state = props.state ?? 'normal';
  const defaults = PERFORA_STATE_DEFAULTS[state];
  return {
    ...defaults,
    density: props.density && props.density !== 'auto' && props.density !== 'none' ? props.density : defaults.density,
    lumen: props.lumen && props.lumen !== 'auto' && props.lumen !== 'none' ? props.lumen : defaults.lumen,
    flow: props.flow && props.flow !== 'auto' ? props.flow : defaults.flow
  };
}

export interface SurfaceFrameProps extends PerforaCommonProps {
  surface?: AutoToken<PerforaSurface>;
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: unknown;
}

export interface DensityFieldProps {
  density?: PerforaDensity;
  variant?: 'dot' | 'stream' | 'bar' | 'ring';
  angleDeg?: number;
  animated?: boolean;
  mask?: 'none' | 'left' | 'right' | 'top' | 'bottom' | 'radial';
  intensity?: number;
  decorative?: boolean;
}

export interface AirButtonProps extends PerforaCommonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  iconLeading?: IconToken;
  iconTrailing?: IconToken;
  children: string;
}

export interface ContextChipProps extends PerforaCommonProps {
  variant?: 'status' | 'metric' | 'filter' | 'action';
  selected?: boolean;
  icon?: IconToken;
  label: string;
  value?: string | number;
  removable?: boolean;
}

export interface AtmospherePanelProps extends PerforaCommonProps {
  variant?: 'weather' | 'home' | 'day' | 'sports' | 'wellness';
  size?: 'compact' | 'regular' | 'expanded';
  eyebrow?: string;
  title?: string;
  primaryValue: string | number;
  primaryUnit?: string;
  summary: string;
  metrics?: ContextMetric[];
  action?: ActionSpec;
  secondaryAction?: ActionSpec;
  visual?: 'density' | 'ring' | 'flow' | 'none';
}

export interface SignalCardProps extends PerforaCommonProps {
  variant?: 'metric' | 'event' | 'device' | 'alert' | 'action';
  size?: 'compact' | 'regular' | 'expanded';
  label?: string;
  title: string;
  value?: string | number;
  unit?: string;
  subtitle?: string;
  icon?: IconToken;
  metric?: ContextMetric;
  action?: ActionSpec;
  miniVisual?: 'none' | 'density' | 'sparkline' | 'ring';
}

export interface DataVeilProps extends PerforaCommonProps {
  variant?: 'sheet' | 'modal' | 'popover' | 'inlineDetail';
  title: string;
  description?: string;
  open: boolean;
  dismissible?: boolean;
  primaryAction?: ActionSpec;
  secondaryAction?: ActionSpec;
  children: unknown;
}

export interface LumenRingProps extends PerforaCommonProps {
  variant?: 'gauge' | 'progress' | 'compass' | 'pulse' | 'status';
  size?: 'sm' | 'md' | 'lg';
  value?: number;
  min?: number;
  max?: number;
  unit?: string;
  label?: string;
  directionDeg?: number;
  showTicks?: boolean;
  showValue?: boolean;
}

export interface FlowDockProps extends PerforaCommonProps {
  variant?: 'navigation' | 'quickAction' | 'hybrid' | 'rail';
  items: FlowDockItem[];
  activeId?: string;
  primaryAction?: ActionSpec;
}

export interface AmbientTimelineProps extends PerforaCommonProps {
  variant?: 'forecast' | 'schedule' | 'session' | 'game' | 'metric';
  startLabel?: string;
  endLabel?: string;
  currentIndex?: number;
  points: TimelinePoint[];
  showValueLine?: boolean;
  showDensityBand?: boolean;
  summary?: string;
}


export type PerforaAccessibilityMode =
  | 'reducedMotion'
  | 'reducedTransparency'
  | 'highContrast'
  | 'lowPower'
  | 'focus';

export const PERFORA_COMPONENT_CONTRACT_VERSION = '1.0.0' as const;
