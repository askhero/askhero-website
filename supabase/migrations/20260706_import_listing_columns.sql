-- Add import-related columns to listings table
-- Run once against your Supabase project via the SQL editor or CLI

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS imported_image_urls  text[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS import_source_url    text,
  ADD COLUMN IF NOT EXISTS certification_accepted boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS certification_timestamp timestamptz;
