import type { CardsCusto } from "../../types/cardsCusto";
import { useEffect, useState } from "react";
import useUsuario from "../../hooks/useUsuario";
import { buscarCardsCusto, CardsCustoError } from "../../services/cardsCusto.service";
import CardCustoOperacional from "./CardCustoOperacional";
import CardManifesto from "./CardManifesto";
import "../../styles/cardsCusto.css";

type Props = {
  /** Mês no formato AAAA-MM, o mesmo do card de rentabilidade. Vazio = mês mais recente. */
  mes?: string;
};

export default function CardsCustoGrupo({ mes }: Props) {
  const { session, logout } = useUsuario();
  const ehGerente = session.role === "gerente";

  const [dados, setDados] = useState<CardsCusto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!ehGerente)
      return;

    let ativo = true;
    setCarregando(true);
    setErro("");

    buscarCardsCusto(mes || undefined)
      .then((d) => {
        if (ativo)
          setDados(d);
      })
      .catch((e) => {
        if (!ativo)
          return;
        if (e instanceof CardsCustoError && e.status === 401)
          logout();
        else
          setErro(e instanceof Error ? e.message : "Erro inesperado.");
      })
      .finally(() => {
        if (ativo)
          setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [mes, ehGerente]);

  if (!ehGerente)
    return null;

  return (
    <div className="cc-grupo">
      <CardCustoOperacional dados={dados} carregando={carregando} erro={erro} />
      <div className="cc-par">
        <CardManifesto tipo="melhor" dados={dados} carregando={carregando} erro={erro} />
        <CardManifesto tipo="pior" dados={dados} carregando={carregando} erro={erro} />
      </div>
    </div>
  );
}