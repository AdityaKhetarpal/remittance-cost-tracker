// Server-side only: turn the world outline file into SVG paths once, at build time,
// so visitors download finished shapes instead of a mapping library.
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import countries from "i18n-iso-countries";
import world from "world-atlas/countries-110m.json";

export const MAP_W = 960;
export const MAP_H = 470;

export type Shape = { id: string; d: string };

export function worldShapes(): Shape[] {
  const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
  const geo = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry>;
  geo.features = geo.features.filter((f) => f.id !== "010"); // leave out Antarctica
  const projection = geoEqualEarth().fitSize([MAP_W, MAP_H], geo);
  const path = geoPath(projection);
  return geo.features.map((f) => ({ id: String(f.id), d: path(f) ?? "" })).filter((s) => s.d);
}

// "IND" -> "356", the id the world outline file uses
export function isoToMapId(iso3: string): string | undefined {
  return countries.alpha3ToNumeric(iso3) ?? undefined;
}
