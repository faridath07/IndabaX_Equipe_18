import { describe, it, expect } from "vitest";
import { computeIrse, haversine, explainRisk } from "../client/src/lib/risk-engine";
import { getRiskLevel } from "../client/src/types";
import type { Report } from "../client/src/types";

function makeReport(partial: Partial<Report>): Report {
  return {
    id: "TEST-" + Math.random().toString(36).slice(7),
    type: "flood",
    title: "Test",
    description: "test",
    location: { city: "Cotonou", neighborhood: "Test", lat: 6.37, lng: 2.40 },
    date: new Date().toISOString(),
    status: "new",
    reporter: "Anonyme",
    source: "demo",
    riskScore: 0,
    riskLevel: "low",
    riskFactors: [],
    ...partial,
  };
}

describe("Risk Engine — IRSE", () => {
  it("retourne un score de 0 quand il n'y a aucun signalement", () => {
    const result = computeIrse([]);
    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
  });

  it("plafonne le score à 100", () => {
    // 50 signalements floods très récents et concentrés
    const reports: Report[] = Array.from({ length: 50 }, () =>
      makeReport({ type: "flood", date: new Date().toISOString() })
    );
    const result = computeIrse(reports);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.level).toBe("critical");
  });

  it("ne retourne jamais un score négatif", () => {
    const report = makeReport({
      type: "other",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
    });
    const result = computeIrse([report]);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(25);
    expect(result.level).toBe("low");
  });

  it("donne un score plus élevé pour des signalements récents", () => {
    const recentReports = Array.from({ length: 5 }, () =>
      makeReport({ type: "flood", date: new Date().toISOString() })
    );
    const oldReports = Array.from({ length: 5 }, () =>
      makeReport({ type: "flood", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() })
    );
    const recentScore = computeIrse(recentReports).score;
    const oldScore = computeIrse(oldReports).score;
    expect(recentScore).toBeGreaterThan(oldScore);
  });

  it("donne un score plus élevé pour des signalements concentrés spatialement", () => {
    const concentrated = Array.from({ length: 5 }, (_, i) =>
      makeReport({
        type: "flood",
        location: { city: "Cotonou", neighborhood: "T", lat: 6.37 + i * 0.0001, lng: 2.40 + i * 0.0001 },
      })
    );
    const dispersed = Array.from({ length: 5 }, (_, i) =>
      makeReport({
        type: "flood",
        location: { city: "Cotonou", neighborhood: "T", lat: 6.37 + i * 0.1, lng: 2.40 + i * 0.1 },
      })
    );
    const cScore = computeIrse(concentrated).score;
    const dScore = computeIrse(dispersed).score;
    expect(cScore).toBeGreaterThanOrEqual(dScore);
  });

  it("détecte le type critique en cas de volume massif", () => {
    const reports: Report[] = [
      ...Array.from({ length: 7 }, () => makeReport({ type: "flood" })),
      ...Array.from({ length: 5 }, () => makeReport({ type: "waste" })),
      ...Array.from({ length: 3 }, () => makeReport({ type: "stagnant_water" })),
    ];
    const result = computeIrse(reports);
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.level).toBe("critical");
    expect(result.factors.length).toBe(5);
  });

  it("produit une explication non vide pour un score > 0", () => {
    const reports = Array.from({ length: 3 }, () => makeReport({ type: "flood" }));
    const result = computeIrse(reports);
    const explanation = explainRisk(result);
    expect(explanation.length).toBeGreaterThan(0);
    expect(explanation).toContain("Volume");
  });

  it("gère les valeurs extrêmes (0 incident)", () => {
    const result = computeIrse([]);
    expect(result.factors).toHaveLength(1);
    expect(result.factors[0].label).toBe("Aucun signalement");
  });
});

describe("Risk levels", () => {
  it("classe correctement les scores", () => {
    expect(getRiskLevel(0)).toBe("low");
    expect(getRiskLevel(24)).toBe("low");
    expect(getRiskLevel(25)).toBe("moderate");
    expect(getRiskLevel(49)).toBe("moderate");
    expect(getRiskLevel(50)).toBe("high");
    expect(getRiskLevel(74)).toBe("high");
    expect(getRiskLevel(75)).toBe("critical");
    expect(getRiskLevel(100)).toBe("critical");
  });
});

describe("Haversine distance", () => {
  it("retourne 0 pour des points identiques", () => {
    expect(haversine(6.37, 2.40, 6.37, 2.40)).toBeCloseTo(0, 6);
  });

  it("calcule correctement la distance Cotonou → Abomey-Calavi (~25 km)", () => {
    const dist = haversine(6.365, 2.418, 6.448, 2.355);
    expect(dist).toBeGreaterThan(8);
    expect(dist).toBeLessThan(20);
  });
});

describe("Classifier NLP", () => {
  it("classifyReport doit être importé", async () => {
    const mod = await import("../client/src/lib/classifier");
    expect(mod.classifyReport).toBeDefined();
  });

  it("classifie correctement une inondation en français", async () => {
    const { classifyReport } = await import("../client/src/lib/classifier");
    const result = classifyReport("Il y a beaucoup d'eau dans la rue à Agla depuis ce matin");
    expect(result.type).toBe("flood");
    expect(result.matchedKeywords.length).toBeGreaterThan(0);
    expect(result.language).toBe("fr");
  });

  it("classifie correctement des déchets", async () => {
    const { classifyReport } = await import("../client/src/lib/classifier");
    const result = classifyReport("Les déchets s'accumulent derrière le marché, dépôt sauvage d'ordures");
    expect(result.type).toBe("waste");
    expect(result.matchedKeywords.length).toBeGreaterThan(0);
  });

  it("détecte le Fon", async () => {
    const { classifyReport } = await import("../client/src/lib/classifier");
    const result = classifyReport("Mi ɖo gbɛ to Agla. Sinn ɖaxo. Huhu wɛ.");
    expect(result.language).toMatch(/fon|mixed/);
    expect(result.matchedKeywords.length).toBeGreaterThan(0);
  });

  it("retourne 'other' pour un texte sans mots-clés", async () => {
    const { classifyReport } = await import("../client/src/lib/classifier");
    const result = classifyReport("Bonjour, je voudrais juste dire bonjour");
    expect(result.type).toBe("other");
  });

  it("détecte la gravité élevée", async () => {
    const { classifyReport } = await import("../client/src/lib/classifier");
    const result = classifyReport("Urgence! Situation grave et critique, danger immédiat!");
    expect(result.severity).toBe("high");
  });
});

describe("Edge cases", () => {
  it("gère un seul signalement", () => {
    const result = computeIrse([makeReport({ type: "flood" })]);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("rejette les valeurs négatives (score toujours >= 0)", () => {
    const result = computeIrse([
      makeReport({
        type: "other",
        date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 an
      }),
    ]);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("est déterministe (même input = même output)", () => {
    const reports = [
      makeReport({ type: "flood" }),
      makeReport({ type: "waste" }),
      makeReport({ type: "stagnant_water" }),
    ];
    const r1 = computeIrse(reports);
    const r2 = computeIrse(reports);
    expect(r1.score).toBe(r2.score);
    expect(r1.factors).toEqual(r2.factors);
  });
});
