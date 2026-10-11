"use client"; // runs in the browser so the numbers change as you pick

import { useState } from "react";
import { arrivesUsd, lossUsd, SEND_USD, usd, yearlySavingUsd } from "@/lib/calc";
import meta from "@/public/data/meta.json";
import corridors from "@/public/data/corridors.json";
import india from "@/public/data/india.json";

type Option = { key: string; label: string; avg: number; cheapest: number | null; services: number };

const WORLD = "world";
const TARGET = meta.sdg_target_pct;

// every route we have, plus every country sending to India, sorted by name
function buildOptions(): Option[] {
  const map = new Map<string, Option>();
  for (const c of corridors) {
    const label = `${c.send_country} → ${c.receive_country}`;
    map.set(label, { key: label, label, avg: c.avg_cost_pct, cheapest: c.cheapest_pct, services: c.services });
  }
  for (const r of india) {
    const label = `${r.send_country} → India`;
    if (!map.has(label)) map.set(label, { key: label, label, avg: r.avg_cost_pct, cheapest: r.cheapest_pct, services: r.services });
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

const OPTIONS = buildOptions(); // worked out once, the data never changes while the page is open

export default function LossCalculator() {
  const options = OPTIONS;
  const [key, setKey] = useState(WORLD);
  const [perYear, setPerYear] = useState(12);

  const world: Option = { key: WORLD, label: "World average", avg: meta.avg_cost_pct, cheapest: null, services: meta.services };
  const o = key === WORLD ? world : options.find((x) => x.key === key) ?? world;

  const lost = lossUsd(o.avg);
  const lostShare = Math.max(3, (lost / SEND_USD) * 100); // keep a sliver visible even for tiny costs
  const best = o.cheapest ?? TARGET;
  const saving = yearlySavingUsd(o.avg, best, perYear);

  return (
    <div className="calc">
      <div className="calc-inputs">
        <div>
          <label className="field-label" htmlFor="route">Sending route</label>
          <select id="route" value={key} onChange={(e) => setKey(e.target.value)}>
            <option value={WORLD}>World average ({meta.latest_quarter})</option>
            {options.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
          </select>
          <p className="hint">{o.services.toLocaleString("en-US")} services quoted in {meta.latest_quarter}.</p>
        </div>
        <div>
          <label className="field-label" htmlFor="times">
            Transfers of $200 a year <output htmlFor="times">{perYear}</output>
          </label>
          <input id="times" type="range" min={1} max={24} step={1} value={perYear} onChange={(e) => setPerYear(Number(e.target.value))} />
          <p className="hint">12 means sending $200 home every month.</p>
        </div>
      </div>

      <div className="calc-out" aria-live="polite">
        <div>
          <div className="bill" role="img" aria-label={`Of $200 sent, ${usd(arrivesUsd(o.avg))} arrives and ${usd(lost)} is lost`}>
            <div className="bill-arrives" style={{ width: `${100 - lostShare}%` }}>{usd(arrivesUsd(o.avg))} arrives</div>
            <div className="bill-lost" style={{ width: `${lostShare}%` }}>{lostShare > 12 ? `−${usd(lost)}` : ""}</div>
          </div>
          <div className="bill-scale"><span>$0</span><span>$200 sent</span></div>
        </div>

        <div className="compare">
          <div>
            <span>Average service loses</span>
            <strong className="is-loss">{usd(lost)}</strong>
            <small>{o.avg.toFixed(2)}% of $200</small>
          </div>
          <div>
            <span>{o.cheapest !== null ? "Cheapest service loses" : "Cheapest service"}</span>
            <strong className="is-cheap">{o.cheapest !== null ? usd(lossUsd(o.cheapest)) : "Pick a route"}</strong>
            <small>{o.cheapest !== null ? `${o.cheapest.toFixed(2)}% of $200` : "to compare companies"}</small>
          </div>
          <div>
            <span>At the UN&apos;s 3% target</span>
            <strong>{usd(lossUsd(TARGET))}</strong>
            <small>SDG 10.c goal for 2030</small>
          </div>
        </div>

        <div className="saving">
          {o.cheapest !== null ? (
            <>Switching from the average service to the cheapest one saves <strong>{usd(saving, 0)}</strong> a year on {perYear} transfer{perYear > 1 ? "s" : ""}.</>
          ) : saving > 0 ? (
            <>If sending money cost 3%, a family sending {perYear} × $200 would keep <strong>{usd(saving, 0)}</strong> more a year.</>
          ) : (
            <>This route already costs less than the 3% target on average.</>
          )}
        </div>
      </div>
    </div>
  );
}
