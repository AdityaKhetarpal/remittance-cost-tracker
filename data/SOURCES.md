# Sources

## World Bank: Remittance Prices Worldwide (RPW)

- Website: https://remittanceprices.worldbank.org/
- File used: `rpw_dataset_2011_2025_q3.xlsx`, sheet `Dataset (from Q2 2016)`
- Download link: https://datacatalogfiles.worldbank.org/ddh-published/0037898/DR0095523/rpw_dataset_2011_2025_q3.xlsx
- Coverage used: Q2 2016 to Q3 2025 (no Q2 2025 in the file)
- Size: 204,469 rows, 47 columns

### Columns used

| World Bank column | Name in this project | Meaning |
|---|---|---|
| period | period | Quarter, e.g. 2016_2Q |
| corridor | corridor | Route code, e.g. GBRIND = UK to India |
| source_name / destination_name | send_country / receive_country | Sending and receiving country |
| destination_region | receive_region | Region of the receiving country |
| firm / firm_type | firm / firm_type | Company and its type (bank, money transfer operator, ...) |
| payment instrument | pay_with | How the sender pays |
| access point | send_via | Where the sender starts the transfer |
| pickup method | receive_as | How the money is received |
| speed actual / transparent | speed / transparent | Delivery time; whether the fee is shown clearly |
| cc1 fx margin | fx_margin_pct | Exchange-rate margin, % of $200 |
| cc1 total cost % | cost_pct | Fee plus exchange-rate margin, % of $200 |

Published global average used for checking: 6.36% in Q3 2025 (Remittance Prices Worldwide website).

## Newer context figures (data/raw/context.csv)

| Figure | Value | Period | Source | Status |
|---|---|---|---|---|
| Sent home to low- and middle-income countries | 728.6 US$ bn | 2025 | [IFAD, Sending Money Home 2026 (via Jamaica Gleaner)](https://jamaica-gleaner.com/article/news/20260916/remittances-nearly-double-decade-migrants-send-home-us729-billion-2025) | reported |
| Received by India, the world's largest recipient | 150.7 US$ bn | 2025 | [IFAD, Sending Money Home 2026 (via The American Bazaar)](https://americanbazaaronline.com/2026/09/15/us-largest-source-remittances-india-150-7-billion-2025-488218/) | reported |
| India's net private transfers (mostly remittances) | 144.8 US$ bn | FY 2025-26 | [RBI balance of payments, Lok Sabha reply (via The Tribune)](https://www.tribuneindia.com/news/business/indias-net-private-transfers-rise-to-record-usd-144-8-billion-in-fy25-26-centre-says-no-war-wise-remittance-data-maintained/) | reported |
| Global average cost of sending $200 | 6.36% | Q3 2025 | [World Bank, Remittance Prices Worldwide Issue 54](https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf) | official |
| Weighted average (by size of flows) | 5.04% | Q3 2025 | [World Bank, Remittance Prices Worldwide Issue 54](https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf) | official |
| SmaRT average (3 cheapest services per route) | 3.29% | Q3 2025 | [World Bank, Remittance Prices Worldwide Issue 54](https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf) | official |
| Digital transfers (non-digital: 7.30%) | 4.59% | Q3 2025 | [World Bank, Remittance Prices Worldwide Issue 54](https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf) | official |
| Non-digital transfers | 7.30% | Q3 2025 | [World Bank, Remittance Prices Worldwide Issue 54](https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf) | official |
| Banks | 14.99% | Q3 2025 | [World Bank, Remittance Prices Worldwide Issue 54](https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf) | official |
| Money transfer operators | 4.72% | Q3 2025 | [World Bank, Remittance Prices Worldwide Issue 54](https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf) | official |

## Where India's remittances come from (data/raw/india_source_shares.csv)

RBI survey of inward remittances, FY 2023-24: United States 27.7%, UAE 19.2%, UK 10.8% (RBI Bulletin March 2025, via Business Standard); Saudi Arabia 6.7%, Singapore 6.6% (via The American Bazaar, Sep 2026). Reported figures.
