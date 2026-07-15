import React from 'react';
import type { SignalCardProps } from './types';

export function SignalCard({ label, value, unit, state = 'normal', caption, action, meter, accessibleDescription }: SignalCardProps) {
  const descId = React.useId();
  const content = (
    <>
      <div className="pa-card-label">{label}</div>
      <div className="pa-card-value">{value}{unit ? <span>{unit}</span> : null}</div>
      {caption ? <div className="pa-card-caption">{caption}</div> : null}
      {action ? <button className="pa-button" type="button" onClick={action.onPress}>{action.label}</button> : null}
      {accessibleDescription ? <span id={descId} className="pa-sr-only">{accessibleDescription}</span> : null}
    </>
  );

  if (meter) {
    return (
      <div className="pa-surface pa-signal-card" data-state={state} role="meter" aria-valuemin={meter.min ?? 0} aria-valuemax={meter.max} aria-valuenow={meter.value} aria-label={meter.label ?? label} aria-describedby={accessibleDescription ? descId : undefined}>
        {content}
      </div>
    );
  }

  return <article className="pa-surface pa-signal-card" data-state={state} aria-describedby={accessibleDescription ? descId : undefined}>{content}</article>;
}
