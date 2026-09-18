import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Store, Star, Loader2, Users } from "lucide-react";

/**
 * Store owner landing page.
 *
 * Two data sources, fetched in parallel:
 *   1. /owner/dashboard — the owner's store info + aggregate stats
 *   2. /owner/ratings   — the individual ratings table
 *
 * Promise.all is used because the two calls are independent — no reason to
 * serialize them. If either fails, both end up in the catch block (see note
 * below about partial failure).
 */
const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fired together rather than awaited in sequence — saves one round-trip
        // of latency since neither response depends on the other.
        const [statsRes, ratingsRes] = await Promise.all([
          api.get("/owner/dashboard"),
          api.get("/owner/ratings"),
        ]);

        if (statsRes.data.success) {
          setData(statsRes.data.data);
        }
        if (ratingsRes.data.success) {
          setRatings(ratingsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch owner data", err);
        // Note: Promise.all rejects fast — if the ratings call fails, the stats
        // response is discarded even though it succeeded. If that matters, swap
        // to Promise.allSettled and handle each result independently.
      } finally {
        // `finally` guarantees the spinner clears on both success and error paths.
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    // Neutral spinner, matching the loading treatment in AdminDashboard,
    // ProtectedRoute, and StoresList. `min-h-[60vh]` centers it in the content
    // area rather than pinning it to the top with a margin.
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-neutral-400" size={28} />
      </div>
    );
  }

  // Empty state — the owner account exists but has no store attached yet.
  // Distinct from "store exists but has no ratings" (handled further down),
  // so it gets its own treatment.
  if (!data || !data.store) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-neutral-200 bg-white px-6 py-16 text-center">
          <Store size={32} className="mx-auto mb-4 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-900">
            No store assigned
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Your account isn't linked to a store yet. Contact an administrator
            to get set up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* ─────────────── Page header ───────────────
          Store name as the primary heading, with a subtitle noting the page
          purpose. Same heading scale as every other top-level page. */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {data.store.name}
        </h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          Store performance and recent activity.
        </p>
      </div>

      {/* ─────────────── Stat cards ───────────────
          Two columns on md+, one on mobile. Structure mirrors the AdminDashboard
          cards — black icon block on the left, label + value stacked on the right. */}
      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Average rating */}
        <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <Star size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Average rating
            </p>
            {/* `toFixed(2)` only when there's a real score — otherwise the label
                reads "N/A" instead of a misleading "0.00". */}
            <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums">
              {data.stats.averageRating > 0
                ? data.stats.averageRating.toFixed(2)
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Total reviews */}
        <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <Users size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Total reviews
            </p>
            {/* `tabular-nums` so the number doesn't shift horizontally when it
                updates after a new rating comes in. */}
            <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums">
              {data.stats.totalRatings}
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────── Recent ratings table ─────────────── */}
      <div className="rounded-xl border border-neutral-200 bg-white">
        {/* Card header — icon + title, hairline divider beneath to separate the
            table from the heading. Same pattern as the store cards on the user side. */}
        <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
          <Star size={16} className="text-neutral-900" />
          <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
            Recent ratings
          </h3>
        </div>

        {ratings.length === 0 ? (
          // Empty state for a store that exists but has no reviews yet.
          // Distinct copy from the "no store assigned" state above.
          <div className="px-6 py-16 text-center">
            <Star size={28} className="mx-auto mb-3 text-neutral-300" />
            <p className="text-sm text-neutral-500">
              No ratings yet. Reviews will appear here once customers start
              rating your store.
            </p>
          </div>
        ) : (
          // Wrapped in a scroll container so the table doesn't blow out the
          // layout on narrow screens — the wrapper scrolls horizontally instead
          // of the whole page.
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  {/* Column headers — small, uppercase, and quiet so rows are the
                      visual focus. `text-left` is explicit because browsers
                      default thead cells to centered alignment. */}
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    User
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Rating
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-neutral-100 last:border-b-0"
                  >
                    <td className="px-5 py-3.5 font-medium text-neutral-900">
                      {r.user_name}
                    </td>
                    <td className="px-5 py-3.5">
                      {/* Rating pill — black chip with white text, matching the
                          overall-rating treatment on store cards. */}
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
                        {r.rating}
                        <Star size={10} className="fill-current" />
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-neutral-500 tabular-nums">
                      {new Date(r.created_at).toLocaleDateString()}
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

export default OwnerDashboard;
