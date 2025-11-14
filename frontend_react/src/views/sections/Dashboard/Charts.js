import React from 'react';
import { useSelector } from 'react-redux';
import { selectExpensesByCategory } from '../../../state/slices/expensesSlice';
import { useFeatureFlags } from '../../../hooks/useFeatureFlags';
import { formatCurrency } from '../../../utils/formatters';

/**
 * Simple charts scaffold using inline SVG to keep dependencies minimal.
 * Renders a bar chart of spend by category if charts feature is enabled.
 */
export default function Charts() {
  const { flags } = useFeatureFlags();
  const byCat = useSelector(selectExpensesByCategory);

  if (!flags.charts) {
    return (
      <div className="section">
        <h2 className="section-title">Charts</h2>
        <p>Charts are disabled by feature flag.</p>
      </div>
    );
  }

  const entries = Object.entries(byCat);
  const maxVal = Math.max(1, ...entries.map(([, v]) => v));
  const width = 680;
  const height = 240;
  const padding = 30;
  const barWidth = (width - padding * 2) / Math.max(1, entries.length);

  return (
    <div className="section">
      <h2 className="section-title">Spend by Category</h2>
      <svg role="img" width="100%" height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Bar chart of spend by category">
        {entries.map(([cat, value], i) => {
          const barHeight = (value / maxVal) * (height - padding * 2);
          const x = padding + i * barWidth;
          const y = height - padding - barHeight;
          return (
            <g key={cat}>
              <title>{`${cat}: ${formatCurrency(value)}`}</title>
              <rect x={x + 6} y={y} width={barWidth - 12} height={barHeight} rx="8" fill="url(#grad)" />
              <text x={x + barWidth / 2} y={height - 8} fontSize="10" textAnchor="middle" fill="currentColor">{cat}</text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
