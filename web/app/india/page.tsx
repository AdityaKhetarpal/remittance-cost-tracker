// India: what it costs to send $200 to India from each country, and what switching saves
import type { Metadata } from "next";
import HBars from "@/components/HBars";
import { lossUsd, pct, usd } from "@/lib/calc";
import meta from "@/public/data/meta.json";
import india from "@/public/data/india.json";
import sources from "@/public/data/india_sources.json";
import ContextCards from "@/components/ContextCards";

export const metadata: Metadata = { title: "India · Remittance Cost Tracker" };

const TARGET = meta.sdg_target_pct;

export default function IndiaPage() {
  const dearest = india[0];
  const cheapest = india[india.length - 1];
  const under = india.filter((r) => r.avg_cost_pct <= TARGET).length;
  const bySaving = [...india].sort((a, b) => b.yearly_saving_usd - a.yearly_saving_usd);

  return (
    <>
      <p className="eyebrow">India · {meta.latest_quarter}</p>
      <h1>Sending $200 to India costs <em>{usd(lossUsd(cheapest.avg_cost_pct))}</em> to <em>{usd(lossUsd(dearest.avg_cost_pct))}</em>.</h1>
      <p className="lead">
        It depends on where the money starts. From {cheapest.send_country} the average service takes {pct(cheapest.avg_cost_pct)};
        from {dearest.send_country}, {pct(dearest.avg_cost_pct)}. {under} of {india.length} sending countries are at or under the {TARGET}% target.
      </p>

      <section className="section">
        <ContextCards keys={["india_inflows", "india_fy26"]} />
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Where India&apos;s money comes from, and what it costs</h2>
          <p>
            The five biggest sending countries made up {sources.reduce((a, r) => a + r.share_pct, 0).toFixed(1)}% of India&apos;s remittances in {sources[0].period} (RBI survey).
            Their cost to send $200 in {meta.latest_quarter}:
          </p>
        </div>
        <div className="panel table-wrap" style={{ padding: 8 }}>
          <table>
            <thead><tr><th>From</th><th className="num">Share of India&apos;s inflows</th><th className="num">Average cost</th><th className="num">Cheapest</th><th>Source</th></tr></thead>
            <tbody>
              {sources.map((r) => (
                <tr key={r.send_country}>
                  <td>{r.send_country}</td>
                  <td className="num"><strong>{r.share_pct.toFixed(1)}%</strong></td>
                  <td className="num">{r.avg_cost_pct !== null ? <span className={`pill ${r.avg_cost_pct <= TARGET ? "pill-cheap" : "pill-loss"}`}>{pct(r.avg_cost_pct)}</span> : "–"}</td>
                  <td className="num">{r.cheapest_pct !== null ? pct(r.cheapest_pct) : "–"}</td>
                  <td className="muted"><a href={r.url} target="_blank" rel="noreferrer">{r.source}</a><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Average cost by sending country</h2>
          <p>% of $200 lost with an average service. Dashed line: the {TARGET}% target.</p>
        </div>
        <div className="panel">
          <HBars color="var(--loss)" target={TARGET}
            rows={india.map((r) => ({
              label: `${r.send_country} → India`,
              sub: `${r.services} services · cheapest ${pct(r.cheapest_pct)}`,
              value: r.avg_cost_pct,
              display: `${pct(r.avg_cost_pct)} · ${usd(lossUsd(r.avg_cost_pct))}`,
              color: r.avg_cost_pct <= TARGET ? "var(--cheap)" : "var(--loss)",
            }))} />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>What switching to the cheapest service saves</h2>
          <p>For someone sending $200 to India every month, average service vs the cheapest one on the same route.</p>
        </div>
        <div className="panel table-wrap" style={{ padding: 8 }}>
          <table>
            <thead><tr><th>From</th><th className="num">Average</th><th className="num">Cheapest</th><th className="num">Saved a year</th></tr></thead>
            <tbody>
              {bySaving.map((r) => (
                <tr key={r.send_country}>
                  <td>{r.send_country}</td>
                  <td className="num">{pct(r.avg_cost_pct)}</td>
                  <td className="num"><span className="pill pill-cheap">{pct(r.cheapest_pct)}</span></td>
                  <td className="num"><strong>{usd(r.yearly_saving_usd, 0)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">Saved a year = (average % − cheapest %) × $2 × 12 transfers. The cheapest service may be slower or need a bank account.</p>
      </section>
    </>
  );
}
