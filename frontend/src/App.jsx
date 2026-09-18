import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoutes";

// Auth pages
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";

// Dashboard pages — one per role, each role lands on its own home
import AdminDashboard from "./pages/DashBoard/AdminDashboard";
import OwnerDashboard from "./pages/DashBoard/OwnerDashBoard";
import UserDashboard from "./pages/DashBoard/UserDashBoard";

// Feature pages
import AdminUsers from "./pages/AdminUsers";
import AdminStores from "./pages/AdminStores";
import StoresList from "./pages/StoresList";
import ChangePassword from "./pages/ChangePassword";

const RootRedirect = () => {
  return <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ─────────────── Public / Auth routes ───────────────*/}
          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signUp" element={<SignUp />} />
          </Route>

          {/* ─────────────── Protected routes ─────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* ─── Shared route — any signed-in user ─── */}
              <Route path="/profile/password" element={<ChangePassword />} />

              {/* ─── Admin-only routes ─── */}
              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/stores" element={<AdminStores />} />
              </Route>

              {/* ─── user routes ───
                  `/dashboard` renders the UserDashboard (which frames StoresList
                  with a page-level greeting). `/stores` stays accessible on its
                  own for direct links and future sub-pages that shouldn't
                  inherit the dashboard header.

                  Role value must match the backend's enum: `USER`, not
                  `USER`. SignUp's select uses `USER`, and ProtectedRoute's
                  fallback checks against it — using `USER` here would silently
                  lock regular users out of their own routes. */}
              <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/stores" element={<StoresList />} />
              </Route>

              {/* ─── Store owner routes ─── */}
              <Route
                element={<ProtectedRoute allowedRoles={["STORE_OWNER"]} />}
              >
                <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              </Route>

              {/* ─── Root fallback ───
                  Single entry point for "/". The redirect target is picked
                  inside RootRedirect so we don't repeat the role mapping that
                  ProtectedRoute already owns. */}
              <Route path="/" element={<RootRedirect />} />
            </Route>
          </Route>

          {/* ─────────────── Catch-all ───────────────
              Unknown paths funnel to "/". For signed-in users that resolves
              through RootRedirect to their dashboard; for guests the outer
              ProtectedRoute bounces them to /auth/login. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
