import React from 'react';
import type { AmbientTimelineProps } from './types';

export function AmbientTimeline({ label, items, summary }: AmbientTimelineProps) {
  const descId = React.useId();
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <section className="pa-surface pa-timeline" aria-labelledby={descId}>
      <p id={descId} className="pa-sr-only">{summary}</p>
      <div className="pa-card-label">{label}</div>
      <div className="pa-timeline-bars" aria-hidden="true">
        {items.map((item) => <span key={item.label} style={{ height: `${Math.max(10, item.value / max * 100)}%` }} data-state={item.state ?? 'normal'} />)}
      </div>
      <div className="pa-timeline-labels" aria-label="타임라인 수치">
        {items.map((item) => (
          <span key={item.label} role="meter" aria-label={item.label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={item.value}>{item.label}</span>
        ))}
      </div>
    </section>
  );
}
