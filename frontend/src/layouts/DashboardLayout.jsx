import React, { useContext, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  LogOut,
  Users,
  Store,
  LayoutDashboard,
  KeyRound,
  Menu,
  X,
} from "lucide-react";

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const navLinks = [];

  if (user?.role === "ADMIN") {
    navLinks.push({
      to: "/admin/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    });
    navLinks.push({ to: "/admin/users", icon: Users, label: "Users" });
    navLinks.push({ to: "/admin/stores", icon: Store, label: "Stores" });
  } else if (user?.role === "STORE_OWNER") {
    navLinks.push({
      to: "/owner/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    });
  } else {
    navLinks.push({ to: "/stores", icon: Store, label: "Browse Stores" });
  }

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-white/10 text-white"
        : "text-white/60 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 antialiased">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* ─────────────── Sidebar ─────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-black p-4 transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-semibold text-black">
              R
            </span>
            <span className="text-base font-semibold tracking-tight text-white">
              RateIt
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="text-white/60 transition hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navItemClass}
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          ))}

          <div className="mt-auto border-t border-white/10 pt-4">
            <NavLink
              to="/profile/password"
              className={navItemClass}
              onClick={() => setSidebarOpen(false)}
            >
              <KeyRound size={18} />
              <span>Change Password</span>
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* ─────────────── Main column ─────────────── */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="text-neutral-500 transition hover:text-neutral-900 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm text-neutral-500 sm:text-base">
              Welcome,{" "}
              <span className="font-medium text-neutral-900">{user?.name}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-neutral-600 sm:inline-flex">
              {user?.role ? user.role.replace("_", " ") : ""}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
