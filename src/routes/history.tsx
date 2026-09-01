import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pencil, Trash2, ChevronDown, CalendarDays, Activity, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Disclaimer, PageHeader } from "@/components/AppShell";
import {
  readingsQuery,
  deleteReading,
  formatDate,
  formatTime,
  pair,
  type Reading,
} from "@/lib/bp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Reading History — BP Care" },
      { name: "description", content: "Browse every recorded blood pressure reading." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { data: readings = [], isLoading } = useQuery(readingsQuery);
  const qc = useQueryClient();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Reading | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => deleteReading(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["readings"] });
      toast.success("Reading deleted");
    },
    onError: () => toast.error("Could not delete the reading."),
  });

  const filtered = useMemo(
    () =>
      readings.filter(
        (r) => (!from || r.reading_date >= from) && (!to || r.reading_date <= to),
      ),
    [readings, from, to],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Reading[]>();
    filtered.forEach((r) => {
      const list = map.get(r.reading_date) ?? [];
      list.push(r);
      map.set(r.reading_date, list);
    });
    return [...map.entries()];
  }, [filtered]);

  return (
    <AppShell>
      <PageHeader eyebrow="All records" title="Reading" accent="History" />

      {/* Filter Section */}
      <div className="mx-5 mt-6 grid grid-cols-2 gap-3 p-1 sm:mx-2">
        <label className="block surface-card p-4">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" /> From
          </span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-transparent text-sm font-bold text-foreground outline-none"
          />
        </label>
        <label className="block surface-card p-4">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
             <Calendar className="h-3.5 w-3.5 text-primary" /> To
          </span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-transparent text-sm font-bold text-foreground outline-none"
          />
        </label>
        {(from || to) && (
          <button
            onClick={() => {
              setFrom("");
              setTo("");
            }}
            className="col-span-2 rounded-full bg-secondary py-3 text-sm font-bold text-secondary-foreground transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="mt-8 space-y-8 px-5 sm:px-2 pb-10">
        {isLoading ? (
          <div className="flex justify-center p-10"><Activity className="h-8 w-8 text-primary animate-pulse" /></div>
        ) : groups.length === 0 ? (
          <div className="surface-card p-10 text-center border border-border">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
            <p className="mt-4 text-sm font-semibold text-muted-foreground">
              No readings found for this date range.
            </p>
          </div>
        ) : (
          groups.map(([date, items]) => (
            <section key={date}>
              <div className="flex items-center gap-3 mb-4 pl-1">
                 <div className="h-2 w-2 rounded-full bg-primary" />
                 <h2 className="text-sm font-extrabold tracking-wide text-foreground">
                  {formatDate(date)}
                </h2>
              </div>
              <div className="space-y-4">
                {items.map((r) => {
                  const isOpen = open === r.id;
                  return (
                    <article key={r.id} className={`surface-card overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-primary/20' : ''}`}>
                      <button
                        onClick={() => setOpen(isOpen ? null : r.id)}
                        className="flex w-full items-center gap-4 p-5 text-left"
                      >
                        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-[20px] transition-colors ${isOpen ? 'gradient-primary text-white shadow-raised' : 'bg-accent text-primary'}`}>
                          <Activity className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground">{formatTime(r.reading_time)}</p>
                          <p className="num-display mt-0.5 text-[13px] font-semibold text-muted-foreground">
                            R {pair(r.right_systolic, r.right_diastolic)} · L {pair(r.left_systolic, r.left_diastolic)}
                          </p>
                        </div>
                        <div className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </button>
                      
                      {isOpen ? (
                        <div className="animate-rise border-t border-border/50 bg-secondary/30 px-6 py-5">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="rounded-2xl bg-card p-4 shadow-sm border border-black/5 dark:border-white/5">
                              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Right Arm</dt>
                              <dd className="num-display text-2xl font-extrabold text-primary">{pair(r.right_systolic, r.right_diastolic)}</dd>
                            </div>
                            <div className="rounded-2xl bg-card p-4 shadow-sm border border-black/5 dark:border-white/5">
                              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Left Arm</dt>
                              <dd className="num-display text-2xl font-extrabold text-primary">{pair(r.left_systolic, r.left_diastolic)}</dd>
                            </div>
                            <div className="rounded-2xl bg-card p-4 shadow-sm border border-black/5 dark:border-white/5">
                              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Pulse</dt>
                              <dd className="num-display text-lg font-bold text-foreground">{r.pulse ? `${r.pulse} bpm` : "—"}</dd>
                            </div>
                            <div className="rounded-2xl bg-card p-4 shadow-sm border border-black/5 dark:border-white/5">
                              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Notes</dt>
                              <dd className="text-sm font-semibold text-foreground truncate">{r.notes || "—"}</dd>
                            </div>
                          </div>
                          
                          <div className="mt-5 flex gap-3">
                            <Link
                              to="/add"
                              search={{ id: r.id }}
                              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary/10 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </Link>
                            <button
                              onClick={() => setPendingDelete(r)}
                              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-destructive/10 py-3 text-sm font-bold text-destructive transition-colors hover:bg-destructive/20"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold">Delete this record?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium">
              This will permanently remove the reading from{" "}
              <span className="font-bold text-foreground">{pendingDelete ? formatDate(pendingDelete.reading_date) : ""}</span> at{" "}
              <span className="font-bold text-foreground">{pendingDelete ? formatTime(pendingDelete.reading_time) : ""}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-full font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) remove.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Disclaimer />
    </AppShell>
  );
}
