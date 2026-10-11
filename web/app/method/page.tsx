// Method: where the data comes from, every cleaning rule, and what the numbers can't tell you
import type { Metadata } from "next";
import { pct } from "@/lib/calc";
import meta from "@/public/data/meta.json";
import methodCheck from "@/public/data/method_check.json";

export const metadata: Metadata = { title: "Method · Remittance Cost Tracker" };

const STEPS = [
  ["Download", "The World Bank's Remittance Prices Worldwide file, one row per service, route and quarter (204,469 rows from Q2 2016)."],
  ["Clean", "Keep 14 columns, turn costs into numbers, label blank regions “Unknown”."],
  ["Filter", "Leave out blank costs and costs below 0% or above 50%, keeping a full copy to test other rules."],
  ["Analyse in SQL", "DuckDB: averages by route, company type, channel, region and quarter, plus routes into India."],
  ["Publish", "A Python script checks the result tables and writes the JSON this site reads. Every push is tested and rebuilt."],
];

type Check = { filter: string; services: number; avg_by_service: number; avg_by_corridor: number };

export default function MethodPage() {
  const checks = methodCheck as Check[];
  return (
    <>
      <p className="eyebrow">Method</p>
      <h1>How the numbers are made.</h1>
      <p className="lead">
        Every cost on this site is the World Bank&apos;s “total cost” of sending $200: the fee plus the margin hidden in the exchange rate,
        as a % of $200. Loss in dollars is that % × $2.
      </p>

      <section className="section">
        <ol className="steps">
          {STEPS.map(([t, d]) => <li className="step" key={t}><h3>{t}</h3><p>{d}</p></li>)}
        </ol>
      </section>

      <section className="section grid-2">
        <div className="panel">
          <h3>Definitions</h3>
          <ul className="limits">
            <li><strong>Route</strong>: one sending country to one receiving country (World Bank “corridor”, e.g. GBRIND = UK to India).</li>
            <li><strong>Average</strong>: every service on a route or in a group counts once; there are no transfer volumes to weight by.</li>
            <li><strong>Cheapest</strong>: the lowest-cost service quoted on the route that quarter.</li>
            <li><strong>Channel</strong> (this project&apos;s own grouping): <em>Fully digital</em> if every access point is Internet or mobile phone, <em>Mixed</em> if some are, otherwise <em>In person only</em>.</li>
            <li><strong>Target</strong>: UN Sustainable Development Goal 10.c, cost of 3% or less by 2030.</li>
          </ul>
        </div>
        <div className="panel">
          <h3>Why {pct(meta.avg_cost_pct)} and not the World Bank&apos;s {pct(meta.wb_published_avg_pct)}?</h3>
          <p className="note" style={{ color: "var(--ink-2)", fontSize: "0.95rem" }}>
            Both are for {meta.latest_quarter}. This site counts each of the {meta.services.toLocaleString("en-US")} services once and leaves out
            costs below 0% or above 50%. The World Bank&apos;s headline figure may use a different set of services or averaging method.
          </p>
          {checks.length > 0 && (
            <div className="table-wrap" style={{ marginTop: 12 }}>
              <table>
                <thead><tr><th>Rule tested</th><th className="num">Services</th><th className="num">Per service</th><th className="num">Per route</th></tr></thead>
                <tbody>
                  {checks.map((c) => (
                    <tr key={c.filter}><td>{c.filter}</td><td className="num">{c.services.toLocaleString("en-US")}</td><td className="num">{pct(c.avg_by_service)}</td><td className="num">{pct(c.avg_by_corridor)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Limitations</h2>
        <ul className="limits">
          <li>Costs are for sending $200 only; larger transfers usually cost a smaller share.</li>
          <li>Averages are not weighted by how much money really moves on each route.</li>
          <li>The World Bank file has no data for Q2 2025.</li>
          <li>The cheapest service on a route may be slower, need a bank account, or be online only.</li>
          <li>Negative costs (a better-than-market exchange rate) are left out of the averages.</li>
        </ul>
      </section>

      <section className="section">
        <h2>Sources</h2>
        <ul className="sources">
          <li><a href="https://remittanceprices.worldbank.org/" target="_blank" rel="noreferrer">World Bank, Remittance Prices Worldwide</a>: the price data and the published {pct(meta.wb_published_avg_pct)} global average.</li>
          <li><a href="https://github.com/AdityaKhetarpal/remittance-cost-tracker/blob/main/notebooks/remittance_analysis.ipynb" target="_blank" rel="noreferrer">The analysis notebook</a>: every step from download to result tables.</li>
          <li><a href="https://github.com/AdityaKhetarpal/remittance-cost-tracker/blob/main/pipeline/build_data.py" target="_blank" rel="noreferrer">The data pipeline</a>: checks and the files behind this site.</li>
        </ul>
      </section>
    </>
  );
}
