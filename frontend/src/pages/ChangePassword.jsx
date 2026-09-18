import React, { useState } from "react";
import api from "../services/api";
import { KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Change-password form.
 *
 * Self-contained: no route params, no context reads — the current user is
 * identified by the auth token attached to the API request. So this page
 * works identically for every role (admin, owner, normal user).
 *
 * Two-stage validation:
 *   1. Client-side — catches mismatched confirms and weak passwords before
 *      hitting the network. Same regex used in SignUp so the rules stay aligned.
 *   2. Server-side — verifies the `currentPassword` is actually correct.
 *      Client can't check that without sending it, so it's a server concern.
 */
const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // `status` holds both the type and message. Type drives which icon and
  // colors render — 'error', 'success', or '' (nothing shown).
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous status so a stale success message doesn't linger while
    // the next attempt is in flight.
    setStatus({ type: "", message: "" });

    // ─── Client-side validation ───
    // Confirm field first — it's the cheapest check, and users who fat-finger
    // the confirm benefit from the fast feedback.
    if (formData.newPassword !== formData.confirmPassword) {
      return setStatus({
        type: "error",
        message: "New passwords do not match",
      });
    }

    // Same password policy as SignUp. Kept inline rather than extracted
    // because it's a two-line check — if you add a third place, pull it into
    // utils/validators.js.
    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!passRegex.test(formData.newPassword)) {
      return setStatus({
        type: "error",
        message:
          "Password must be 8-16 chars, include 1 uppercase and 1 special char",
      });
    }

    setLoading(true);

    try {
      // Only send the two fields the API needs. Sending confirmPassword
      // would be dead weight — the server has no use for it.
      const res = await api.put("/auth/password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (res.data.success) {
        setStatus({
          type: "success",
          message: "Password updated successfully!",
        });
        // Reset every field — including currentPassword. Leaving the old
        // password sitting in a filled input after success is a minor hygiene
        // issue and confusing (looks like the form didn't complete).
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      // Server errors here are typically "current password is incorrect" —
      // pass through the API's message when it exists.
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to update password",
      });
    } finally {
      setLoading(false);
    }
  };

  // Shared input styling — same tokens used on Login and SignUp so the
  // three forms feel like one system.
  const inputClass =
    "block w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50";

  const labelClass = "block text-sm font-medium text-neutral-900";

  return (
    // `max-w-md mx-auto` keeps the form at reading width on wide screens.
    // Card styling matches the auth pages — hairline border, rounded corners.
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        {/* ─────────────── Header ─────────────── */}
        <div className="mb-6 flex items-center gap-2.5">
          <KeyRound size={18} className="text-neutral-900" />
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
            Change password
          </h2>
        </div>

        {/* ─────────────── Status banner ───────────────
            Monochrome treatment:
              - error   → black surface, white text (inverted, high contrast)
              - success → white surface, hairline border, neutral text
            Same visual pattern as the toast in StoresList so "notification"
            reads consistently across the app. */}
        {status.message && (
          <div
            role="status"
            className={`mb-6 flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm ${
              status.type === "error"
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-neutral-50 text-neutral-900"
            }`}
          >
            {/* Icon only shown on success — errors use the inverted background
                alone to signal "something's wrong," no icon needed. */}
            {status.type === "success" && (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            )}
            {status.type === "error" && (
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ─── Current password ─── */}
          <div>
            <label htmlFor="currentPassword" className={`mb-2 ${labelClass}`}>
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              autoComplete="current-password"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* ─── New password ─── */}
          <div>
            <label htmlFor="newPassword" className={`mb-2 ${labelClass}`}>
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              disabled={loading}
              className={inputClass}
            />
            {/* Hint moved below the field as quiet caption text — same pattern
                as the SignUp password field, so both forms teach the rule the
                same way. */}
            <p className="mt-1.5 text-xs text-neutral-400">
              8–16 characters, 1 uppercase, 1 special character.
            </p>
          </div>

          {/* ─── Confirm new password ─── */}
          <div>
            <label htmlFor="confirmPassword" className={`mb-2 ${labelClass}`}>
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* ─── Submit ───
              Same black button treatment used on Login and SignUp. Loading
              swaps the label to "Updating…" so the button communicates what's
              happening instead of just spinning silently. */}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Updating…</span>
              </>
            ) : (
              <span>Update password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
