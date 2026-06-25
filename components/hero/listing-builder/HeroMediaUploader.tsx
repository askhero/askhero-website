import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2, Video } from "lucide-react";
import type { BuilderMediaFile } from "@/components/hero/listing-builder/types";
import { getTourOrderForLabel, mediaCategorySlug, mediaTourOptions, orderListingMedia } from "@/lib/hero/mediaTourOrder";

export function HeroMediaUploader({ media, onChange }: { media: BuilderMediaFile[]; onChange: (files: BuilderMediaFile[]) => void }) {
  function handleFiles(files: FileList | null) {
    if (!files) return;
    const next = orderListingMedia(
      [
        ...media,
        ...Array.from(files).slice(0, Math.max(0, 12 - media.length)).map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
          kind: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file",
        })) satisfies BuilderMediaFile[],
      ],
      (item) => item.file.name,
      (item) => item.kind,
    );
    onChange(next);
  }

  function updateCategory(index: number, label: string) {
    const next = media.map((item, itemIndex) => itemIndex === index
      ? {
          ...item,
          category: label,
          categorySlug: mediaCategorySlug(label),
          tourLabel: label,
          tourOrder: getTourOrderForLabel(label) + itemIndex / 1000,
        }
      : item);
    onChange(orderListingMedia(next, (item) => item.file.name, (item) => item.kind));
  }

  function moveMedia(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= media.length) return;
    const next = [...media];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next.map((entry, entryIndex) => ({ ...entry, tourOrder: entryIndex })));
  }

  function removeMedia(index: number) {
    const removed = media[index];
    if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    const next = media.filter((_, itemIndex) => itemIndex !== index);
    onChange(orderListingMedia(next, (item) => item.file.name, (item) => item.kind));
  }

  function setCover(index: number) {
    onChange(media.map((item, itemIndex) => ({ ...item, isCover: itemIndex === index })));
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-gold-200/80">Photos and video</p>
          <h2 className="mt-1 text-xl font-bold text-white">Arrange the home tour</h2>
          <p className="mt-2 text-sm leading-6 text-white/52">Choose a category for every upload. Hero starts with the front exterior, then exterior angles, entry, living areas, bedrooms, baths, and outdoor spaces.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gold-300 bg-gold-400 px-5 py-3 text-sm font-bold text-[#030712] shadow-gold hover:bg-gold-300">
          <ImagePlus className="h-4 w-4" />
          Add Media
          <input className="sr-only" type="file" accept="image/*,video/*" multiple onChange={(event) => handleFiles(event.target.files)} />
        </label>
      </div>

      {media.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item, index) => (
            <div key={`${item.file.name}-${item.file.size}-${index}`} className="overflow-hidden rounded-xl border border-white/10 bg-[#07111f]">
              <div className="relative">
                {item.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.previewUrl} alt={item.file.name} className="h-36 w-full object-cover" />
                ) : item.kind === "video" ? (
                  <video src={item.previewUrl} className="h-36 w-full object-cover" controls />
                ) : (
                  <div className="flex h-36 items-center justify-center text-white/50"><Video className="h-8 w-8" /></div>
                )}
                {item.isCover ? (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold-400 px-2 py-1 text-xs font-bold text-[#030712]">
                    <Star className="h-3 w-3 fill-current" />
                    Cover
                  </span>
                ) : null}
              </div>
              <div className="space-y-3 p-3">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/42">Media category</label>
                <select
                  required
                  value={item.category || item.tourLabel || ""}
                  onChange={(event) => updateCategory(index, event.target.value)}
                  className="h-10 w-full rounded-lg border border-white/12 bg-white px-3 text-sm font-semibold text-[#030712]"
                >
                  {mediaTourOptions.map((option) => (
                    <option key={option.label} value={option.label}>{option.label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => moveMedia(index, -1)} disabled={index === 0} className="flex h-9 flex-1 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:text-white disabled:opacity-35">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => moveMedia(index, 1)} disabled={index === media.length - 1} className="flex h-9 flex-1 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:text-white disabled:opacity-35">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setCover(index)} className="flex h-9 flex-1 items-center justify-center rounded-lg border border-gold-300/30 text-gold-200 transition hover:bg-gold-400/10">
                    <Star className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => removeMedia(index)} className="flex h-9 flex-1 items-center justify-center rounded-lg border border-red-300/25 text-red-200 transition hover:bg-red-400/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="truncate text-xs text-white/48">{item.file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
