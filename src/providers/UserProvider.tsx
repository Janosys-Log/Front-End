import type { ReactNode } from "react";
import type { Session } from "../types/app";
import { useMemo, useState } from "react";
import { UserContext } from "../contexts/userContext";
import { limparSessao, obterSessao } from "../services/auth.service";

type UserProviderProps = {
  children: ReactNode;
};

export default function UserProvider({ children }: UserProviderProps) {
  const [session, setSession] = useState<Session>(() => {
    const saved = obterSessao();
    if (saved) {
      return {
        userName: saved.nome,
        role: saved.perfil === "GERENCIA" ? "gerente" : "operador",
        token: saved.token,
        email: saved.email,
        idUsuario: saved.idUsuario,
      };
    }
    return { userName: "", role: "operador" };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return obterSessao() !== null;
  });

  function logout() {
    limparSessao();
    setSession({ userName: "", role: "operador" });
    setIsAuthenticated(false);
  }

  const contextValue = useMemo(
    () => ({ session, setSession, isAuthenticated, setIsAuthenticated, logout }),
    [session, isAuthenticated],
  );

  return (
    <UserContext value={contextValue}>
      {children}
    </UserContext>
  );
}
