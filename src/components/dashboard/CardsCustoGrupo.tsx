import type { CardsCusto } from "../../types/cardsCusto";
import { useEffect, useState } from "react";
import useUsuario from "../../hooks/useUsuario";
import { MESES } from "../../constants/grandeSp";
import { buscarCardsCusto, CardsCustoError } from "../../services/cardsCusto.service";
import CardCustoOperacional from "./CardCustoOperacional";
import CardManifesto from "./CardManifesto";
import "../../styles/cardsCusto.css";

type Props = {
  /** Mês no formato AAAA-MM. */
  mes?: string;
  mesNum?: number;
  ano?: number;
  onMudarPeriodo?: (mes: number, ano: number) => void;
};

export default function CardsCustoGrupo({ mes, mesNum, ano, onMudarPeriodo }: Props) {
  const { session, logout } = useUsuario();
  const ehGerente = session.role === "gerente";

  const [dados, setDados] = useState<CardsCusto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const anoAtual = new Date().getFullYear();
  const anosOpcoes = Array.from(
    new Set([2024, 2025, 2026, 2027, anoAtual, ano ?? anoAtual])
  ).sort((a, b) => a - b);

  const mesAtualSelecionado = mesNum ?? (mes ? Number(mes.split("-")[1]) : new Date().getMonth() + 1);
  const anoAtualSelecionado = ano ?? (mes ? Number(mes.split("-")[0]) : anoAtual);
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
      <div className="cc-periodo-bar">
        <span className="cc-periodo-label">Período dos cards</span>
        <div className="cc-periodo-controls">
          <select
            className="cc-periodo-select"
            value={mesAtualSelecionado}
            onChange={e => onMudarPeriodo?.(Number(e.target.value), anoAtualSelecionado)}
            aria-label="Selecionar mês dos cards"
          >
            {MESES.map((nome, i) => (
              <option key={nome} value={i + 1}>
                {nome.toUpperCase()}
              </option>
            ))}
          </select>
          <select
            className="cc-periodo-select cc-periodo-select-ano"
            value={anoAtualSelecionado}
            onChange={e => onMudarPeriodo?.(mesAtualSelecionado, Number(e.target.value))}
            aria-label="Selecionar ano dos cards"
          >
            {anosOpcoes.map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="cc-grid">
        <CardCustoOperacional dados={dados} carregando={carregando} erro={erro} />
        <div className="cc-par">
          <CardManifesto tipo="melhor" dados={dados} carregando={carregando} erro={erro} />
          <CardManifesto tipo="pior" dados={dados} carregando={carregando} erro={erro} />
        </div>
      </div>
    </div>
  );
}
