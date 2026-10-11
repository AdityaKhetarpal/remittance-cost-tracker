# Remittance Cost Tracker

How much it costs to send **$200** home, by route, by type of company and by channel, using the World Bank's Remittance Prices Worldwide data (Q2 2016 to Q3 2025).

**Live site:** https://remittance-cost-tracker.vercel.app/

## The problem

Migrants send money home every month, and part of every transfer is lost to fees and to a hidden margin in the exchange rate. The UN target (SDG 10.c) is to bring this cost under **3%**. This project shows where the money is lost, who charges the most, and how much a family could save by switching to the cheapest service.

## First results (Q3 2025)

Services with a total cost between 0% and 50% of $200. 6,360 services on 348 routes.

| Finding | Number |
|---|---|
| Average cost of sending $200 | 5.91% (about $11.82) |
| Banks | 12.64% ($25.28 lost on $200), 955 services |
| Money transfer operators | 4.68% ($9.36 lost on $200), 5,238 services |
| Most expensive route (3+ services) | Senegal → Mali, 25.70% |
| Cheapest route (3+ services) | Malaysia → Myanmar, 0.29% |
| Sending to India: cheapest country | United Kingdom → India, 1.91% |
| Sending to India: most expensive country | South Africa → India, 16.39% |

The World Bank publishes a global average of 6.36% for Q3 2025. Step 17 of the notebook tests which cleaning rule and averaging method match it, before these numbers are used on the website.

## Data

| File | Contents | Source |
|---|---|---|
| `rpw_dataset_2011_2025_q3.xlsx` (not stored in the repo, downloaded by the notebook) | One row per service, route and quarter, 204,469 rows, 47 columns | World Bank, Remittance Prices Worldwide |
| `data/raw/context.csv` | Newer headline figures: 2025 flows (IFAD *Sending Money Home 2026*, Sep 2026), India FY 2025-26 (RBI via Parliament, Jul 2026), World Bank Q3 2025 breakdowns | Each row has its source link, period and status (official / reported) |
| `data/raw/india_source_shares.csv` | Where India's remittances come from (US 27.7%, UAE 19.2%, UK 10.8%, ...) | RBI survey, FY 2023-24 (reported) |

**Freshness:** Q3 2025 is the latest World Bank price edition (checked October 2026). `.github/workflows/check-new-data.yml` checks every Monday for a newer one and opens an issue when it appears.

Full source note: [`data/SOURCES.md`](data/SOURCES.md). The raw file is about 50 MB, so the notebook downloads it instead of storing it here.

## Method

```
World Bank Excel ─► Parquet ─► pandas cleaning ─► DuckDB SQL ─► CSV results ─► (next) dashboard
```

Notebook: [`notebooks/remittance_analysis.ipynb`](notebooks/remittance_analysis.ipynb), built and run in Google Colab.

1. Download the file once and save the main sheet as Parquet (later runs skip both steps).
2. Keep 14 columns, convert costs to numbers, label missing regions as "Unknown".
3. Remove blank costs and costs below 0% or above 50%, keeping an untouched copy for checks.
4. Label each service's channel: **Fully digital** (Internet or mobile only), **Mixed**, or **In person only**. This is this project's own definition.
5. SQL in DuckDB: global average (by service and by route), trend by quarter, routes, company type, channel, region, and routes into India.
6. Save every result table as CSV.

## The website

| Page | What it does |
|---|---|
| Overview | "You send $200" calculator (pick a route, see what arrives, what's lost and what switching saves); cost by company type, region and quarter; most and least expensive routes |
| Routes | Search and sort every route; pick one for its average, cheapest and (with full data) every company's price |
| Map | World map coloured by the average cost of sending money to or from each country (shown once the full route list is added) |
| India | Cost of sending $200 to India from 20 countries, and the yearly saving from switching to the cheapest service |
| Method | Steps, definitions, the 5.91% vs 6.36% check, limitations and sources |

Built with Next.js and plain CSS, hand-drawn SVG charts, no tracking and no API keys.

## Automation

- `pipeline/build_data.py` reads the notebook's result tables in `data/outputs/`, stops on missing tables, impossible costs or repeated routes, and writes the JSON the website reads.
- `.github/workflows/ci.yml` runs on every push: the pipeline, lint, tests and a production build.
- Vercel redeploys the site automatically on every push to `main`.

**Updating the data:** run the notebook, copy the CSVs from `remittance/outputs` in Google Drive into `data/outputs/`, run `python pipeline/build_data.py`, commit and push.

## Limitations

- The World Bank file has no data for Q2 2025 (it goes from Q1 2025 to Q3 2025).
- Each service counts once in the averages; the data has no transfer volumes, so the averages are not weighted by how much money really moves on each route.
- Negative costs (a better-than-market exchange rate) and costs above 50% are removed for now; step 17 shows how much this changes the average.
- Costs are for sending $200 only.

## Run it yourself

```bash
# 1. the analysis: open notebooks/remittance_analysis.ipynb in Google Colab
#    and choose Runtime -> Restart session and run all

# 2. rebuild the website data (Python 3.12)
pip install -r pipeline/requirements.txt
python pipeline/build_data.py

# 3. run the website (Node 20.9+)
cd web
npm install
npm test
npm run dev        # http://localhost:3000
```

---

Built by [Aditya Khetarpal](https://github.com/AdityaKhetarpal) · [LinkedIn](https://www.linkedin.com/in/adityakhetarpal)

*Analysis and education only. Not financial advice.*
