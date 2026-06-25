export default function Sidebar({ items, active, onChange }) {
  return (
    <aside className="card p-3">
      {items.map((item) => (
        <button key={item} className={`block w-full rounded px-3 py-3 text-left text-sm ${active === item ? "bg-gold text-bg-primary" : "text-text-muted hover:bg-bg-dark"}`} onClick={() => onChange(item)}>
          {item}
        </button>
      ))}
    </aside>
  );
}
