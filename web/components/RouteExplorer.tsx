"use client"; // search, sort and pick a route in the browser

import { useEffect, useMemo, useRef, useState } from "react";
import { pct, usd, yearlySavingUsd } from "@/lib/calc";
import type { Corridor, Service } from "@/lib/types";
import meta from "@/public/data/meta.json";
import corridorsJson from "@/public/data/corridors.json";

const corridors = corridorsJson as Corridor[];
type SortKey = "avg_cost_pct" | "cheapest_pct" | "services";

// a column heading you can click to sort by it (highest first)
function SortBtn({ k, sort, onSort, children }: { k: SortKey; sort: SortKey; onSort: (k: SortKey) => void; children: string }) {
  return (
    <button type="button" onClick={() => onSort(k)} aria-pressed={sort === k}>
      {children}{sort === k ? " ↓" : ""}
    </button>
  );
}

export default function RouteExplorer() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("avg_cost_pct");
  const [picked, setPicked] = useState(corridors[0]?.corridor);
  const [services, setServices] = useState<Record<string, Service[]> | null>(null);
  const detailRef = useRef<HTMLElement>(null);

  // on phones the detail sits under the list, so bring it into view after a pick
  const pick = (code: string) => {
    setPicked(code);
    if (window.innerWidth < 960) setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  // the full company list is large, so load it only on this page and only if it exists
  useEffect(() => {
    if (!meta.complete) return;
    fetch("/data/services.json").then((r) => r.json()).then(setServices).catch(() => setServices(null));
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return corridors
      .filter((c) => !q || `${c.send_country} ${c.receive_country} ${c.corridor}`.toLowerCase().includes(q))
      .sort((a, b) => b[sort] - a[sort]);
  }, [query, sort]);

  const c = corridors.find((x) => x.corridor === picked);
  const firms = c && services ? services[c.corridor] ?? [] : [];

  return (
    <div className="explorer">
      <section className="panel" style={{ padding: 0 }} aria-label="All routes">
        <div style={{ padding: "16px 16px 8px" }}>
          <label className="field-label" htmlFor="q">Find a route</label>
          <input id="q" className="search" type="search" placeholder="Country name, e.g. India" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="table-wrap route-list">
          <table>
            <thead>
              <tr>
                <th>From → to</th>
                <th className="num"><SortBtn k="avg_cost_pct" sort={sort} onSort={setSort}>Average</SortBtn></th>
                <th className="num"><SortBtn k="cheapest_pct" sort={sort} onSort={setSort}>Cheapest</SortBtn></th>
                <th className="num"><SortBtn k="services" sort={sort} onSort={setSort}>Services</SortBtn></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.corridor} aria-selected={r.corridor === picked} tabIndex={0}
                  onClick={() => pick(r.corridor)} onKeyDown={(e) => e.key === "Enter" && pick(r.corridor)}>
                  <td>{r.send_country} → {r.receive_country}<div className="muted">{r.receive_region}</div></td>
                  <td className="num">
                    <span className={`pill ${r.avg_cost_pct <= meta.sdg_target_pct ? "pill-cheap" : "pill-loss"}`}>{pct(r.avg_cost_pct)}</span>
                  </td>
                  <td className="num">{pct(r.cheapest_pct)}</td>
                  <td className="num">{r.services}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={4} className="muted">No route matches “{query}”.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {c && (
        <section className="panel detail" aria-live="polite" ref={detailRef}>
          <p className="eyebrow">{c.receive_region}</p>
          <h3>{c.send_country} → {c.receive_country}</h3>
          <p className="muted" style={{ marginTop: 4 }}>{c.services} services quoted in {meta.latest_quarter}</p>

          <div className="compare" style={{ marginTop: 18 }}>
            <div><span>Average</span><strong className="is-loss">{usd(c.avg_loss_usd_on_200)}</strong><small>{pct(c.avg_cost_pct)} lost</small></div>
            <div><span>Cheapest</span><strong className="is-cheap">{usd(c.cheapest_loss_usd_on_200)}</strong><small>{pct(c.cheapest_pct)} lost</small></div>
            <div><span>vs 3% target</span><strong>{c.gap_to_3pct > 0 ? "+" : ""}{c.gap_to_3pct.toFixed(2)}</strong><small>points</small></div>
          </div>
          <p className="saving" style={{ marginTop: 16 }}>
            Sending $200 every month with the cheapest service instead of an average one saves <strong>{usd(yearlySavingUsd(c.avg_cost_pct, c.cheapest_pct, 12), 0)}</strong> a year.
          </p>

          {firms.length > 0 && (
            <>
              <h3 style={{ marginTop: 24, fontSize: "1.05rem" }}>Every company on this route</h3>
              <div className="firm-list">
                {firms.map((f, i) => (
                  <div className="firm-row" key={`${f.firm}-${i}`}>
                    <span>{f.firm}</span>
                    <strong>{pct(f.cost_pct)}</strong>
                    <span className="firm-meta">
                      {f.firm_type} · {f.channel}{f.speed ? ` · ${f.speed}` : ""}
                      {f.fx_margin_pct !== null ? ` · ${pct(f.fx_margin_pct)} hidden in the exchange rate` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
