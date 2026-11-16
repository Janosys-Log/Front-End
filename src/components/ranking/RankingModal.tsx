import type {
  RankingMotoristaItemDTO,
  RankingRentabilidadeResponseDTO,
  VisaoRanking,
} from "../../types/ranking";
import { useEffect, useMemo, useState } from "react";
import {
  buscarRankingRentabilidade,
  formatarInteiroBr,
  formatarMesNome,
  formatarMoedaBr,
} from "../../services/ranking.service";
import RankingChartsColumn from "./RankingChartsColumn";
import RankingTable from "./RankingTable";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mesSelecionado: string;
  onChangeMes: (novoMes: string) => void;
  visaoSelecionada: VisaoRanking;
  onChangeVisao: (novaVisao: VisaoRanking) => void;
  onAbrirPaginaNegativos?: (mes: string, visao: VisaoRanking) => void;
}

const FAIXAS_FILTRO = [
  { codigo: "TODOS", rotulo: "Todos" },
  { codigo: "MENOR_QUE_0", rotulo: "< R$ 0 (Negativa)" },
  { codigo: "DE_0_A_500", rotulo: "R$ 0 a R$ 500" },
  { codigo: "DE_500_A_1000", rotulo: "R$ 500 a R$ 1.000" },
  { codigo: "DE_1000_A_1500", rotulo: "R$ 1.000 a R$ 1.500" },
  { codigo: "DE_1500_A_2000", rotulo: "R$ 1.500 a R$ 2.000" },
  { codigo: "DE_2000_A_2500", rotulo: "R$ 2.000 a R$ 2.500" },
  { codigo: "DE_2500_A_3000", rotulo: "R$ 2.500 a R$ 3.000" },
  { codigo: "MAIOR_OU_IGUAL_3000", rotulo: "> R$ 3.000" },
];

const CATEGORIAS_FILTRO = [
  { codigo: "URBANOS_EXPRESS", rotulo: "Urbanos Express" },
  { codigo: "URBANOS_DE_CARGA", rotulo: "Urbanos de Carga" },
  { codigo: "PESADOS", rotulo: "Pesados" },
  { codigo: "ARTICULADOS", rotulo: "Articulados" },
];

const SUBCATEGORIAS_FILTRO = [
  { codigo: "FIORINO", rotulo: "Fiorino" },
  { codigo: "VAN", rotulo: "VAN" },
  { codigo: "VUC", rotulo: "VUC" },
  { codigo: "TRES_QUARTOS", rotulo: "3/4" },
  { codigo: "TOCO", rotulo: "Toco" },
  { codigo: "TRUCK", rotulo: "Truck" },
  { codigo: "BI_TRUCK", rotulo: "Bi-Truck" },
  { codigo: "CAVALO_MECANICO", rotulo: "Cavalo Mecânico" },
  { codigo: "CAVALO_MECANICO_TRUCADO", rotulo: "Cavalo Mecânico Trucado" },
  { codigo: "SEMI_REBOQUE_2_EIXOS", rotulo: "Semi-reboque 2 eixos" },
  { codigo: "SEMI_REBOQUE_3_EIXOS", rotulo: "Semi-reboque 3 eixos" },
  { codigo: "SEMI_REBOQUE_4_EIXOS", rotulo: "Semi-reboque 4 eixos" },
];

function pertenceAFaixa(rm: number, codigoFaixa: string): boolean {
  switch (codigoFaixa) {
    case "MENOR_QUE_0":
      return rm < 0;
    case "DE_0_A_500":
      return rm >= 0 && rm < 500;
    case "DE_500_A_1000":
      return rm >= 500 && rm < 1000;
    case "DE_1000_A_1500":
      return rm >= 1000 && rm < 1500;
    case "DE_1500_A_2000":
      return rm >= 1500 && rm < 2000;
    case "DE_2000_A_2500":
      return rm >= 2000 && rm < 2500;
    case "DE_2500_A_3000":
      return rm >= 2500 && rm < 3000;
    case "MAIOR_OU_IGUAL_3000":
      return rm >= 3000;
    default:
      return true;
  }
}

export default function RankingModal({
  isOpen,
  onClose,
  mesSelecionado,
  onChangeMes,
  visaoSelecionada,
  onChangeVisao,
  onAbrirPaginaNegativos,
}: Props) {
  const [dados, setDados] = useState<RankingRentabilidadeResponseDTO | null>(
    null,
  );
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string>("");

  // Filtros locais da tabela (não afetam os 3 gráficos laterais conforme CA7)
  const [filtroFaixa, setFiltroFaixa] = useState<string>("TODOS");
  const [filtroVeiculo, setFiltroVeiculo] = useState<string>("TODOS");
  const [buscaMotorista, setBuscaMotorista] = useState<string>("");

  // Fechar com tecla ESC (CA1)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Buscar dados da API sempre que abrir ou mudar mês / visão
  useEffect(() => {
    if (!isOpen) return;
    let cancelado = false;

    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const resp = await buscarRankingRentabilidade(
          mesSelecionado || undefined,
          visaoSelecionada,
        );
        if (cancelado) return;
        setDados(resp);
        if (!mesSelecionado && resp.resumo.mesReferencia) {
          onChangeMes(resp.resumo.mesReferencia);
        }
      } catch (e) {
        if (cancelado) return;
        setErro(
          e instanceof Error
            ? e.message
            : "Não foi possível carregar os dados do ranking. Tente novamente.",
        );
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    void carregar();
    return () => {
      cancelado = true;
    };
  }, [isOpen, mesSelecionado, visaoSelecionada, onChangeMes]);

  // Filtragem local da tabela (CA7)
  const itensFiltrados = useMemo<RankingMotoristaItemDTO[]>(() => {
    if (!dados) return [];
    const termo = buscaMotorista.trim().toLowerCase();

    return dados.itens.filter(item => {
      if (
        termo &&
        !item.nomeMotorista.toLowerCase().includes(termo)
      ) {
        return false;
      }

      if (
        filtroFaixa !== "TODOS" &&
        !pertenceAFaixa(item.rentabilidadeMedia, filtroFaixa)
      ) {
        return false;
      }

      if (filtroVeiculo !== "TODOS") {
        if (filtroVeiculo.startsWith("CAT:")) {
          const cat = filtroVeiculo.slice(4);
          if (item.tipoVeiculo !== cat) return false;
        } else if (filtroVeiculo.startsWith("SUB:")) {
          const sub = filtroVeiculo.slice(4);
          if (item.subtipoVeiculo !== sub) return false;
        }
      }

      return true;
    });
  }, [dados, buscaMotorista, filtroFaixa, filtroVeiculo]);

  if (!isOpen) return null;

  const resumo = dados?.resumo;
  const mesesOpcoes = dados?.mesesDisponiveis?.length
    ? dados.mesesDisponiveis
    : mesSelecionado
      ? [mesSelecionado]
      : [];

  return (
    <div
      className="rk-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="rk-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rk-modal-title"
        onClick={e => e.stopPropagation()}
      >
        {/* Botão Fechar (X) no canto superior direito */}
        <button
          type="button"
          className="rk-modal-close"
          onClick={onClose}
          aria-label="Fechar modal do ranking"
          title="Fechar (ESC)"
        >
          ✕
        </button>

        {/* Cabeçalho Centralizado (Item 1 do Mockup) */}
        <header className="rk-modal-header">
          <h2 id="rk-modal-title" className="rk-modal-title">
            RENTABILIDADE MÉDIA
          </h2>
          <p className="rk-modal-subtitle">
            Rentabilidade Total / Nº de Manifestos
          </p>
        </header>

        {/* Barra de Controles (Itens 2, 10, 3 e 4 do Mockup) */}
        <div className="rk-controls-bar">
          {/* (2) Seletor de mês em pílula azul */}
          <div className="rk-month-select-wrap">
            <select
              aria-label="Selecionar mês de referência"
              className="rk-month-select"
              value={resumo?.mesReferencia ?? mesSelecionado}
              onChange={e => onChangeMes(e.target.value)}
            >
              {mesesOpcoes.map(m => (
                <option key={m} value={m}>
                  {formatarMesNome(m).toUpperCase()}
                </option>
              ))}
            </select>
            <span className="rk-month-caret">▼</span>
          </div>

          {/* (2) Radio buttons: Rentabilidade Geral vs Rentabilidade Grande SP */}
          <div className="rk-radio-group" role="radiogroup" aria-label="Escopo de rentabilidade">
            <label className="rk-radio-label">
              <input
                type="radio"
                name="rk-visao"
                checked={visaoSelecionada === "GERAL"}
                onChange={() => onChangeVisao("GERAL")}
              />
              <span className="rk-radio-custom" />
              <span className="rk-radio-text">Rentabilidade Geral</span>
            </label>

            <label className="rk-radio-label">
              <input
                type="radio"
                name="rk-visao"
                checked={visaoSelecionada === "GRANDE_SP"}
                onChange={() => onChangeVisao("GRANDE_SP")}
              />
              <span className="rk-radio-custom" />
              <span className="rk-radio-text">Rentabilidade Grande SP</span>
            </label>
          </div>

          {/* (10) Filtro Rentabilidade Média */}
          <div className="rk-filter-select-wrap">
            <select
              aria-label="Filtrar por faixa de rentabilidade média"
              className="rk-filter-select"
              value={filtroFaixa}
              onChange={e => setFiltroFaixa(e.target.value)}
            >
              {FAIXAS_FILTRO.map(f => (
                <option key={f.codigo} value={f.codigo}>
                  Rentabilidade média : {f.rotulo}
                </option>
              ))}
            </select>
          </div>

          {/* (3) Filtro Tipo de veículo */}
          <div className="rk-filter-select-wrap">
            <select
              aria-label="Filtrar por tipo de veículo"
              className="rk-filter-select"
              value={filtroVeiculo}
              onChange={e => setFiltroVeiculo(e.target.value)}
            >
              <option value="TODOS">Tipo de veículo: Todos</option>
              <optgroup label="Categorias">
                {CATEGORIAS_FILTRO.map(c => (
                  <option key={c.codigo} value={`CAT:${c.codigo}`}>
                    Tipo de veículo: {c.rotulo}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Subcategorias">
                {SUBCATEGORIAS_FILTRO.map(s => (
                  <option key={s.codigo} value={`SUB:${s.codigo}`}>
                    Tipo de veículo: {s.rotulo}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* (4) Busca por nome do motorista */}
          <div className="rk-search-wrap">
            <span className="rk-search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              type="search"
              className="rk-search-input"
              placeholder="Buscar motorista..."
              value={buscaMotorista}
              onChange={e => setBuscaMotorista(e.target.value)}
              aria-label="Buscar motorista por nome"
            />
          </div>
        </div>

        {/* Faixa de Resumo do Período (Item 5 do Mockup) */}
        {resumo && (
          <div className="rk-summary-strip">
            <div className="rk-summary-item">
              <strong>Média da frota:</strong>{" "}
              <span>{formatarMoedaBr(resumo.mediaFrotaMes)}</span>
            </div>

            <div className="rk-summary-item">
              <strong>{formatarMesNome(resumo.mesAnterior)}:</strong>{" "}
              {resumo.possuiDadosMesAnterior &&
              resumo.mediaFrotaMesAnterior !== null ? (
                <span>
                  {formatarMoedaBr(resumo.mediaFrotaMesAnterior)}{" "}
                  {resumo.variacaoFrotaPercentual !== null && (
                    <strong
                      className={
                        resumo.variacaoFrotaPercentual >= 0
                          ? "rk-var-up"
                          : "rk-var-down"
                      }
                    >
                      {resumo.variacaoFrotaPercentual >= 0 ? "▲ +" : "▼ −"}
                      {Math.abs(resumo.variacaoFrotaPercentual).toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        },
                      )}
                      %
                    </strong>
                  )}
                </span>
              ) : (
                <span>—</span>
              )}
            </div>

            <div className="rk-summary-item">
              <strong>Motoristas:</strong>{" "}
              <span>{formatarInteiroBr(resumo.totalMotoristas)}</span>
            </div>

            <div className="rk-summary-item">
              <strong>Manifestos:</strong>{" "}
              <span>{formatarInteiroBr(resumo.totalManifestos)}</span>
            </div>
          </div>
        )}

        {/* Estados de Carregamento, Erro ou Vazio (Fluxos Alternativos A1 e A2) */}
        {carregando ? (
          <div className="rk-state-box">
            <p>Carregando dados do ranking de rentabilidade...</p>
          </div>
        ) : erro ? (
          <div className="rk-state-box rk-state-error">
            <p>{erro}</p>
          </div>
        ) : resumo && !resumo.possuiDadosMes ? (
          <div className="rk-state-box">
            <p>
              {!resumo.possuiManifestosImportadosNoMes
                ? "Não há manifestos importados para o mês selecionado."
                : "Nenhum manifesto para destinos da Grande SP no mês selecionado."}
            </p>
          </div>
        ) : dados ? (
          <div className="rk-main-grid">
            {/* Coluna Esquerda: Tabela Completa do Ranking */}
            <RankingTable
              itens={itensFiltrados}
              onAnalisarNegativos={
                onAbrirPaginaNegativos && resumo
                  ? () =>
                      onAbrirPaginaNegativos(
                        resumo.mesReferencia,
                        visaoSelecionada,
                      )
                  : undefined
              }
            />

            {/* Coluna Direita: 3 Gráficos Empilhados */}
            <RankingChartsColumn
              faixas={dados.graficoFaixas}
              subcategorias={dados.graficoSubcategorias}
              destinoComparativo={dados.graficoGrandeSpVsDemais}
              mediaFrotaMes={dados.resumo.mediaFrotaMes}
              totalMotoristas={dados.resumo.totalMotoristas}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
