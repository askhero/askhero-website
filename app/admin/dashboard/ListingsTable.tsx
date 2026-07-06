"use client";

import { useState, useTransition } from "react";
import type { AdminListing } from "./page";

type Tab = "pending" | "approved" | "all";

export function ListingsTable({ listings: initial }: { listings: AdminListing[] }) {
  const [listings, setListings] = useState(initial);
  const [tab, setTab] = useState<Tab>("pending");
  const [, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered =
    tab === "pending"
      ? listings.filter((l) => l.approval_status === "pending")
      : tab === "approved"
        ? listings.filter((l) => l.approval_status === "approved")
        : listings;

  async function handleAction(id: string, action: "approve" | "reject") {
    const res = await fetch(`/api/admin/listings/${id}/approval`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrors((prev) => ({ ...prev, [id]: (body as { error?: string }).error ?? "Error" }));
      return;
    }

    startTransition(() => {
      setListings((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                approval_status: action === "approve" ? "approved" : "rejected",
                status: action === "approve" ? "active" : "draft",
              }
            : l,
        ),
      );
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    });
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: `Pending (${listings.filter((l) => l.approval_status === "pending").length})` },
    { key: "approved", label: `Approved (${listings.filter((l) => l.approval_status === "approved").length})` },
    { key: "all", label: `All (${listings.length})` },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3.5 text-sm font-semibold transition ${
              tab === key
                ? "border-b-2 border-[#c9a84c] text-[#c9a84c]"
                : "text-white/44 hover:text-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.05] text-xs uppercase tracking-widest text-white/38">
            <tr>
              <th className="px-5 py-3">Address</th>
              <th className="px-5 py-3">City</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Approval</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-white/34">
                  No listings in this tab.
                </td>
              </tr>
            ) : (
              filtered.map((listing) => (
                <tr key={listing.id} className="border-t border-white/8 transition hover:bg-white/[0.025]">
                  <td className="max-w-xs truncate px-5 py-3.5 font-medium text-white">
                    {listing.address_line_1 ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-white/64">{listing.city ?? "—"}</td>
                  <td className="px-5 py-3.5 text-white/64">{formatMoney(listing.price)}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill value={listing.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <ApprovalPill value={listing.approval_status} />
                  </td>
                  <td className="px-5 py-3.5 text-white/44">{formatDate(listing.created_at)}</td>
                  <td className="px-5 py-3.5">
                    {errors[listing.id] && (
                      <p className="mb-1 text-xs text-red-400">{errors[listing.id]}</p>
                    )}
                    <div className="flex gap-2">
                      {listing.approval_status !== "approved" && (
                        <button
                          onClick={() => handleAction(listing.id, "approve")}
                          className="rounded-lg bg-green-500/15 px-3 py-1.5 text-xs font-semibold text-green-400 transition hover:bg-green-500/25"
                        >
                          Approve
                        </button>
                      )}
                      {listing.approval_status !== "rejected" && (
                        <button
                          onClick={() => handleAction(listing.id, "reject")}
                          className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/25"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ value }: { value: string | null }) {
  const color =
    value === "active"
      ? "bg-green-500/15 text-green-400"
      : value === "draft"
        ? "bg-slate-500/20 text-slate-300"
        : "bg-white/8 text-white/44";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {value ?? "—"}
    </span>
  );
}

function ApprovalPill({ value }: { value: string | null }) {
  const color =
    value === "approved"
      ? "bg-green-500/15 text-green-400"
      : value === "pending"
        ? "bg-amber-500/15 text-amber-400"
        : value === "rejected"
          ? "bg-red-500/15 text-red-400"
          : "bg-white/8 text-white/44";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {value ?? "—"}
    </span>
  );
}

function formatMoney(value: number | null) {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
