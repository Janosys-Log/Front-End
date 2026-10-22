import type { Role, Theme, View } from "../../types/app";
import { LayoutDashboard, LogOut, Moon, Sun, Truck, Upload, Users } from "lucide-react";

type Props = {
  role: Role;
  userName: string;
  theme: Theme;
  view: View;
  onNavigate: (view: View) => void;
  onToggleTheme: () => void;
  onLogout: () => void;
};

const tabs: { view: View; label: string; icon: typeof LayoutDashboard }[] = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "motoristas", label: "Motoristas", icon: Truck },
  { view: "upload", label: "Upload", icon: Upload },
  { view: "usuarios", label: "Usuários", icon: Users },
];

export default function NavbarPilula({ role, userName, theme, view, onNavigate, onToggleTheme, onLogout }: Props) {
  return (
    <nav className={`nav-pill ${role === "gerente" ? "manager" : "operator"}`} aria-label="Navegação principal">
      <a className="nav-brand" href="/motoristas" onClick={(event) => { event.preventDefault(); onNavigate("motoristas"); }} aria-label="Janosys, Motoristas">
        <span className="nav-brand-mark">J</span>
        <span className="nav-brand-name">JANOSYS</span>
      </a>

      <div className="nav-pill-items">
        {tabs.map(({ view: tabView, label, icon: Icon }) => {
          if (tabView === "usuarios" && role !== "gerente") return null;
          return (
            <button
              key={tabView}
              type="button"
              className={`nav-pill-item${view === tabView ? " active" : ""}`}
              onClick={() => onNavigate(tabView)}
              aria-current={view === tabView ? "page" : undefined}
              title={label}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div className="nav-pill-actions">
        <button
          type="button"
          className="nav-action"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
        </button>
        <span className="nav-user-name">{userName}</span>
        <button type="button" className="nav-action nav-logout" onClick={onLogout} title="Sair" aria-label="Sair">
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </nav>
  );
}
