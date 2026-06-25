import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EditableListingFields } from "@/components/hero/listing-builder/types";

export function HeroListingEditableFields({ fields, onChange }: { fields: EditableListingFields; onChange: (fields: EditableListingFields) => void }) {
  function update<K extends keyof EditableListingFields>(key: K, value: EditableListingFields[K]) {
    onChange({ ...fields, [key]: value });
  }

  function updateNumber(key: keyof EditableListingFields, value: string) {
    onChange({ ...fields, [key]: value === "" ? null : Number(value) } as EditableListingFields);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.18em] text-gold-200/80">Editable extracted fields</p>
      <h2 className="mt-1 text-xl font-bold text-white">Review and correct Hero draft</h2>
      <p className="mt-2 text-sm leading-6 text-white/52">Please review everything Hero created. If anything is incorrect, edit it before confirming.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TextField label="Listing title" value={fields.title} onChange={(value) => update("title", value)} span />
        <TextField label="Full address" value={fields.address ?? ""} onChange={(value) => update("address", value || null)} span />
        <TextField label="Address line 1" value={fields.address_line_1 ?? ""} onChange={(value) => update("address_line_1", value || null)} />
        <TextField label="City" value={fields.city ?? ""} onChange={(value) => update("city", value || null)} />
        <TextField label="State" value={fields.state ?? ""} onChange={(value) => update("state", value || null)} />
        <TextField label="ZIP" value={fields.zip ?? ""} onChange={(value) => update("zip", value || null)} />
        <NumberField label="Asking price" value={fields.asking_price} onChange={(value) => updateNumber("asking_price", value)} />
        <NumberField label="Beds" value={fields.beds} onChange={(value) => updateNumber("beds", value)} />
        <NumberField label="Baths" value={fields.baths} onChange={(value) => updateNumber("baths", value)} />
        <NumberField label="Sqft" value={fields.sqft} onChange={(value) => updateNumber("sqft", value)} />
        <NumberField label="Lot size" value={fields.lot_size} onChange={(value) => updateNumber("lot_size", value)} />
        <NumberField label="Year built" value={fields.year_built} onChange={(value) => updateNumber("year_built", value)} />
        <TextField label="Property type" value={fields.property_type ?? ""} onChange={(value) => update("property_type", value || null)} />
        <TextareaField label="Description" value={fields.description} onChange={(value) => update("description", value)} span />
        <TextareaField label="Highlights" value={fields.highlightsText} onChange={(value) => update("highlightsText", value)} span />
        <TextareaField label="Seller / agent notes" value={fields.seller_notes.join("\n")} onChange={(value) => update("seller_notes", lines(value))} span />
        <TextareaField label="Hero AI Summary" value={fields.heroAiSummary} onChange={(value) => update("heroAiSummary", value)} span />
        <TextareaField label="Missing data" value={fields.missingDataText} onChange={(value) => update("missingDataText", value)} span />
      </div>
    </section>
  );
}

function TextField({ label, value, onChange, span }: { label: string; value: string; onChange: (value: string) => void; span?: boolean }) {
  return (
    <div className={`space-y-2 ${span ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number | null; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="number" value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function TextareaField({ label, value, onChange, span }: { label: string; value: string; onChange: (value: string) => void; span?: boolean }) {
  return (
    <div className={`space-y-2 ${span ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-32" />
    </div>
  );
}

function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}