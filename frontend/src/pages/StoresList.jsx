import { useState, useEffect } from "react";

//axios agent required to make API calls to the backend.
import api from "../services/api";

//reusable star-rating component.
import StarRating from "../components/StarRating";

// Import icons from Lucide React.
import {
  Search,
  Loader2,
  Star,
  CheckCircle2,
  Store,
  AlertCircle,
} from "lucide-react";

// StoresList component is responsible for:
// 1. Fetching stores
// 2. Searching stores
// 3. Displaying store ratings
// 4. Submitting a new rating
// 5. Updating an existing rating
const StoresList = () => {
  // Store the list of stores received from the backend.
  // Initially, there are no stores.
  const [stores, setStores] = useState([]);

  // Track whether the stores are currently being fetched.
  // Initially true because we fetch stores when the component loads.
  const [loading, setLoading] = useState(true);

  // Store the text entered into the search input.
  const [search, setSearch] = useState("");

  // Store the current toast notification.
  // null means no toast is currently displayed.
  const [toast, setToast] = useState(null);

  // ============================================================
  // FETCH STORES
  // ============================================================

  // Function responsible for requesting stores from the backend.
  const fetchStores = async () => {
    // Show the loading state before starting the API request.
    setLoading(true);

    try {
      // Create an object that will be used to build
      // URL query parameters.
      const queryParams = new URLSearchParams();

      // Only add the name parameter if the user
      // has entered a search value.
      if (search.trim()) {
        queryParams.append("name", search.trim());
      }

      // Send GET request to:
      //
      // /api/stores
      //
      // If the user searched "abc":
      //
      // /api/stores?name=abc
      const res = await api.get(`/stores?${queryParams.toString()}`);

      // Check whether the backend says the request was successful.
      if (res.data.success) {
        // Store the returned stores in React state.
        //
        // Updating this state causes React to re-render
        // the store cards on the screen.
        setStores(res.data.data);
      }
    } catch (error) {
      // Print the error in the browser console
      // for debugging purposes.
      console.error("Error fetching stores:", error);

      // Show an error notification to the user.
      //
      // If the backend provides a message, use it.
      // Otherwise use the default message.
      showToast(
        error.response?.data?.message || "Failed to load stores",
        "error",
      );
    } finally {
      // Stop the loading indicator whether the request
      // succeeded or failed.
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL STORE FETCH
  // ============================================================

  // useEffect runs after the component is mounted.
  useEffect(() => {
    // Fetch the stores when the page initially loads.
    fetchStores();

    // Empty dependency array means:
    // run this effect only when the component mounts.
  }, []);

  // ============================================================
  // SEARCH
  // ============================================================

  // Handle submission of the search form.
  const handleSearch = (e) => {
    // Prevent the browser from refreshing the page
    // when the form is submitted.
    e.preventDefault();

    // Fetch stores using the current search value.
    fetchStores();
  };

  // ============================================================
  // TOAST NOTIFICATION
  // ============================================================

  // Display a temporary notification to the user.
  //
  // type can be:
  // "success"
  // "error"
  const showToast = (message, type = "success") => {
    // Store the toast message and its type.
    setToast({
      message,
      type,
    });

    // Automatically remove the toast after 3 seconds.
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // ============================================================
  // SUBMIT / UPDATE RATING
  // ============================================================

  // Handle a user's store rating.
  //
  // storeId:
  // Which store the user is rating.
  //
  // newRating:
  // The rating selected by the user.
  //
  // existingRating:
  // The user's previous rating, if one exists.
  const handleRate = async (storeId, newRating, existingRating) => {
    try {
      // --------------------------------------------------------
      // UPDATE EXISTING RATING
      // --------------------------------------------------------

      // If the user already has a rating,
      // update the existing rating instead of creating another one.
      if (existingRating) {
        // Send PUT request to update the user's rating.
        //
        // Example:
        // PUT /api/ratings/5
        //
        // Body:
        // { rating: 4 }
        await api.put(`/ratings/${storeId}`, {
          rating: newRating,
        });

        // Inform the user that the rating was updated.
        showToast("Rating updated successfully!");
      }

      // --------------------------------------------------------
      // CREATE NEW RATING
      // --------------------------------------------------------
      else {
        // The user hasn't rated this store before.
        // Therefore, create a new rating.
        //
        // Example:
        // POST /api/ratings
        //
        // Body:
        // {
        //   store_id: 5,
        //   rating: 4
        // }
        await api.post("/ratings", {
          store_id: storeId,
          rating: newRating,
        });

        // Inform the user that the rating was submitted.
        showToast("Rating submitted successfully!");
      }

      // Fetch the stores again after rating submission/update.
      //
      // This ensures that:
      // 1. Overall rating is updated.
      // 2. User's rating is updated.
      // 3. UI contains the latest database data.
      fetchStores();
    } catch (error) {
      // Print the error in the browser console.
      console.error("Error submitting rating:", error);

      // Display the backend error message if available.
      // Otherwise display a default message.
      showToast(
        error.response?.data?.message || "Failed to submit rating",
        "error",
      );
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="mx-auto max-w-7xl">
      {/* ========================================================
          TOAST NOTIFICATION
          ======================================================== */}

      {/* Only render the toast when toast is not null. */}
      {toast && (
        <div className="pointer-events-none fixed right-4 top-20 z-50 sm:right-6 sm:top-24">
          {/* Toast container */}
          <div
            role="status"
            className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm shadow-sm ${
              toast.type === "error"
                ? "border-neutral-900/15 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-900"
            }`}
          >
            {/* Show error icon for an error toast */}
            {toast.type === "error" ? (
              <AlertCircle size={16} className="shrink-0" />
            ) : (
              /* Show success icon for a success toast */
              <CheckCircle2 size={16} className="shrink-0" />
            )}

            {/* Display the toast message */}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ========================================================
          HEADER + SEARCH
          ======================================================== */}

      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        {/* Page title and description */}
        <div>
          {/* Page heading */}
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Stores
          </h2>

          {/* Page description */}
          <p className="mt-1.5 text-sm text-neutral-500">
            Browse and rate your favorite stores.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="w-full sm:w-auto">
          <div className="relative flex w-full sm:w-72">
            {/* Search icon */}
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            {/* Search input */}
            <input
              type="text"
              placeholder="Search stores…"
              // Display the current search state.
              value={search}
              // Update search state whenever the user types.
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>
        </form>
      </div>

      {/* ========================================================
          CONTENT
          ======================================================== */}

      {/* If stores are being fetched, show loading spinner. */}
      {loading ? (
        <div className="flex justify-center py-24">
          {/* Animated loading spinner */}
          <Loader2 className="animate-spin text-neutral-400" size={28} />
        </div>
      ) : stores.length === 0 ? (
        /* --------------------------------------------------------
           NO STORES
           -------------------------------------------------------- */

        <div className="rounded-xl border border-neutral-200 bg-white px-6 py-16 text-center">
          {/* Store icon */}
          <Store size={32} className="mx-auto mb-4 text-neutral-300" />

          {/* Main message */}
          <p className="text-sm font-medium text-neutral-900">
            No stores found
          </p>

          {/* Secondary message */}
          <p className="mt-1 text-sm text-neutral-500">
            {/* Show different message depending on search state */}
            {search.trim()
              ? "Try a different search term."
              : "There are no stores to display yet."}
          </p>
        </div>
      ) : (
        /* --------------------------------------------------------
           STORE CARDS
           -------------------------------------------------------- */

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Loop through every store */}
          {stores.map((store) => (
            // Each store gets its own card.
            <div
              key={store.id}
              className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300"
            >
              {/* ==================================================
                  STORE NAME + OVERALL RATING
                  ================================================== */}

              <div className="flex items-start justify-between gap-3">
                {/* Store name */}
                <h3 className="text-base font-semibold tracking-tight text-neutral-900">
                  {store.name}
                </h3>

                {/* Check whether the store has ratings */}
                {store.overall_rating > 0 ? (
                  /* Display overall rating */
                  <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white">
                    {/* Convert rating to a number and show 2 decimals */}
                    {Number(store.overall_rating).toFixed(2)}

                    {/* Star icon */}
                    <Star size={11} className="fill-current" />
                  </div>
                ) : (
                  /* Display "New" when there are no ratings */
                  <span className="shrink-0 rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] text-neutral-400">
                    New
                  </span>
                )}
              </div>

              {/* ==================================================
                  STORE ADDRESS
                  ================================================== */}

              <p className="mt-2 flex-grow text-sm leading-relaxed text-neutral-500">
                {/* Display store address */}
                {store.address}
              </p>

              {/* ==================================================
                  USER RATING SECTION
                  ================================================== */}

              <div className="mt-5 border-t border-neutral-100 pt-4">
                {/* Change heading depending on whether
                    the user already rated this store. */}
                <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {store.user_rating ? "Your rating" : "Rate this store"}
                </p>

                {/* Center the star rating component */}
                <div className="flex justify-center">
                  {/* Reusable rating component */}
                  <StarRating
                    // Show the user's existing rating.
                    //
                    // If there is no rating, use 0.
                    initialRating={store.user_rating || 0}
                    // Execute handleRate when the user
                    // selects a star rating.
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

// Export the component so it can be used
// inside UserDashboard or another page.
export default StoresList;
