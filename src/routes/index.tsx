import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, HeartPulse, ChevronRight, Activity, Clock, Info } from "lucide-react";
import { AppShell, Disclaimer } from "@/components/AppShell";
import {
  readingsQuery,
  settingsQuery,
  greeting,
  formatDate,
  formatTime,
  isElevated,
  todayISO,
  daysAgoISO,
  pair,
} from "@/lib/bp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BP Care — Family Blood Pressure Diary" },
      { name: "description", content: "Record and review daily blood pressure readings." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: readings = [], isLoading } = useQuery(readingsQuery);
  const { data: settings } = useQuery(settingsQuery);
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all");
  
  const name = settings?.patient_name ?? "User";
  const latest = readings[0];
  const today = todayISO();

  const filteredReadings = readings.filter(r => {
    if (filter === "all") return true;
    if (filter === "today") return r.reading_date === today;
    if (filter === "week") return r.reading_date >= daysAgoISO(6);
    if (filter === "month") return r.reading_date >= daysAgoISO(29);
    return true;
  });

  const displayReadings = filteredReadings
    .filter(r => r.id !== latest?.id)
    .slice(0, 4);

  return (
    <AppShell>
      <div className="px-5 pt-8 sm:px-8 sm:pt-10">
        {/* Header - CardioLife Style */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-secondary border border-border">
              {/* Fallback avatar */}
              <div className="w-full h-full bg-accent text-primary grid place-items-center font-bold text-lg">
                {name.charAt(0)}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{greeting()},</p>
              <h2 className="text-base font-extrabold text-foreground">{name}</h2>
            </div>
          </div>
          <button className="h-10 w-10 rounded-full bg-card shadow-sm border border-black/5 flex items-center justify-center text-foreground hover:bg-accent hover:text-primary transition-colors">
            <Bell className="h-5 w-5" />
          </button>
        </header>

        {/* Main Title */}
        <div className="mt-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            BP <span className="text-primary">Dashboard</span>
          </h1>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0">
          {[
            { id: "all", label: "All" },
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilter(pill.id as any)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold shadow-sm transition-all ${
                filter === pill.id
                  ? "bg-primary text-primary-foreground scale-[1.02]"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Latest Reading - Prominent Red Card */}
        <div className="mt-6">
          {latest ? (
            <div className="relative overflow-hidden rounded-[32px] gradient-primary p-6 text-primary-foreground shadow-raised">
              <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)", backgroundSize: "16px 16px" }} />
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/20 backdrop-blur-md text-white">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Latest Reading</h3>
                    <p className="text-[11px] font-semibold opacity-80 mt-0.5">
                      {formatDate(latest.reading_date)}
                    </p>
                  </div>
                </div>
                <div className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white">
                  {formatTime(latest.reading_time)}
                </div>
              </div>

              <div className="relative mt-8 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider opacity-75">Right Arm</p>
                  <p className="num-display mt-1 text-3xl font-extrabold">
                    {pair(latest.right_systolic, latest.right_diastolic)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider opacity-75">Left Arm</p>
                  <p className="num-display mt-1 text-3xl font-extrabold">
                    {pair(latest.left_systolic, latest.left_diastolic)}
                  </p>
                </div>
              </div>

              <div className="relative mt-6 flex items-center justify-between border-t border-white/20 pt-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Activity className="h-4 w-4 opacity-80" />
                  <span>Pulse {latest.pulse ?? "—"}</span>
                </div>
                
                <Link
                  to="/history"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary transition-transform hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="surface-card p-8 text-center border border-border">
              <HeartPulse className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
              <p className="mt-4 text-sm font-semibold text-muted-foreground">
                {isLoading ? "Loading readings…" : "No readings yet. Add the first one below."}
              </p>
            </div>
          )}
        </div>

        {/* Elevated Warning */}
        {latest && isElevated(latest) && (
          <div className="mt-5 flex gap-4 rounded-3xl bg-accent p-5">
            <Info className="h-6 w-6 shrink-0 text-accent-foreground" />
            <p className="text-xs font-semibold leading-relaxed text-accent-foreground">
              Your latest reading is higher than usual. Consider rechecking after resting and seek medical advice when appropriate.
            </p>
          </div>
        )}

        {/* Recent Readings List */}
        <section className="mt-8 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground">Recent Readings</h2>
            <Link to="/history" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {displayReadings.length === 0 ? (
              <p className="text-sm font-medium text-muted-foreground px-2">No other recent readings found.</p>
            ) : (
              displayReadings.map((r, i) => (
                <Link
                  key={r.id}
                  to="/add"
                  search={{ id: r.id }}
                  className="surface-card animate-rise flex items-center gap-4 p-4 pr-5 transition-transform hover:scale-[1.01]"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-foreground">{formatDate(r.reading_date)}</p>
                    <p className="num-display truncate text-[13px] font-semibold text-muted-foreground mt-0.5">
                      R {pair(r.right_systolic, r.right_diastolic)} · L {pair(r.left_systolic, r.left_diastolic)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground">{formatTime(r.reading_time)}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <Disclaimer />
      </div>
    </AppShell>
  );
}
