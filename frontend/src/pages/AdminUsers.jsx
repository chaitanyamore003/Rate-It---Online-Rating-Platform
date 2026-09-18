import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Loader2,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Users,
} from "lucide-react";

/**
 * Admin user management table.
 *
 * Filtering vs. sorting behave differently on purpose:
 *   - Filters  → applied on submit (button or Enter). User types freely,
 *                no request per keystroke.
 *   - Sorting  → applied instantly on header click. A single tap should feel
 *                immediate, and column headers are cheap to re-click.
 *
 * Both cases funnel through the same `fetchUsers` helper, so there's one
 * place that knows how to build the query string.
 */
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter inputs — held separately from `users` so typing doesn't re-render
  // the table until the user actually submits.
  const [filters, setFilters] = useState({ name: "", email: "", role: "" });

  // Sort state — default is newest-first, matching the backend's natural order.
  const [sort, setSort] = useState({ field: "created_at", order: "desc" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // URLSearchParams handles encoding — a name like "O'Brien" or "a&b"
      // gets safely escaped without manual work.
      const queryParams = new URLSearchParams();

      // Only append non-empty filters, so the URL stays readable and the
      // backend can treat missing params as "no constraint."
      if (filters.name) queryParams.append("name", filters.name);
      if (filters.email) queryParams.append("email", filters.email);
      if (filters.role) queryParams.append("role", filters.role);

      queryParams.append("sortBy", sort.field);
      queryParams.append("order", sort.order);

      const res = await api.get(`/admin/users?${queryParams.toString()}`);
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.error(err);
      // No toast — this is a passive admin view; an empty table plus the
      // console log is enough signal without disrupting the page.
    } finally {
      setLoading(false);
    }
  };

  // Refetch whenever sort changes. Filters are intentionally NOT in the dep
  // array — they're applied via the form's submit handler below, not on change.
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  // Filters are applied on submit (button click or Enter key), not on change.
  // This avoids a request per keystroke, which matters on large user lists.
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // Clicking the same column toggles direction; clicking a different column
  // switches to it and starts at ascending. Ascending-first matches the
  // "A → Z" mental model most users expect.
  const handleSort = (field) => {
    if (sort.field === field) {
      setSort({ field, order: sort.order === "asc" ? "desc" : "asc" });
    } else {
      setSort({ field, order: "asc" });
    }
  };

  // Shared input styling — matches Login, SignUp, and ChangePassword so the
  // whole app reads as one form system.
  const inputClass =
    "block w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black";

  const labelClass = "block text-sm font-medium text-neutral-900";

  // Role badge styles — three roles rendered as monochrome pills with
  // different weights so they're distinguishable without color:
  //   ADMIN       → solid black (highest contrast, highest privilege)
  //   STORE_OWNER → outlined, dark text
  //   USER → soft neutral fill (quietest, most common role)
  const roleBadge = (role) => {
    const base =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide";

    if (role === "ADMIN") {
      return `${base} bg-neutral-900 text-white`;
    }
    if (role === "STORE_OWNER") {
      return `${base} border border-neutral-300 text-neutral-900`;
    }
    return `${base} bg-neutral-100 text-neutral-600`;
  };

  // Sortable header cell — reused three times below. Keeps the header JSX
  // from repeating the arrow logic and hover state on every column.
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
          {/* Three states:
                - active asc  → up arrow
                - active desc → down arrow
                - inactive    → faint double arrow (hints "sortable")
              The inactive icon sits at 40% opacity so it reads as a hint
              rather than a prominent control. */}
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
          Users
        </h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          Search, filter, and sort every account on the platform.
        </p>
      </div>

      {/* ─────────────── Filters ───────────────
          Card matches the surrounding language — hairline border, white
          surface. `items-end` on the flex row aligns the submit button's
          bottom edge with the inputs, which sit lower than their labels. */}
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
            <label htmlFor="f-role" className={`mb-2 ${labelClass}`}>
              Role
            </label>
            <select
              id="f-role"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="USER">user</option>
            </select>
          </div>

          {/* Submit button — same black treatment as auth forms, but width-fit
              rather than full-width since it sits beside inputs, not beneath. */}
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <Search size={15} />
            <span>Filter</span>
          </button>
        </form>
      </div>

      {/* ─────────────── Users table ─────────────── */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {loading ? (
          // Centered spinner inside the card — same neutral treatment used
          // across every other loading state in the app.
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-neutral-400" size={28} />
          </div>
        ) : users.length === 0 ? (
          // Empty state with icon + copy, matching the pattern used in
          // StoresList and OwnerDashboard.
          <div className="px-6 py-16 text-center">
            <Users size={32} className="mx-auto mb-4 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-900">
              No users found
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          // Horizontal scroll wrapper — the table has 4 columns and a long
          // address field, so on narrow screens we scroll the table rather
          // than break the layout.
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <SortHeader field="name">Name</SortHeader>
                  <SortHeader field="email">Email</SortHeader>
                  <SortHeader field="role">Role</SortHeader>
                  {/* Address is not sortable — no sort param sent for it,
                      so a plain header keeps it visually distinct from the
                      clickable ones above. */}
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Address
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50/60"
                  >
                    <td className="px-5 py-3.5 font-medium text-neutral-900">
                      {u.name}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-600">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={roleBadge(u.role)}>
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    {/* Address truncation: `td` elements ignore `max-w` when a
                        sibling column needs space, so the truncation is applied
                        to an inner div with an explicit max width. `title`
                        surfaces the full value on hover. */}
                    <td className="px-5 py-3.5 text-neutral-500">
                      <div
                        className="max-w-[220px] truncate"
                        title={u.address || undefined}
                      >
                        {u.address || "N/A"}
                      </div>
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

export default AdminUsers;
