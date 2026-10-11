// Horizontal bars with the value written at the tip, and an optional dashed line for the 3% target

export type BarRow = {
  label: string;
  value: number; // sets the bar length
  display: string; // the formatted value shown at the tip
  sub?: string; // optional small second line under the label
  color?: string; // overrides the default colour for this bar
};

type Props = { rows: BarRow[]; color: string; max?: number; target?: number };

export default function HBars({ rows, color, max, target }: Props) {
  const top = max ?? Math.max(...rows.map((r) => r.value), target ?? 0); // longest bar = 80% of the track
  const at = (v: number) => `${(v / top) * 80}%`;
  return (
    <div className="hbars" role="list">
      {rows.map((r) => (
        <div className="hbar" role="listitem" key={r.label} tabIndex={0}>
          <span className="hbar-label">
            {r.label}
            {r.sub && <span className="hbar-sub">{r.sub}</span>}
          </span>
          <span className="hbar-track">
            <span className="hbar-bar" style={{ width: at(r.value), background: r.color ?? color }} />
            <span className="hbar-value">{r.display}</span>
            {target !== undefined && <span className="hbar-target" style={{ left: at(target) }} aria-hidden="true" />}
          </span>
        </div>
      ))}
    </div>
  );
}
