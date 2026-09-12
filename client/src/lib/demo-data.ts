// ============================================================================
// Dataset de démonstration — signalements citoyens (données fictives)
// ============================================================================
// IMPORTANT: ce sont des données fictives pour la démonstration hackathon.
// Elles sont clairement marquées comme "demo" et ne proviennent pas de citoyens réels.
// ============================================================================

import type { Report } from "../types";
import { computeIrse } from "../lib/risk-engine";

const now = new Date();

function daysAgo(days: number, hours = 0): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

interface RawReport {
  id: string;
  type: Report["type"];
  title: string;
  description: string;
  location: Report["location"];
  date: string;
  status: Report["status"];
  reporter: string;
  source: Report["source"];
}

const rawReports: RawReport[] = [
  // ============================================================================
  // COTONOU — Agla (zone à risque critique)
  // ============================================================================
  {
    id: "EC-1048",
    type: "flood",
    title: "Inondation voie principale Agla",
    description: "Il y a beaucoup d'eau sur la voie principale à Agla depuis ce matin. Niveau grave, plusieurs maisons inondées. Urgence!",
    location: { city: "Cotonou", neighborhood: "Agla", lat: 6.3870, lng: 2.4080 },
    date: daysAgo(0, 2),
    status: "new",
    reporter: "Aïcha K.",
    source: "demo",
  },
  {
    id: "EC-1049",
    type: "flood",
    title: "Eau dans la rue à Agla",
    description: "Inondation depuis hier soir, l'eau ne coule pas, accumulation importante.",
    location: { city: "Cotonou", neighborhood: "Agla", lat: 6.3865, lng: 2.4085 },
    date: daysAgo(0, 14),
    status: "new",
    reporter: "Anonyme",
    source: "demo",
  },
  {
    id: "EC-1050",
    type: "stagnant_water",
    title: "Eau stagnante Agla",
    description: "Eaux stagnantes partout dans le quartier d'Agla, moustiques nombreux.",
    location: { city: "Cotonou", neighborhood: "Agla", lat: 6.3875, lng: 2.4070 },
    date: daysAgo(1),
    status: "new",
    reporter: "Benoît A.",
    source: "demo",
  },
  {
    id: "EC-1051",
    type: "waste",
    title: "Dépôt sauvage Agla",
    description: "Dépôt sauvage d'ordures en bordure de la voie. Tas important d'immondices.",
    location: { city: "Cotonou", neighborhood: "Agla", lat: 6.3868, lng: 2.4090 },
    date: daysAgo(1, 6),
    status: "in_progress",
    reporter: "Anonyme",
    source: "demo",
  },
  {
    id: "EC-1052",
    type: "flood",
    title: "Récidive inondation Agla",
    description: "Encore une inondation à Agla, c'est la 3ème fois ce mois. Gravité importante.",
    location: { city: "Cotonou", neighborhood: "Agla", lat: 6.3872, lng: 2.4082 },
    date: daysAgo(2),
    status: "new",
    reporter: "Mariam S.",
    source: "demo",
  },

  // ============================================================================
  // COTONOU — Dantokpa (risque élevé)
  // ============================================================================
  {
    id: "EC-1047",
    type: "waste",
    title: "Déchets brûlés Dantokpa",
    description: "Les déchets s'accumulent derrière le marché Dantokpa et sont brûlés. Fumée importante et odeur.",
    location: { city: "Cotonou", neighborhood: "Dantokpa", lat: 6.3650, lng: 2.4180 },
    date: daysAgo(0, 5),
    status: "in_progress",
    reporter: "Anonyme",
    source: "demo",
  },
  {
    id: "EC-1046",
    type: "waste",
    title: "Tas d'ordures Dantokpa",
    description: "Tas énorme d'ordures près de l'entrée du marché. Insalubrité critique.",
    location: { city: "Cotonou", neighborhood: "Dantokpa", lat: 6.3655, lng: 2.4185 },
    date: daysAgo(1, 3),
    status: "new",
    reporter: "Commerçant Dantokpa",
    source: "demo",
  },
  {
    id: "EC-1045",
    type: "insalubrity",
    title: "Zone insalubre Dantokpa",
    description: "Zone très sale avec beaucoup de mouches. Risque sanitaire élevé pour les commerçants.",
    location: { city: "Cotonou", neighborhood: "Dantokpa", lat: 6.3645, lng: 2.4175 },
    date: daysAgo(2, 8),
    status: "in_progress",
    reporter: "Anonyme",
    source: "demo",
  },
  {
    id: "EC-1044",
    type: "stagnant_water",
    title: "Eaux stagnantes Dantokpa",
    description: "Eaux stagnantes dans les caniveaux du marché. Beaucoup de moustiques.",
    location: { city: "Cotonou", neighborhood: "Dantokpa", lat: 6.3658, lng: 2.4190 },
    date: daysAgo(3),
    status: "new",
    reporter: "Vendeuse Dantokpa",
    source: "demo",
  },

  // ============================================================================
  // ABOMEY-CALAVI — Godomey (risque modéré)
  // ============================================================================
  {
    id: "EC-1043",
    type: "waste",
    title: "Dépôt Godomey marché",
    description: "Déchets sauvages derrière le marché de Godomey. Accumulation importante depuis quelques jours.",
    location: { city: "Abomey-Calavi", neighborhood: "Godomey", lat: 6.4220, lng: 2.3350 },
    date: daysAgo(1, 10),
    status: "new",
    reporter: "Anonyme",
    source: "demo",
  },
  {
    id: "EC-1042",
    type: "flood",
    title: "Inondation Godomey",
    description: "Eau sur la voie à Godomey après la pluie d'hier. Pas très grave mais persistante.",
    location: { city: "Abomey-Calavi", neighborhood: "Godomey", lat: 6.4225, lng: 2.3355 },
    date: daysAgo(2, 4),
    status: "in_progress",
    reporter: "Emmanuel D.",
    source: "demo",
  },
  {
    id: "EC-1041",
    type: "stagnant_water",
    title: "Flaque Godomey",
    description: "Flaque d'eau stagnante près de l'arrêt de bus. Eau sale qui ne s'évacue pas.",
    location: { city: "Abomey-Calavi", neighborhood: "Godomey", lat: 6.4215, lng: 2.3345 },
    date: daysAgo(3, 6),
    status: "resolved",
    reporter: "Anonyme",
    source: "demo",
  },

  // ============================================================================
  // PORTO-NOVO (risque modéré)
  // ============================================================================
  {
    id: "EC-1040",
    type: "flood",
    title: "Inondation Porto-Novo centre",
    description: "Inondation dans le centre de Porto-Novo après la forte pluie. Plusieurs rues coupées.",
    location: { city: "Porto-Novo", neighborhood: "Centre", lat: 6.4960, lng: 2.6050 },
    date: daysAgo(2, 8),
    status: "new",
    reporter: "Rachidi M.",
    source: "demo",
  },
  {
    id: "EC-1039",
    type: "waste",
    title: "Déchets Porto-Novo",
    description: "Dépôt d'ordures sauvage près du grand marché. Accumulation importante.",
    location: { city: "Porto-Novo", neighborhood: "Centre", lat: 6.4955, lng: 2.6045 },
    date: daysAgo(4),
    status: "in_progress",
    reporter: "Anonyme",
    source: "demo",
  },
  {
    id: "EC-1038",
    type: "stagnant_water",
    title: "Eaux stagnantes Adjara",
    description: "Eaux stagnantes à Adjara, moustiques très nombreux le soir.",
    location: { city: "Porto-Novo", neighborhood: "Adjara", lat: 6.4960, lng: 2.6450 },
    date: daysAgo(5),
    status: "new",
    reporter: "Fati A.",
    source: "demo",
  },

  // ============================================================================
  // PARAKOU (risque faible à modéré)
  // ============================================================================
  {
    id: "EC-1037",
    type: "waste",
    title: "Dépôt Parakou",
    description: "Tas de déchets près de la gare de Parakou. Situation à surveiller.",
    location: { city: "Parakou", neighborhood: "Centre", lat: 9.3370, lng: 2.6330 },
    date: daysAgo(4, 5),
    status: "in_progress",
    reporter: "Issa B.",
    source: "demo",
  },
  {
    id: "EC-1036",
    type: "stagnant_water",
    title: "Canal bouché Parakou",
    description: "Canal d'évacuation bouché, eau stagnante en amont. À nettoyer rapidement.",
    location: { city: "Parakou", neighborhood: "Centre", lat: 9.3375, lng: 2.6335 },
    date: daysAgo(6),
    status: "resolved",
    reporter: "Anonyme",
    source: "demo",
  },

  // ============================================================================
  // COTONOU — Cadjèhoun (risque faible)
  // ============================================================================
  {
    id: "EC-1035",
    type: "waste",
    title: "Poubelle débordée Cadjèhoun",
    description: "Poubelle publique débordée depuis 2 jours. Pas très grave mais à ramasser.",
    location: { city: "Cotonou", neighborhood: "Cadjèhoun", lat: 6.3580, lng: 2.3850 },
    date: daysAgo(3, 2),
    status: "new",
    reporter: "Anonyme",
    source: "demo",
  },
  {
    id: "EC-1034",
    type: "other",
    title: "Odeur suspecte Cadjèhoun",
    description: "Odeur suspecte près du canal. Pas d'eau visible mais odeur persistante.",
    location: { city: "Cotonou", neighborhood: "Cadjèhoun", lat: 6.3575, lng: 2.3855 },
    date: daysAgo(5, 8),
    status: "resolved",
    reporter: "Honoré K.",
    source: "demo",
  },

  // ============================================================================
  // COTONOU — Fidjrossè (risque faible)
  // ============================================================================
  {
    id: "EC-1033",
    type: "waste",
    title: "Déchets plage Fidjrossè",
    description: "Déchets accumulés sur la plage de Fidjrossè. Impact touristique.",
    location: { city: "Cotonou", neighborhood: "Fidjrossè", lat: 6.3450, lng: 2.3500 },
    date: daysAgo(6),
    status: "in_progress",
    reporter: "Anonyme",
    source: "demo",
  },
  {
    id: "EC-1032",
    type: "stagnant_water",
    title: "Mare Fidjrossè",
    description: "Petite mare d'eau stagnante près de la plage. Pas très étendue.",
    location: { city: "Cotonou", neighborhood: "Fidjrossè", lat: 6.3445, lng: 2.3505 },
    date: daysAgo(7),
    status: "resolved",
    reporter: "Plagiste",
    source: "demo",
  },
];

/**
 * Génère le dataset complet de signalements de démonstration avec scores IRSE calculés.
 */
export function generateDemoReports(): Report[] {
  return rawReports.map((r) => {
    // Calculer le score IRSE par signalement (en regardant les signalements proches)
    const nearby = rawReports.filter((other) => {
      if (other.id === r.id) return false;
      const dx = other.location.lat - r.location.lat;
      const dy = other.location.lng - r.location.lng;
      return Math.sqrt(dx * dx + dy * dy) < 0.01; // ~1 km
    });
    const allForZone = [r, ...nearby];
    const irse = computeIrse(allForZone as Report[]);

    return {
      ...r,
      riskScore: irse.score,
      riskLevel: irse.level,
      riskFactors: irse.factors,
    } as Report;
  });
}

/**
 * Regroupe les signalements par zone géographique et calcule l'IRSE par zone.
 */
export function computeZoneRisks(reports: Report[]): ZoneRiskGroup[] {
  // Grouper par ville + quartier
  const groups = new Map<string, Report[]>();
  for (const r of reports) {
    const key = `${r.location.city} — ${r.location.neighborhood}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const results: ZoneRiskGroup[] = [];
  for (const [zone, zoneReports] of groups) {
    const irse = computeIrse(zoneReports);
    // Tendance 7 jours
    const trend: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = zoneReports.filter((r) => {
        const d = new Date(r.date);
        return d >= dayStart && d < dayEnd;
      }).length;
      trend.push(count);
    }
    results.push({
      zone,
      city: zoneReports[0].location.city,
      lat: zoneReports[0].location.lat,
      lng: zoneReports[0].location.lng,
      totalReports: zoneReports.length,
      byType: countByType(zoneReports),
      irse: irse.score,
      level: irse.level,
      factors: irse.factors,
      recentTrend: trend,
    });
  }

  // Trier par IRSE décroissant
  return results.sort((a, b) => b.irse - a.irse);
}

interface ZoneRiskGroup {
  zone: string;
  city: string;
  lat: number;
  lng: number;
  totalReports: number;
  byType: Record<string, number>;
  irse: number;
  level: string;
  factors: any[];
  recentTrend: number[];
}

function countByType(reports: Report[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of reports) {
    counts[r.type] = (counts[r.type] || 0) + 1;
  }
  return counts;
}
