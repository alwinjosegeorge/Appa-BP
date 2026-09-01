import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Check, Calendar, Clock, Activity, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Disclaimer } from "@/components/AppShell";
import { readingsQuery, saveReading, todayISO, nowTime, type Reading } from "@/lib/bp";

type Search = { id?: string };

export const Route = createFileRoute("/add")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    id: typeof search["id"] === "string" ? search["id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Add a Blood Pressure Reading — BP Care" },
      {
        name: "description",
        content: "Record right arm and left arm blood pressure, pulse and notes in seconds.",
      },
    ],
  }),
  component: AddPage,
});

function AddPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: readings = [] } = useQuery(readingsQuery);
  const existing: Reading | undefined = id ? readings.find((r) => r.id === id) : undefined;

  const [form, setForm] = useState(() => ({
    reading_date: todayISO(),
    reading_time: nowTime(),
    right_systolic: "",
    right_diastolic: "",
    left_systolic: "",
    left_diastolic: "",
    pulse: "",
    notes: "",
  }));
  const [hydrated, setHydrated] = useState(false);

  if (existing && !hydrated) {
    setHydrated(true);
    setForm({
      reading_date: existing.reading_date,
      reading_time: existing.reading_time.slice(0, 5),
      right_systolic: existing.right_systolic?.toString() ?? "",
      right_diastolic: existing.right_diastolic?.toString() ?? "",
      left_systolic: existing.left_systolic?.toString() ?? "",
      left_diastolic: existing.left_diastolic?.toString() ?? "",
      pulse: existing.pulse?.toString() ?? "",
      notes: existing.notes ?? "",
    });
  }

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  const mutation = useMutation({
    mutationFn: async () => {
      const hasAny = ["right_systolic", "right_diastolic", "left_systolic", "left_diastolic"].some(
        (k) => form[k as keyof typeof form].trim() !== "",
      );
      if (!hasAny) throw new Error("Please enter at least one arm reading.");
      await saveReading(
        {
          reading_date: form.reading_date,
          reading_time: form.reading_time,
          right_systolic: num(form.right_systolic),
          right_diastolic: num(form.right_diastolic),
          left_systolic: num(form.left_systolic),
          left_diastolic: num(form.left_diastolic),
          pulse: num(form.pulse),
          notes: form.notes.trim() === "" ? null : form.notes.trim(),
        },
        id,
      );
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["readings"] });
      toast.success(id ? "Reading updated" : "Reading saved", {
        description: "Thank you for keeping the record up to date.",
      });
      navigate({ to: "/" });
    },
    onError: (e: Error) => toast.error(e.message || "Could not save the reading."),
  });

  return (
    <AppShell>
      <div className="px-5 pt-8 sm:px-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.history.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm border border-black/5 hover:bg-accent hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary">
            <Activity className="h-5 w-5" />
          </div>
        </header>
        <h1 className="mt-8 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          {id ? "Edit" : "Log a"} <span className="text-primary">Reading</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your blood pressure details accurately.
        </p>
      </div>

      <form
        className="mt-8 space-y-6 px-5 sm:px-8"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-accent grid place-items-center text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-foreground">Date & Time</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              value={form.reading_date}
              onChange={(e) => set("reading_date", e.target.value)}
              className={`flex-1 min-w-0 ${inputClass}`}
            />
            <input
              type="time"
              value={form.reading_time}
              onChange={(e) => set("reading_time", e.target.value)}
              className={`flex-1 min-w-0 ${inputClass}`}
            />
          </div>
        </div>

        <ArmCard
          title="Right Arm"
          sys={form.right_systolic}
          dia={form.right_diastolic}
          onSys={(v) => set("right_systolic", v)}
          onDia={(v) => set("right_diastolic", v)}
        />
        <ArmCard
          title="Left Arm"
          sys={form.left_systolic}
          dia={form.left_diastolic}
          onSys={(v) => set("left_systolic", v)}
          onDia={(v) => set("left_diastolic", v)}
        />

        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-8 w-8 rounded-full bg-accent grid place-items-center text-primary">
              <Activity className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-foreground">Additional Details</h2>
          </div>
          <div className="space-y-4">
            <Field label="Pulse (bpm)">
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="78"
                value={form.pulse}
                onChange={(e) => set("pulse", e.target.value.replace(/\D/g, ""))}
                className={bigInputClass}
              />
            </Field>
            <Field label="Notes (optional)">
              <input
                type="text"
                placeholder="Before breakfast, feeling dizzy..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Before breakfast", "After medicine", "After resting"].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("notes", n)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                    form.notes === n
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-primary"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-full gradient-primary px-6 py-5 text-lg font-bold text-primary-foreground shadow-raised transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
        >
          <Check className="h-5 w-5" />
          {mutation.isPending ? "Saving…" : "Save Record"}
        </button>
      </form>

      <Disclaimer />
    </AppShell>
  );
}

const inputClass =
  "w-full rounded-[20px] border border-border bg-background px-5 py-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50";
const bigInputClass =
  "num-display w-full rounded-[20px] border border-border bg-background px-5 py-5 text-center text-3xl font-extrabold text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function ArmCard({
  title,
  sys,
  dia,
  onSys,
  onDia,
}: {
  title: string;
  sys: string;
  dia: string;
  onSys: (v: string) => void;
  onDia: (v: string) => void;
}) {
  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-3 mb-4">
         <div className="h-8 w-8 rounded-full bg-accent grid place-items-center text-primary">
          <HeartPulse className="h-4 w-4" />
        </div>
        <h2 className="text-base font-bold text-foreground">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Systolic">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="120"
            value={sys}
            onChange={(e) => onSys(e.target.value.replace(/\D/g, ""))}
            className={bigInputClass}
          />
        </Field>
        <Field label="Diastolic">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="80"
            value={dia}
            onChange={(e) => onDia(e.target.value.replace(/\D/g, ""))}
            className={bigInputClass}
          />
        </Field>
      </div>
    </div>
  );
}
