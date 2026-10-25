import type { Role, Theme, View } from "../../types/app";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LogOut,
  Moon,
  RotateCcw,
  Sun,
  Upload,
  Users,
} from "lucide-react";

type Props = {
  role: Role;
  userName: string;
  theme: Theme;
  view: View;
  onNavigate: (view: View) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  onReset: () => void;
  onImport: () => void;
};

export default function Sidebar({
  role,
  userName,
  theme,
  view,
  onNavigate,
  collapsed,
  onToggleCollapse,
  onToggleTheme,
  onLogout,
  onReset,
  onImport,
}: Props) {
  return (
    <div className={`nav sidenav ${collapsed ? "collapsed" : ""}`}>
      <div
        className={`flex ${collapsed ? "flex-col-reverse justify-center gap-5" : "items-center justify-between"}`}
      >
        <div className="brand-mini">
          <div className="brand-mark small">JS</div>
          <span className={`${collapsed ? "hidden" : "inline"}`}>Janosys</span>
        </div>

        <button
          type="button"
          className="sidenav-toggle"
          onClick={onToggleCollapse}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <ChevronLeft size={16} />
        </button>
      </div>
      <div className="nav-items">
        <button
          type="button"
          className={view === "painel" ? "active" : ""}
          onClick={() => onNavigate("painel")}
        >
          <LayoutGrid size={16} />
          <span className={`${collapsed && "hidden"}`}>Painel operacional</span>
          <ChevronRight size={13} className={`chev ${collapsed && "hidden"}`} />
        </button>
        {role === "gerente" && (
          <button
            type="button"
            className={view === "usuarios" ? "active" : ""}
            onClick={() => onNavigate("usuarios")}
          >
            <Users size={16} />
            <span className={`${collapsed && "hidden"}`}>Usuários</span>
            <ChevronRight
              size={13}
              className={`chev ${collapsed && "hidden"}`}
            />
          </button>
        )}
      </div>

      <div className="sidenav-footer">
        <span>{userName}</span>
        <span className="role-tag">
          {role === "gerente" ? "Gerência" : "Operacional"}
        </span>
        <button
          type="button"
          className="btn-ghost small"
          onClick={onImport}
          title="Importar .csv"
        >
          <Upload size={13} />
          <span>Importar .csv</span>
        </button>
        <button
          type="button"
          className="btn-ghost small"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
        </button>
        <button
          type="button"
          className="btn-ghost small"
          onClick={onReset}
          title="Recarregar exemplo"
        >
          <RotateCcw size={13} />
          <span>Recarregar exemplo</span>
        </button>
        <button
          type="button"
          className="btn-ghost small"
          onClick={onLogout}
          title="Sair"
        >
          <LogOut size={13} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
