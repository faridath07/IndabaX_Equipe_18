// ============================================================================
// NLP Classifier — Classification automatique des signalements (FR + Fon)
// ============================================================================
// Classifie un texte libre en type de signalement + extrait gravité et lieu.
// Méthode: heuristique basée sur des dictionnaires de mots-clés bilingues.
// Pas de ML, pas d'API externe, 100% client-side, explicable.
// ============================================================================

import type { ReportType } from "../types";

interface ClassificationResult {
  type: ReportType;
  confidence: number;       // 0-1
  matchedKeywords: string[];
  language: "fr" | "fon" | "mixed";
  severity: "low" | "medium" | "high";
  suggestedLocation?: string;
}

// Dictionnaires bilingues FR + Fon (translittération approximative)
const KEYWORDS: Record<ReportType, { fr: string[]; fon: string[] }> = {
  flood: {
    fr: [
      "inondation", "inondé", "inondée", "eau dans la rue", "eau sur la voie",
      "beaucoup d'eau", "montée des eaux", "débordement", "crue", "ruissellement",
      "pluie forte", "eau partout", "voiture inondée", "maison inondée",
    ],
    fon: [
      "mi ɖo gbɛ", "sinn ɖo", "sinn ɖo nu", "mi hɛn", "sinn wlí",
      "jɛ ɖo", "sinn ɖaxo", "sinn ɖo fǐ", "mi wlí xwé",
    ],
  },
  waste: {
    fr: [
      "déchets", "dépôt sauvage", "ordures", "poubelle", "décharge",
      "immondices", "détritus", "tas d'ordures", "déchets sauvages",
      "amoncellement", "déchets brûlés", "brûlage déchets", "décharge sauvage",
    ],
    fon: [
      "amɔ ɖagbe", "amɔ", "ɖagbe ɖo", "amɔ sisi", "amɔ lɛ ɖo",
      "fǐ e nɔ ɖa amɔ", "amɔ ɖaxo lɛ", "ɖagbe lɛ ɖo fǐ",
    ],
  },
  stagnant_water: {
    fr: [
      "eau stagnante", "eaux stagnantes", "flaque", "marre d'eau",
      "eau qui ne coule pas", "eau accumulée", "eau sale",
      "canal bouché", "égout bouché", "eau pourrie",
    ],
    fon: [
      "sinn mɛ", "sinn e ɖo fǐ", "sinn e ma ɖu ɖo",
      "sinn e nɔ ɖo fǐ", "sinn kpe ɖo",
    ],
  },
  insalubrity: {
    fr: [
      "insalubre", "sale", "propreté", "insalubrité",
      "malodorant", "puant", "odeur", "mouches",
      " excréments", "toilettes publiques", "latrines",
    ],
    fon: [
      "fǐ ɖagbe ɖé", "fǐ e ɖo sin", "alɔ ɖagbe",
      "nukún ɖagbe", "nyɔ e nɔ ɖo",
    ],
  },
  other: {
    fr: ["problème", "incident", "autre", "situation", "danger", "préoccupant"],
    fon: ["nyɔ ɖe ɖe", "nyi e ɖo", "klɔ̌ e ɖo"],
  },
};

// Mots-clés de gravité
const SEVERITY_KEYWORDS_HIGH = [
  "urgent", "urgence", "grave", "danger", "critique", "massif", "énorme",
  "beaucoup", "grand", "sévère", "impossible", "victime", "malade",
  // Fon
  "ɖaxo", "huhu", "klɛ", "wɛ", "tɛ tɛ",
];

const SEVERITY_KEYWORDS_MEDIUM = [
  "important", "plusieurs", "depuis hier", "depuis 2 jours", "accumulation",
  "beaucoup", "grand nombre", "fréquent",
];

// Extraction de lieu (noms de villes/quartiers du Bénin)
const BENIN_LOCATIONS: Record<string, { lat: number; lng: number; city: string }> = {
  // Cotonou
  "agla": { lat: 6.3870, lng: 2.4080, city: "Cotonou" },
  "dantokpa": { lat: 6.3650, lng: 2.4180, city: "Cotonou" },
  "akpakpa": { lat: 6.3700, lng: 2.4300, city: "Cotonou" },
  "cadjèhoun": { lat: 6.3580, lng: 2.3850, city: "Cotonou" },
  "jéricho": { lat: 6.3720, lng: 2.4050, city: "Cotonou" },
  "fidjrossè": { lat: 6.3450, lng: 2.3500, city: "Cotonou" },
  "ganhi": { lat: 6.3620, lng: 2.4120, city: "Cotonou" },
  // Abomey-Calavi
  "godomey": { lat: 6.4220, lng: 2.3350, city: "Abomey-Calavi" },
  "calavi": { lat: 6.4480, lng: 2.3550, city: "Abomey-Calavi" },
  "abomey-calavi": { lat: 6.4480, lng: 2.3550, city: "Abomey-Calavi" },
  // Porto-Novo
  "porto-novo": { lat: 6.4960, lng: 2.6050, city: "Porto-Novo" },
  "porto novo": { lat: 6.4960, lng: 2.6050, city: "Porto-Novo" },
  "adjara": { lat: 6.4960, lng: 2.6450, city: "Porto-Novo" },
  // Parakou
  "parakou": { lat: 9.3370, lng: 2.6330, city: "Parakou" },
  "arakou": { lat: 9.3370, lng: 2.6330, city: "Parakou" },
};

export function classifyReport(text: string): ClassificationResult {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  const scores: Record<ReportType, number> = {
    flood: 0, waste: 0, stagnant_water: 0, insalubrity: 0, other: 0,
  };
  let detectedLang: "fr" | "fon" | "mixed" = "fr";
  let fonHit = false;
  let frHit = false;

  // Compter les hits par type
  (Object.keys(KEYWORDS) as ReportType[]).forEach((type) => {
    const dict = KEYWORDS[type];
    dict.fr.forEach((kw) => {
      if (lower.includes(kw)) {
        scores[type]++;
        matched.push(kw);
        frHit = true;
      }
    });
    dict.fon.forEach((kw) => {
      if (lower.includes(kw)) {
        scores[type]++;
        matched.push(kw);
        fonHit = true;
      }
    });
  });

  // Langue détectée
  if (frHit && fonHit) detectedLang = "mixed";
  else if (fonHit) detectedLang = "fon";

  // Type avec le plus de hits
  let bestType: ReportType = "other";
  let bestScore = 0;
  (Object.keys(scores) as ReportType[]).forEach((type) => {
    if (scores[type] > bestScore) {
      bestScore = scores[type];
      bestType = type;
    }
  });

  // Si aucun match, "other"
  if (bestScore === 0) {
    bestType = "other";
  }

  // Confiance (heuristique simple)
  let confidence = Math.min(bestScore / 3, 1);
  if (bestType === "other" && bestScore === 0) confidence = 0.2;

  // Gravité
  let severity: "low" | "medium" | "high" = "low";
  for (const kw of SEVERITY_KEYWORDS_HIGH) {
    if (lower.includes(kw)) {
      severity = "high";
      break;
    }
  }
  if (severity !== "high") {
    for (const kw of SEVERITY_KEYWORDS_MEDIUM) {
      if (lower.includes(kw)) {
        severity = "medium";
        break;
      }
    }
  }

  // Extraction de lieu
  let suggestedLocation: string | undefined;
  for (const [locName] of Object.entries(BENIN_LOCATIONS)) {
    if (lower.includes(locName)) {
      suggestedLocation = locName.charAt(0).toUpperCase() + locName.slice(1);
      break;
    }
  }

  return {
    type: bestType,
    confidence: Math.round(confidence * 100) / 100,
    matchedKeywords: matched,
    language: detectedLang,
    severity,
    suggestedLocation,
  };
}

/**
 * Retourne les coordonnées d'un lieu connu du Bénin.
 */
export function getLocationCoords(name: string): { lat: number; lng: number; city: string } | null {
  const lower = name.toLowerCase().trim();
  return BENIN_LOCATIONS[lower] || null;
}

/**
 * Liste de tous les lieux connus (pour l'autocomplétion).
 */
export function listKnownLocations(): { name: string; city: string; lat: number; lng: number }[] {
  return Object.entries(BENIN_LOCATIONS).map(([name, info]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    city: info.city,
    lat: info.lat,
    lng: info.lng,
  }));
}
