import { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import { getAllReports } from "../lib/store";
import { REPORT_TYPE_LABELS, RISK_LEVELS, type ReportType } from "../types";
import { Filter, MapPin } from "lucide-react";

const BENIN_CENTER: [number, number] = [7.5, 2.3]; // Centre approximatif du Bénin
const COTONOU: [number, number] = [6.37, 2.40];

const TYPE_FILTERS: { value: ReportType | "all"; label: string; icon: string }[] = [
  { value: "all", label: "Tous", icon: "🌍" },
  { value: "flood", label: "Inondations", icon: "🌊" },
  { value: "waste", label: "Déchets", icon: "🗑️" },
  { value: "stagnant_water", label: "Eaux stagnantes", icon: "💧" },
  { value: "insalubrity", label: "Insalubrité", icon: "⚠️" },
  { value: "other", label: "Autres", icon: "📌" },
];

export default function MapPage() {
  // Utilise getAllReports() qui fusionne démo + signalements utilisateur persistés
  const reports = useMemo(() => getAllReports(), []);
  const [filter, setFilter] = useState<ReportType | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = filter === "all" ? reports : reports.filter((r) => r.type === filter);

  const userCount = reports.filter((r) => r.source === "citizen").length;

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
            Carte interactive
          </div>
          <h1 className="text-3xl font-bold mb-2">Carte des signalements environnementaux</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {filtered.length} signalement(s) affichés
            {userCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
                {userCount} soumis par les citoyens
              </span>
            )}
            — cliquez sur un point pour voir le détail et le score IRSE.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Filter size={16} style={{ color: "var(--text-muted)" }} />
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
              style={{
                background: filter === f.value ? "var(--accent)" : "var(--surface)",
                color: filter === f.value ? "#000" : "var(--text-secondary)",
                borderColor: filter === f.value ? "var(--accent)" : "var(--border)",
              }}
            >
              <span>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Carte */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: "var(--border)", height: "600px" }}
        >
          <MapContainer
            center={COTONOU}
            zoom={11}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {filtered.map((r) => {
              const level = RISK_LEVELS[r.riskLevel];
              const isSelected = selectedId === r.id;
              return (
                <CircleMarker
                  key={r.id}
                  center={[r.location.lat, r.location.lng]}
                  radius={isSelected ? 14 : 9}
                  pathOptions={{
                    color: level.color,
                    fillColor: level.color,
                    fillOpacity: r.source === "citizen" ? 0.9 : 0.6,
                    weight: r.source === "citizen" ? 3 : 2,
                  }}
                  eventHandlers={{ click: () => setSelectedId(r.id) }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <strong>{REPORT_TYPE_LABELS[r.type].fr}</strong> — IRSE {r.riskScore}/100
                    {r.source === "citizen" && " 📌 Citoyen"}
                  </Tooltip>
                  <Popup>
                    <div style={{ minWidth: 220 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>
                        {REPORT_TYPE_LABELS[r.type].icon} {REPORT_TYPE_LABELS[r.type].fr}
                      </div>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                        <MapPin size={10} style={{ display: "inline" }} /> {r.location.neighborhood}, {r.location.city}
                      </div>
                      <div style={{ fontSize: 12, marginBottom: 6, fontStyle: "italic", color: "#555" }}>
                        "{r.description.slice(0, 80)}{r.description.length > 80 ? "…" : ""}"
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "#888" }}>{new Date(r.date).toLocaleDateString("fr-FR")}</span>
                        <span
                          style={{
                            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                            background: `${level.color}22`, color: level.color,
                          }}
                        >
                          {level.label} · {r.riskScore}/100
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#888" }}>
                        Source: {r.source === "citizen" ? "🗑️ Citoyen (persisté)" : r.source === "demo" ? "Démo" : r.source}
                        <br />Signaleur: {r.reporter} · Statut: {r.status === "new" ? "Nouveau" : r.status === "in_progress" ? "En cours" : "Traité"}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Légende */}
        <div className="mt-4 flex flex-wrap gap-4 items-center text-xs">
          <span style={{ color: "var(--text-muted)" }}>Niveaux de risque IRSE :</span>
          {Object.values(RISK_LEVELS).map((lvl) => (
            <div key={lvl.label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: lvl.color }} />
              <span>{lvl.label} ({lvl.min}-{lvl.max})</span>
            </div>
          ))}
          <span className="ml-4 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: "var(--accent)", background: "var(--accent-glow)" }} />
            📌 = soumis par un citoyen
          </span>
        </div>

        {/* Liste détaillée */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Signalements récents</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {filtered.slice(0, 12).map((r) => {
              const level = RISK_LEVELS[r.riskLevel];
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className="text-left rounded-xl p-4 border transition-all hover:scale-[1.01]"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: selectedId === r.id ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{REPORT_TYPE_LABELS[r.type].icon}</span>
                      <div>
                        <div className="font-semibold text-sm">
                          {r.title}
                          {r.source === "citizen" && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
                              📌 Vôtre
                            </span>
                          )}
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {r.location.neighborhood}, {r.location.city}
                        </div>
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{ background: `${level.color}22`, color: level.color }}
                    >
                      {r.riskScore}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {r.description.slice(0, 100)}{r.description.length > 100 ? "…" : ""}
                  </div>
                  <div className="text-xs mt-2 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                    <MapPin size={10} /> {new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[10px]" style={{ background: "var(--surface)" }}>
                      {r.status === "new" ? "Nouveau" : r.status === "in_progress" ? "En cours" : "Traité"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
