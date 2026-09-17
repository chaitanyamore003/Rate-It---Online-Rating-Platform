import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { LogIn, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);

        if (res.data.data.user.role === "ADMIN") navigate("/admin/dashboard");
        else if (res.data.data.user.role === "STORE_OWNER")
          navigate("/owner/dashboard");
        else navigate("/stores");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Sign in
        </h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          Welcome back. Enter your details to continue.
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
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-neutral-900"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            autoComplete="email"
            className="block w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-900"
            >
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-neutral-500 transition hover:text-neutral-900"
            >
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="current-password"
            className="block w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <LogIn size={16} />
          )}
          <span>{loading ? "Signing in…" : "Sign in"}</span>
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link
          to="/auth/signUp"
          className="font-medium text-neutral-900 underline-offset-4 transition hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
