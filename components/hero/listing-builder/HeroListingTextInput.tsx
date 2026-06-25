import { Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function HeroListingTextInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-[2rem] border border-white/12 bg-white/[0.055] p-2 shadow-[0_30px_120px_rgba(0,0,0,0.58)] backdrop-blur-2xl focus-within:border-gold-300/60">
      <div className="rounded-[1.5rem] border border-white/8 bg-[#07111f]/92 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-400 text-[#030712] shadow-[0_0_45px_rgba(217,180,92,0.22)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={8}
            className="min-h-64 resize-none rounded-2xl border-white/12 text-base leading-7 sm:text-lg"
            placeholder="I want to list 9545 Valencia Avenue NW, Concord, NC 28027 for $350,000. It has 4 bedrooms, 3 bathrooms, about 2,600 sqft, a fenced backyard, updated kitchen, two-car garage, and I have photos and a video."
          />
        </div>
        <p className="mt-4 border-t border-white/8 pt-4 text-sm leading-6 text-white/50">
          Hero extracts only what you provide. School ratings, crime data, insurance risk, and appreciation outlook stay unavailable until verified data is connected.
        </p>
      </div>
    </div>
  );
}
