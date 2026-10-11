// Routes: search every route, pick one to see its average, cheapest and (with full data) every company
import type { Metadata } from "next";
import RouteExplorer from "@/components/RouteExplorer";
import meta from "@/public/data/meta.json";

export const metadata: Metadata = { title: "Routes · Remittance Cost Tracker" };

export default function RoutesPage() {
  return (
    <>
      <p className="eyebrow">Routes · {meta.latest_quarter}</p>
      <h1>Every route, from cheapest to most expensive.</h1>
      <p className="lead">
        A route is one sending country to one receiving country. Search for yours, then pick it to see how much the
        average and the cheapest service take from $200.
      </p>
      {!meta.complete && (
        <p className="notice">
          Showing the {meta.routes_listed} routes from the first results: the 10 most and 10 least expensive with at least 3 services.
          Every route, with each company&apos;s price, appears after the next data update.
        </p>
      )}
      <RouteExplorer />
    </>
  );
}
