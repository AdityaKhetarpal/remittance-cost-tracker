// Shapes of the JSON files in public/data (written by pipeline/build_data.py)

export type Meta = {
  latest_quarter: string;
  avg_cost_pct: number;
  avg_of_corridors_pct: number | null;
  services: number;
  corridors: number;
  routes_listed: number;
  wb_published_avg_pct: number;
  sdg_target_pct: number;
  complete: boolean;
  has_channels: boolean;
};

export type Corridor = {
  corridor: string;
  send_country: string;
  receive_country: string;
  receive_region: string;
  services: number;
  avg_cost_pct: number;
  cheapest_pct: number;
  gap_to_3pct: number;
  avg_loss_usd_on_200: number;
  cheapest_loss_usd_on_200: number;
  send_iso3: string;
  receive_iso3: string;
};

export type Service = {
  firm: string;
  firm_type: string;
  channel: string;
  speed: string | null;
  cost_pct: number;
  fx_margin_pct: number | null;
};

export type CountryCost = { iso3: string; name: string; avg_cost_pct: number; services: number; routes: number };
