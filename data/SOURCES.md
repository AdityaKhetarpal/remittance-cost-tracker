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
