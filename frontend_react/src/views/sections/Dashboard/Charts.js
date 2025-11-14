import React from 'react';
import { useSelector } from 'react-redux';
import { selectExpensesByCategory } from '../../../state/slices/expensesSlice';
import { useFeatureFlags } from '../../../hooks/useFeatureFlags';
import { formatCurrency } from '../../../utils/formatters';

/**
 * Simple charts using inline SVG to keep dependencies minimal.
 * Renders a bar chart of spend by category if charts feature is enabled.
 */
export default function Charts() {
  const { flags } = useFeatureFlags();
  const byCat = useSelector(selectExpensesByCategory);

  if (!flags.charts) {
    return (
      <div className="section">
        <h2 className="section-title">Charts</h2>
        <p className="muted">Charts are disabled by feature flag.</p>
      </div>
    );
  }

  const entries = Object.entries(byCat);
  const maxVal = Math.max(1, ...entries.map(([, v]) => v));
  const width = 720;
  const height = 260;
  const padding = 36;
  const barWidth = (width - padding * 2) / Math.max(1, entries.length);

  return (
    <figure className="section" aria-labelledby="chart-title-cats">
      <h2 id="chart-title-cats" className="section-title">Spend by Category</h2>
      {entries.length === 0 ? (
        <p className="muted">No data yet. Add expenses to see category distribution.</p>
      ) : (
        <svg role="img" width="100%" height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Bar chart of spend by category">
          <desc>Bars represent total spending per category. Values shown in USD.</desc>
          {entries.map(([cat, value], i) => {
            const barHeight = (value / maxVal) * (height - padding * 2);
            const x = padding + i * barWidth;
            const y = height - padding - barHeight;
            return (
              <g key={cat}>
                <title>{`${cat}: ${formatCurrency(value)}`}</title>
                <rect
                  x={x + 6}
                  y={y}
                  width={barWidth - 12}
                  height={barHeight}
                  rx="8"
                  fill="url(#gradBar)"
                />
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  fontSize="10"
                  textAnchor="middle"
                  fill="currentColor"
                >
                  {cat}
                </text>
              </g>
            );
          })}
          <defs>
            <linearGradient id="gradBar" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      )}
      <figcaption className="muted" aria-live="polite">
        Uses Ocean Professional theme colors. Primary bars in #2563EB gradient.
      </figcaption>
    </figure>
  );
}
