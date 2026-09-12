import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import {
  Activity, Droplets, Trash2, ShieldAlert, Crosshair, MapPin,
  AlertCircle, TrendingUp, ListChecks,
} from "lucide-react";
import { generateDemoReports, computeZoneRisks } from "../lib/demo-data";
import { REPORT_TYPE_LABELS, RISK_LEVELS, type ReportType } from "../types";

const COLORS = ["#22c55e", "#eab308", "#f97316", "#dc2626", "#a78bfa"];

export default function DashboardPage() {
  const reports = useMemo(() => generateDemoReports(), []);
  const zones = useMemo(() => computeZoneRisks(reports), [reports]);

  // KPIs
  const totalReports = reports.length;
  const totalFloods = reports.filter((r) => r.type === "flood").length;
  const totalWaste = reports.filter((r) => r.type === "waste").length;
  const totalOthers = reports.filter((r) => !["flood", "waste"].includes(r.type)).length;
  const highRiskZones = zones.filter((z) => ["high", "critical"].includes(z.level)).length;
  const avgIrse = zones.length > 0 ? Math.round(zones.reduce((s, z) => s + z.irse, 0) / zones.length) : 0;

  // Données pour les charts
  const typeData = (Object.keys(REPORT_TYPE_LABELS) as ReportType[]).map((type) => ({
    name: REPORT_TYPE_LABELS[type].fr,
    value: reports.filter((r) => r.type === type).length,
    color: COLORS[["flood", "waste", "stagnant_water", "insalubrity", "other"].indexOf(type)],
  }));

  const zoneData = zones.slice(0, 6).map((z) => ({
    name: z.zone.split("—")[1]?.trim() || z.zone,
    IRSE: z.irse,
    Signalements: z.totalReports,
  }));

  // Trend 7 jours
  const trendData = useMemo(() => {
    const days: { name: string; reports: number; cumul: number }[] = [];
    let cumul = 0;
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = reports.filter((r) => {
        const d = new Date(r.date);
        return d >= dayStart && d < dayEnd;
      }).length;
      cumul += count;
      days.push({
        name: dayStart.toLocaleDateString("fr-FR", { weekday: "short" }),
        reports: count,
        cumul,
      });
    }
    return days;
  }, [reports]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
          Dashboard
        </div>
        <h1 className="text-3xl font-bold">Vue d'ensemble — Surveillance environnementale</h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Données de démonstration — {totalReports} signalements sur {zones.length} zones du Bénin.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <KpiCard icon={Activity} label="Total signalements" value={totalReports} color="#22c55e" />
        <KpiCard icon={Droplets} label="Inondations" value={totalFloods} color="#06b6d4" />
        <KpiCard icon={Trash2} label="Dépôts déchets" value={totalWaste} color="#fbbf24" />
        <KpiCard icon={AlertCircle} label="Autres alertes" value={totalOthers} color="#a78bfa" />
        <KpiCard icon={Crosshair} label="Zones à risque" value={highRiskZones} color="#f97316" />
        <KpiCard icon={ShieldAlert} label="IRSE moyen" value={`${avgIrse}/100`} color="#dc2626" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Évolution 7 jours */}
        <div className="rounded-2xl p-6 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} style={{ color: "var(--accent)" }} />
            <h3 className="font-semibold">Évolution des signalements (7 jours)</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <RTooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="reports" name="Nouveaux" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="cumul" name="Cumul" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par type */}
        <div className="rounded-2xl p-6 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <ListChecks size={18} style={{ color: "var(--accent)" }} />
            <h3 className="font-semibold">Répartition par type</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={typeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                label={(e: any) => `${e.name}: ${e.value}`}
                labelLine={false}
                style={{ fontSize: 10 }}
              >
                {typeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <RTooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart IRSE par zone */}
      <div className="rounded-2xl p-6 border mb-6" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} style={{ color: "var(--accent)" }} />
          <h3 className="font-semibold">IRSE par zone ({zones.length} zones)</h3>
        </div>
        <ResponsiveContainer width="100%" height={Math.max(240, zones.length * 32)}>
          <BarChart data={zoneData} layout="vertical" margin={{ left: 80, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11 }} width={120} />
            <RTooltip
              contentStyle={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="IRSE" fill="#f97316" radius={[0, 4, 4, 0]} />
            <Bar dataKey="Signalements" fill="#22c55e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Détail par zone */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
        <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold">Détail par zone (trié par IRSE décroissant)</h3>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {zones.map((z) => {
            const level = RISK_LEVELS[z.level as keyof typeof RISK_LEVELS] || RISK_LEVELS.low;
            return (
              <div key={z.zone} className="p-5 hover:bg-opacity-50" style={{ background: "var(--bg-card)" }}>
                <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                  <div>
                    <div className="font-bold">{z.zone}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{z.city} · {z.totalReports} signalement(s)</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-black" style={{ color: level.color }}>{z.irse}</div>
                    <div
                      className="px-2.5 py-1 rounded-md text-xs font-bold border"
                      style={{ background: `${level.color}1a`, color: level.color, borderColor: `${level.color}55` }}
                    >
                      {level.label}
                    </div>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full mb-3" style={{ background: "var(--surface)" }}>
                  <div className="h-full rounded-full" style={{ width: `${z.irse}%`, background: level.color }} />
                </div>
                <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span className="flex items-center gap-1"><Droplets size={11} /> {z.byType.flood || 0} inondation(s)</span>
                  <span className="flex items-center gap-1"><Trash2 size={11} /> {z.byType.waste || 0} déchet(s)</span>
                  <span className="flex items-center gap-1"><Activity size={11} /> {z.byType.stagnant_water || 0} eau stagnante</span>
                </div>
                {z.factors.slice(0, 3).map((f: any, i: number) => (
                  <div key={i} className="text-xs mt-2 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: "var(--text-muted)" }} />
                    {f.label}: {f.detail}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} style={{ color }} />
        <div className="text-[11px] leading-tight" style={{ color: "var(--text-muted)" }}>{label}</div>
      </div>
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
    </div>
  );
}
