import type {
  MotoristaNegativoItemDTO,
  PaginaNegativosResponseDTO,
  VisaoRanking,
} from "../types/ranking";
import { useEffect, useMemo, useState } from "react";
import DriverManifestosModal from "../components/ranking/DriverManifestosModal";
import {
  buscarPaginaNegativos,
  formatarInteiroBr,
  formatarMesNome,
  formatarMoedaBr,
} from "../services/ranking.service";

interface Props {
  mesInicial?: string;
  visaoInicial?: VisaoRanking;
  onVoltarAoDashboard: () => void;
  textoBotaoVoltar?: string;
  onChangeMes?: (novoMes: string) => void;
  onChangeVisao?: (novaVisao: VisaoRanking) => void;
}

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

export default function RentabilidadeNegativaPage({
  mesInicial = "",
  visaoInicial = "GERAL",
  onVoltarAoDashboard,
  textoBotaoVoltar,
  onChangeMes,
  onChangeVisao,
}: Props) {
  const [mesSelecionado, setMesSelecionado] = useState<string>(mesInicial);
  const [visaoSelecionada, setVisaoSelecionada] =
    useState<VisaoRanking>(visaoInicial);

  useEffect(() => {
    if (mesInicial) setMesSelecionado(mesInicial);
  }, [mesInicial]);

  useEffect(() => {
    if (visaoInicial) setVisaoSelecionada(visaoInicial);
  }, [visaoInicial]);

  const [dados, setDados] = useState<PaginaNegativosResponseDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Filtros locais
  const [filtroVeiculo, setFiltroVeiculo] = useState<string>("TODOS");
  const [buscaMotorista, setBuscaMotorista] = useState<string>("");

  // Estado do Modal de Manifestos (Figura 6)
  const [modalMotoristaId, setModalMotoristaId] = useState<number | null>(null);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const resp = await buscarPaginaNegativos(
          mesSelecionado || undefined,
          visaoSelecionada,
        );
        if (cancelado) return;
        setDados(resp);
        if (!mesSelecionado && resp.resumo.mesReferencia) {
          setMesSelecionado(resp.resumo.mesReferencia);
        }
      } catch (e) {
        if (cancelado) return;
        setErro(
          e instanceof Error
            ? e.message
            : "Não foi possível carregar os motoristas com rentabilidade negativa.",
        );
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    void carregar();
    return () => {
      cancelado = true;
    };
  }, [mesSelecionado, visaoSelecionada]);

  // Filtragem local dos motoristas
  const motoristasFiltrados = useMemo<MotoristaNegativoItemDTO[]>(() => {
    if (!dados) return [];
    const termo = buscaMotorista.trim().toLowerCase();

    return dados.motoristas.filter((m: MotoristaNegativoItemDTO) => {
      if (termo && !m.nomeMotorista.toLowerCase().includes(termo)) {
        return false;
      }
      if (filtroVeiculo !== "TODOS") {
        if (filtroVeiculo.startsWith("CAT:")) {
          const cat = filtroVeiculo.slice(4);
          if (m.tipoVeiculo !== cat) return false;
        } else if (filtroVeiculo.startsWith("SUB:")) {
          const sub = filtroVeiculo.slice(4);
          if (m.subtipoVeiculo !== sub) return false;
        }
      }
      return true;
    });
  }, [dados, buscaMotorista, filtroVeiculo]);

  function renderVariacao(m: MotoristaNegativoItemDTO) {
    if (
      m.statusVariacao === "SEM_MES_ANTERIOR" ||
      m.variacaoMesAnterior === null
    ) {
      return <span className="rkn-var-neutral">—</span>;
    }
    if (m.statusVariacao === "NOVO") {
      return <span className="rkn-var-neutral">— novo</span>;
    }

    const valor = Math.abs(m.variacaoMesAnterior).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (m.statusVariacao === "AUMENTO") {
      return <span className="rkn-var-up">▲ +{valor}</span>;
    }
    if (m.statusVariacao === "QUEDA") {
      return <span className="rkn-var-down">▼ −{valor}</span>;
    }
    return <span className="rkn-var-neutral">0,00</span>;
  }

  const resumo = dados?.resumo;
  const mesesOpcoes = dados?.mesesDisponiveis?.length
    ? dados.mesesDisponiveis
    : mesSelecionado
      ? [mesSelecionado]
      : [];

  return (
    <div className="rkn-page-container">
      {/* Botão Superior Esquerdo (Item 1 do Mockup / Figura 5) */}
      <div className="rkn-top-bar">
        <button
          type="button"
          className="rkn-back-btn"
          onClick={onVoltarAoDashboard}
          title={textoBotaoVoltar ?? "Retornar ao Dashboard"}
        >
          {textoBotaoVoltar ?? "← Voltar ao Dashboard"}
        </button>
      </div>

      {/* Título Centralizado em vermelho/vinho */}
      <header className="rkn-page-header">
        <h1 className="rkn-page-title">
          MOTORISTAS COM RENTABILIDADE MÉDIA NEGATIVA
        </h1>
      </header>

      {/* Barra de Controles e Filtros (Item 2 do Mockup) */}
      <div className="rkn-controls-bar">
        {/* Seletor de mês em pílula azul */}
        <div className="rk-month-select-wrap">
          <select
            aria-label="Selecionar mês de referência"
            className="rk-month-select"
            value={resumo?.mesReferencia ?? mesSelecionado}
            onChange={e => {
              setMesSelecionado(e.target.value);
              onChangeMes?.(e.target.value);
            }}
          >
            {mesesOpcoes.map((m: string) => (
              <option key={m} value={m}>
                {formatarMesNome(m).toUpperCase()}
              </option>
            ))}
          </select>
          <span className="rk-month-caret">▼</span>
        </div>

        {/* Radio buttons: Rentabilidade Geral vs Grande SP */}
        <div className="rk-radio-group" role="radiogroup" aria-label="Escopo de rentabilidade">
          <label className="rk-radio-label">
            <input
              type="radio"
              name="rkn-visao"
              checked={visaoSelecionada === "GERAL"}
              onChange={() => {
                setVisaoSelecionada("GERAL");
                onChangeVisao?.("GERAL");
              }}
            />
            <span className="rk-radio-custom" />
            <span className="rk-radio-text">Rentabilidade Geral</span>
          </label>

          <label className="rk-radio-label">
            <input
              type="radio"
              name="rkn-visao"
              checked={visaoSelecionada === "GRANDE_SP"}
              onChange={() => {
                setVisaoSelecionada("GRANDE_SP");
                onChangeVisao?.("GRANDE_SP");
              }}
            />
            <span className="rk-radio-custom" />
            <span className="rk-radio-text">Rentabilidade Grande SP</span>
          </label>
        </div>

        {/* Filtro Tipo de veículo */}
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

        {/* Busca por nome do motorista */}
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

      {/* Faixa de Resumo (Item 3 do Mockup) */}
      {resumo && (
        <div className="rkn-summary-strip">
          <div className="rkn-summary-left">
            <strong>Motoristas com média negativa:</strong>{" "}
            <span>
              {resumo.quantidadeMotoristasNegativos} (
              {resumo.percentualNegativos.toLocaleString("pt-BR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
              % dos {formatarInteiroBr(resumo.totalMotoristasFrota)})
            </span>
          </div>

          <div className="rkn-summary-right">
            <span>RT total deles:</span>{" "}
            <strong className="rkn-rt-negative">
              {formatarMoedaBr(resumo.rtTotalNegativos)}
            </strong>
          </div>
        </div>
      )}

      {/* Estados de Carregamento, Erro ou Vazio */}
      {carregando ? (
        <div className="rk-state-box">
          <p>Carregando dados dos motoristas com rentabilidade negativa...</p>
        </div>
      ) : erro ? (
        <div className="rk-state-box rk-state-error">
          <p>{erro}</p>
        </div>
      ) : motoristasFiltrados.length === 0 ? (
        <div className="rkn-empty-card">
          <div className="rkn-empty-badge">✓</div>
          <h3>Excelente resultado!</h3>
          <p>
            {dados?.motoristas.length === 0
              ? "Nenhum motorista com rentabilidade média negativa no período selecionado."
              : "Nenhum motorista corresponde aos filtros aplicados."}
          </p>
        </div>
      ) : (
        <>
          {/* Tabela de Motoristas com RM Negativa (Item 4 do Mockup / Figura 5) */}
          <div className="rkn-table-container" role="table" aria-label="Tabela de motoristas com rentabilidade negativa">
            <div className="rkn-table-header" role="row">
              <div className="rkn-th rkn-col-pos" role="columnheader">#</div>
              <div className="rkn-th rkn-col-rm" role="columnheader">Rentab. Média</div>
              <div className="rkn-th rkn-col-var" role="columnheader">vs mês ant.</div>
              <div className="rkn-th rkn-col-manif" role="columnheader">Manifestos</div>
              <div className="rkn-th rkn-col-neg" role="columnheader">Negativos</div>
              <div className="rkn-th rkn-col-mot" role="columnheader">Motorista</div>
              <div className="rkn-th rkn-col-veic" role="columnheader">Tipo veíc.</div>
              <div className="rkn-th rkn-col-rt" role="columnheader">RT total (R$)</div>
              <div className="rkn-th rkn-col-arrow" role="columnheader">›</div>
            </div>

            <div className="rkn-table-body" role="rowgroup">
              {motoristasFiltrados.map((m: MotoristaNegativoItemDTO, idx: number) => (
                <div
                  key={m.motoristaId}
                  className={`rkn-row ${idx % 2 === 0 ? "rkn-row-even" : "rkn-row-odd"}`}
                  onClick={() => setModalMotoristaId(m.motoristaId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setModalMotoristaId(m.motoristaId);
                    }
                  }}
                  title={`Ver manifestos de ${m.nomeMotorista}`}
                >
                  <div className="rkn-cell rkn-col-pos">{m.posicaoFormatada}</div>
                  <div className="rkn-cell rkn-col-rm rkn-cell-bold rkn-text-red">
                    {formatarMoedaBr(m.rentabilidadeMedia, false)}
                  </div>
                  <div className="rkn-cell rkn-col-var">{renderVariacao(m)}</div>
                  <div className="rkn-cell rkn-col-manif">{m.numeroManifestos}</div>
                  <div className="rkn-cell rkn-col-neg">{m.fracaoManifestosNegativos}</div>
                  <div className="rkn-cell rkn-col-mot" title={m.nomeMotorista}>
                    {m.nomeMotorista}
                  </div>
                  <div className="rkn-cell rkn-col-veic">{m.subtipoLabel}</div>
                  <div className="rkn-cell rkn-col-rt rkn-cell-bold rkn-text-red">
                    {formatarMoedaBr(m.rentabilidadeTotal, false)}
                  </div>
                  <div className="rkn-cell rkn-col-arrow">›</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dica de rodapé (Item 5 do Mockup) */}
          <div className="rkn-table-footer-hint">
            Clique na linha de um motorista para abrir, em um modal, os manifestos dele no mês.
          </div>
        </>
      )}

      {/* Modal de Detalhamento dos Manifestos (Figura 6) */}
      <DriverManifestosModal
        isOpen={modalMotoristaId !== null}
        onClose={() => setModalMotoristaId(null)}
        motoristaId={modalMotoristaId}
        mesSelecionado={mesSelecionado}
        visaoSelecionada={visaoSelecionada}
      />
    </div>
  );
}
