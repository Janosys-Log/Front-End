import { useEffect, useState } from "react";
import { MESES } from "../../constants/grandeSp";
import {
  buscarDashboardOperacional,
  type DashboardOperacionalDados,
} from "../../services/dashboardOperacional.service";
import "../../styles/painelCustoOperacional.css";

type Props = {
  mes: number;
  ano: number;
  onMudarMes: (mes: number, ano: number) => void;
  mesesDisponiveis?: string[];
};

function brl(v: number) {
  return v
    .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    .replace(/\u00A0/g, " ");
}

const num = (v: number) => v.toLocaleString("pt-BR");

function formatarDataBr(iso?: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function PainelCustoOperacional({
  mes,
  ano,
  onMudarMes,
  mesesDisponiveis = [],
}: Props) {
  const [dados, setDados] = useState<DashboardOperacionalDados | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string>("");

  const mesAnoFormatado = `${ano}-${String(mes).padStart(2, "0")}`;

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const resp = await buscarDashboardOperacional(mesAnoFormatado);
        if (cancelado) return;
        setDados(resp);
      } catch (e) {
        if (cancelado) return;
        setErro(e instanceof Error ? e.message : "Erro ao carregar dados operacionais");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    void carregar();
    return () => {
      cancelado = true;
    };
  }, [mesAnoFormatado]);

  const nomeMesAtual = MESES[mes - 1] ?? "Mês";
  const mesAnteriorNum = mes === 1 ? 12 : mes - 1;
  const nomeMesAnterior = MESES[mesAnteriorNum - 1] ?? "mês anterior";

  const custoTotal = dados?.custoOperacionalTotal ?? 0;
  const custoTotalAnterior = dados?.custoOperacionalTotalMesAnterior ?? 0;
  const varCustoTotal = dados?.variacaoCustoTotalPercentual;

  const custoMedio = dados?.custoMedioPorManifesto ?? 0;
  const varCustoMedio = dados?.variacaoCustoMedioPercentual;
  const totalManifestos = dados?.totalManifestos ?? 0;

  const melhor = dados?.melhorManifesto;
  const pior = dados?.piorManifesto;

  return (
    <div className="pco-container">
      {/* Indicador 1: Mês dos cards */}
      <div className="pco-month-bar">
        <span className="psm-indicator-num">1</span>
        <span className="pco-month-label">Mês dos cards:</span>

        <div className="pco-month-select-wrap">
          <select
            className="pco-month-select"
            value={mes}
            onChange={e => onMudarMes(Number(e.target.value), ano)}
            aria-label="Selecionar mês dos cards operacionais"
          >
            {mesesDisponiveis.length > 0
              ? mesesDisponiveis.map(mStr => {
                  const parts = mStr.split("-").map(Number);
                  const m = parts[1];
                  const a = parts[0];
                  const nome = MESES[m - 1] ?? mStr;
                  return (
                    <option key={mStr} value={m} data-ano={a}>
                      {nome.toUpperCase()}
                    </option>
                  );
                })
              : MESES.map((nome, i) => (
                  <option key={nome} value={i + 1}>
                    {nome.toUpperCase()}
                  </option>
                ))}
          </select>
          <span className="pco-month-caret">▼</span>
        </div>
      </div>

      {erro && (
        <p className="mas-error" role="alert">
          {erro}
        </p>
      )}

      {/* Indicador 2: Card de Custo Operacional do Mês */}
      <div className="pco-card-custo">
        <div className="pco-custo-main">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="psm-indicator-num">2</span>
            <h3 className="pco-custo-title">CUSTO OPERACIONAL DO MÊS</h3>
          </div>
          <span className="pco-custo-sub">
            {nomeMesAtual} · todos os destinos
          </span>

          <div className="pco-custo-value">
            {carregando ? "Carregando..." : brl(custoTotal)}
          </div>

          <div className="pco-custo-trend">
            {varCustoTotal !== null && varCustoTotal !== undefined ? (
              <span
                className={
                  varCustoTotal > 0
                    ? "pco-custo-trend--up"
                    : varCustoTotal < 0
                      ? "pco-custo-trend--down"
                      : "pco-custo-trend--neutral"
                }
              >
                {varCustoTotal >= 0 ? "▲ +" : "▼ "}
                {varCustoTotal.toFixed(1).replace(".", ",")}% vs {nomeMesAnterior.toLowerCase()}{" "}
                ({brl(custoTotalAnterior)})
              </span>
            ) : (
              <span className="pco-custo-trend--neutral">
                Sem comparação com mês anterior
              </span>
            )}
          </div>
        </div>

        <div className="pco-custo-details">
          {/* Indicador 3: Custo médio por manifesto e Total de manifestos */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="psm-indicator-num">3</span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
              <div className="pco-metric-row">
                <span className="pco-metric-label">Custo médio por manifesto</span>
                <div className="pco-metric-value-wrap">
                  <span className="pco-metric-value">{brl(custoMedio)}</span>
                  {varCustoMedio !== null && varCustoMedio !== undefined && (
                    <span
                      className={`pco-metric-trend ${
                        varCustoMedio > 0 ? "pco-custo-trend--up" : "pco-custo-trend--down"
                      }`}
                    >
                      {varCustoMedio >= 0 ? "▲ +" : "▼ "}
                      {varCustoMedio.toFixed(1).replace(".", ",")}%
                    </span>
                  )}
                </div>
              </div>

              <div className="pco-metric-row">
                <span className="pco-metric-label">Manifestos no mês</span>
                <span className="pco-metric-value">{num(totalManifestos)}</span>
              </div>
            </div>
          </div>

          {/* Indicador 4: Aviso Geral */}
          <div className="pco-info-box">
            <span className="psm-indicator-num" style={{ width: "16px", height: "16px", fontSize: "9px" }}>
              4
            </span>
            <span className="pco-info-icon">ℹ️</span>
            <span>
              Valores gerais do mês, com todos os destinos. Este card não tem visão Grande SP.
            </span>
          </div>
        </div>
      </div>

      {/* Indicadores 5 e 6: Melhor e Pior Manifesto do Mês */}
      <div className="pco-destaques-grid">
        {/* Card 5: Melhor Manifesto do Mês */}
        <div className="pco-card-destaque pco-card-destaque--melhor">
          <header className="pco-destaque-header">
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
              <span className="psm-indicator-num">5</span>
              <h4 className="pco-destaque-title">MELHOR MANIFESTO DO MÊS</h4>
            </div>
            <p className="pco-destaque-sub">Maior rentabilidade total do manifesto</p>
          </header>

          {melhor ? (
            <>
              <div className="pco-destaque-body">
                <div className="pco-destaque-manifesto-id">
                  Manifesto {melhor.idManifesto}
                </div>
                <div className="pco-destaque-val">
                  +{brl(melhor.valorRecebido)}
                </div>
              </div>

              <div className="pco-destaque-box">
                <div className="pco-destaque-row">
                  <strong>Data:</strong> {formatarDataBr(melhor.dataManifesto)} ·{" "}
                  <strong>Destino:</strong> {melhor.destino}
                </div>
                <div className="pco-destaque-row">
                  <strong>Motorista:</strong> {melhor.motoristaNome} · {melhor.veiculoDescricao}
                </div>
              </div>
            </>
          ) : (
            <div className="pco-empty-card">
              Nenhum manifesto registrado em {nomeMesAtual.toLowerCase()}.
            </div>
          )}
        </div>

        {/* Card 6: Pior Manifesto do Mês */}
        <div className="pco-card-destaque pco-card-destaque--pior">
          <header className="pco-destaque-header">
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}>
              <span className="psm-indicator-num">6</span>
              <h4 className="pco-destaque-title">PIOR MANIFESTO DO MÊS</h4>
            </div>
            <p className="pco-destaque-sub">Menor rentabilidade total do manifesto</p>
          </header>

          {pior ? (
            <>
              <div className="pco-destaque-body">
                <div className="pco-destaque-manifesto-id">
                  Manifesto {pior.idManifesto}
                </div>
                <div className="pco-destaque-val">
                  {pior.valorRecebido < 0
                    ? `-${brl(Math.abs(pior.valorRecebido))}`
                    : brl(pior.valorRecebido)}
                </div>
              </div>

              <div className="pco-destaque-box">
                <div className="pco-destaque-row">
                  <strong>Data:</strong> {formatarDataBr(pior.dataManifesto)} ·{" "}
                  <strong>Destino:</strong> {pior.destino}
                </div>
                <div className="pco-destaque-row">
                  <strong>Motorista:</strong> {pior.motoristaNome} · {pior.veiculoDescricao}
                </div>
              </div>
            </>
          ) : (
            <div className="pco-empty-card">
              Nenhum manifesto registrado em {nomeMesAtual.toLowerCase()}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
