import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Loader2,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Store,
  Star,
} from "lucide-react";

/**
 * Admin store management table.
 *
 * Deliberately mirrors AdminUsers in structure and behavior:
 *   - Filters  → applied on submit (button or Enter), not on keystroke
 *   - Sorting  → applied instantly on header click
 *   - One `fetchStores` helper builds the query string for both paths
 *
 * Keeping the two admin tables visually and behaviorally identical means
 * admins don't have to relearn the interaction when switching between them.
 */
const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter inputs — held separately from `stores` so typing doesn't re-render
  // the table until the user actually submits the form.
  const [filters, setFilters] = useState({ name: "", email: "", address: "" });

  // Sort state — default is newest-first, matching the backend's natural order.
  const [sort, setSort] = useState({ field: "created_at", order: "desc" });

  const fetchStores = async () => {
    setLoading(true);
    try {
      // URLSearchParams handles encoding for names/addresses with special
      // characters — "Joe's Café" and "12 Main St & 3rd" both escape correctly.
      const queryParams = new URLSearchParams();

      // Only append non-empty filters, so the URL stays clean and the backend
      // can treat missing params as "no constraint."
      if (filters.name) queryParams.append("name", filters.name);
      if (filters.email) queryParams.append("email", filters.email);
      if (filters.address) queryParams.append("address", filters.address);

      queryParams.append("sortBy", sort.field);
      queryParams.append("order", sort.order);

      const res = await api.get(`/admin/stores?${queryParams.toString()}`);
      if (res.data.success) setStores(res.data.data);
    } catch (err) {
      console.error(err);
      // No toast — passive admin view. Empty table + console log is enough.
    } finally {
      setLoading(false);
    }
  };

  // Refetch on sort change. Filters are deliberately NOT in the dep array —
  // they apply on form submit, not on every keystroke.
  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchStores();
  };

  // Clicking the same column toggles direction; clicking a different column
  // switches to it and starts at ascending.
  const handleSort = (field) => {
    if (sort.field === field) {
      setSort({ field, order: sort.order === "asc" ? "desc" : "asc" });
    } else {
      setSort({ field, order: "asc" });
    }
  };

  // Shared input styling — identical to AdminUsers, Login, SignUp, and
  // ChangePassword so the whole app reads as one form system.
  const inputClass =
    "block w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black";

  const labelClass = "block text-sm font-medium text-neutral-900";

  // Sortable header cell — reused for every column below. Same three-state
  // icon logic as AdminUsers: up when active-asc, down when active-desc,
  // faint double-arrow when inactive to hint "this is sortable."
  const SortHeader = ({ field, children, className = "" }) => {
    const isActive = sort.field === field;

    return (
      <th
        onClick={() => handleSort(field)}
        className={`cursor-pointer select-none px-5 py-3 text-left text-xs font-medium uppercase tracking-wider transition hover:text-neutral-900 ${
          isActive ? "text-neutral-900" : "text-neutral-500"
        } ${className}`}
      >
        <div className="inline-flex items-center gap-1.5">
          {children}
          {isActive ? (
            sort.order === "asc" ? (
              <ArrowUp size={13} />
            ) : (
              <ArrowDown size={13} />
            )
          ) : (
            <ArrowUpDown size={13} className="text-neutral-300" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* ─────────────── Page header ─────────────── */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Stores
        </h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          Every registered store on the platform.
        </p>
      </div>

      {/* ─────────────── Filters ───────────────
          Same layout as AdminUsers: three inputs + a submit button that
          bottom-aligns with the fields on md+ screens. */}
      <div className="mb-5 rounded-xl border border-neutral-200 bg-white p-5">
        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-col gap-4 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <label htmlFor="f-name" className={`mb-2 ${labelClass}`}>
              Name
            </label>
            <input
              id="f-name"
              type="text"
              placeholder="Search by name"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="flex-1">
            <label htmlFor="f-email" className={`mb-2 ${labelClass}`}>
              Email
            </label>
            <input
              id="f-email"
              type="text"
              placeholder="Search by email"
              value={filters.email}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div className="flex-1">
            <label htmlFor="f-address" className={`mb-2 ${labelClass}`}>
              Address
            </label>
            <input
              id="f-address"
              type="text"
              placeholder="Search by address"
              value={filters.address}
              onChange={(e) =>
                setFilters({ ...filters, address: e.target.value })
              }
              className={inputClass}
            />
          </div>

          {/* Submit button — matches AdminUsers. `shrink-0` keeps it from
              being squeezed by the flex-1 inputs beside it. */}
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <Search size={15} />
            <span>Filter</span>
          </button>
        </form>
      </div>

      {/* ─────────────── Stores table ─────────────── */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {loading ? (
          // Centered neutral spinner — same treatment as every other
          // loading state in the app.
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-neutral-400" size={28} />
          </div>
        ) : stores.length === 0 ? (
          // Empty state with icon + two-line copy, matching the pattern
          // used in AdminUsers, StoresList, and OwnerDashboard.
          <div className="px-6 py-16 text-center">
            <Store size={32} className="mx-auto mb-4 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-900">
              No stores found
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          // Horizontal scroll wrapper — the table has four columns including
          // an address, so narrow screens scroll the table rather than
          // break the layout.
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <SortHeader field="name">Name</SortHeader>
                  <SortHeader field="email">Email</SortHeader>
                  <SortHeader field="address">Address</SortHeader>
                  {/* Rating column is sortable but right-aligned — numeric
                      sorts read better with the values flush to one edge. */}
                  <SortHeader field="overall_rating" className="text-right">
                    Rating
                  </SortHeader>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50/60"
                  >
                    <td className="px-5 py-3.5 font-medium text-neutral-900">
                      {s.name}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">{s.email}</td>
                    {/* Address truncation applied to an inner div rather than
                        the <td> — table cells ignore max-width when the layout
                        engine needs the space, so the truncation must live on
                        a block element inside. `title` shows full text on hover. */}
                    <td className="px-5 py-3.5 text-neutral-500">
                      <div
                        className="max-w-[220px] truncate"
                        title={s.address || undefined}
                      >
                        {s.address || "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {s.overall_rating > 0 ? (
                        // Rating pill — black chip with white text, matching
                        // the overall-rating treatment on store cards in
                        // StoresList and OwnerDashboard. `tabular-nums` keeps
                        // the digits from shifting when values change.
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
                          {Number(s.overall_rating).toFixed(2)}
                          <Star size={10} className="fill-current" />
                        </span>
                      ) : (
                        // Unrated stores get a quiet hairline chip rather than
                        // a bold "No ratings yet" — the rating column should
                        // still scan as a column of pills, not mixed formats.
                        <span className="inline-flex items-center rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] text-neutral-400">
                          No ratings
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStores;
