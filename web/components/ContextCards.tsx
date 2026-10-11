// Headline figures from newer publications, each card showing its source, period and status
import context from "@/public/data/context.json";

type Item = { key: string; label: string; value: number; unit: string; period: string; source: string; url: string; published: string; status: string };
const C = context as Record<string, Item>;

// 728.6 + "US$ billion" -> "$728.6 bn"; 4.59 + "%" -> "4.59%"
export function show(i: Item): string {
  return i.unit === "%" ? `${i.value.toFixed(2)}%` : `$${i.value.toLocaleString("en-US")} bn`;
}

export function ctx(key: string): Item {
  const i = C[key];
  if (!i) throw new Error(`context.csv has no row "${key}"`);
  return i;
}

export default function ContextCards({ keys }: { keys: string[] }) {
  return (
    <div className="ctx-grid">
      {keys.map((k) => {
        const i = ctx(k);
        return (
          <div className="panel ctx" key={k}>
            <p className="stat-label">{i.label}</p>
            <p className="stat-value">{show(i)}</p>
            <p className="stat-note">{i.period}</p>
            <p className="ctx-src">
              <a href={i.url} target="_blank" rel="noreferrer">{i.source}</a>
              {i.published && <> · {new Date(i.published + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</>}
              <span className={`badge badge-${i.status}`}>{i.status}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
