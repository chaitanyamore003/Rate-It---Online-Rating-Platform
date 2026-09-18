import React, { useState } from "react";
import { Star } from "lucide-react";

/**
 * Five-star rating control.
 *
 * - Interactive by default — hover previews a rating, click commits it.
 * - `readonly` mode renders the same stars but blocks hover and click.
 * - `initialRating` is the source of truth on mount. To keep the widget in sync
 *   when the parent refetches (e.g. StoresList re-fetches after a rating),
 *   pass `key={store.user_rating}` from the parent so React remounts this
 *   component with the new value. Otherwise the local state will drift.
 *
 * Monochrome: filled stars are black (`text-neutral-900`), empty stars are a
 * light gray hairline (`text-neutral-300`). No yellow — matches the rest of the app.
 */
const StarRating = ({ initialRating, onRate, readonly = false }) => {
  // Local state — the currently committed rating (persists between renders).
  const [rating, setRating] = useState(initialRating || 0);

  // Hover preview — only used while the cursor is over a star. When it's 0,
  // the component falls back to `rating` for display. Using `hoverRating || rating`
  // below means a hover of 0 (which never happens for stars 1-5) transparently
  // defers to the committed value.
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    // Skip hover tracking entirely in readonly mode — no preview to show.
    if (!readonly) setHoverRating(index);
  };

  const handleMouseLeave = () => {
    // Reset the preview so the committed rating is what shows after the cursor leaves.
    if (!readonly) setHoverRating(0);
  };

  const handleClick = (index) => {
    if (readonly) return;

    // Optimistically update local state so the star fills instantly, then notify
    // the parent. If the network call fails, the parent's re-fetch (or a failed
    // refetch) will surface the error — see StoresList's toast handling.
    setRating(index);
    if (onRate) onRate(index);
  };

  return (
    // onMouseLeave lives on the wrapper so that moving between stars doesn't
    // briefly reset the preview to 0 (which would cause flicker).
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={handleMouseLeave}
      role={readonly ? "img" : "radiogroup"}
      aria-label={readonly ? `Rating: ${rating} out of 5` : "Rate this item"}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        // `hoverRating` takes priority when the user is actively hovering;
        // otherwise fall back to the committed `rating`.
        const isFilled = index <= (hoverRating || rating);

        return (
          <button
            key={index}
            type="button"
            // Disable the button in readonly mode so it's skipped by keyboard
            // tab order and can't fire a click handler.
            disabled={readonly}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            // `focus-visible` (not `focus`) so the ring only appears for keyboard
            // users, not on every mouse click. `rounded-sm` keeps the ring tight
            // to the star rather than a giant square.
            className={`rounded-sm outline-none transition focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
              readonly ? "cursor-default" : "cursor-pointer"
            }`}
            aria-label={`${index} star${index > 1 ? "s" : ""}`}
            aria-pressed={isFilled}
          >
            <Star
              size={22}
              // Filled = solid black via `fill-current`; empty = light hairline.
              // `fill-current` uses the text color as the fill, so one class
              // controls both stroke and fill in the active state.
              className={`transition ${
                isFilled ? "fill-current text-neutral-900" : "text-neutral-300"
              } ${
                // In interactive mode, empty stars darken slightly on hover so
                // the preview reads as a step toward the filled state.
                !readonly && !isFilled ? "group-hover:text-neutral-400" : ""
              }`}
              // strokeWidth 1.5 keeps the empty stars feeling like thin outlines
              // rather than chunky shapes — matches the app's hairline aesthetic.
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
