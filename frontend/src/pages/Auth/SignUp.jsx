import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { UserPlus, Loader2 } from "lucide-react";

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

    // Basic frontend validation to save requests
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
        navigate("/login", {
          state: { message: "Registration successful! Please login." },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-center">
        Create an Account
      </h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe (min 5 characters as per req)"
            minLength="5"
            maxLength="20"
          />
          <p className="text-xs text-muted mt-1">
            {formData.name.length}/20 (Min 5 characters required)
          </p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="8-16 chars, 1 uppercase, 1 special"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            className="form-control"
            value={formData.address}
            onChange={handleChange}
            maxLength="400"
            rows="3"
            placeholder="Your address"
          ></textarea>
        </div>

        <div className="form-group mb-6">
          <label className="form-label" htmlFor="role">
            Account Type
          </label>
          <select
            id="role"
            className="form-control"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="NORMAL_USER">Customer</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <UserPlus size={18} />
          )}
          <span>Register</span>
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-accent-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
