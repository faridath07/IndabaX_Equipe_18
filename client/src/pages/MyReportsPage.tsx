import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Trash2, Download, Upload, Send, MapPin, Clock, CheckCircle2,
  AlertCircle, RefreshCw, FileJson,
} from "lucide-react";
import {
  getUserReports, deleteUserReport, updateReportStatus,
  exportAllData, importUserReports, clearUserReports,
} from "../lib/store";
import { REPORT_TYPE_LABELS, RISK_LEVELS, type ReportStatus } from "../types";

export default function MyReportsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [showImportZone, setShowImportZone] = useState(false);
  const [importText, setImportText] = useState("");

  // Re-read from localStorage on every refreshKey change
  const reports = useMemo(() => getUserReports(), [refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleDelete(id: string) {
    if (confirm("Supprimer ce signalement ? Cette action est irréversible.")) {
      deleteUserReport(id);
      refresh();
    }
  }

  function handleStatusChange(id: string, status: ReportStatus) {
    updateReportStatus(id, status);
    refresh();
  }

  function handleExport() {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecosia-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    if (!importText.trim()) {
      setImportResult("Veuillez coller du JSON valide.");
      return;
    }
    const result = importUserReports(importText);
    if (result.error) {
      setImportResult(`❌ ${result.error}`);
    } else {
      setImportResult(`✅ ${result.success} signalement(s) importé(s).`);
      setImportText("");
      setShowImportZone(false);
      refresh();
    }
  }

  function handleClearAll() {
    if (confirm("Effacer TOUS vos signalements ? Cette action est irréversible.")) {
      clearUserReports();
      refresh();
    }
  }

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = importUserReports(text);
      if (result.error) {
        setImportResult(`❌ ${result.error}`);
      } else {
        setImportResult(`✅ ${result.success} signalement(s) importé(s).`);
        refresh();
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
          Espace citoyen
        </div>
        <h1 className="text-3xl font-bold mb-2">Mes signalements</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {reports.length === 0
            ? "Vous n'avez pas encore soumis de signalement. Les signalements que vous créez sont sauvegardés dans votre navigateur."
            : `${reports.length} signalement(s) que vous avez soumis — sauvegardés localement sur cet appareil.`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          to="/report"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          <Send size={16} /> Nouveau signalement
        </Link>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all hover:scale-105"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
          disabled={reports.length === 0}
        >
          <Download size={16} /> Exporter (JSON)
        </button>
        <button
          onClick={() => setShowImportZone(!showImportZone)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all hover:scale-105"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          <Upload size={16} /> Importer
        </button>
        <label
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all hover:scale-105 cursor-pointer"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          <FileJson size={16} /> Importer fichier
          <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
        </label>
        {reports.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all hover:scale-105 ml-auto"
            style={{ background: "rgba(220,38,38,0.1)", borderColor: "rgba(220,38,38,0.3)", color: "#dc2626" }}
          >
            <Trash2 size={16} /> Tout effacer
          </button>
        )}
      </div>

      {/* Import zone */}
      {showImportZone && (
        <div
          className="rounded-xl p-4 mb-6 border animate-slide-up"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <label className="block text-sm font-semibold mb-2">Coller le JSON à importer</label>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='[{"id":"EC-...","type":"flood",...}] ou {"userReports":[...]}'
            className="w-full px-3 py-2 rounded-lg border outline-none text-xs font-mono min-h-[100px]"
            style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleImport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "var(--accent)", color: "#000" }}
            >
              <Upload size={12} /> Importer
            </button>
            <button
              onClick={() => setShowImportZone(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {importResult && (
        <div
          className="rounded-xl p-3 mb-4 border text-sm"
          style={{
            background: importResult.startsWith("✅") ? "rgba(34,197,94,0.1)" : "rgba(220,38,38,0.1)",
            borderColor: importResult.startsWith("✅") ? "rgba(34,197,94,0.3)" : "rgba(220,38,38,0.3)",
            color: importResult.startsWith("✅") ? "#22c55e" : "#dc2626",
          }}
        >
          {importResult}
        </div>
      )}

      {/* Empty state */}
      {reports.length === 0 ? (
        <div
          className="rounded-2xl p-12 border text-center"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">Aucun signalement pour le moment</h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Quand vous soumettez un signalement, il apparaît ici et persiste dans votre navigateur.
            Vous pouvez ensuite suivre son statut, le modifier ou l'exporter.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold"
            style={{ background: "var(--accent)", color: "#000" }}
          >
            <Send size={18} /> Créer mon premier signalement
          </Link>
        </div>
      ) : (
        <>
          {/* Liste des signalements */}
          <div className="space-y-3">
            {reports.map((r) => {
              const level = RISK_LEVELS[r.riskLevel];
              const typeLabel = REPORT_TYPE_LABELS[r.type];
              return (
                <div
                  key={r.id}
                  className="rounded-xl p-5 border"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{typeLabel.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">{r.title}</div>
                        <div className="text-xs flex items-center gap-2 mt-1" style={{ color: "var(--text-muted)" }}>
                          <MapPin size={10} /> {r.location.neighborhood}, {r.location.city}
                          <Clock size={10} className="ml-2" /> {new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="text-xs mt-1 font-mono" style={{ color: "var(--text-muted)" }}>
                          ID: {r.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="px-2.5 py-1 rounded-md text-xs font-bold border"
                        style={{ background: `${level.color}1a`, color: level.color, borderColor: `${level.color}55` }}
                      >
                        {level.label} · {r.riskScore}/100
                      </div>
                    </div>
                  </div>

                  <div className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                    {r.description}
                  </div>

                  {/* Facteurs IRSE */}
                  {r.riskFactors.length > 0 && (
                    <div className="rounded-lg p-3 border mb-3" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                      <div className="text-xs font-mono mb-2" style={{ color: "var(--text-muted)" }}>FACTEURS DE RISQUE</div>
                      <div className="space-y-1">
                        {r.riskFactors.map((f, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span style={{ color: "var(--text-secondary)" }}>{f.label}: {f.detail}</span>
                            <span className="font-mono" style={{ color: "var(--accent)" }}>+{f.weight.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gestion du statut */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Statut:</span>
                    {(["new", "in_progress", "resolved"] as ReportStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(r.id, s)}
                        className="px-2.5 py-1 rounded text-xs font-semibold transition-all"
                        style={{
                          background: r.status === s ? "var(--accent)" : "var(--surface)",
                          color: r.status === s ? "#000" : "var(--text-secondary)",
                        }}
                      >
                        {s === "new" ? "🆕 Nouveau" : s === "in_progress" ? "🔄 En cours" : "✅ Traité"}
                      </button>
                    ))}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all"
                      style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626" }}
                    >
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              <RefreshCw size={12} /> Rafraîchir
            </button>
          </div>
        </>
      )}

      {/* Info box */}
      <div
        className="mt-8 rounded-xl p-4 border text-sm"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
          <div>
            <div className="font-semibold mb-1">💾 Persistance locale</div>
            <p style={{ color: "var(--text-secondary)" }}>
              Vos signalements sont stockés dans le <strong>localStorage</strong> de votre navigateur.
              Ils persistent entre les sessions sur ce même appareil et navigateur.
              Pour les transférer sur un autre appareil, utilisez <strong>Exporter</strong> puis <strong>Importer</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
