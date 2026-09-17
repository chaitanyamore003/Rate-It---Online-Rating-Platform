import { useState, useEffect } from "react";
import api from "../services/api";
import StarRating from "../components/StarRating";
import { Search, Loader2, Star, CheckCircle2, Store } from "lucide-react";

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Fetch stores from backend
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

  // Fetch stores when component first loads
  useEffect(() => {
    fetchStores();
  }, []);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores();
  };

  // Display toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Submit or update a store rating
  const handleRate = async (storeId, newRating, existingRating) => {
    try {
      if (existingRating) {
        // User has already rated this store
        await api.put(`/ratings/${storeId}`, {
          rating: newRating,
        });

        showToast("Rating updated successfully!");
      } else {
        // User is rating this store for the first time
        await api.post("/ratings", {
          store_id: storeId,
          rating: newRating,
        });

        showToast("Rating submitted successfully!");
      }

      // Refresh stores so the average rating is accurate
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
    <div>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg ${
              toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            <CheckCircle2 size={18} />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header + Search */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Registered Stores</h2>

          <p className="mt-1 text-sm text-gray-500">
            Browse and rate your favorite stores
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full md:w-auto">
          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-l-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 md:w-64"
          />

          <button
            type="submit"
            className="rounded-r-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
          >
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : stores.length === 0 ? (
        /* No stores */
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <Store size={48} className="mx-auto mb-4 text-gray-400" />

          <p className="text-gray-500">No stores found.</p>
        </div>
      ) : (
        /* Store cards */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Store name */}
              <h3 className="mb-2 text-xl font-bold">{store.name}</h3>

              {/* Store address */}
              <p className="mb-4 flex-grow text-sm text-gray-500">
                {store.address}
              </p>

              <div className="border-t border-gray-200 pt-4">
                {/* Overall rating */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Rating</span>

                  {store.overall_rating > 0 ? (
                    <div className="flex items-center gap-1 font-bold text-yellow-500">
                      {Number(store.overall_rating).toFixed(2)}

                      <Star size={16} className="fill-current" />
                    </div>
                  ) : (
                    <span className="text-xs italic text-gray-400">
                      No ratings yet
                    </span>
                  )}
                </div>

                {/* User rating */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 text-center text-sm font-medium">
                    {store.user_rating ? "Your Rating" : "Rate this store"}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoresList;
