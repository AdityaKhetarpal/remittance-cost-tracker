"use client"; // hover and the receive/send switch run in the browser

import { useRef, useState } from "react";
import { BANDS, costBand, lossUsd, usd } from "@/lib/calc";

export type MapValue = { name: string; avg_cost_pct: number; services: number; routes: number };
type Props = {
  shapes: { id: string; d: string }[];
  receive: Record<string, MapValue>; // keyed by map id
  send: Record<string, MapValue>;
  width: number;
  height: number;
};

const FILL = ["var(--m0)", "var(--m1)", "var(--m2)", "var(--m3)", "var(--m4)"];

export default function WorldMap({ shapes, receive, send, width, height }: Props) {
  const [side, setSide] = useState<"receive" | "send">("receive");
  const [hover, setHover] = useState<{ v: MapValue; x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const values = side === "receive" ? receive : send;

  const onMove = (e: React.PointerEvent, v: MapValue) => {
    const r = box.current!.getBoundingClientRect();
    setHover({ v, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <>
      <div className="section-head" style={{ marginBottom: 12 }}>
        <div className="toggle" role="group" aria-label="Colour countries by">
          <button type="button" aria-pressed={side === "receive"} onClick={() => setSide("receive")}>Money received</button>
          <button type="button" aria-pressed={side === "send"} onClick={() => setSide("send")}>Money sent</button>
        </div>
        <p className="muted">
          {side === "receive" ? "Average cost of sending $200 into each country." : "Average cost of sending $200 out of each country."}
        </p>
      </div>

      <div className="panel map-panel chart-wrap" ref={box}>
        <svg className="chart map-svg" viewBox={`0 0 ${width} ${height}`} role="img"
          aria-label={`World map of the average cost of ${side === "receive" ? "receiving" : "sending"} $200`}>
          {shapes.map((s) => {
            const v = values[s.id];
            return (
              <path key={s.id} d={s.d} className={v ? "has-data" : undefined}
                fill={v ? FILL[costBand(v.avg_cost_pct)] : "var(--m-none)"}
                onPointerMove={v ? (e) => onMove(e, v) : undefined}
                onPointerLeave={() => setHover(null)}>
                {v && <title>{`${v.name}: ${v.avg_cost_pct.toFixed(2)}%`}</title>}
              </path>
            );
          })}
        </svg>
        {hover && (
          <div className="tip" style={{ left: hover.x, top: hover.y }}>
            <strong>{hover.v.name}</strong>
            {hover.v.avg_cost_pct.toFixed(2)}% · {usd(lossUsd(hover.v.avg_cost_pct))} lost on $200
            <br />
            {hover.v.services} services on {hover.v.routes} route{hover.v.routes > 1 ? "s" : ""}
          </div>
        )}
        <div className="legend">
          {BANDS.map((b, i) => <span key={b.label}><i style={{ background: FILL[i] }} />{b.label}</span>)}
          <span><i style={{ background: "var(--m-none)" }} />No data</span>
        </div>
      </div>
    </>
  );
}
