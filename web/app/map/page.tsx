// Map: every country coloured by the average cost of sending $200 to it (or from it)
import type { Metadata } from "next";
import Link from "next/link";
import WorldMap, { type MapValue } from "@/components/WorldMap";
import { isoToMapId, MAP_H, MAP_W, worldShapes } from "@/lib/geo";
import type { CountryCost } from "@/lib/types";
import { pct } from "@/lib/calc";
import meta from "@/public/data/meta.json";
import countriesJson from "@/public/data/countries.json";

export const metadata: Metadata = { title: "Map · Remittance Cost Tracker" };

const data = countriesJson as { receive: CountryCost[]; send: CountryCost[] };

// World Bank country codes -> the ids the map outline uses
function keyed(rows: CountryCost[]): Record<string, MapValue> {
  const out: Record<string, MapValue> = {};
  for (const r of rows) {
    const id = isoToMapId(r.iso3);
    if (id) out[id] = { name: r.name, avg_cost_pct: r.avg_cost_pct, services: r.services, routes: r.routes };
  }
  return out;
}

export default function MapPage() {
  if (!meta.complete) {
    return (
      <>
        <p className="eyebrow">Map</p>
        <h1>The map needs the full route list.</h1>
        <p className="lead">It appears after the next data update. Meanwhile, see the <Link href="/routes">routes</Link> and the <Link href="/india">India</Link> view.</p>
      </>
    );
  }
  const expensive = [...data.receive].sort((a, b) => b.avg_cost_pct - a.avg_cost_pct).slice(0, 8);
  return (
    <>
      <p className="eyebrow">Map · {meta.latest_quarter}</p>
      <h1>Where sending money home costs the most.</h1>
      <p className="lead">
        Each country is coloured by the average cost of sending $200. Green countries are at or under the UN&apos;s 3% target.
        Hover a country for the numbers.
      </p>
      <section className="section" style={{ marginTop: 32 }}>
        <WorldMap shapes={worldShapes()} receive={keyed(data.receive)} send={keyed(data.send)} width={MAP_W} height={MAP_H} />
        <p className="note">Very small countries (for example Singapore or Bahrain) are too small to show on this world map; they are listed on the Routes page.</p>
      </section>
      <section className="section">
        <div className="section-head"><h2>Most expensive countries to send money to</h2></div>
        <div className="panel table-wrap" style={{ padding: 8 }}>
          <table>
            <thead><tr><th>Country</th><th className="num">Average cost</th><th className="num">Routes</th><th className="num">Services</th></tr></thead>
            <tbody>
              {expensive.map((r) => (
                <tr key={r.iso3}><td>{r.name}</td><td className="num"><span className="pill pill-loss">{pct(r.avg_cost_pct)}</span></td><td className="num">{r.routes}</td><td className="num">{r.services}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
