import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Activity, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { AppShell, Disclaimer, PageHeader } from "@/components/AppShell";
import { readingsQuery, daysAgoISO, todayISO, type Reading } from "@/lib/bp";

export const Route = createFileRoute("/trends")({
  head: () => ({
    meta: [
      { title: "Blood Pressure Trends — BP Care" },
      {
        name: "description",
        content:
          "See 7-day, 30-day and all-time systolic and diastolic trends, plus a right vs left arm comparison.",
      },
    ],
  }),
  component: TrendsPage,
});

const RANGES = [
  { key: "1", label: "Today" },
  { key: "7", label: "7 Days" },
  { key: "30", label: "30 Days" },
  { key: "all", label: "All Time" },
] as const;

function avg(nums: number[]) {
  if (!nums.length) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function buildToday(readings: Reading[]) {
  const today = todayISO();
  const filtered = readings.filter((r) => r.reading_date === today);

  return filtered
    .sort((a, b) => (a.reading_time < b.reading_time ? -1 : 1))
    .map((r) => {
      const sysAll = [r.right_systolic, r.left_systolic].filter((v): v is number => v != null);
      const diaAll = [r.right_diastolic, r.left_diastolic].filter((v): v is number => v != null);

      let timeLabel = r.reading_time;
      try {
        const [h, m] = r.reading_time.split(":");
        const d = new Date();
        d.setHours(Number(h), Number(m));
        timeLabel = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
      } catch (e) {}

      return {
        date: r.reading_date,
        label: timeLabel,
        systolic: avg(sysAll),
        diastolic: avg(diaAll),
        rightSys: r.right_systolic ?? null,
        leftSys: r.left_systolic ?? null,
      };
    });
}

function buildDaily(readings: Reading[]) {
  const map = new Map<string, Reading[]>();
  readings.forEach((r) => {
    const list = map.get(r.reading_date) ?? [];
    list.push(r);
    map.set(r.reading_date, list);
  });
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, items]) => {
      const pick = (fn: (r: Reading) => number | null) =>
        avg(items.map(fn).filter((v): v is number => v != null));
      const rs = pick((r) => r.right_systolic);
      const ls = pick((r) => r.left_systolic);
      const rd = pick((r) => r.right_diastolic);
      const ld = pick((r) => r.left_diastolic);
      const sysAll = [rs, ls].filter((v): v is number => v != null);
      const diaAll = [rd, ld].filter((v): v is number => v != null);
      return {
        date,
        label: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
        }),
        systolic: avg(sysAll),
        diastolic: avg(diaAll),
        rightSys: rs,
        leftSys: ls,
      };
    });
}

function TrendsPage() {
  const { data: readings = [] } = useQuery(readingsQuery);
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("7");

  const data = useMemo(() => {
    if (range === "1") {
      return buildToday(readings);
    }
    const cutoff = range === "all" ? null : daysAgoISO(Number(range) - 1);
    const filtered = cutoff ? readings.filter((r) => r.reading_date >= cutoff) : readings;
    return buildDaily(filtered);
  }, [readings, range]);

  return (
    <AppShell>
      <PageHeader eyebrow="Overview" title="BP" accent="Trends">
        <p className="mt-2 text-sm text-muted-foreground">
          {range === "1" 
            ? "Your readings recorded throughout today."
            : "Daily averages of the readings you recorded."}
        </p>
      </PageHeader>

      <div className="mt-6 flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide sm:px-2">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold shadow-sm transition-all ${
              range === r.key
                ? "gradient-primary text-primary-foreground scale-[1.02]"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6 px-5 sm:px-2 pb-10">
        {data.length === 0 ? (
          <div className="surface-card p-10 text-center border border-border">
             <Activity className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
            <p className="mt-4 text-sm font-semibold text-muted-foreground">
              No readings in this period yet.
            </p>
          </div>
        ) : (
          <>
            <ChartCard 
              title="Systolic & Diastolic" 
              subtitle={range === "1" ? "Individual readings (mmHg)" : "Average per day (mmHg)"} 
              icon={TrendingUp}
            >
              <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: 'bold' }} labelStyle={{ fontWeight: 'bold', color: 'var(--color-muted-foreground)', marginBottom: 4 }} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic"
                  stroke="var(--color-primary)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "var(--color-primary)", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic"
                  stroke="var(--color-primary-deep)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "var(--color-primary-deep)", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  connectNulls
                />
              </LineChart>
            </ChartCard>

            <ChartCard 
              title="Right vs Left Arm" 
              subtitle={range === "1" ? "Systolic readings (mmHg)" : "Systolic average per day (mmHg)"} 
              icon={Activity}
            >
              <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: 'bold' }} labelStyle={{ fontWeight: 'bold', color: 'var(--color-muted-foreground)', marginBottom: 4 }} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                <Line
                  type="monotone"
                  dataKey="rightSys"
                  name="Right arm"
                  stroke="var(--color-primary)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "var(--color-primary)", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="leftSys"
                  name="Left arm"
                  stroke="var(--color-primary-deep)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "var(--color-primary-deep)", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  connectNulls
                />
              </LineChart>
            </ChartCard>
          </>
        )}
      </div>

      <Disclaimer />
    </AppShell>
  );
}

const tooltipStyle = {
  borderRadius: 16,
  border: "1px solid var(--color-border)",
  fontSize: 12,
  background: "var(--color-card)",
  color: "var(--color-foreground)",
  boxShadow: "var(--shadow-card)",
} as const;

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  children: React.ReactElement;
}) {
  return (
    <div className="surface-card p-6 border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-full bg-accent grid place-items-center text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-foreground">{title}</h2>
          <p className="text-[11px] font-bold text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
