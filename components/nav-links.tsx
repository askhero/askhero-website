"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  ["Search", "/search"],
  ["Hero Score", "/hero-score"],
  ["For Realtors", "/for-realtors"],
  ["For Sellers", "/for-sellers"],
  ["Find an Agent", "/find-agent"],
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 text-sm lg:flex">
      {navItems.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          className={
            pathname === href
              ? "text-[#c9a84c] font-semibold"
              : "text-white/68 transition hover:text-white"
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
