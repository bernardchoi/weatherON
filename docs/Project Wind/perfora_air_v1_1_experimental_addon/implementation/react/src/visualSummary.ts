import type { AtmosphereResult } from './dataMap';

export function buildVisualSummary(result: AtmosphereResult, title = '오늘의 공기'): string {
  return `${title} 시각 요약: ${result.accessibleSummary}`;
}
