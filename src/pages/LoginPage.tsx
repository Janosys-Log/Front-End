import type { Role, Theme } from "../types/app";
import { LogIn } from "lucide-react";
import { useState } from "react";
import RouteNetworkBackground from "../components/login/RouteNetworkBackground";
import useUsuario from "../hooks/useUsuario";
import { login } from "../services/auth.service";

type Props = {
  theme: Theme;
};

export default function LoginPage({ theme }: Props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setSession, setIsAuthenticated } = useUsuario();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      setErrorMessage("Por favor, preencha o e-mail e a senha.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await login({ email: email.trim(), senha });
      const role: Role = data.perfil === "GERENCIA" ? "gerente" : "operador";

      setSession({
        role,
        userName: data.nome,
        token: data.token,
        email: data.email,
        idUsuario: data.idUsuario,
      });
      setIsAuthenticated(true);
    }
    catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro ao efetuar login.");
    }
    finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <RouteNetworkBackground theme={theme} />
      <div className="login-vignette" />
      <div className="login-card">
        <div className="brand">
          <div className="brand-mark">JS</div>
          <div>
            <div className="brand-name">Janosys</div>
            <div className="brand-sub">Painel de Motoristas</div>
          </div>
        </div>
        <h1>Entrar no painel</h1>
        <p className="login-copy">Acompanhe manifestos, status de rota e avaliações da frota em um só lugar.</p>

        {errorMessage && (
          <div
            style={{
              color: "#f87171",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13px",
              marginBottom: "16px",
              lineHeight: "1.4",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="field">
            E-mail
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ex: admin@janosys.com"
              required
              autoFocus
            />
          </label>
          <label className="field">
            Senha
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <button
            type="submit"
            className="btn-primary full"
            disabled={isLoading}
            style={{ marginTop: "12px", opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
          >
            <LogIn size={16} />
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
