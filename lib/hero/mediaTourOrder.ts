export type MediaTourItem<T> = T & {
  tourLabel?: string;
  tourOrder?: number;
  category?: string;
  categorySlug?: string;
  isCover?: boolean;
};

type OrderedMediaTourItem<T> = MediaTourItem<T> & {
  originalIndex: number;
};

const bedroomLabels = Array.from({ length: 10 }, (_, index) => `Bedroom ${index + 1}`);
const bathroomLabels = Array.from({ length: 11 }, (_, index) => `Bathroom ${index + 1}`);
const garageLabels = Array.from({ length: 6 }, (_, index) => `Garage ${index + 1}`);

export const mediaCategoryLabels = [
  "Front exterior",
  "Front exterior Angle",
  "Entrance inside",
  "Kitchen",
  "Dinning Area",
  "Living Area",
  "Family room",
  "Master bedroom",
  ...bedroomLabels,
  "Staircase",
  "Loft",
  "Bonus room",
  "Master Bathroom",
  "Half bathroom",
  ...bathroomLabels,
  "Swimming pool",
  "Rear Exterior",
  "Left side exterior",
  "right side exterior",
  "Sunroom",
  "Mud room",
  "Basement",
  "Pantry",
  ...garageLabels,
  "Garage inside",
  "Elevator",
  "fitness room",
  "Walkway",
  "Sky view",
  "Fenced yard",
  "Street view",
  "Dog room",
  "Other",
] as const;

export const mediaTourOptions = mediaCategoryLabels.map((label, order) => ({
  label,
  order,
  slug: mediaCategorySlug(label),
}));

const keywordSlots: Array<{ label: string; patterns: RegExp[] }> = [
  { label: "Front exterior", patterns: [/\bfront\b/i, /\bexterior\b/i, /\belevation\b/i, /\bfacade\b/i] },
  { label: "Front exterior Angle", patterns: [/\bfront.*angle\b/i, /\bangle.*front\b/i, /\bdriveway\b/i] },
  { label: "Entrance inside", patterns: [/\bentry\b/i, /\bentrance\b/i, /\bfoyer\b/i] },
  { label: "Kitchen", patterns: [/\bkitchen\b/i] },
  { label: "Dinning Area", patterns: [/\bdining\b/i, /\bbreakfast\b/i] },
  { label: "Living Area", patterns: [/\bliving\b/i, /\bgreat.?room\b/i] },
  { label: "Family room", patterns: [/\bfamily\b/i] },
  { label: "Master bedroom", patterns: [/\bprimary\b/i, /\bmaster.*bed\b/i] },
  { label: "Master Bathroom", patterns: [/\bmaster.*bath\b/i, /\bprimary.*bath\b/i] },
  { label: "Half bathroom", patterns: [/\bhalf.*bath\b/i, /\bpowder\b/i] },
  { label: "Bathroom 1", patterns: [/\bbath(?:room)?\b/i] },
  { label: "Bedroom 1", patterns: [/\bbed(?:room)?\b/i] },
  { label: "Swimming pool", patterns: [/\bpool\b/i] },
  { label: "Rear Exterior", patterns: [/\brear\b/i, /\bback\b/i, /\bbackyard\b/i] },
  { label: "Left side exterior", patterns: [/\bleft.*side\b/i] },
  { label: "right side exterior", patterns: [/\bright.*side\b/i, /\bside\b/i] },
  { label: "Sunroom", patterns: [/\bsunroom\b/i] },
  { label: "Mud room", patterns: [/\bmud\b/i] },
  { label: "Basement", patterns: [/\bbasement\b/i] },
  { label: "Pantry", patterns: [/\bpantry\b/i] },
  { label: "Garage 1", patterns: [/\bgarage\b/i] },
  { label: "Garage inside", patterns: [/\bgarage.*inside\b/i] },
  { label: "Elevator", patterns: [/\belevator\b/i] },
  { label: "fitness room", patterns: [/\bfitness\b/i, /\bgym\b/i] },
  { label: "Walkway", patterns: [/\bwalkway\b/i, /\bpath\b/i] },
  { label: "Sky view", patterns: [/\bsky\b/i, /\baerial\b/i, /\bdrone\b/i] },
  { label: "Fenced yard", patterns: [/\bfenc(?:e|ed)\b/i] },
  { label: "Street view", patterns: [/\bstreet\b/i] },
  { label: "Dog room", patterns: [/\bdog\b/i, /\bpet\b/i] },
];

export function orderListingMedia<T>(
  items: T[],
  getName: (item: T) => string,
  getKind?: (item: T) => string,
): Array<MediaTourItem<T>> {
  const ordered = items
    .map((item, index): OrderedMediaTourItem<T> => {
      const existing = item as { tourLabel?: string; tourOrder?: number; category?: string; categorySlug?: string; isCover?: boolean };
      const label = existing.category || existing.tourLabel || inferTourLabel(getName(item), getKind?.(item), index);
      const order = typeof existing.tourOrder === "number" ? existing.tourOrder : getTourOrderForLabel(label) + index / 1000;
      return {
        ...item,
        category: label,
        categorySlug: existing.categorySlug || mediaCategorySlug(label),
        tourLabel: label,
        tourOrder: order,
        isCover: Boolean(existing.isCover),
        originalIndex: index,
      };
    })
    .sort((left, right) => {
      if (left.isCover !== right.isCover) return left.isCover ? -1 : 1;
      const leftOrder = left.tourOrder ?? 999;
      const rightOrder = right.tourOrder ?? 999;
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return left.originalIndex - right.originalIndex;
    });

  const hasCover = ordered.some((item) => item.isCover);
  if (!hasCover && ordered.length) {
    const front = ordered.find((item) => mediaCategorySlug(item.category || item.tourLabel || "") === "front-exterior");
    (front ?? ordered[0]).isCover = true;
  }

  return ordered.map((item) => {
    const next: Partial<OrderedMediaTourItem<T>> = { ...item };
    delete next.originalIndex;
    return next as MediaTourItem<T>;
  });
}

export function getTourOrderForLabel(label: string) {
  return mediaTourOptions.find((option) => option.label === label)?.order ?? 999;
}

export function mediaCategorySlug(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function inferTourLabel(name: string, kind: string | undefined, index: number) {
  const normalized = name.replace(/[_-]+/g, " ");
  const keywordSlot = keywordSlots.find((slot) => slot.patterns.some((pattern) => pattern.test(normalized)));
  if (keywordSlot) return keywordSlot.label;
  if (kind === "video") return "Other";
  return mediaCategoryLabels[index] ?? "Other";
}
