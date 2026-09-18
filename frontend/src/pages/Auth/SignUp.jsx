import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { UserPlus, Loader2, ChevronDown } from "lucide-react";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.name.length < 5 || formData.name.length > 20) {
      return setError("Name must be between 5 and 20 characters");
    }

    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!passRegex.test(formData.password)) {
      return setError(
        "Password must be 8-16 chars, include 1 uppercase and 1 special char",
      );
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/register", formData);
      if (res.data.success) {
        navigate("/auth/login", {
          state: { message: "Registration successful! Please login." },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "block w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50";

  const labelClass = "block text-sm font-medium text-neutral-900";

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Create an account
        </h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          Join RateIt and start sharing your experience.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-neutral-900/10 bg-neutral-900/[0.04] px-3.5 py-2.5 text-sm text-neutral-900"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="name" className={labelClass}>
              Full name
            </label>
            <span className="text-xs tabular-nums text-neutral-400">
              {formData.name.length}/20
            </span>
          </div>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
            minLength={5}
            maxLength={20}
            autoComplete="name"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={`mb-2 ${labelClass}`}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={`mb-2 ${labelClass}`}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            autoComplete="new-password"
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-neutral-400">
            8–16 characters, 1 uppercase, 1 special character.
          </p>
        </div>

        <div>
          <label htmlFor="address" className={`mb-2 ${labelClass}`}>
            Address
          </label>
          <textarea
            id="address"
            value={formData.address}
            onChange={handleChange}
            maxLength={400}
            rows={3}
            placeholder="Your address"
            autoComplete="street-address"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label htmlFor="role" className={`mb-2 ${labelClass}`}>
            Account type
          </label>
          <div className="relative">
            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
              required
              className={`${inputClass} cursor-pointer appearance-none pr-10`}
            >
              <option value="USER">Customer</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <UserPlus size={16} />
          )}
          <span>{loading ? "Creating account…" : "Create account"}</span>
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-medium text-neutral-900 underline-offset-4 transition hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
