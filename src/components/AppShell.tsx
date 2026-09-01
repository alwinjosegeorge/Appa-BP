import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, TrendingUp, Settings2, Plus, HeartPulse } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/history", label: "History", icon: ClipboardList },
  { to: "/add", label: "Add", icon: Plus, isPrimary: true },
  { to: "/trends", label: "Trends", icon: TrendingUp },
  { to: "/settings", label: "Profile", icon: Settings2 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouterState();
  
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-0 sm:px-6 lg:px-8">
        {/* Desktop / tablet sidebar */}
        <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between py-8 lg:flex border-r border-border/40">
          <div>
            <div className="flex items-center gap-3 px-5 mb-10">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-primary text-primary-foreground shadow-raised">
                <HeartPulse className="h-6 w-6" />
              </span>
              <span className="text-xl font-extrabold tracking-tight">BP Care</span>
            </div>
            <nav className="flex flex-col gap-2 px-3">
              {NAV.map(({ to, label, icon: Icon, isPrimary }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === "/" }}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[15px] font-bold transition-all ${
                    isPrimary 
                      ? "gradient-primary text-primary-foreground shadow-raised hover:scale-[1.02] mt-4" 
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-32 lg:pb-12">{children}</main>
      </div>

      {/* Mobile bottom nav - CardioLife style */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-40 lg:hidden px-4 pb-6">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between rounded-full bg-card px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-black/5 dark:border-white/5">
            {NAV.map(({ to, label, icon: Icon, isPrimary }) => {
              const isActive = router.location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === "/" }}
                  className={`relative flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-full transition-all ${
                    isPrimary
                      ? "gradient-primary text-primary-foreground shadow-raised -translate-y-4 hover:scale-105 active:scale-95"
                      : isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isPrimary ? "h-7 w-7" : ""} ${isActive && !isPrimary ? "animate-rise" : ""}`} />
                  {!isPrimary && (
                    <span className="text-[10px] font-bold">{label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <header className="px-5 pt-8 pb-4 sm:px-2">
      {eyebrow ? (
        <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">{eyebrow}</p>
      ) : null}
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
        {title} {accent ? <span className="text-primary">{accent}</span> : null}
      </h1>
      {children}
    </header>
  );
}

export function Disclaimer() {
  return (
    <p className="px-6 pb-8 pt-8 text-center text-xs font-medium leading-relaxed text-muted-foreground opacity-60">
      This app is for personal record keeping and does not replace professional medical advice.
    </p>
  );
}
