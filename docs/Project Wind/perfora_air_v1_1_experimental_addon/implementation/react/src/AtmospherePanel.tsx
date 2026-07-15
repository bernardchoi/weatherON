import React from 'react';
import type { AtmospherePanelProps } from './types';

export function AtmospherePanel({
  title,
  eyebrow = '오늘의 공기',
  state,
  summary,
  reason,
  metrics,
  recommendation,
  actions = [],
  accessibleSummary,
  lastUpdatedLabel
}: AtmospherePanelProps) {
  const summaryId = React.useId();
  const titleId = React.useId();
  return (
    <section
      className={`pa-surface pa-atmosphere-panel pa-state-${state}`}
      aria-labelledby={titleId}
      aria-describedby={summaryId}
      data-state={state}
    >
      <div className="pa-density-field" aria-hidden="true" />
      <div className="pa-content">
        <div>
          <div className="pa-eyebrow">{eyebrow}</div>
          <h2 id={titleId}>{title}</h2>
        </div>
        <p className="pa-summary">{summary}</p>
        {reason ? <p className="pa-reason">{reason}</p> : null}
        <div className="pa-metrics" aria-label="핵심 수치">
          {metrics.map((metric) => (
            <div className="pa-metric" key={metric.label}>
              <span className="pa-metric-value">{metric.value}{metric.unit ? <span>{metric.unit}</span> : null}</span>
              <span className="pa-metric-label">{metric.label}</span>
            </div>
          ))}
        </div>
        <p className="pa-reason">{recommendation}</p>
        {actions.length > 0 ? (
          <div className="pa-actions">
            {actions.map((action) => (
              <button key={action.label} className={`pa-button ${action.priority === 'primary' ? 'pa-button-primary' : ''}`} type="button" onClick={action.onPress}>
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
        {lastUpdatedLabel ? <p className="pa-card-caption">{lastUpdatedLabel}</p> : null}
        <p id={summaryId} className="pa-sr-only">{accessibleSummary}</p>
      </div>
    </section>
  );
}
