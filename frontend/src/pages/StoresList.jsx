import { useState, useEffect } from "react";
import api from "../services/api";
import StarRating from "../components/StarRating";
import {
  Search,
  Loader2,
  Star,
  CheckCircle2,
  Store,
  AlertCircle,
} from "lucide-react";

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const fetchStores = async () => {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();

      if (search.trim()) {
        queryParams.append("name", search.trim());
      }

      const res = await api.get(`/stores?${queryParams.toString()}`);

      if (res.data.success) {
        setStores(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);

      showToast(
        error.response?.data?.message || "Failed to load stores",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleRate = async (storeId, newRating, existingRating) => {
    try {
      if (existingRating) {
        await api.put(`/ratings/${storeId}`, { rating: newRating });
        showToast("Rating updated successfully!");
      } else {
        await api.post("/ratings", { store_id: storeId, rating: newRating });
        showToast("Rating submitted successfully!");
      }

      fetchStores();
    } catch (error) {
      console.error("Error submitting rating:", error);

      showToast(
        error.response?.data?.message || "Failed to submit rating",
        "error",
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* ─────────────── Toast ─────────────── */}
      {toast && (
        <div className="pointer-events-none fixed right-4 top-20 z-50 sm:right-6 sm:top-24">
          <div
            role="status"
            className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm shadow-sm ${
              toast.type === "error"
                ? "border-neutral-900/15 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-900"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle size={16} className="shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ─────────────── Header + Search ─────────────── */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Stores
          </h2>
          <p className="mt-1.5 text-sm text-neutral-500">
            Browse and rate your favorite stores.
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full sm:w-auto">
          <div className="relative flex w-full sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search stores…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>
        </form>
      </div>

      {/* ─────────────── Content ─────────────── */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-neutral-400" size={28} />
        </div>
      ) : stores.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white px-6 py-16 text-center">
          <Store size={32} className="mx-auto mb-4 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-900">
            No stores found
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {search.trim()
              ? "Try a different search term."
              : "There are no stores to display yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300"
            >
              {/* Store name + rating */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold tracking-tight text-neutral-900">
                  {store.name}
                </h3>

                {store.overall_rating > 0 ? (
                  <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white">
                    {Number(store.overall_rating).toFixed(2)}
                    <Star size={11} className="fill-current" />
                  </div>
                ) : (
                  <span className="shrink-0 rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] text-neutral-400">
                    New
                  </span>
                )}
              </div>

              {/* Address */}
              <p className="mt-2 flex-grow text-sm leading-relaxed text-neutral-500">
                {store.address}
              </p>

              {/* Rating section */}
              <div className="mt-5 border-t border-neutral-100 pt-4">
                <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {store.user_rating ? "Your rating" : "Rate this store"}
                </p>

                <div className="flex justify-center">
                  <StarRating
                    initialRating={store.user_rating || 0}
                    onRate={(newRating) =>
                      handleRate(store.id, newRating, store.user_rating)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoresList;
