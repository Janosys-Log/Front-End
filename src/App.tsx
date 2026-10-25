import type { Theme } from "./types/app";
import { useState } from "react";
import Shell from "./components/layout/Shell";
import useUsuario from "./hooks/useUsuario";
import LoginPage from "./pages/LoginPage";
import PainelPage from "./pages/PainelPage";
import "./styles/index.css";


// Roteamento simples por estado (login ⇄ painel).
// Ao adotar react-router, cada página vira uma <Route> e `session` vai para um contexto.
export default function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const { isAuthenticated } = useUsuario();
  const onToggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  return (
    <Shell theme={theme}>
      {isAuthenticated
        ? (
           <PainelPage
              theme={theme}
              onToggleTheme={onToggleTheme}
            />
           
          )
        : (
            <LoginPage theme={theme} onToggleTheme={onToggleTheme} />
          )}
    </Shell>
  );
}
