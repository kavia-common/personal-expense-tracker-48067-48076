import { formatCurrency } from './formatters';

/**
 * Lightweight SVG chart helpers for line and pie/donut charts.
 * Accessible: caller should provide aria-label via surrounding <figure>.
 */

// PUBLIC_INTERFACE
export function buildLinePath(points, width, height, padding = 10) {
  /** Returns d attribute for an SVG path for the given normalized points. */
  const n = points.length;
  if (n === 0) return '';
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const maxY = Math.max(1, ...points.map((p) => p.y));
  const stepX = n > 1 ? innerW / (n - 1) : 0;

  const toX = (i) => padding + i * stepX;
  const toY = (y) => padding + innerH - (y / maxY) * innerH;

  let d = `M ${toX(0)} ${toY(points[0].y)}`;
  for (let i = 1; i < n; i++) {
    const x = toX(i);
    const y = toY(points[i].y);
    // simple straight lines; keep minimal
    d += ` L ${x} ${y}`;
  }
  return d;
}

// PUBLIC_INTERFACE
export function buildAreaPath(points, width, height, padding = 10) {
  /** Returns d attribute for an SVG area under the line. */
  const n = points.length;
  if (n === 0) return '';
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const maxY = Math.max(1, ...points.map((p) => p.y));
  const stepX = n > 1 ? innerW / (n - 1) : 0;

  const toX = (i) => padding + i * stepX;
  const toY = (y) => padding + innerH - (y / maxY) * innerH;

  let d = `M ${toX(0)} ${toY(points[0].y)}`;
  for (let i = 1; i < n; i++) {
    d += ` L ${toX(i)} ${toY(points[i].y)}`;
  }
  // close to bottom baseline
  d += ` L ${toX(n - 1)} ${height - padding}`;
  d += ` L ${toX(0)} ${height - padding} Z`;
  return d;
}

// PUBLIC_INTERFACE
export function buildPieArcs(data, cx, cy, radius, innerRadius = 0) {
  /**
   * Converts [{label, value, color}] to arc path specs.
   * Returns [{d, title, color, midAngle}].
   */
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0) || 1;
  let startAngle = -Math.PI / 2; // start at top
  const arcs = [];
  data.forEach((d) => {
    const val = Number(d.value) || 0;
    const angle = (val / total) * Math.PI * 2;
    const endAngle = startAngle + angle;

    const largeArc = angle > Math.PI ? 1 : 0;

    const sx = cx + radius * Math.cos(startAngle);
    const sy = cy + radius * Math.sin(startAngle);
    const ex = cx + radius * Math.cos(endAngle);
    const ey = cy + radius * Math.sin(endAngle);

    if (innerRadius > 0) {
      // Donut using two arcs and lines
      const isx = cx + innerRadius * Math.cos(startAngle);
      const isy = cy + innerRadius * Math.sin(startAngle);
      const iex = cx + innerRadius * Math.cos(endAngle);
      const iey = cy + innerRadius * Math.sin(endAngle);

      const path = [
        `M ${isx} ${isy}`,
        `L ${sx} ${sy}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey}`,
        `L ${iex} ${iey}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${isx} ${isy}`,
        'Z',
      ].join(' ');
      arcs.push({ d: path, title: `${d.label}: ${formatCurrency(val)}`, color: d.color, midAngle: startAngle + angle / 2 });
    } else {
      const path = [
        `M ${cx} ${cy}`,
        `L ${sx} ${sy}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey}`,
        'Z',
      ].join(' ');
      arcs.push({ d: path, title: `${d.label}: ${formatCurrency(val)}`, color: d.color, midAngle: startAngle + angle / 2 });
    }

    startAngle = endAngle;
  });
  return arcs;
}
