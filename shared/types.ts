// ============================================================================
// EcosIA — Types partagés
// ============================================================================

export type ReportType =
  | "flood"           // Inondation
  | "waste"           // Déchets / dépôts sauvages
  | "stagnant_water"  // Eaux stagnantes
  | "insalubrity"     // Zone insalubre
  | "other";          // Autre

export type ReportStatus = "new" | "in_progress" | "resolved";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  location: {
    city: string;
    neighborhood: string;
    lat: number;
    lng: number;
  };
  date: string;        // ISO 8601
  status: ReportStatus;
  reporter: string;    // "Anonyme" ou nom
  source: "citizen" | "demo" | "ai";
  // Données enrichies par le Risk Engine
  riskScore: number;   // 0-100
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
}

export interface RiskFactor {
  label: string;
  weight: number;      // contribution au score
  detail: string;
}

// Groupement géographique pour le calcul de risque par zone
export interface ZoneRisk {
  zone: string;        // ex: "Cotonou — Agla"
  city: string;
  lat: number;
  lng: number;
  totalReports: number;
  byType: Record<ReportType, number>;
  irse: number;         // 0-100
  level: RiskLevel;
  factors: RiskFactor[];
  recentTrend: number[]; // 7 derniers jours (nombre de signalements)
}

export const REPORT_TYPE_LABELS: Record<ReportType, { fr: string; fon: string; icon: string }> = {
  flood: { fr: "Inondation", fon: "Mi ɖo gbɛ", icon: "🌊" },
  waste: { fr: "Déchets / Dépôt sauvage", fon: "Amɔ ɖagbe", icon: "🗑️" },
  stagnant_water: { fr: "Eaux stagnantes", fon: "Sinn mɛ", icon: "💧" },
  insalubrity: { fr: "Zone insalubre", fon: "Fǐ ɖagbe ɖé", icon: "⚠️" },
  other: { fr: "Autre problème", fon: "Nyɔ ɖe ɖe", icon: "📌" },
};

export const RISK_LEVELS: Record<RiskLevel, { label: string; color: string; bg: string; min: number; max: number }> = {
  low: { label: "Faible", color: "#22c55e", bg: "bg-green-500/10 text-green-600 border-green-500/30", min: 0, max: 24 },
  moderate: { label: "Modéré", color: "#eab308", bg: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", min: 25, max: 49 },
  high: { label: "Élevé", color: "#f97316", bg: "bg-orange-500/10 text-orange-600 border-orange-500/30", min: 50, max: 74 },
  critical: { label: "Critique", color: "#dc2626", bg: "bg-red-500/10 text-red-600 border-red-500/30", min: 75, max: 100 },
};

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "moderate";
  return "low";
}
