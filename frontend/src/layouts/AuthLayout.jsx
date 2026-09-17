import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-white text-neutral-900 antialiased lg:grid lg:grid-cols-[1fr_1fr]">
      {/* ─────────────── Left: Brand panel ─────────────── */}
      <aside className="relative hidden bg-black lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-semibold text-black">
            R
          </span>
          <span className="text-base font-semibold tracking-tight text-white">
            RateIt
          </span>
        </div>

        {/* Headline */}
        <div className="max-w-sm">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
            Honest ratings,
            <br />
            <span className="text-white/40">better decisions.</span>
          </h2>

          <p className="mt-5 text-sm leading-relaxed text-white/50">
            Real customer experiences, turned into clear insights — so you
            always know where to shop and who to trust.
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} RateIt
        </p>
      </aside>

      {/* ─────────────── Right: Auth form ─────────────── */}
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-sm font-semibold text-white">
              R
            </span>
            <span className="text-base font-semibold tracking-tight">
              RateIt
            </span>
          </div>

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
