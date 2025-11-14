import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectMonthlyTotals, selectExpensesByCategory, selectExpenses } from '../../state/slices/expensesSlice';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { apiClient } from '../../services/apiClient';
import { buildAreaPath, buildLinePath, buildPieArcs } from '../../utils/charts';
import { formatCurrency } from '../../utils/formatters';
import { useCategories } from '../../state/slices/categoriesSlice';

/**
 * Reports page displays monthly spend trend and category breakdown.
 * It attempts to fetch /api/reports/summary?from&to but will compute series
 * locally from Redux store when offline or request fails.
 */
export default function ReportsPage() {
  const { flags } = useFeatureFlags();
  const localMonthly = useSelector(selectMonthlyTotals);
  const localByCategory = useSelector(selectExpensesByCategory);
  const allExpenses = useSelector(selectExpenses);
  const { categories } = useCategories();

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  // Determine from/to based on local data
  const { from, to } = useMemo(() => {
    if (!allExpenses.length) return { from: '', to: '' };
    const dates = allExpenses
      .map((e) => new Date(e.date || Date.now()))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());
    const start = dates[0];
    const end = dates[dates.length - 1];
    const toISO = (d) => d.toISOString().slice(0, 10);
    return { from: toISO(start), to: toISO(end) };
  }, [allExpenses]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!flags.charts) return;
      if (!from || !to) {
        setSummary(null);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const q = new URLSearchParams({ from, to }).toString();
        const data = await apiClient.get(`/reports/summary?${q}`);
        if (!cancelled) {
          setSummary(data);
        }
      } catch (e) {
        // Swallow error: fallback to local computation
        if (!cancelled) {
          setSummary(null);
          setError('Using local data (offline).');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [flags.charts, from, to]);

  // Build monthly series: prefer API if shape matches, else local
  const monthSeries = useMemo(() => {
    if (summary && Array.isArray(summary.monthly)) {
      // Expected shape: [{month: 'YYYY-MM', total: number}]
      return summary.monthly;
    }
    return localMonthly;
  }, [summary, localMonthly]);

  // Build category series with friendly labels
  const categorySeries = useMemo(() => {
    let dataObj = localByCategory;
    if (summary && summary.byCategory) dataObj = summary.byCategory;

    const catNameById = categories.reduce((m, c) => {
      m[c.id] = c.name;
      return m;
    }, {});
    const palette = [
      '#2563EB', // primary
      '#F59E0B', // secondary
      '#EF4444', // error
      '#10B981', // green accent
      '#8B5CF6', // violet
      '#06B6D4', // cyan
      '#F43F5E', // rose
    ];
    const entries = Object.entries(dataObj || {});
    return entries.map(([id, value], i) => ({
      label: catNameById[id] || id,
      value: Number(value) || 0,
      color: palette[i % palette.length],
    }));
  }, [summary, localByCategory, categories]);

  // SVG sizes
  const trendW = 720;
  const trendH = 260;
  const donutSize = 260;

  if (!flags.charts) {
    return (
      <div className="reports">
        <div className="section">
          <h2 className="section-title">Reports</h2>
          <p className="muted">Charts are disabled by feature flag.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports" style={{ display: 'grid', gap: 14 }}>
      <section className="section">
        <h2 className="section-title">Monthly Spend Trend</h2>
        {loading && <p className="muted">Loading report…</p>}
        {error && <p className="muted" role="status">{error}</p>}
        {monthSeries.length === 0 ? (
          <p className="muted">No data available. Add expenses to see trends.</p>
        ) : (
          <figure aria-labelledby="chart-title-trend">
            <h3 id="chart-title-trend" className="sr-only">Monthly total spending</h3>
            <svg
              role="img"
              width="100%"
              height={trendH}
              viewBox={`0 0 ${trendW} ${trendH}`}
              aria-label="Line chart of monthly spending totals"
            >
              <defs>
                <linearGradient id="gradArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
              <desc>Line shows total spent per month. Values in USD.</desc>
              {(() => {
                const points = monthSeries.map((m) => ({ x: m.month, y: Number(m.total) || 0 }));
                const dLine = buildLinePath(points, trendW, trendH, 36);
                const dArea = buildAreaPath(points, trendW, trendH, 36);
                return (
                  <g>
                    <path d={dArea} fill="url(#gradArea)" />
                    <path d={dLine} fill="none" stroke="#2563EB" strokeWidth="2.5" />
                    {points.map((p, i) => {
                      const maxY = Math.max(1, ...points.map((pp) => pp.y));
                      const innerW = trendW - 36 * 2;
                      const innerH = trendH - 36 * 2;
                      const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;
                      const x = 36 + i * stepX;
                      const y = 36 + innerH - (p.y / maxY) * innerH;
                      return (
                        <g key={i}>
                          <title>{`${p.x}: ${formatCurrency(p.y)}`}</title>
                          <circle cx={x} cy={y} r="3" fill="#2563EB" />
                        </g>
                      );
                    })}
                    {/* X labels */}
                    {monthSeries.map((m, i) => {
                      const innerW = trendW - 36 * 2;
                      const stepX = monthSeries.length > 1 ? innerW / (monthSeries.length - 1) : 0;
                      const x = 36 + i * stepX;
                      return (
                        <text key={m.month} x={x} y={trendH - 10} fontSize="10" textAnchor="middle" fill="currentColor">
                          {m.month}
                        </text>
                      );
                    })}
                  </g>
                );
              })()}
            </svg>
            <figcaption className="muted">Primary line color #2563EB. Hover tooltips provided via titles.</figcaption>
          </figure>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Category Breakdown</h2>
        {categorySeries.length === 0 ? (
          <p className="muted">No categories to display.</p>
        ) : (
          <figure aria-labelledby="chart-title-cats-donut" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 1fr', gap: 14 }}>
            <h3 id="chart-title-cats-donut" className="sr-only">Spending by category</h3>
            <svg
              role="img"
              width="100%"
              height={donutSize}
              viewBox={`0 0 ${donutSize} ${donutSize}`}
              aria-label="Donut chart of category spending"
            >
              <desc>Donut chart showing percentage spend by category. Values in USD.</desc>
              {(() => {
                const cx = donutSize / 2;
                const cy = donutSize / 2;
                const arcs = buildPieArcs(categorySeries, cx, cy, 110, 60);
                return arcs.map((a, idx) => (
                  <path key={idx} d={a.d} fill={a.color}>
                    <title>{categorySeries[idx].label + ': ' + formatCurrency(categorySeries[idx].value)}</title>
                  </path>
                ));
              })()}
            </svg>
            <div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
                {categorySeries.map((c, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 2, background: c.color, display: 'inline-block' }} />
                    <span style={{ flex: 1 }}>{c.label}</span>
                    <span className="muted">{formatCurrency(c.value)}</span>
                  </li>
                ))}
              </ul>
              <small className="muted">Secondary accent #F59E0B and error #EF4444 may appear in legend colors.</small>
            </div>
          </figure>
        )}
      </section>
    </div>
  );
}
