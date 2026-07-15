export type PAState = 'calm' | 'normal' | 'live' | 'alert' | 'critical' | 'loading' | 'insufficientData' | 'offline';
export type PAMode = 'day' | 'dusk' | 'night' | 'rainy';
export type PADensity = 'calm' | 'normal' | 'live' | 'alert' | 'critical';
export type PALumen = 'whisper' | 'soft' | 'notice' | 'alert' | 'critical';
export type PAFlow = 'still' | 'drift' | 'slow' | 'medium' | 'gust';

export type PAMetric = {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
};

export type PAAction = {
  label: string;
  onPress?: () => void;
  href?: string;
  priority?: 'primary' | 'secondary';
};

export type AtmospherePanelProps = {
  title: string;
  eyebrow?: string;
  state: PAState;
  mode?: PAMode;
  summary: string;
  reason?: string;
  metrics: PAMetric[];
  recommendation: string;
  actions?: PAAction[];
  accessibleSummary: string;
  density?: PADensity;
  lumen?: PALumen;
  flow?: PAFlow;
  lastUpdatedLabel?: string;
};

export type SignalCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  state?: PAState;
  caption?: string;
  action?: PAAction;
  meter?: { value: number; min?: number; max: number; label?: string };
  accessibleDescription?: string;
};

export type LumenRingProps = {
  label: string;
  value: number;
  max: number;
  state?: PAState;
  directionDeg?: number;
  unit?: string;
  description?: string;
};

export type AmbientTimelineItem = {
  label: string;
  value: number;
  state?: PAState;
  description?: string;
};

export type AmbientTimelineProps = {
  label: string;
  items: AmbientTimelineItem[];
  summary: string;
};
