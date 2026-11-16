import type { RankingMotoristaItemDTO } from "../../types/ranking";
import { useState } from "react";
import { formatarMoedaBr } from "../../services/ranking.service";

export type CampoOrdenacaoRanking = "rentabilidadeMedia" | "nomeMotorista";
export type DirecaoOrdenacao = "asc" | "desc";

interface Props {
  itens: RankingMotoristaItemDTO[];
  onAnalisarNegativos?: () => void;
}

export default function RankingTable({ itens, onAnalisarNegativos }: Props) {
  const [campoOrdenacao, setCampoOrdenacao] =
    useState<CampoOrdenacaoRanking>("rentabilidadeMedia");
  const [direcaoOrdenacao, setDirecaoOrdenacao] =
    useState<DirecaoOrdenacao>("desc");

  function alternarOrdenacao(campo: CampoOrdenacaoRanking) {
    if (campoOrdenacao === campo) {
      setDirecaoOrdenacao(d => (d === "desc" ? "asc" : "desc"));
    } else {
      setCampoOrdenacao(campo);
      setDirecaoOrdenacao(campo === "rentabilidadeMedia" ? "desc" : "asc");
    }
  }

  const itensOrdenados = [...itens].sort((a, b) => {
    if (campoOrdenacao === "nomeMotorista") {
      const cmp = a.nomeMotorista.localeCompare(b.nomeMotorista, "pt-BR");
      return direcaoOrdenacao === "asc" ? cmp : -cmp;
    }
    // Ordenação padrão por posição oficial (que já aplica os critérios de desempate do CA6)
    return direcaoOrdenacao === "desc"
      ? a.posicao - b.posicao
      : b.posicao - a.posicao;
  });

  // Separa os itens normais e os itens com rentabilidade média negativa (ou últimos 3) para envolver o bloco negativo com a aba lateral "Clique para análise" (Figura 3 e Figura 4)
  const itensPositivosOuZero = itensOrdenados.filter(
    item => !item.rentabilidadeNegativa,
  );
  const itensNegativos = itensOrdenados.filter(
    item => item.rentabilidadeNegativa,
  );

  function renderVariacao(item: RankingMotoristaItemDTO) {
    if (
      item.statusVariacao === "SEM_MES_ANTERIOR" ||
      item.statusVariacao === "NOVO" ||
      item.variacaoMesAnterior === null
    ) {
      return <span className="rk-var-neutral">—</span>;
    }

    const valor = Math.round(Math.abs(item.variacaoMesAnterior));
    if (item.statusVariacao === "AUMENTO") {
      return (
        <span className="rk-var-up">
          ▲ +{valor.toLocaleString("pt-BR")}
        </span>
      );
    }
    if (item.statusVariacao === "QUEDA") {
      return (
        <span className="rk-var-down">
          ▼ −{valor.toLocaleString("pt-BR")}
        </span>
      );
    }
    return <span className="rk-var-neutral">0</span>;
  }

  function classeLinha(item: RankingMotoristaItemDTO): string {
    if (item.rentabilidadeNegativa || item.ultimos3) {
      return "rk-row rk-row-red";
    }
    if (item.top3) {
      return "rk-row rk-row-green";
    }
    if (item.abaixoMediaFrota) {
      return "rk-row rk-row-yellow";
    }
    return "rk-row rk-row-white";
  }

  function renderLinha(item: RankingMotoristaItemDTO) {
    const negOuUltimos = item.rentabilidadeNegativa || item.ultimos3;
    const posStr = negOuUltimos ? `${item.posicao}º` : String(item.posicao);

    const margemStr =
      item.margemPercentual !== null && item.margemPercentual !== undefined
        ? `${item.margemPercentual < 0 ? "−" : ""}${Math.abs(
            item.margemPercentual,
          ).toLocaleString("pt-BR", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}%`
        : "—";

    return (
      <div
        key={item.motoristaId}
        className={classeLinha(item)}
        role="row"
      >
        <div className="rk-cell rk-col-pos" role="cell">
          {posStr}
        </div>
        <div className="rk-cell rk-col-rm" role="cell">
          {formatarMoedaBr(item.rentabilidadeMedia, false)}
        </div>
        <div className="rk-cell rk-col-var" role="cell">
          {renderVariacao(item)}
        </div>
        <div className="rk-cell rk-col-nm" role="cell">
          {item.numeroManifestos}
        </div>
        <div
          className="rk-cell rk-col-mot"
          role="cell"
          title={item.nomeMotorista}
        >
          {item.nomeMotorista}
        </div>
        <div className="rk-cell rk-col-veic" role="cell">
          {item.subtipoLabel}
        </div>
        <div className="rk-cell rk-col-margem" role="cell">
          {margemStr}
        </div>
        <div className="rk-cell rk-col-rt" role="cell">
          {formatarMoedaBr(item.rentabilidadeTotal, false)}
        </div>
      </div>
    );
  }

  return (
    <div className="rk-table-section">
      <div className="rk-table-container" role="table" aria-label="Ranking de Rentabilidade">
        {/* Cabeçalho da Tabela (Item 8 do Mockup) */}
        <div className="rk-table-header" role="row">
          <div className="rk-th rk-col-pos" role="columnheader">
            #
          </div>
          <button
            type="button"
            className="rk-th rk-th-sortable rk-col-rm"
            onClick={() => alternarOrdenacao("rentabilidadeMedia")}
            title="Ordenar por Rentabilidade Média"
          >
            <span>Rentab. Média</span>
            <span className="rk-th-sub">
              (R$){" "}
              {campoOrdenacao === "rentabilidadeMedia"
                ? direcaoOrdenacao === "desc"
                  ? "▼"
                  : "▲"
                : "⇅"}
            </span>
          </button>
          <div className="rk-th rk-col-var" role="columnheader">
            <span>vs. mês</span>
            <span className="rk-th-sub">ant.</span>
          </div>
          <div className="rk-th rk-col-nm" role="columnheader">
            <span>Nº</span>
            <span className="rk-th-sub">manif.</span>
          </div>
          <button
            type="button"
            className="rk-th rk-th-sortable rk-col-mot"
            onClick={() => alternarOrdenacao("nomeMotorista")}
            title="Ordenar por nome do motorista"
          >
            <span>
              Motorista{" "}
              {campoOrdenacao === "nomeMotorista"
                ? direcaoOrdenacao === "asc"
                  ? "▲"
                  : "▼"
                : "⇅"}
            </span>
          </button>
          <div className="rk-th rk-col-veic" role="columnheader">
            <span>Tipo veíc.</span>
            <span className="rk-th-sub">⇅</span>
          </div>
          <div className="rk-th rk-col-margem" role="columnheader">
            <span>Margem</span>
            <span className="rk-th-sub">%</span>
          </div>
          <div className="rk-th rk-col-rt" role="columnheader">
            <span>RT total (R$)</span>
          </div>
        </div>

        {/* Corpo da Tabela */}
        <div className="rk-table-body" role="rowgroup">
          {itens.length === 0 ? (
            <div className="rk-table-empty">
              Nenhum motorista encontrado para os filtros aplicados.
            </div>
          ) : (
            <>
              {itensPositivosOuZero.map(renderLinha)}

              {itensNegativos.length > 0 && (
                <div className="rk-negative-group-wrapper">
                  <div className="rk-negative-group-rows">
                    {itensNegativos.map(renderLinha)}
                  </div>
                  {onAnalisarNegativos && (
                    <button
                      type="button"
                      className="rk-negative-side-tab"
                      onClick={onAnalisarNegativos}
                      title="Abrir análise detalhada de motoristas com rentabilidade média negativa (US.15)"
                    >
                      <span>Clique para análise</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Legenda inferior da tabela (Figura 3) */}
      <div className="rk-table-legend">
        <span className="rk-tlegend-item">
          <i className="rk-tlegend-swatch rk-swatch-green" /> 3 primeiros
        </span>
        <span className="rk-tlegend-item">
          <i className="rk-tlegend-swatch rk-swatch-white" /> acima da média (sem cor)
        </span>
        <span className="rk-tlegend-item">
          <i className="rk-tlegend-swatch rk-swatch-yellow" /> abaixo da média da frota
        </span>
        <span className="rk-tlegend-item">
          <i className="rk-tlegend-swatch rk-swatch-red" /> rentabilidade média negativa
        </span>
      </div>

      {/* Bloco de Ação Explícito para o Ranking de Negativos (US.15) - SEMPRE VISÍVEL */}
      {onAnalisarNegativos && (
        <div className="rk-table-negativos-footer-cta">
          <div className="rk-neg-footer-info">
            <span className="rk-neg-footer-icon">
              {itensNegativos.length > 0 ? "⚠️" : "📊"}
            </span>
            <span>
              {itensNegativos.length > 0 ? (
                <>
                  <strong>{itensNegativos.length} motorista(s)</strong> com Rentabilidade Média Negativa neste período.
                </>
              ) : (
                <>
                  Nenhum motorista com rentabilidade média negativa neste período.
                </>
              )}
            </span>
          </div>
          <button
            type="button"
            className="rk-neg-footer-btn"
            onClick={onAnalisarNegativos}
            title="Abrir página com o ranking exclusivo e detalhamento dos motoristas negativos (US.15)"
          >
            <span>Ver Ranking de Negativos (US.15) →</span>
          </button>
        </div>
      )}
    </div>
  );
}
