import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const LISTING_IDS = [
  "a824e06c-e887-4b27-b43e-e9a797b7a090",
  "4c6d07fa-daca-48b5-b9f3-0c9ca102085a",
  "2a98314b-df36-4ddd-841f-657b46d64056",
  "591f181b-bf37-4a1a-a7e9-9f4af9978d1d",
  "ffb9c480-d531-4ecb-9693-4286ebcad36b",
];

const LISTING_PHOTOS: Record<string, string[]> = {
  "a824e06c-e887-4b27-b43e-e9a797b7a090": [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&q=80",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&q=80",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
  ],
  "4c6d07fa-daca-48b5-b9f3-0c9ca102085a": [
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  ],
  "2a98314b-df36-4ddd-841f-657b46d64056": [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80",
    "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=600&q=80",
    "https://images.unsplash.com/photo-1549488344-d87de6f7d0f0?w=600&q=80",
    "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=600&q=80",
  ],
  "591f181b-bf37-4a1a-a7e9-9f4af9978d1d": [
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  ],
  "ffb9c480-d531-4ecb-9693-4286ebcad36b": [
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&q=80",
    "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=600&q=80",
  ],
};

const PHOTO_CATEGORIES = ["Exterior", "Kitchen", "Living Room", "Bedroom", "Backyard"];

async function main() {
  console.log("Approving demo listings and adding photos...\n");

  for (const id of LISTING_IDS) {
    // Approve listing
    const { error: approveError } = await supabase
      .from("listings")
      .update({
        approval_status: "approved",
        published: true,
        approved_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (approveError) {
      console.error(`  ✗ Failed to approve ${id}:`, approveError.message);
      continue;
    }
    console.log(`  ✓ Approved ${id}`);

    // Remove any existing listing_photos rows for this listing
    await supabase.from("listing_photos").delete().eq("listing_id", id);

    // Insert photo rows using Unsplash URLs as storage_path (external)
    const photos = LISTING_PHOTOS[id] ?? [];
    for (const [index, url] of photos.entries()) {
      const category = PHOTO_CATEGORIES[index] ?? "Photo";
      const { error: photoError } = await supabase.from("listing_photos").insert({
        listing_id: id,
        storage_path: url,
        alt_text: `${category} photo`,
        sort_order: index,
      });
      if (photoError) {
        console.warn(`    ✗ Photo ${index + 1} failed:`, photoError.message);
      } else {
        console.log(`    ✓ Added photo ${index + 1} (${category})`);
      }
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
