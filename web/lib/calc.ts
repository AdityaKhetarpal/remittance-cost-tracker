// The maths behind the site, as small pure functions so they can be tested.
// Every World Bank cost is quoted for sending $200, as a % of the amount sent.

export const SEND_USD = 200;

// money lost on one $200 transfer, e.g. 5.91% -> $11.82
export function lossUsd(costPct: number, amount = SEND_USD): number {
  return (amount * costPct) / 100;
}

// what arrives after the cost is taken
export function arrivesUsd(costPct: number, amount = SEND_USD): number {
  return amount - lossUsd(costPct, amount);
}

// a year of transfers: saving from switching from the average service to the cheapest one
export function yearlySavingUsd(avgPct: number, cheapestPct: number, perYear: number, amount = SEND_USD): number {
  return Math.max(0, lossUsd(avgPct - cheapestPct, amount)) * perYear;
}

// how many times more one cost is than another, e.g. banks vs money transfer operators
export function timesMore(a: number, b: number): number {
  return b > 0 ? a / b : NaN;
}

// map colour band: 0 = at or under the 3% target ... 4 = 10% or more
export const BANDS = [
  { max: 3, label: "Up to 3% (UN target)" },
  { max: 5, label: "3% to 5%" },
  { max: 7, label: "5% to 7%" },
  { max: 10, label: "7% to 10%" },
  { max: Infinity, label: "10% or more" },
] as const;

export function costBand(costPct: number): number {
  return BANDS.findIndex((b) => costPct <= b.max);
}

// formatting
export const usd = (n: number, d = 2) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const pct = (n: number) => `${n.toFixed(2)}%`;
