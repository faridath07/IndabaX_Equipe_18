# ==============================================================================
# PROJET EcosIA - INDABAX BÉNIN 2026
# Algorithme partiel de calcul de l'Indice de Risque Sanitaire (Paludisme / Choléra)
# ==============================================================================

def evaluer_risque_sante(nombre_inondations, nombre_depots_dechets):
    """
    Calcule un score de risque épidémique sur une échelle de 0 à 100.
    - Les zones inondées (eaux stagnantes/moustiques) pèsent pour 60% du risque.
    - Les dépôts de déchets sauvages (insalubrité/bactéries) pèsent pour 40% du risque.
    """
    # Application des coefficients de pondération locaux
    score_brut = (nombre_inondations * 12) + (nombre_depots_dechets * 8)
    
    # Plafonnement mathématique du score à 100%
    score_final = min(score_brut, 100)
    
    return score_final

# --- SIMULATION DE TERRAIN POUR DEUX QUARTIERS DE COTONOU ---

print("=== SYSTÈME PRÉDICTIF EcosIA - ANALYSE SANITAIRE EN COURS ===")

# Cas 1 : Quartier d'Agla (Fortes inondations détectées par les citoyens)
inondations_agla = 7
dechets_agla = 3
risque_agla = evaluer_risque_sante(inondations_agla, dechets_agla)

print(f"\n Zone : Cotonou - Quartier Agla")
print(f" Signalements actifs : {inondations_agla} Inondations | {dechets_agla} Dépôts de déchets")
print(f" Indice de risque épidémique calculé : {risque_agla}%")

if risque_agla >= 75:
    print(" ALERTE CRITIQUE : Seuil épidémique franchi ! Notification automatisée envoyée au Centre de Santé d'Agla.")

# Cas 2 : Quartier de Dantokpa (Forte insalubrité/déchets détectés)
inondations_tokpa = 2
dechets_tokpa = 8
risque_tokpa = evaluer_risque_sante(inondations_tokpa, dechets_tokpa)

print(f"\n Zone : Cotonou - Marché Dantokpa")
print(f" Signalements actifs : {inondations_tokpa} Inondations | {dechets_tokpa} Dépôts de déchets")
print(f" Indice de risque épidémique calculé : {risque_tokpa}%")

if risque_tokpa >= 75:
    print(" ALERTE CRITIQUE : Seuil épidémique franchi ! Notification automatisée envoyée aux agents sanitaires de Dantokpa.")
