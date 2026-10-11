"use client"; // hover shows the exact quarter

import { useRef, useState } from "react";

type Row = { period_label: string; period_order: number; avg_cost_pct: number; services: number };

const W = 640, H = 260;
const L = 40, R = 56, T = 18, B = 34;

// 20253 -> a running quarter number, so a missing quarter leaves a real gap on the axis
const qIndex = (order: number) => Math.floor(order / 10) * 4 + (order % 10) - 1;

export default function TrendChart({ rows, target }: { rows: Row[]; target: number }) {
  const [hi, setHi] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const q0 = qIndex(rows[0].period_order);
  const q1 = qIndex(rows[rows.length - 1].period_order);
  const ymax = Math.ceil(Math.max(...rows.map((r) => r.avg_cost_pct)) + 1);
  const xOf = (r: Row) => L + ((qIndex(r.period_order) - q0) / Math.max(1, q1 - q0)) * (W - L - R);
  const yOf = (v: number) => H - B - (v / ymax) * (H - T - B);

  // solid line between neighbouring quarters, dashed where a quarter is missing
  const segments = rows.slice(1).map((r, i) => {
    const p = rows[i];
    const gap = qIndex(r.period_order) - qIndex(p.period_order) > 1;
    return { key: r.period_order, d: `M${xOf(p)},${yOf(p.avg_cost_pct)} L${xOf(r)},${yOf(r.avg_cost_pct)}`, gap };
  });

  const onMove = (clientX: number) => {
    const box = svgRef.current!.getBoundingClientRect();
    const x = ((clientX - box.left) / box.width) * W;
    let best = 0;
    rows.forEach((r, i) => { if (Math.abs(xOf(r) - x) < Math.abs(xOf(rows[best]) - x)) best = i; });
    setHi(best);
  };

  const ticks = Array.from({ length: Math.floor(ymax / 2) + 1 }, (_, i) => i * 2);
  const last = rows[rows.length - 1];
  const h = hi !== null ? rows[hi] : null;

  return (
    <div className="chart-wrap">
      <svg ref={svgRef} className="chart" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Average cost of sending $200 by quarter, ${rows[0].period_label} to ${last.period_label}`}
        onPointerMove={(e) => onMove(e.clientX)} onPointerLeave={() => setHi(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={L} x2={W - R} y1={yOf(t)} y2={yOf(t)} />
            <text x={L - 8} y={yOf(t) + 4} textAnchor="end">{t}%</text>
          </g>
        ))}
        {rows.map((r, i) => (i % 2 === 0 || i === rows.length - 1 ? (
          <text key={r.period_order} x={xOf(r)} y={H - B + 20} textAnchor="middle">{r.period_label}</text>
        ) : null))}

        {/* UN target */}
        <line x1={L} x2={W - R} y1={yOf(target)} y2={yOf(target)} stroke="var(--target)" strokeWidth="2" strokeDasharray="6 5" />
        <text className="target-label" x={W - R + 6} y={yOf(target) + 4}>{target}%</text>

        {segments.map((s) => (
          <path key={s.key} d={s.d} fill="none" stroke="var(--loss)" strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={s.gap ? "3 5" : undefined} opacity={s.gap ? 0.6 : 1} />
        ))}
        {rows.map((r) => <circle key={r.period_order} cx={xOf(r)} cy={yOf(r.avg_cost_pct)} r="3.5" fill="var(--loss)" />)}

        <circle cx={xOf(last)} cy={yOf(last.avg_cost_pct)} r="6" fill="var(--loss)" stroke="var(--surface)" strokeWidth="2" />
        <text className="annot" x={xOf(last) + 10} y={yOf(last.avg_cost_pct) - 8}>{last.avg_cost_pct.toFixed(2)}%</text>

        {h && (
          <line x1={xOf(h)} x2={xOf(h)} y1={T} y2={H - B} stroke="var(--ink-3)" strokeWidth="1" />
        )}
      </svg>
      {h && (
        <div className="tip" style={{ left: `${(xOf(h) / W) * 100}%`, top: `${(yOf(h.avg_cost_pct) / H) * 100}%` }}>
          <strong>{h.period_label}</strong>
          {h.avg_cost_pct.toFixed(2)}% · ${(h.avg_cost_pct * 2).toFixed(2)} lost on $200
          <br />
          {h.services.toLocaleString("en-US")} services
        </div>
      )}
    </div>
  );
}
