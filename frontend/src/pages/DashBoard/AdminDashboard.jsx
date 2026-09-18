import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Users, Store, Star, Loader2 } from "lucide-react";

/**
 * Admin landing page — shows three system-wide counters.
 *
 * Layout choice: cards are clickable (Users, Stores) except Ratings, which has
 * no dedicated page to drill into. Keeping the Ratings card non-interactive
 * (no <Link> wrapper, no hover state) signals that visually — the user shouldn't
 * click something that does nothing.
 */
const AdminDashboard = () => {
  // `null` rather than an empty object so we can distinguish "not loaded yet"
  // from "loaded and genuinely zero." The `?.` fallbacks below handle the null case.
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
        // No toast here on purpose — this is a passive read on page load,
        // and the fallback "0" values below keep the layout usable if it fails.
      } finally {
        // `finally` (not after the try block) so `loading` always flips even
        // if the request throws — otherwise a network error leaves a spinner forever.
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    // Neutral spinner, sized down to 28 and centered vertically with `min-h`.
    // Matches the loading treatment in ProtectedRoute and StoresList.
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-neutral-400" size={28} />
      </div>
    );
  }

  // Stat card definitions — extracted so the JSX below stays a clean map rather
  // than three near-identical blocks. `to` being optional is what drives the
  // interactive vs. static rendering in each card.
  const cards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      to: "/admin/users",
    },
    {
      label: "Total Stores",
      value: stats?.totalStores ?? 0,
      icon: Store,
      to: "/admin/stores",
    },
    {
      label: "Total Ratings",
      value: stats?.totalRatings ?? 0,
      icon: Star,
      // No `to` — this one is display-only.
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page header — same scale as Stores and other top-level pages
          (text-2xl semibold tracking-tight + neutral-500 subtitle). */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Overview
        </h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          A snapshot of platform activity.
        </p>
      </div>

      {/* Responsive grid — 1 col on mobile, 3 on md+.
          `gap-5` matches the density used in StoresList. */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, to }) => {
          // Shared card styling. `border-neutral-200` + white surface keeps it
          // in the same visual family as store cards on the user side.
          const baseClass =
            "flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5";

          // Interactive cards get a border-darkening hover (subtle — matches
          // the direction used on store cards). Static cards get no hover.
          const interactiveClass = to
            ? "transition hover:border-neutral-300"
            : "";

          // Card content is identical for both variants — pulled out so we
          // don't duplicate it inside the Link and non-Link branches below.
          const content = (
            <>
              {/* Icon container — inverted (black bg, white icon) instead of
                  the original's colored tints. One visual accent per card,
                  monochrome, and consistent across all three. */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
                <Icon size={20} />
              </div>

              <div className="min-w-0">
                {/* Label above value — reads as a small caption, letting the
                    number be the visual anchor. `tabular-nums` keeps the digits
                    from shifting if the value updates. */}
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 tabular-nums">
                  {value}
                </p>
              </div>
            </>
          );

          // Interactive variant — wrapped in Link so the whole card is clickable.
          // `no-underline text-inherit` undo the default anchor styling.
          if (to) {
            return (
              <Link
                key={label}
                to={to}
                className={`${baseClass} ${interactiveClass} text-inherit no-underline`}
              >
                {content}
              </Link>
            );
          }

          // Static variant — plain div, no hover, no pointer cursor.
          return (
            <div key={label} className={baseClass}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
