# Remittance Cost Tracker

How much it costs to send **$200** home, by route, by type of company and by channel, using the World Bank's Remittance Prices Worldwide data (Q2 2016 to Q3 2025).

**Status:** analysis in progress (notebook). Next: a model of what drives cost, then a live dashboard.

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

## Limitations

- The World Bank file has no data for Q2 2025 (it goes from Q1 2025 to Q3 2025).
- Each service counts once in the averages; the data has no transfer volumes, so the averages are not weighted by how much money really moves on each route.
- Negative costs (a better-than-market exchange rate) and costs above 50% are removed for now; step 17 shows how much this changes the average.
- Costs are for sending $200 only.

## Run it yourself

Open the notebook in Google Colab and choose **Runtime → Restart session and run all**. It creates a `remittance` folder in your Google Drive, downloads the data and saves results in `remittance/outputs`.

---

Built by [Aditya Khetarpal](https://github.com/AdityaKhetarpal) · [LinkedIn](https://www.linkedin.com/in/adityakhetarpal)

*Analysis and education only. Not financial advice.*
