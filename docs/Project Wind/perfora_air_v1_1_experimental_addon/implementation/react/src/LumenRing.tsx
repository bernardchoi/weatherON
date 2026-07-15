import React from 'react';
import type { LumenRingProps } from './types';

export function LumenRing({ label, value, max, state = 'normal', directionDeg = 0, unit = '', description }: LumenRingProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  const circumference = 2 * Math.PI * 46;
  const dash = circumference * pct;
  const titleId = React.useId();
  const descId = React.useId();
  return (
    <svg className="pa-lumen-ring" width="128" height="128" viewBox="0 0 128 128" role="img" aria-labelledby={titleId} aria-describedby={descId} data-state={state}>
      <title id={titleId}>{label}</title>
      <desc id={descId}>{description ?? `${label}: ${value}${unit} / ${max}${unit}`}</desc>
      <circle cx="64" cy="64" r="46" fill="none" stroke="rgba(99,122,148,.18)" strokeWidth="10" />
      <circle cx="64" cy="64" r="46" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`} transform="rotate(-90 64 64)" />
      <line x1="64" y1="64" x2="64" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform={`rotate(${directionDeg} 64 64)`} />
      <text x="64" y="72" textAnchor="middle" className="pa-ring-text">{value}{unit}</text>
    </svg>
  );
}
