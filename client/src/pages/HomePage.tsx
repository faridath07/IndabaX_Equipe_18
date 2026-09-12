import { Link } from "react-router-dom";
import {
  Send, MapPin, BarChart3, Play, ArrowRight, Mic, Brain,
  Crosshair, ShieldAlert, Users, Activity, Droplets, Trash2,
} from "lucide-react";
import { useMemo } from "react";
import { generateDemoReports, computeZoneRisks } from "../lib/demo-data";
import { RISK_LEVELS } from "../types";

export default function HomePage() {
  const reports = useMemo(() => generateDemoReports(), []);
  const zones = useMemo(() => computeZoneRisks(reports), [reports]);

  const totalReports = reports.length;
  const criticalZones = zones.filter((z) => z.level === "critical").length;
  const highZones = zones.filter((z) => z.level === "high").length;
  const avgIrse = zones.length > 0
    ? Math.round(zones.reduce((s, z) => s + z.irse, 0) / zones.length)
    : 0;

  const pipeline = [
    { icon: Users, label: "Citoyen", desc: "Signalement par texte ou voix", color: "#22c55e" },
    { icon: Send, label: "Signalement", desc: "Texte FR / Fon + photo", color: "#06b6d4" },
    { icon: Brain, label: "IA", desc: "Classification NLP", color: "#a78bfa" },
    { icon: Activity, label: "Analyse", desc: "Facteurs de risque", color: "#fbbf24" },
    { icon: ShieldAlert, label: "IRSE", desc: "Score 0-100", color: "#f97316" },
    { icon: MapPin, label: "Carte", desc: "Visualisation géo", color: "#dc2626" },
    { icon: Crosshair, label: "Priorisation", desc: "Zones d'action", color: "#22c55e" },
  ];

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 20% 30%, rgba(34,197,94,0.15), transparent 50%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.12), transparent 50%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
              style={{
                background: "rgba(34,197,94,0.1)",
                borderColor: "rgba(34,197,94,0.3)",
                color: "#22c55e",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              IndabaX Bénin 2026 — Équipe 18
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6">
              L'intelligence citoyenne pour{" "}
              <span style={{ background: "linear-gradient(135deg, #22c55e, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                détecter les risques
              </span>{" "}
              environnementaux au Bénin.
            </h1>
            <p className="text-lg mb-8 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
              Les citoyens signalent. L'IA analyse. Le risque est calculé. La carte s'illumine.
              Une plateforme d'éco-santé pour prioriser les interventions avant l'épidémie.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/report"
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                <Send size={18} />
                Signaler un problème
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border transition-all hover:scale-105"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
              >
                <BarChart3 size={18} />
                Voir le dashboard
              </Link>
              <Link
                to="/map"
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border transition-all hover:scale-105"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
              >
                <MapPin size={18} />
                Carte interactive
              </Link>
            </div>
          </div>

          {/* Quick KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12 max-w-3xl">
            <StatCard label="Signalements" value={totalReports} icon={Activity} />
            <StatCard label="Zones critiques" value={criticalZones} icon={ShieldAlert} color="#dc2626" />
            <StatCard label="Zones à risque élevé" value={highZones} icon={Crosshair} color="#f97316" />
            <StatCard label="IRSE moyen" value={`${avgIrse}/100`} icon={BarChart3} color="#22c55e" />
          </div>
        </div>
      </section>

      {/* PROBLÈME → SOLUTION → IMPACT */}
      <section className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <div className="text-2xl mb-3">🚨</div>
              <h3 className="font-bold text-lg mb-2">Problème</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Les citoyens signalent les problèmes environnementaux, mais les données sont dispersées
                et difficiles à exploiter rapidement pour anticiper les risques sanitaires.
              </p>
            </Card>
            <Card highlight>
              <div className="text-2xl mb-3">💡</div>
              <h3 className="font-bold text-lg mb-2">Solution</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                EcosIA transforme les signalements citoyens en données structurées et calcule un
                <strong> Indice de Risque Sanitaire Environnemental (IRSE)</strong> explicable pour prioriser les interventions.
              </p>
            </Card>
            <Card>
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="font-bold text-lg mb-2">Impact</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Les autorités, ONG et communautés identifient rapidement les zones prioritaires
                pour prévenir le paludisme, le choléra et autres maladies liées à l'environnement.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="border-t" style={{ borderColor: "var(--border)", background: "var(--bg-elev)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
              Comment ça marche
            </div>
            <h2 className="text-3xl font-bold">Le pipeline EcosIA</h2>
            <p className="mt-3 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Du signalement citoyen à la décision éclairée.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-3 overflow-x-auto pb-2">
            {pipeline.map((step, i) => (
              <div key={i} className="flex items-center gap-3 flex-1 min-w-[160px]">
                <div
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border flex-1"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${step.color}22`, color: step.color }}
                  >
                    <step.icon size={22} />
                  </div>
                  <div className="font-semibold text-sm">{step.label}</div>
                  <div className="text-xs text-center" style={{ color: "var(--text-muted)" }}>{step.desc}</div>
                </div>
                {i < pipeline.length - 1 && (
                  <ArrowRight size={16} className="hidden md:block flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODE DÉMO */}
      <section className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div
            className="rounded-2xl p-8 sm:p-12 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, var(--bg-card), var(--surface))", border: "1px solid var(--border)" }}
          >
            <div
              className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: "var(--accent)", filter: "blur(100px)", opacity: 0.15 }}
            />
            <div className="relative">
              <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
                Démo jury
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Scénario de démonstration (2 min)</h2>
              <p className="mb-6 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
                Simulez un signalement complet : un citoyen signale une inondation à Agla,
                le système classifie, calcule l'IRSE, place le point sur la carte et met à jour le dashboard.
              </p>
              <Link
                to="/report?demo=1"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                <Play size={18} />
                Lancer la démonstration
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ZONES À RISQUE */}
      <section className="border-t" style={{ borderColor: "var(--border)", background: "var(--bg-elev)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
                Indice de Risque Sanitaire Environnemental
              </div>
              <h2 className="text-3xl font-bold">Zones surveillées au Bénin</h2>
            </div>
            <Link to="/map" className="text-sm font-semibold flex items-center gap-1 hover:underline" style={{ color: "var(--accent)" }}>
              Voir la carte <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.slice(0, 6).map((z) => {
              const level = RISK_LEVELS[z.level as keyof typeof RISK_LEVELS] || RISK_LEVELS.low;
              return (
                <div
                  key={z.zone}
                  className="rounded-xl p-5 border transition-all hover:scale-[1.02]"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold">{z.zone}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{z.city}</div>
                    </div>
                    <div
                      className="px-2.5 py-1 rounded-md text-xs font-bold border"
                      style={{ background: `${level.color}1a`, color: level.color, borderColor: `${level.color}55` }}
                    >
                      {level.label}
                    </div>
                  </div>
                  <div className="flex items-end gap-2 mb-3">
                    <div className="text-3xl font-black" style={{ color: level.color }}>{z.irse}</div>
                    <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>/ 100 IRSE</div>
                  </div>
                  <div className="w-full h-1.5 rounded-full mb-3" style={{ background: "var(--surface)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${z.irse}%`, background: level.color }}
                    />
                  </div>
                  <div className="flex gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span className="flex items-center gap-1"><Droplets size={12} /> {z.byType.flood || 0}</span>
                    <span className="flex items-center gap-1"><Trash2 size={12} /> {z.byType.waste || 0}</span>
                    <span className="flex items-center gap-1"><Activity size={12} /> {z.totalReports} total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color?: string }) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} style={{ color: color || "var(--accent)" }} />
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
      </div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}

function Card({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <div
      className="rounded-xl p-6 border"
      style={{
        background: highlight ? "var(--surface)" : "var(--bg-card)",
        borderColor: highlight ? "var(--accent)" : "var(--border)",
      }}
    >
      {children}
    </div>
  );
}
