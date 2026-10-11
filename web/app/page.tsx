// Overview: one $200 transfer first (the hero), then who charges most, where, and how it has changed
import Link from "next/link";
import LossCalculator from "@/components/LossCalculator";
import HBars from "@/components/HBars";
import TrendChart from "@/components/TrendChart";
import { lossUsd, pct, timesMore, usd } from "@/lib/calc";
import meta from "@/public/data/meta.json";
import trend from "@/public/data/trend.json";
import firmTypes from "@/public/data/firm_types.json";
import regions from "@/public/data/regions.json";
import corridors from "@/public/data/corridors.json";
import channels from "@/public/data/channels.json";

const TARGET = meta.sdg_target_pct;
const colorFor = (v: number) => (v <= TARGET ? "var(--cheap)" : "var(--loss)");

export default function Home() {
  const bank = firmTypes.find((f) => f.firm_type === "Bank");
  const mto = firmTypes.find((f) => f.firm_type === "Money Transfer Operator");
  const top5 = corridors.slice(0, 5);
  const cheap5 = [...corridors].sort((a, b) => a.avg_cost_pct - b.avg_cost_pct).slice(0, 5);
  const chan = channels as { channel: string; services: number; avg_cost_pct: number }[];

  return (
    <>
      {/* ---------- hero: one $200 transfer ---------- */}
      <p className="eyebrow">World Bank data · {meta.latest_quarter}</p>
      <h1>Send $200 home, and <em>{usd(lossUsd(meta.avg_cost_pct))}</em> never arrives.</h1>
      <p className="lead">
        On average, {pct(meta.avg_cost_pct)} of every $200 is lost to fees and a hidden exchange-rate margin. That&apos;s{" "}
        {timesMore(meta.avg_cost_pct, TARGET).toFixed(1)}× the UN&apos;s {TARGET}% target. Pick a route to see what your family loses, and what the cheapest service would save.
      </p>
      <LossCalculator />

      {/* ---------- key numbers ---------- */}
      <section className="section">
        <div className="stats">
          <div className="stat">
            <p className="stat-label">Average cost of sending $200</p>
            <p className="stat-value">{pct(meta.avg_cost_pct)}</p>
            <p className="stat-note">{(meta.avg_cost_pct - TARGET).toFixed(2)} points above the {TARGET}% target</p>
          </div>
          {bank && mto && (
            <div className="stat">
              <p className="stat-label">Banks vs money transfer operators</p>
              <p className="stat-value">{timesMore(bank.avg_cost_pct, mto.avg_cost_pct).toFixed(1)}×</p>
              <p className="stat-note">{pct(bank.avg_cost_pct)} vs {pct(mto.avg_cost_pct)} of $200</p>
            </div>
          )}
          <div className="stat">
            <p className="stat-label">Prices compared</p>
            <p className="stat-value">{meta.services.toLocaleString("en-US")}</p>
            <p className="stat-note">services on {meta.corridors} routes</p>
          </div>
        </div>
      </section>

      {/* ---------- who charges most ---------- */}
      <section className="section">
        <div className="section-head">
          <h2>Who you send with matters most</h2>
          <p>Average loss on $200 by type of company. The dashed line is the {TARGET}% target ($6).</p>
        </div>
        <div className="panel">
          <HBars color="var(--loss)" target={TARGET}
            rows={firmTypes.map((f) => ({
              label: f.firm_type,
              sub: `${f.services.toLocaleString("en-US")} services`,
              value: f.avg_cost_pct,
              display: `${pct(f.avg_cost_pct)} · ${usd(f.avg_loss_usd_on_200)}`,
              color: colorFor(f.avg_cost_pct),
            }))} />
          {bank && <p className="note">Through a bank, {usd(bank.avg_loss_usd_on_200)} of every $200 is lost on average, against the $6 the target allows.</p>}
        </div>
      </section>

      {/* ---------- channels (full data only) ---------- */}
      {chan.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Online, mixed or in person</h2>
            <p>Fully digital = every way to send is online or by mobile. This project&apos;s own grouping of the World Bank&apos;s access points.</p>
          </div>
          <div className="panel">
            <HBars color="var(--loss)" target={TARGET}
              rows={chan.map((c) => ({
                label: c.channel, sub: `${c.services.toLocaleString("en-US")} services`, value: c.avg_cost_pct,
                display: `${pct(c.avg_cost_pct)} · ${usd(lossUsd(c.avg_cost_pct))}`, color: colorFor(c.avg_cost_pct),
              }))} />
          </div>
        </section>
      )}

      {/* ---------- where and when ---------- */}
      <section className="section grid-2">
        <div className="panel">
          <h3>Cost by region money is sent to</h3>
          <p className="note" style={{ marginTop: 6, marginBottom: 10 }}>Average % of $200, {meta.latest_quarter}</p>
          <HBars color="var(--loss)" target={TARGET}
            rows={regions.map((r) => ({
              label: r.receive_region, sub: `${r.corridors} routes`, value: r.avg_cost_pct,
              display: pct(r.avg_cost_pct), color: colorFor(r.avg_cost_pct),
            }))} />
          <p className="note">“Unknown” = routes where the World Bank file leaves the region blank.</p>
        </div>
        <div className="panel">
          <h3>Average cost by quarter</h3>
          <p className="note" style={{ marginTop: 6, marginBottom: 8 }}>Hover for the exact quarter</p>
          <TrendChart rows={trend} target={TARGET} />
          <div className="legend">
            <span><i style={{ background: "var(--loss)" }} />Average cost</span>
            <span><i className="line-key" />UN target, {TARGET}%</span>
          </div>
          <p className="note">The World Bank file has no Q2 2025, so that stretch is dotted.</p>
        </div>
      </section>

      {/* ---------- routes ---------- */}
      <section className="section">
        <div className="section-head">
          <h2>The most and least expensive routes</h2>
          <p>Routes with at least 3 services, so one odd price can&apos;t decide the result. <Link href="/routes">See every route →</Link></p>
        </div>
        <div className="grid-2">
          {[{ title: "Most expensive", rows: top5 }, { title: "Cheapest", rows: cheap5 }].map((t) => (
            <div className="panel table-wrap" style={{ padding: 8 }} key={t.title}>
              <table>
                <thead><tr><th>{t.title}</th><th className="num">Average</th><th className="num">Lost on $200</th></tr></thead>
                <tbody>
                  {t.rows.map((r) => (
                    <tr key={r.corridor}>
                      <td>{r.send_country} → {r.receive_country}</td>
                      <td className="num"><span className={`pill ${r.avg_cost_pct <= TARGET ? "pill-cheap" : "pill-loss"}`}>{pct(r.avg_cost_pct)}</span></td>
                      <td className="num">{usd(r.avg_loss_usd_on_200)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <p className="note" style={{ marginTop: 40 }}>
        The World Bank publishes a global average of {pct(meta.wb_published_avg_pct)} for {meta.latest_quarter}. This site&apos;s{" "}
        {pct(meta.avg_cost_pct)} counts every service once and leaves out costs below 0% or above 50%; the <Link href="/method">Method</Link> page explains the difference.
      </p>
    </>
  );
}
