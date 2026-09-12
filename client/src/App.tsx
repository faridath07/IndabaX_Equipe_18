import { useState, useEffect } from "react";
import { Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
import {
  Home, MapPin, BarChart3, Send, Info, Menu, X, Moon, Sun,
  Play, Github, ExternalLink, ListChecks,
} from "lucide-react";
import HomePage from "./pages/HomePage";
import ReportPage from "./pages/ReportPage";
import MapPage from "./pages/MapPage";
import DashboardPage from "./pages/DashboardPage";
import MyReportsPage from "./pages/MyReportsPage";
import AboutPage from "./pages/AboutPage";

type Theme = "dark" | "light";

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("ecosia-theme") as Theme | null;
    return stored || "dark";
  });
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("ecosia-theme", theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}

const NAV_ITEMS = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/report", label: "Signaler", icon: Send },
  { to: "/map", label: "Carte", icon: MapPin },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/my-reports", label: "Mes signalements", icon: ListChecks },
  { to: "/about", label: "À propos", icon: Info },
];

export default function App() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* NAV */}
      <nav
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{
          background: theme === "dark" ? "rgba(10,15,13,.82)" : "rgba(247,250,248,.82)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}
            >
              🌍
            </div>
            <div className="leading-tight">
              <div className="font-bold text-base tracking-tight">EcosIA</div>
              <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                GbéWé
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive ? "text-white" : ""
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: "var(--accent)", color: "#000" }
                    : { color: "var(--text-secondary)" }
                }
              >
                <item.icon size={15} />
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-lg border flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a
              href="https://github.com/faridath07/IndabaX_Equipe_18"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg border flex items-center justify-center transition-all hover:scale-105 hidden sm:flex"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
            <Link
              to="/report"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
              style={{ background: "var(--accent)", color: "#000" }}
            >
              <Send size={14} />
              Signaler
            </Link>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden w-9 h-9 rounded-lg border flex items-center justify-center"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t" style={{ borderColor: "var(--border)", background: "var(--bg-elev)" }}>
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { background: "var(--accent)", color: "#000" }
                      : { color: "var(--text-secondary)" }
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* MAIN */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-reports" element={<MyReportsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="border-t" style={{ borderColor: "var(--border)", background: "var(--bg-elev)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🌍</span>
                <span className="font-bold text-lg">EcosIA / GbéWé</span>
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Intelligence citoyenne pour détecter précocement les risques environnementaux et sanitaires au Bénin.
              </p>
              <p className="text-xs mt-3 font-mono" style={{ color: "var(--text-muted)" }}>
                Built in Benin, designed for Africa.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="font-semibold mb-1">Liens</div>
              <a href="https://github.com/faridath07/IndabaX_Equipe_18" target="_blank" rel="noopener" className="hover:text-green-500 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                <Github size={14} /> Repository GitHub
              </a>
              <a href="https://ecos-chat-nqqj5jlv.manus.space" target="_blank" rel="noopener" className="hover:text-green-500 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                <ExternalLink size={14} /> Démo Manus (backup)
              </a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t text-center text-xs font-mono" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            © 2026 Équipe 18 — IndabaX Bénin 2026 · Données de démonstration
          </div>
        </div>
      </footer>
    </div>
  );
}
