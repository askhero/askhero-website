import { AlertCircle } from "lucide-react";

export function HeroListingMissingData({ items }: { items: string[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#07111f]/80 p-5">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-gold-300" />
        <h3 className="font-bold text-white">Missing or unavailable data</h3>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2 text-sm text-white/62">
              {formatMissingItem(item)}
            </div>
          ))
        ) : (
          <p className="text-sm text-white/54">No missing fields detected from the provided listing details.</p>
        )}
      </div>
    </section>
  );
}

function formatMissingItem(item: string) {
  if (/unavailable|not available|not configured|required|not connected/i.test(item)) {
    return item;
  }
  return `${item}: Data not available yet.`;
}
