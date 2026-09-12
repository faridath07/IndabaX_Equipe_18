# ==============================================================================
# EcosIA / GbéWé — IndabaX Bénin 2026
# Risk Engine — Indice de Risque Sanitaire Environnemental (IRSE)
# ==============================================================================
# Version 2.0 — Score heuristique explicable, déterministe, reproductible.
#
# Ce n'est PAS un modèle de Machine Learning.
# C'est une fonction déterministe qui combine plusieurs facteurs:
#   1. Volume pondéré par type de signalement
#   2. Récence des signalements (décroissance linéaire sur 7 jours)
#   3. Densité spatiale (proximité géographique)
#   4. Persistance (récurrence d'un type de problème)
#   5. Gravité perçue (mots-clés FR/Fon dans la description)
#
# Score final: 0-100
#   0-24   : Faible
#   25-49  : Modéré
#   50-74  : Élevé
#   75-100 : Critique
# ==============================================================================

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import List, Dict
import math

# Poids par type de signalement (somme = 1.0)
TYPE_WEIGHTS = {
    "flood": 0.35,           # Inondations → eaux stagnantes → moustiques → paludisme
    "waste": 0.25,           # Déchets → insalubrité → choléra
    "stagnant_water": 0.25,  # Eaux stagnantes → moustiques direct
    "insalubrity": 0.10,
    "other": 0.05,
}

RECENCY_DAYS = 7
MS_PER_DAY = 24 * 60 * 60 * 1000
VOLUME_MAX_PER_TYPE = 10  # 10 signalements d'un type = saturation

GRAVITY_KEYWORDS = [
    # FR
    "grave", "important", "beaucoup", "énorme", "grand", "urgence",
    "critique", "massif", "sévère", "danger",
    # Fon (translittération)
    "huhu", "klɛ", "ɖaxo", "wɛ",
]


@dataclass
class Report:
    id: str
    type: str
    description: str
    lat: float
    lng: float
    date: datetime  # ISO 8601


@dataclass
class RiskFactor:
    label: str
    weight: float
    detail: str


@dataclass
class IrseResult:
    score: int
    level: str
    factors: List[RiskFactor] = field(default_factory=list)


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Distance en km entre 2 coordonnées GPS (formule de Haversine)."""
    R = 6371  # km
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_risk_level(score: int) -> str:
    if score >= 75:
        return "critical"
    if score >= 50:
        return "high"
    if score >= 25:
        return "moderate"
    return "low"


def compute_irse(reports: List[Report], now: datetime = None) -> IrseResult:
    """
    Calcule l'IRSE pour une zone (groupe de signalements proches).

    Args:
        reports: Liste des signalements de la zone
        now: Timestamp de référence (défaut: datetime.now())

    Returns:
        IrseResult avec score (0-100), level et facteurs explicatifs
    """
    if now is None:
        now = datetime.now()

    if not reports:
        return IrseResult(
            score=0,
            level="low",
            factors=[RiskFactor("Aucun signalement", 0.0, "Pas de signal environnemental détecté.")],
        )

    factors: List[RiskFactor] = []

    # 1. Volume pondéré par type (max 50 points)
    type_counts: Dict[str, int] = {t: 0 for t in TYPE_WEIGHTS}
    for r in reports:
        if r.type in type_counts:
            type_counts[r.type] += 1

    volume_score = 0.0
    volume_details = []
    for type_, count in type_counts.items():
        if count > 0:
            type_score = min(count / VOLUME_MAX_PER_TYPE, 1.0) * TYPE_WEIGHTS[type_] * 100
            volume_score += type_score
            label_map = {
                "flood": "inondations", "waste": "dépôts de déchets",
                "stagnant_water": "eaux stagnantes", "insalubrity": "zones insalubres",
                "other": "autres",
            }
            volume_details.append(f"{count} {label_map.get(type_, type_)}")
    factors.append(RiskFactor(
        "Volume de signalements",
        round(volume_score, 2),
        ", ".join(volume_details),
    ))

    # 2. Récence (max 20 points)
    now_ms = now.timestamp() * 1000
    recency_score = 0.0
    recent_count = 0
    for r in reports:
        age_days = (now_ms - r.date.timestamp() * 1000) / MS_PER_DAY
        if age_days <= RECENCY_DAYS:
            weight = 1.0 - (age_days / RECENCY_DAYS)
            recency_score += weight
            if age_days <= 1:
                recent_count += 1
    recency_score = min(recency_score / 5, 1.0) * 20
    factors.append(RiskFactor(
        "Récence des incidents",
        round(recency_score, 2),
        f"{recent_count} signalement(s) dans les dernières 24h" if recent_count > 0
        else "Aucun signalement récent (24h)",
    ))

    # 3. Densité spatiale (max 15 points)
    coords = [(r.lat, r.lng) for r in reports]
    centroid_lat = sum(c[0] for c in coords) / len(coords)
    centroid_lng = sum(c[1] for c in coords) / len(coords)
    distances = [haversine(c[0], c[1], centroid_lat, centroid_lng) for c in coords]
    avg_distance = sum(distances) / len(distances)
    density_score = max(0, min(1, (5 - avg_distance) / 4)) * 15
    if avg_distance < 1:
        density_detail = "Signalements concentrés dans un rayon < 1 km"
    elif avg_distance < 3:
        density_detail = f"Dispersion modérée (~{avg_distance:.1f} km)"
    else:
        density_detail = f"Signalements dispersés (~{avg_distance:.1f} km)"
    factors.append(RiskFactor(
        "Densité spatiale",
        round(density_score, 2),
        density_detail,
    ))

    # 4. Persistance (max 10 points)
    repeated_types = [t for t, c in type_counts.items() if c >= 3]
    repetition_score = min(len(repeated_types) / 2, 1.0) * 10
    factors.append(RiskFactor(
        "Persistance du problème",
        round(repetition_score, 2),
        f"{len(repeated_types)} type(s) récurrent(s) (≥ 3 occurrences)" if repeated_types
        else "Pas de répétition détectée",
    ))

    # 5. Gravité perçue (max 5 points)
    gravity_matches = 0
    for r in reports:
        lower_desc = r.description.lower()
        if any(kw in lower_desc for kw in GRAVITY_KEYWORDS):
            gravity_matches += 1
    gravity_score = min(gravity_matches / 3, 1.0) * 5
    factors.append(RiskFactor(
        "Gravité perçue",
        round(gravity_score, 2),
        f"{gravity_matches} signalement(s) avec mots-clés de gravité" if gravity_matches > 0
        else "Descriptions sans indice de gravité particulière",
    ))

    # Score total
    total = min(100, max(0, volume_score + recency_score + density_score + repetition_score + gravity_score))
    rounded = round(total)

    return IrseResult(score=rounded, level=get_risk_level(rounded), factors=factors)


def explain_risk(result: IrseResult) -> str:
    """Génère une explication lisible du risque."""
    parts = []
    for f in result.factors:
        if f.weight > 0:
            parts.append(f"{f.label}: {f.detail} (+{f.weight:.1f} pts)")
    return "\n".join(parts)


# ==============================================================================
# DÉMONSTRATION — Quartiers de Cotonou
# ==============================================================================
if __name__ == "__main__":
    print("=" * 70)
    print("EcosIA — SYSTÈME D'ANALYSE DE RISQUE SANITAIRE ENVIRONNEMENTAL (IRSE)")
    print("IndabaX Bénin 2026 — Équipe 18")
    print("=" * 70)

    now = datetime.now()

    # Zone 1: Agla — forte activité
    agla_reports = [
        Report(id="EC-001", type="flood", description="Beaucoup d'eau sur la voie, gravité importante",
                lat=6.3870, lng=2.4080, date=now - timedelta(hours=2)),
        Report(id="EC-002", type="flood", description="Inondation récurrente, situation grave",
                lat=6.3865, lng=2.4085, date=now - timedelta(hours=14)),
        Report(id="EC-003", type="stagnant_water", description="Eaux stagnantes, moustiques nombreux",
                lat=6.3875, lng=2.4070, date=now - timedelta(days=1)),
        Report(id="EC-004", type="waste", description="Dépôt sauvage d'ordures important",
                lat=6.3868, lng=2.4090, date=now - timedelta(days=1, hours=6)),
        Report(id="EC-005", type="flood", description="Encore une inondation, 3ème fois ce mois, urgence",
                lat=6.3872, lng=2.4082, date=now - timedelta(days=2)),
    ]
    agla_result = compute_irse(agla_reports, now)

    print(f"\n📍 Zone : COTONOU — Quartier Agla")
    print(f"   Signalements : {len(agla_reports)} actifs")
    print(f"   IRSE : {agla_result.score}/100 — Niveau: {agla_result.level.upper()}")
    print(f"\n   Facteurs :")
    for f in agla_result.factors:
        print(f"   • {f.label}: {f.detail} (+{f.weight:.1f} pts)")

    if agla_result.level == "critical":
        print(f"\n🚨 ALERTE CRITIQUE — Seuil de risque sanitaire franchi!")
        print(f"   Notification recommandée : Centre de Santé d'Agla, Mairie de Cotonou, ONG locale.")

    # Zone 2: Dantokpa — risque élevé
    dantokpa_reports = [
        Report(id="EC-006", type="waste", description="Tas énorme d'ordures derrière le marché",
                lat=6.3650, lng=2.4180, date=now - timedelta(hours=5)),
        Report(id="EC-007", type="waste", description="Déchets brûlés, fumée importante",
                lat=6.3655, lng=2.4185, date=now - timedelta(days=1, hours=3)),
        Report(id="EC-008", type="insalubrity", description="Zone très sale, beaucoup de mouches",
                lat=6.3645, lng=2.4175, date=now - timedelta(days=2, hours=8)),
        Report(id="EC-009", type="stagnant_water", description="Eaux stagnantes dans les caniveaux",
                lat=6.3658, lng=2.4190, date=now - timedelta(days=3)),
    ]
    dantokpa_result = compute_irse(dantokpa_reports, now)

    print(f"\n{'=' * 70}")
    print(f"\n📍 Zone : COTONOU — Marché Dantokpa")
    print(f"   Signalements : {len(dantokpa_reports)} actifs")
    print(f"   IRSE : {dantokpa_result.score}/100 — Niveau: {dantokpa_result.level.upper()}")
    print(f"\n   Facteurs :")
    for f in dantokpa_result.factors:
        print(f"   • {f.label}: {f.detail} (+{f.weight:.1f} pts)")

    if dantokpa_result.level in ("high", "critical"):
        print(f"\n⚠️  RISQUE ÉLEVÉ — Surveillance renforcée recommandée.")

    # Zone 3: Zone sans signalement
    print(f"\n{'=' * 70}")
    empty_result = compute_irse([])
    print(f"\n📍 Zone : Test — Aucun signalement")
    print(f"   IRSE : {empty_result.score}/100 — Niveau: {empty_result.level.upper()}")
    print(f"   {empty_result.factors[0].detail}")

    print(f"\n{'=' * 70}")
    print("✓ Démo terminée — Le Risk Engine est déterministe et reproductible.")
    print("=" * 70)
