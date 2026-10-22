import { useEffect, useState } from "react";
import type { Role, Theme } from "../../types/app";
import { LayoutGrid, LogOut, Moon, RotateCcw, Sun, Upload } from "lucide-react";

type Props = {
  role: Role;
  userName: string;
  theme: Theme;
  onToggleTheme: () => void;
  onLogout: () => void;
  onReset: () => void;
  onImport: () => void;
};

export default function NavbarPilula({ role, userName, theme, onToggleTheme, onLogout, onReset, onImport }: Props) {
  const [scrollState, setScrollState] = useState<"expanded" | "compact" | "hidden">("expanded");

  useEffect(() => {
    let accumulated = 0;
    let previousDirection = 0;

    const handleWheel = (event: WheelEvent) => {
      const direction = Math.sign(event.deltaY);
      if (!direction) return;
      if (direction !== previousDirection) accumulated = 0;
      previousDirection = direction;
      accumulated += Math.abs(event.deltaY);

      if (direction > 0) {
        setScrollState(accumulated > 460 ? "hidden" : accumulated > 120 ? "compact" : "expanded");
      } else {
        setScrollState("expanded");
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <nav className={`nav-pill ${scrollState}`} aria-label="Navegação principal">
      <div className="nav-pill-items">
        <button className="nav-pill-item active" title="Painel operacional" aria-label="Painel operacional">
          <LayoutGrid size={19} />
          <span>Painel operacional</span>
        </button>
        <button className="nav-pill-item" onClick={onImport} title="Importar CSV" aria-label="Importar CSV">
          <Upload size={18} />
          <span>Importar CSV</span>
        </button>
        <button className="nav-pill-item" onClick={onToggleTheme} title={theme === "dark" ? "Modo claro" : "Modo escuro"} aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
        </button>
        <button className="nav-pill-item" onClick={onReset} title="Recarregar exemplo" aria-label="Recarregar exemplo">
          <RotateCcw size={18} />
          <span>Recarregar exemplo</span>
        </button>
        <button className="nav-pill-item" onClick={onLogout} title="Sair" aria-label={`Sair, ${userName}, ${role === "gerente" ? "Gerência" : "Operacional"}`}>
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </nav>
  );
}
