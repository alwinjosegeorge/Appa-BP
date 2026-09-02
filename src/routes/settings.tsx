import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { AppShell, PageHeader, Disclaimer } from "@/components/AppShell";
import { settingsQuery, saveSettings, readingsQuery, formatDate, formatTime } from "@/lib/bp";
import { Download, User, Check, Activity } from "lucide-react";
import { toPng } from "html-to-image";
import download from "downloadjs";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/settings")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: readings = [] } = useQuery(readingsQuery);
  const qc = useQueryClient();
  
  const [name, setName] = useState(settings?.patient_name ?? "User");
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      await saveSettings({ patient_name: name });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Profile updated");
    }
  });

  const handleExport = async () => {
    if (!reportRef.current) return;
    try {
      setIsExporting(true);
      toast.loading("Generating report...", { id: "export" });
      
      // Wait for fonts/styles to apply
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await toPng(reportRef.current, { 
        quality: 1, 
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      download(dataUrl, `BP_Report_${new Date().toISOString().split('T')[0]}.png`);
      toast.success("Report downloaded successfully!", { id: "export" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report", { id: "export" });
    } finally {
      setIsExporting(false);
    }
  };

  // Build simple chart data for report (reverse to chronological order)
  const chartData = [...readings].reverse().map(r => ({
    date: formatDate(r.reading_date),
    sys: r.right_systolic ?? r.left_systolic,
    dia: r.right_diastolic ?? r.left_diastolic
  })).filter(r => r.sys != null && r.dia != null);

  return (
    <AppShell>
      <PageHeader eyebrow="Settings" title="Your" accent="Profile">
        <p className="mt-2 text-sm text-muted-foreground">Manage your information and export reports.</p>
      </PageHeader>

      <div className="px-5 sm:px-2 mt-8 space-y-6">
        <div className="surface-card p-6">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-8 w-8 rounded-full bg-accent grid place-items-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-foreground">Personal Info</h2>
          </div>
          
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Name</span>
              <input 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-[20px] border border-border bg-background px-5 py-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/50"
              />
            </label>
            
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || name === (settings?.patient_name ?? "User")}
              className="flex w-full items-center justify-center gap-2 rounded-full gradient-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-raised disabled:opacity-50 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Check className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </div>

        <div className="surface-card p-6">
           <div className="flex items-center gap-3 mb-4">
             <div className="h-8 w-8 rounded-full bg-accent grid place-items-center text-primary">
              <Download className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-foreground">Export Data</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Download a beautiful image containing your recent BP readings and trend graph to share with your doctor.
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting || readings.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary text-secondary-foreground px-6 py-4 text-sm font-bold shadow-sm transition-all hover:bg-accent hover:text-primary disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> {isExporting ? "Generating..." : "Download Report Image"}
          </button>
        </div>
      </div>

      <Disclaimer />

      {/* Hidden Report Template for export */}
      <div 
        ref={reportRef} 
        style={{ position: 'absolute', top: '-9999px', left: '-9999px', zIndex: -1, width: '800px', padding: '40px', background: 'white', color: '#111' }}
        className="font-sans"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #f3f4f6', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, color: '#e11d48' }}>BP Care Report</h1>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#4b5563', margin: '8px 0 0' }}>Patient: {settings?.patient_name ?? "User"}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Generated on {new Date().toLocaleDateString()}</p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0' }}>Total Readings: {readings.length}</p>
          </div>
        </div>

        {chartData.length > 0 && (
          <div style={{ marginBottom: '40px', background: '#fafafa', padding: '20px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="#e11d48" /> Blood Pressure Trend
            </h2>
            <div style={{ height: '250px', width: '100%' }}>
              <LineChart width={720} height={250} data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Line type="monotone" dataKey="sys" name="Systolic" stroke="#e11d48" strokeWidth={3} dot={{r:3}} isAnimationActive={false} />
                <Line type="monotone" dataKey="dia" name="Diastolic" stroke="#881337" strokeWidth={3} dot={{r:3}} isAnimationActive={false} />
              </LineChart>
            </div>
          </div>
        )}

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Recent Readings</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Date & Time</th>
                <th style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Systolic (mmHg)</th>
                <th style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Diastolic (mmHg)</th>
                <th style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Pulse</th>
                <th style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {readings.slice(0, 15).map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600 }}>{formatDate(r.reading_date)} {formatTime(r.reading_time)}</td>
                  <td style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 700, color: '#e11d48' }}>{r.right_systolic ?? r.left_systolic ?? '-'}</td>
                  <td style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 700, color: '#881337' }}>{r.right_diastolic ?? r.left_diastolic ?? '-'}</td>
                  <td style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600 }}>{r.pulse ?? '-'}</td>
                  <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>{r.notes ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {readings.length > 15 && (
            <p style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
              Showing latest 15 readings...
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
