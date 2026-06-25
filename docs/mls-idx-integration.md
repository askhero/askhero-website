# MLS, IDX, and RESO Integration Guide

AskHero is built to accept listing data later, but this repo does not claim MLS access and does not connect to a live MLS feed.

## Architecture

- Internal model: `types/listing.ts`
- Provider contract: `lib/integrations/idx/provider-interface.ts`
- Manual provider: `lib/integrations/idx/manual-provider.ts`
- RESO placeholder: `lib/integrations/idx/reso-provider-placeholder.ts`
- SimplyRETS placeholder: `lib/integrations/idx/simplyrets-placeholder.ts`

Every provider normalizes incoming data into the internal `NormalizedListing` model before persistence.

## Credentials Needed Later

- Broker or MLS approval
- IDX vendor agreement or RESO Web API credentials
- Data usage and display rules from each MLS
- Photo licensing permissions
- Compliance review for required attribution, refresh cadence, and display restrictions

## Compliance Notes

- Do not display MLS listings until the data agreement is approved.
- Respect MLS-required attribution and listing status rules.
- Store provider `source_type` and `source_id` for traceability.
- Keep manual listings under admin approval before public display.
