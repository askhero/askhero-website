import { Link } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-border-default bg-bg-primary/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded border border-gold text-gold"><Home size={18} /></span>
          <span className="font-display text-xl">AskHero Deal Room</span>
        </Link>
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <span>{user?.name}</span>
          <button className="btn-ghost flex items-center gap-2" onClick={logout}><LogOut size={16} /> Logout</button>
        </div>
      </div>
    </header>
  );
}
