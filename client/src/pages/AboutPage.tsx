import { Link } from "react-router-dom";
import {
  Brain, ShieldAlert, Code2, Map as MapIcon, Database, GitBranch,
  AlertTriangle, ExternalLink, ArrowRight, Mic,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-10">
        <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
          À propos / Méthodologie
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          EcosIA / GbéWé — Intelligence citoyenne pour le Bénin
        </h1>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          Une plateforme d'éco-santé conçue au Bénin pour le Bénin, et pensée pour l'Afrique.
          <strong> Built in Benin, designed for Africa.</strong>
        </p>
      </div>

      {/* Problème → Solution */}
      <Section title="Le problème">
        <p>
          Au Bénin, les inondations urbaines, dépôts sauvages et eaux stagnantes sont des facteurs
          reconnus de propagation du paludisme et du choléra. Les citoyens signalent ces problèmes
          au quotidien, mais ces signalements restent dispersés (WhatsApp, appels, réseaux sociaux)
          et difficiles à exploiter rapidement pour anticiper les risques sanitaires.
        </p>
      </Section>

      <Section title="La solution EcosIA">
        <p>
          EcosIA est une plateforme qui transforme les signalements citoyens (texte ou voix en
          français/fon) en données structurées, classifiées automatiquement par IA, et calcule un
          <strong> Indice de Risque Sanitaire Environnemental (IRSE)</strong> explicable, permettant
          aux autorités, ONG et communautés de prioriser les interventions.
        </p>
      </Section>

      {/* Pipeline */}
      <Section title="Pipeline IA" icon={Brain}>
        <div className="rounded-xl p-5 font-mono text-sm border" style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          <div><span style={{ color: "var(--accent)" }}>Citoyen</span></div>
          <div>↓</div>
          <div><span style={{ color: "#06b6d4" }}>Signalement</span> (texte FR/Fon, photo)</div>
          <div>↓</div>
          <div><span style={{ color: "#a78bfa" }}>Classification NLP</span> → type de problème</div>
          <div>↓</div>
          <div><span style={{ color: "#fbbf24" }}>Analyse des facteurs</span> (volume, récence, densité, répétition, gravité)</div>
          <div>↓</div>
          <div><span style={{ color: "#f97316" }}>IRSE</span> (Indice de Risque Sanitaire Environnemental, 0-100)</div>
          <div>↓</div>
          <div><span style={{ color: "#dc2626" }}>Carte interactive</span> + Dashboard</div>
          <div>↓</div>
          <div><span style={{ color: "var(--accent)" }}>Priorisation</span> des zones d'intervention</div>
        </div>
      </Section>

      {/* Risk Engine */}
      <Section title="Risk Engine — IRSE" icon={ShieldAlert}>
        <p className="mb-4">
          L'IRSE (Indice de Risque Sanitaire Environnemental) est un score <strong>heuristique
          explicable, déterministe et reproductible</strong>. Ce n'est pas un modèle de Machine Learning.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <FactorCard label="1. Volume pondéré par type" weight="50 pts max" desc="Inondations (35%), déchets (25%), eaux stagnantes (25%), insalubrité (10%), autres (5%)" />
          <FactorCard label="2. Récence" weight="20 pts max" desc="Signalements des 7 derniers jours, décroissance linéaire" />
          <FactorCard label="3. Densité spatiale" weight="15 pts max" desc="Signalements concentrés dans un rayon < 1 km = risque élevé" />
          <FactorCard label="4. Persistance" weight="10 pts max" desc="Types récurrents (≥ 3 occurrences)" />
          <FactorCard label="5. Gravité perçue" weight="5 pts max" desc="Mots-clés (urgent, grave, ɖaxo, huhu...) en FR et Fon" />
        </div>
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="text-xs font-mono mb-2" style={{ color: "var(--text-muted)" }}>Seuils IRSE</div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center p-2 rounded" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
              <div className="font-bold">0-24</div>
              <div>Faible</div>
            </div>
            <div className="text-center p-2 rounded" style={{ background: "rgba(234,179,8,0.1)", color: "#eab308" }}>
              <div className="font-bold">25-49</div>
              <div>Modéré</div>
            </div>
            <div className="text-center p-2 rounded" style={{ background: "rgba(249,115,22,0.1)", color: "#f97316" }}>
              <div className="font-bold">50-74</div>
              <div>Élevé</div>
            </div>
            <div className="text-center p-2 rounded" style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626" }}>
              <div className="font-bold">75-100</div>
              <div>Critique</div>
            </div>
          </div>
        </div>
      </Section>

      {/* NLP Fon */}
      <Section title="Inclusion linguistique — Fon + Français" icon={Mic}>
        <p>
          Le projet intègre un dictionnaire bilingue Français/Fon (translittération approximative)
          pour la classification des signalements. Le Fon est l'une des langues les plus parlées au
          sud du Bénin, et reste sous-représentée dans les outils numériques.
        </p>
        <div className="mt-3 rounded-xl p-4 border text-sm font-mono" style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
          <div>FR: "Il y a beaucoup d'eau dans la rue à Agla"</div>
          <div>Fon: "Mi ɖo gbɛ to Agla. Sinn ɖaxo."</div>
          <div style={{ color: "var(--accent)" }}>→ Type: INONDATION 🌊</div>
        </div>
        <p className="mt-3 text-xs italic" style={{ color: "var(--text-muted)" }}>
          Note: la reconnaissance vocale Fon en direct nécessiterait un modèle STT spécialisé
          (non disponible sans infrastructure externe). L'architecture est en place pour l'intégrer
          via une API dédiée. La démo utilise la saisie texte ou un échantillon Fon pré-défini.
        </p>
      </Section>

      {/* Stack */}
      <Section title="Architecture technique" icon={Code2}>
        <div className="grid sm:grid-cols-2 gap-3">
          <TechCard icon="⚛️" name="React 18 + TypeScript" desc="Frontend SPA, multi-fichiers" />
          <TechCard icon="⚡" name="Vite 5" desc="Build rapide + GitHub Pages" />
          <TechCard icon="🗺️" name="Leaflet + OpenStreetMap" desc="Cartes interactives, sans clé API" />
          <TechCard icon="📊" name="Recharts" desc="Visualisations (line, bar, pie)" />
          <TechCard icon="🧠" name="Risk Engine TS" desc="IRSE explicable, 100% client-side" />
          <TechCard icon="🧩" name="Classifier NLP" desc="Dictionnaires FR/Fon, regex" />
        </div>
        <div className="mt-4 rounded-xl p-4 border text-sm" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="font-semibold mb-2 flex items-center gap-2">
            <Database size={14} style={{ color: "var(--accent)" }} /> Architecture
          </div>
          <pre className="text-xs font-mono overflow-x-auto" style={{ color: "var(--text-secondary)" }}>
{`client/
├── src/
│   ├── components/   # Composants UI
│   ├── pages/        # Home, Report, Map, Dashboard, About
│   ├── lib/          # Risk Engine, Classifier, Demo Data
│   ├── hooks/
│   └── styles.css
├── index.html
shared/
└── types.ts          # Types partagés (Report, RiskLevel, etc.)
tests/
└── risk-engine.test.ts  # Tests unitaires
.github/workflows/
└── deploy.yml        # CI/CD GitHub Pages`}
          </pre>
        </div>
      </Section>

      {/* Limites */}
      <Section title="Limites & honnêteté" icon={AlertTriangle}>
        <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <li>• Les signalements affichés sont des <strong>données de démonstration</strong> fictives.</li>
          <li>• L'IRSE est une heuristique, <strong>pas un modèle ML</strong>. Elle est explicable mais indicative.</li>
          <li>• L'objectif n'est pas de prédire une épidémie, mais de <strong>produire un indice de risque</strong> pour aider à prioriser.</li>
          <li>• La reconnaissance vocale Fon en direct nécessiterait un modèle STT externe.</li>
          <li>• Aucune donnée personnelle n'est collectée — l'app est 100% client-side.</li>
        </ul>
      </Section>

      {/* Liens */}
      <Section title="Liens utiles" icon={GitBranch}>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/faridath07/IndabaX_Equipe_18"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <GitBranch size={16} /> Repository GitHub <ExternalLink size={12} />
          </a>
          <a
            href="https://ecos-chat-nqqj5jlv.manus.space"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            Démo Manus (backup) <ExternalLink size={12} />
          </a>
          <Link
            to="/report?demo=1"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold"
            style={{ background: "var(--accent)", color: "#000" }}
          >
            Lancer la démo <ArrowRight size={16} />
          </Link>
        </div>
      </Section>

      {/* Équipe */}
      <div className="mt-10 pt-8 border-t text-center" style={{ borderColor: "var(--border)" }}>
        <div className="text-sm font-mono mb-2" style={{ color: "var(--text-muted)" }}>
          Équipe 18 — IndabaX Bénin 2026
        </div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
          Une solution inclusive qui sauve des vies. 🌍
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: any }) {
  return (
    <section className="mb-10">
      <h2 className="flex items-center gap-2 text-xl font-bold mb-3">
        {Icon && <Icon size={18} style={{ color: "var(--accent)" }} />}
        {title}
      </h2>
      <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {children}
      </div>
    </section>
  );
}

function FactorCard({ label, weight, desc }: { label: string; weight: string; desc: string }) {
  return (
    <div className="rounded-lg p-3 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="flex justify-between items-center mb-1">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "var(--surface)", color: "var(--accent)" }}>{weight}</div>
      </div>
      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</div>
    </div>
  );
}

function TechCard({ icon, name, desc }: { icon: string; name: string; desc: string }) {
  return (
    <div className="rounded-lg p-3 border flex items-center gap-3" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="font-semibold text-sm">{name}</div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</div>
      </div>
    </div>
  );
}
