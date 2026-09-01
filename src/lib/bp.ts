import { createServerFn } from "@tanstack/start";
import { sql } from "./db";

export type Reading = {
  id: string;
  patient_name: string;
  reading_date: string;
  reading_time: string;
  right_systolic: number | null;
  right_diastolic: number | null;
  left_systolic: number | null;
  left_diastolic: number | null;
  pulse: number | null;
  notes: string | null;
  created_at: string;
};

export type ReadingInput = Omit<Reading, "id" | "created_at" | "patient_name"> & {
  patient_name?: string;
};

export type Settings = {
  id: string;
  patient_name: string;
  patient_age: number | null;
};

// Server Functions
export const getReadings = createServerFn({ method: "GET" }).handler(async () => {
  const data = await sql`SELECT * FROM bp_readings ORDER BY reading_date DESC, reading_time DESC`;
  // Format dates correctly since postgres.js returns Date objects for DATE/TIMESTAMP types
  return data.map(r => ({
    ...r,
    reading_date: r.reading_date instanceof Date ? r.reading_date.toISOString().slice(0, 10) : r.reading_date,
    reading_time: typeof r.reading_time === 'string' ? r.reading_time.slice(0, 5) : r.reading_time,
  })) as Reading[];
});

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const data = await sql`SELECT id, patient_name, patient_age FROM app_settings LIMIT 1`;
  return (data[0] as Settings) || null;
});

export const saveReadingFn = createServerFn({ method: "POST" })
  .validator((d: { id?: string; input: ReadingInput }) => d)
  .handler(async ({ data: { id, input } }) => {
    // Fill default values if empty to avoid postgres errors
    const safeInput = { ...input };
    Object.keys(safeInput).forEach((key) => {
      if (safeInput[key as keyof ReadingInput] === undefined) {
        safeInput[key as keyof ReadingInput] = null as any;
      }
    });

    if (id) {
      await sql`UPDATE bp_readings SET ${sql(safeInput)} WHERE id = ${id}`;
    } else {
      await sql`INSERT INTO bp_readings ${sql(safeInput)}`;
    }
  });

export const deleteReadingFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data: id }) => {
    await sql`DELETE FROM bp_readings WHERE id = ${id}`;
  });

// Query Definitions
export const readingsQuery = {
  queryKey: ["readings"],
  queryFn: () => getReadings(),
};

export const settingsQuery = {
  queryKey: ["settings"],
  queryFn: () => getSettings(),
};

export async function saveReading(input: ReadingInput, id?: string) {
  await saveReadingFn({ data: { id, input } });
}

export async function deleteReading(id: string) {
  await deleteReadingFn({ data: id });
}

/** Formatting helpers */
export function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${suffix}`;
}

export function formatDate(d: string) {
  if (!d) return "";
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function todayISO() {
  const now = new Date();
  const off = now.getTimezoneOffset();
  return new Date(now.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function nowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function pair(s: number | null, d: number | null) {
  return s != null && d != null ? `${s}/${d}` : "—";
}

/** Gentle, non-diagnostic flag only. */
export function isElevated(r: Reading) {
  const values = [
    [r.right_systolic, r.right_diastolic],
    [r.left_systolic, r.left_diastolic],
  ];
  return values.some(([s, d]) => (s != null && s >= 160) || (d != null && d >= 100));
}

export function daysAgoISO(days: number) {
  const now = new Date();
  now.setDate(now.getDate() - days);
  const off = now.getTimezoneOffset();
  return new Date(now.getTime() - off * 60000).toISOString().slice(0, 10);
}
