export default function OfferSlider({ value, min, max, onChange }) {
  return (
    <input className="w-full accent-gold" type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
  );
}
