import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Send, Mic, MapPin, Sparkles, Brain, Crosshair, ShieldAlert,
  Check, AlertCircle, Play, Type, Image as ImageIcon,
} from "lucide-react";
import { classifyReport, listKnownLocations, getLocationCoords } from "../lib/classifier";
import { computeIrse } from "../lib/risk-engine";
import { REPORT_TYPE_LABELS, type ReportType, type Report } from "../types";

const DEMO_SCRIPT = "Il y a beaucoup d'eau sur la voie principale à Agla depuis ce matin. Niveau grave, plusieurs maisons inondées. Urgence!";

export default function ReportPage() {
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";

  const [text, setText] = useState(isDemo ? DEMO_SCRIPT : "");
  const [location, setLocation] = useState("");
  const [reporter, setReporter] = useState("");
  const [showVoiceUI, setShowVoiceUI] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  // Auto-run demo scenario
  useEffect(() => {
    if (isDemo && !submitted) {
      const timer = setTimeout(() => handleAnalyze(DEMO_SCRIPT, "Agla"), 800);
      return () => clearTimeout(timer);
    }
  }, [isDemo]);

  const knownLocations = listKnownLocations();
  const [analysis, setAnalysis] = useState<ReturnType<typeof classifyReport> | null>(null);

  function handleAnalyze(textVal: string, locVal?: string) {
    if (!textVal.trim()) return;
    const result = classifyReport(textVal);
    setAnalysis(result);
    if (locVal && !location) setLocation(locVal);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !analysis) return;
    const locCoords = getLocationCoords(location) || { lat: 6.3650, lng: 2.4180, city: "Cotonou" };

    // Compute IRSE for this report (alone, but with realistic factors)
    const tempReport: Report = {
      id: `EC-${Date.now()}`,
      type: analysis.type,
      title: text.slice(0, 60),
      description: text,
      location: {
        city: locCoords.city,
        neighborhood: location || "Non précisé",
        lat: locCoords.lat,
        lng: locCoords.lng,
      },
      date: new Date().toISOString(),
      status: "new",
      reporter: reporter || "Anonyme",
      source: "citizen",
      riskScore: 0,
      riskLevel: "low",
      riskFactors: [],
    };
    const irse = computeIrse([tempReport]);
    tempReport.riskScore = irse.score;
    tempReport.riskLevel = irse.level;
    tempReport.riskFactors = irse.factors;

    setSubmittedReport(tempReport);
    setSubmitted(true);
  }

  function handleVoice() {
    setShowVoiceUI(true);
    // Web Speech API (best-effort — not all browsers support Fon)
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      // Fallback: simulate a Fon sample
      setTimeout(() => {
        setText("Mi ɖo gbɛ to Agla. Sinn ɖaxo. Huhu wɛ.");
        handleAnalyze("Mi ɖo gbɛ to Agla. Sinn ɖaxo. Huhu wɛ.");
        setShowVoiceUI(false);
      }, 1500);
      return;
    }
    const recog = new SR();
    recog.lang = "fr-FR"; // Best-effort
    recog.interimResults = false;
    recog.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setText(transcript);
      handleAnalyze(transcript);
      setShowVoiceUI(false);
    };
    recog.onerror = () => setShowVoiceUI(false);
    recog.onend = () => setShowVoiceUI(false);
    recog.start();
  }

  if (submitted && submittedReport) {
    return <ReportSuccess report={submittedReport} onReset={() => {
      setSubmitted(false);
      setText("");
      setLocation("");
      setReporter("");
      setAnalysis(null);
    }} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
          Signalement citoyen
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Signaler un problème environnemental</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Décrivez ce que vous voyez. Notre IA classifie le signalement et calcule le niveau de risque.
        </p>
      </div>

      {/* Pipeline visuel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
        {[
          { icon: Type, label: "Texte", color: "#22c55e" },
          { icon: Mic, label: "Voix FR/Fon", color: "#06b6d4" },
          { icon: Brain, label: "IA Classifie", color: "#a78bfa" },
          { icon: ShieldAlert, label: "IRSE", color: "#f97316" },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-xl p-3 border flex flex-col items-center gap-1"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}22`, color: s.color }}>
              <s.icon size={18} />
            </div>
            <div className="text-xs font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {isDemo && (
        <div
          className="rounded-xl p-4 mb-6 border flex items-center gap-3 animate-slide-up"
          style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.3)" }}
        >
          <Play size={18} className="text-green-500 flex-shrink-0" />
          <div className="text-sm">
            <strong>Mode démo activé.</strong> Un signalement type est pré-rempli pour montrer le flux complet.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Zone de texte + voix */}
        <div>
          <label className="block text-sm font-semibold mb-2">Décrivez le problème</label>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (analysis) setAnalysis(null);
              }}
              placeholder="Ex: Il y a beaucoup d'eau dans la rue à Agla depuis hier, plusieurs maisons inondées..."
              className="w-full px-4 py-3 bg-transparent outline-none resize-none min-h-[120px] text-sm"
              style={{ color: "var(--text)" }}
            />
            <div className="flex items-center justify-between px-3 py-2 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={handleVoice}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                style={{ background: "var(--surface)", color: "var(--accent)" }}
              >
                <Mic size={14} />
                {showVoiceUI ? "Écoute..." : "Signalement vocal"}
              </button>
              <button
                type="button"
                onClick={() => handleAnalyze(text, location)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                style={{ background: "var(--accent)", color: "#000" }}
                disabled={!text.trim()}
              >
                <Sparkles size={14} />
                Analyser avec l'IA
              </button>
            </div>
          </div>
        </div>

        {/* Résultat analyse IA */}
        {analysis && (
          <div
            className="rounded-xl p-5 border animate-slide-up"
            style={{ background: "var(--bg-card)", borderColor: "var(--accent)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} style={{ color: "var(--accent)" }} />
              <span className="text-sm font-semibold">Analyse IA</span>
              <span
                className="ml-auto px-2 py-0.5 rounded text-xs font-mono"
                style={{ background: "var(--surface)", color: "var(--text-muted)" }}
              >
                Confiance: {Math.round(analysis.confidence * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">{REPORT_TYPE_LABELS[analysis.type].icon}</div>
              <div>
                <div className="font-bold text-base">{REPORT_TYPE_LABELS[analysis.type].fr}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Fon: {REPORT_TYPE_LABELS[analysis.type].fon} · Langue détectée: {analysis.language.toUpperCase()}
                </div>
              </div>
            </div>
            {analysis.matchedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {analysis.matchedKeywords.slice(0, 5).map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-xs font-mono"
                    style={{ background: "var(--surface)", color: "var(--accent-light)" }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
            {analysis.severity !== "low" && (
              <div className="text-xs flex items-center gap-1" style={{ color: analysis.severity === "high" ? "#dc2626" : "#fbbf24" }}>
                <AlertCircle size={12} />
                Gravité: {analysis.severity === "high" ? "Élevée" : "Moyenne"}
              </div>
            )}
            {analysis.suggestedLocation && !location && (
              <button
                type="button"
                onClick={() => setLocation(analysis.suggestedLocation!)}
                className="mt-3 text-xs flex items-center gap-1 px-2 py-1 rounded"
                style={{ background: "var(--surface)", color: "var(--accent)" }}
              >
                <MapPin size={12} /> Lieu détecté: {analysis.suggestedLocation} (cliquer pour utiliser)
              </button>
            )}
          </div>
        )}

        {/* Localisation */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Localisation</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              list="known-locations"
              placeholder="Quartier ou ville (ex: Agla, Dantokpa, Godomey)"
              className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text)" }}
            />
            <datalist id="known-locations">
              {knownLocations.map((l) => (
                <option key={l.name} value={l.name}>
                  {l.city}
                </option>
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Votre nom (optionnel)</label>
            <input
              type="text"
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
              placeholder="Anonyme par défaut"
              className="w-full px-4 py-2.5 rounded-lg border outline-none text-sm"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
        </div>

        {/* Photo (placeholder, sans upload réel) */}
        <div>
          <label className="block text-sm font-semibold mb-2">Photo (optionnel)</label>
          <div
            className="rounded-lg border-2 border-dashed p-4 text-center text-sm cursor-pointer"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            onClick={() => alert("Upload photo — démo: fonctionnalité à venir")}
          >
            <ImageIcon size={20} className="mx-auto mb-1" />
            Cliquez pour ajouter une photo (démo)
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.01]"
          style={{ background: "var(--accent)", color: "#000" }}
          disabled={!text.trim() || !analysis}
        >
          <Send size={18} />
          Envoyer le signalement
        </button>

        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          En envoyant, vous acceptez que ce signalement (anonymisé) apparaisse sur la carte de démonstration.
        </p>
      </form>
    </div>
  );
}

function ReportSuccess({ report, onReset }: { report: Report; onReset: () => void }) {
  const level = report.riskLevel;
  const colors = {
    low: "#22c55e", moderate: "#eab308", high: "#f97316", critical: "#dc2626",
  };
  const labels = {
    low: "Faible", moderate: "Modéré", high: "Élevé", critical: "Critique",
  };
  const color = colors[level];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div
        className="rounded-2xl p-8 border text-center mb-6"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{ background: `${color}22`, color }}
        >
          <Check size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Signalement reçu!</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          ID: <code className="font-mono" style={{ color: "var(--accent)" }}>{report.id}</code>
        </p>
      </div>

      <div
        className="rounded-2xl p-6 border mb-6"
        style={{ background: "var(--bg-card)", borderColor: level === "low" ? "var(--border)" : color }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold">IRSE — Indice de Risque Sanitaire Environnemental</div>
          <div className="px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: `${color}1a`, color }}>
            {labels[level]}
          </div>
        </div>
        <div className="flex items-end gap-2 mb-3">
          <div className="text-5xl font-black" style={{ color }}>{report.riskScore}</div>
          <div className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>/ 100</div>
        </div>
        <div className="w-full h-2 rounded-full mb-4" style={{ background: "var(--surface)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${report.riskScore}%`, background: color }} />
        </div>
        <div className="space-y-2 text-sm">
          {report.riskFactors.map((f, i) => (
            <div key={i} className="flex justify-between items-start gap-3 py-1.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="font-medium">{f.label}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{f.detail}</div>
              </div>
              <div className="font-mono text-xs" style={{ color: "var(--accent)" }}>
                +{f.weight.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link
          to="/map"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold"
          style={{ background: "var(--accent)", color: "#000" }}
        >
          <MapPin size={18} /> Voir sur la carte
        </Link>
        <Link
          to="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          <Crosshair size={18} /> Dashboard
        </Link>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          <Send size={18} /> Nouveau
        </button>
      </div>
    </div>
  );
}
