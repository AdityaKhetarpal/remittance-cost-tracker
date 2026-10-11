"""Turn the notebook's result tables (data/outputs/*.csv) into the JSON files the website reads.

Run from the repo root:  python pipeline/build_data.py

Checks stop the build if a table is missing, a cost is impossible, or a route appears twice,
so wrong numbers never reach the live site.
"""
import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
IN = ROOT / "data" / "outputs"
OUT = ROOT / "web" / "public" / "data"

WB_PUBLISHED_AVG = 6.36   # World Bank global average, Q3 2025 (remittanceprices.worldbank.org)
SDG_TARGET = 3.0          # UN SDG 10.c target for the cost of sending money home
LATEST_LABEL = None       # filled from trend.csv


def read(name, required=True):
    path = IN / f"{name}.csv"
    if not path.exists():
        if required:
            raise SystemExit(f"STOP: {path.relative_to(ROOT)} is missing")
        print(f"  (optional) {name}.csv not found, skipping")
        return None
    return pd.read_csv(path)


def check_costs(df, cols, name):
    for c in cols:
        bad = df[(df[c] < -100) | (df[c] > 100)]
        if len(bad):
            raise SystemExit(f"STOP: {name}.{c} has impossible values:\n{bad}")


def write(name, obj):
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f"{name}.json").write_text(json.dumps(obj, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    size = len(obj) if isinstance(obj, list) else "object"
    print(f"  wrote {name}.json ({size})")


def records(df):
    # NaN -> None so the JSON is valid
    return json.loads(df.to_json(orient="records", force_ascii=False))


def main():
    print("Reading", IN.relative_to(ROOT))

    # ---- required tables ----
    global_avg = read("global_avg")
    trend = read("trend").sort_values("period_order")
    corridors = read("corridors_latest")
    firm_types = read("by_firm_type")
    regions = read("by_region")
    india = read("to_india")

    # ---- optional tables (the full notebook run adds them) ----
    channels = read("by_channel", required=False)
    method_check = read("method_check", required=False)
    services = read("corridor_services", required=False)

    # ---- checks ----
    check_costs(corridors, ["avg_cost_pct", "cheapest_pct"], "corridors_latest")
    check_costs(firm_types, ["avg_cost_pct"], "by_firm_type")
    check_costs(india, ["avg_cost_pct", "cheapest_pct"], "to_india")
    if corridors["corridor"].duplicated().any():
        raise SystemExit("STOP: a route appears twice in corridors_latest.csv")
    if (corridors["cheapest_pct"] > corridors["avg_cost_pct"] + 1e-9).any():
        raise SystemExit("STOP: a route's cheapest cost is above its average")
    if trend["period_order"].duplicated().any():
        raise SystemExit("STOP: a quarter appears twice in trend.csv")

    regions["receive_region"] = regions["receive_region"].replace({"..": "Unknown"}).fillna("Unknown")

    # corridor code = sender ISO3 + receiver ISO3, e.g. GBRIND
    corridors["send_iso3"] = corridors["corridor"].str[:3]
    corridors["receive_iso3"] = corridors["corridor"].str[3:]
    corridors = corridors.sort_values("avg_cost_pct", ascending=False)

    g = global_avg.iloc[0]
    latest = trend.iloc[-1]
    complete = services is not None

    meta = {
        "latest_quarter": latest["period_label"],
        "avg_cost_pct": float(g["avg_all_services"]),
        "avg_of_corridors_pct": None if pd.isna(g["avg_of_corridors"]) else float(g["avg_of_corridors"]),
        "services": int(g["services"]),
        "corridors": int(g["corridors"]),
        "routes_listed": int(len(corridors)),
        "wb_published_avg_pct": WB_PUBLISHED_AVG,
        "sdg_target_pct": SDG_TARGET,
        "complete": complete,
        "has_channels": channels is not None,
    }
    write("meta", meta)
    write("trend", records(trend))
    write("corridors", records(corridors))
    write("firm_types", records(firm_types))
    write("regions", records(regions))
    write("india", records(india.sort_values("avg_cost_pct", ascending=False)))
    write("channels", records(channels) if channels is not None else [])
    write("method_check", records(method_check) if method_check is not None else [])

    if services is not None:
        check_costs(services, ["cost_pct"], "corridor_services")
        services = services.sort_values(["corridor", "cost_pct"])
        # one entry per route: every company's price, cheapest first
        by_route = {
            code: records(rows[["firm", "firm_type", "channel", "speed", "cost_pct", "fx_margin_pct"]])
            for code, rows in services.groupby("corridor")
        }
        write("services", by_route)

        # map: average cost by receiving country and by sending country (every service counts once)
        services["receive_iso3"] = services["corridor"].str[3:]
        services["send_iso3"] = services["corridor"].str[:3]
        def by(col, name_col):
            t = services.groupby([col, name_col]).agg(
                avg_cost_pct=("cost_pct", "mean"), services=("cost_pct", "size"), routes=("corridor", "nunique")
            ).reset_index().rename(columns={col: "iso3", name_col: "name"})
            t["avg_cost_pct"] = t["avg_cost_pct"].round(2)
            return records(t)
        write("countries", {"receive": by("receive_iso3", "receive_country"), "send": by("send_iso3", "send_country")})
    else:
        write("services", {})
        write("countries", {"receive": [], "send": []})

    print("Done.", "Complete data." if complete else "First results only: add corridor_services.csv for the full site.")


if __name__ == "__main__":
    main()
