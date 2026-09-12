// ============================================================================
// Risk Engine — Indice de Risque Sanitaire Environnemental (IRSE)
// ============================================================================
// Score 0-100 basé sur des facteurs explicables :
//   1. Volume de signalements par type (poids par type)
//   2. Récence des signalements (plus récent = plus de poids)
//   3. Densité spatiale (signalements proches = risque concentré)
//   4. Répétition (plusieurs incidents du même type = effet cumulatif)
//   5. Gravité perçue (selon les mots-clés dans la description)
//
// IMPORTANT : ce n'est PAS un modèle de Machine Learning.
// C'est un score heuristique explicable, déterministe et reproductible.
// ============================================================================

import type { Report, ReportType, RiskFactor, RiskLevel } from "../types";
import { getRiskLevel } from "../types";

// Poids par type de signalement (somme = 1.0)
const TYPE_WEIGHTS: Record<ReportType, number> = {
  flood: 0.35,           // Inondations → eaux stagnantes → moustiques → paludisme
  waste: 0.25,           // Déchets → insalubrité → choléra
  stagnant_water: 0.25,  // Eaux stagnantes → direct moustiques
  insalubrity: 0.10,     // Zone insalubre
  other: 0.05,           // Autre
};

// Période de référence pour la récence (7 jours)
const RECENCY_DAYS = 7;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Mots-clés de gravité (langue: fr + fon)
const GRAVITY_KEYWORDS = [
  // Français
  "grave", "important", "beaucoup", "énorme", "grand", "importante",
  "urgence", "critique", "massif", "sévère", "danger",
  // Fon (translittération)
  "huhu", "klɛ", "ɖaxo", "wɛ",
];

export interface IrseResult {
  score: number;          // 0-100
  level: RiskLevel;
  factors: RiskFactor[];
}

/**
 * Calcule l'IRSE pour une zone (groupe de signalements proches).
 *
 * @param reports Liste des signalements de la zone
 * @param now Timestamp de référence (défaut: maintenant)
 */
export function computeIrse(reports: Report[], now: Date = new Date()): IrseResult {
  if (!reports.length) {
    return {
      score: 0,
      level: "low",
      factors: [{ label: "Aucun signalement", weight: 0, detail: "Pas de signal environnemental détecté dans cette zone." }],
    };
  }

  const factors: RiskFactor[] = [];

  // 1. Volume pondéré par type (max théorique: ~50 points si tous types à saturation)
  const typeCounts: Record<ReportType, number> = {
    flood: 0, waste: 0, stagnant_water: 0, insalubrity: 0, other: 0,
  };
  for (const r of reports) {
    typeCounts[r.type]++;
  }

  // Score de volume: 10 signalements d'un type à plein poids = 50 points
  const VOLUME_MAX_PER_TYPE = 10;
  let volumeScore = 0;
  const volumeDetails: string[] = [];
  (Object.keys(typeCounts) as ReportType[]).forEach((type) => {
    if (typeCounts[type] > 0) {
      const typeScore = Math.min(typeCounts[type] / VOLUME_MAX_PER_TYPE, 1) * TYPE_WEIGHTS[type] * 100;
      volumeScore += typeScore;
      const label = typeLabel(type);
      volumeDetails.push(`${typeCounts[type]} ${label}`);
    }
  });
  factors.push({
    label: "Volume de signalements",
    weight: Math.round(volumeScore * 100) / 100,
    detail: volumeDetails.join(", "),
  });

  // 2. Récence (poids max: 20 points)
  // Un signalement < 24h = plein poids; > 7 jours = 0
  const nowMs = now.getTime();
  let recencyScore = 0;
  let recentCount = 0;
  for (const r of reports) {
    const ageDays = (nowMs - new Date(r.date).getTime()) / MS_PER_DAY;
    if (ageDays <= RECENCY_DAYS) {
      const weight = 1 - (ageDays / RECENCY_DAYS); // décroissance linéaire
      recencyScore += weight;
      if (ageDays <= 1) recentCount++;
    }
  }
  // Normaliser: 5 signalements récents = 20 points
  recencyScore = Math.min(recencyScore / 5, 1) * 20;
  factors.push({
    label: "Récence des incidents",
    weight: Math.round(recencyScore * 100) / 100,
    detail: recentCount > 0
      ? `${recentCount} signalement(s) dans les dernières 24h`
      : "Aucun signalement récent (24h)",
  });

  // 3. Densité spatiale (poids max: 15 points)
  // Calcul de la dispersion moyenne des signalements
  const coords = reports.map(r => ({ lat: r.location.lat, lng: r.location.lng }));
  const centroid = {
    lat: coords.reduce((s, c) => s + c.lat, 0) / coords.length,
    lng: coords.reduce((s, c) => s + c.lng, 0) / coords.length,
  };
  const distances = coords.map(c => haversine(c.lat, c.lng, centroid.lat, centroid.lng));
  const avgDistance = distances.reduce((s, d) => s + d, 0) / distances.length; // km
  // Distance < 1 km = forte densité (15 points); > 5 km = faible
  const densityScore = Math.max(0, Math.min(1, (5 - avgDistance) / 4)) * 15;
  factors.push({
    label: "Densité spatiale",
    weight: Math.round(densityScore * 100) / 100,
    detail: avgDistance < 1
      ? "Signalements concentrés dans un rayon < 1 km"
      : avgDistance < 3
        ? `Dispersion modérée (~${avgDistance.toFixed(1)} km)`
        : `Signalements dispersés (~${avgDistance.toFixed(1)} km)`,
  });

  // 4. Répétition / persistance (poids max: 10 points)
  // Compter les types avec >= 3 occurrences
  const repeatedTypes = (Object.keys(typeCounts) as ReportType[]).filter(t => typeCounts[t] >= 3);
  const repetitionScore = Math.min(repeatedTypes.length / 2, 1) * 10;
  factors.push({
    label: "Persistance du problème",
    weight: Math.round(repetitionScore * 100) / 100,
    detail: repeatedTypes.length > 0
      ? `${repeatedTypes.length} type(s) récurrent(s) (≥ 3 occurrences)`
      : "Pas de répétition détectée",
  });

  // 5. Gravité perçue via mots-clés (poids max: 5 points)
  let gravityMatches = 0;
  for (const r of reports) {
    const lowerDesc = r.description.toLowerCase();
    for (const kw of GRAVITY_KEYWORDS) {
      if (lowerDesc.includes(kw)) {
        gravityMatches++;
        break;
      }
    }
  }
  const gravityScore = Math.min(gravityMatches / 3, 1) * 5;
  factors.push({
    label: "Gravité perçue",
    weight: Math.round(gravityScore * 100) / 100,
    detail: gravityMatches > 0
      ? `${gravityMatches} signalement(s) avec mots-clés de gravité`
      : "Descriptions sans indice de gravité particulière",
  });

  // Score total (plafonné à 100)
  const totalScore = Math.min(100, Math.max(0, volumeScore + recencyScore + densityScore + repetitionScore + gravityScore));
  const roundedScore = Math.round(totalScore);

  return {
    score: roundedScore,
    level: getRiskLevel(roundedScore),
    factors,
  };
}

function typeLabel(type: ReportType): string {
  const labels: Record<ReportType, string> = {
    flood: "inondations",
    waste: "dépôts de déchets",
    stagnant_water: "eaux stagnantes",
    insalubrity: "zones insalubres",
    other: "autres",
  };
  return labels[type];
}

// Formule de Haversine (distance en km entre 2 coordonnées)
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Génère une explication lisible du risque pour une zone.
 */
export function explainRisk(result: IrseResult): string {
  const parts: string[] = [];
  for (const f of result.factors) {
    if (f.weight > 0) {
      parts.push(`${f.label}: ${f.detail} (+${f.weight.toFixed(1)} pts)`);
    }
  }
  return parts.join("\n");
}
