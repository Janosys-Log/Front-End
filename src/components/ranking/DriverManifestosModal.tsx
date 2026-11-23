import type {
  DetalheMotoristaManifestosResponseDTO,
  ManifestoItemDetalheDTO,
  VisaoRanking,
} from "../../types/ranking";
import { useEffect, useState } from "react";
import {
  buscarManifestosMotoristaNegativo,
  formatarMesNome,
  formatarMoedaBr,
} from "../../services/ranking.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  motoristaId: number | null;
  mesSelecionado: string;
  visaoSelecionada: VisaoRanking;
}

export default function DriverManifestosModal({
  isOpen,
  onClose,
  motoristaId,
  mesSelecionado,
  visaoSelecionada,
}: Props) {
  const [detalhes, setDetalhes] =
    useState<DetalheMotoristaManifestosResponseDTO | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // Fechar com ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !motoristaId) {
      setDetalhes(null);
      return;
    }
    let cancelado = false;

    async function carregarManifestos() {
      setCarregando(true);
      setErro("");
      try {
        const resp = await buscarManifestosMotoristaNegativo(
          motoristaId!,
          mesSelecionado || undefined,
          visaoSelecionada,
        );
        if (cancelado) return;
        setDetalhes(resp);
      } catch (e) {
        if (cancelado) return;
        setErro(
          e instanceof Error
            ? e.message
            : "Não foi possível carregar os manifestos do motorista.",
        );
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void carregarManifestos();
    return () => {
      cancelado = true;
    };
  }, [isOpen, motoristaId, mesSelecionado, visaoSelecionada]);

  if (!isOpen || !motoristaId) return null;

  return (
    <div
      className="rk-manifestos-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="rk-manifestos-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rk-manif-title"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="rk-manifestos-close"
          onClick={onClose}
          aria-label="Fechar modal de manifestos"
          title="Fechar (ESC)"
        >
          ✕
        </button>

        {carregando ? (
          <div className="rk-manif-state">Carregando manifestos do motorista...</div>
        ) : erro ? (
          <div className="rk-manif-state rk-state-error">{erro}</div>
        ) : detalhes ? (
          <>
            {/* Cabeçalho (Item 6 do Mockup / Figura 6) */}
            <header className="rk-manif-header">
              <h2 id="rk-manif-title" className="rk-manif-title">
                {detalhes.nomeMotorista} · {detalhes.subtipoLabel}
              </h2>
              <div className="rk-manif-subtitle">
                <span>{formatarMesNome(detalhes.mesReferencia)}</span>
                <span className="rk-manif-sep">·</span>
                <span>
                  visão {detalhes.visao === "GRANDE_SP" ? "Grande SP" : "Geral"}
                </span>
                <span className="rk-manif-sep">·</span>
                <span>
                  posição <strong>{detalhes.posicaoFormatada}</strong>
                </span>
                <span className="rk-manif-sep">·</span>
                <span>
                  Rentabilidade Média{" "}
                  <strong className="rk-text-negative">
                    {formatarMoedaBr(detalhes.rentabilidadeMedia)}
                  </strong>
                </span>
                <span className="rk-manif-sep">·</span>
                <span>
                  RT total{" "}
                  <strong className="rk-text-negative">
                    {formatarMoedaBr(detalhes.rentabilidadeTotal)}
                  </strong>
                </span>
                <span className="rk-manif-sep">·</span>
                <span>
                  <strong>{detalhes.fracaoManifestosNegativos}</strong> manifestos negativos
                </span>
              </div>
            </header>

            {/* Subtítulo da Seção */}
            <div className="rk-manif-table-title">
              Manifestos do mês (pior RT primeiro)
            </div>

            {/* Tabela de Manifestos */}
            <div className="rk-manif-table-wrap">
              <div className="rk-manif-header-row" role="row">
                <div className="rk-mth rk-mcol-id">Manifesto</div>
                <div className="rk-mth rk-mcol-data">Data</div>
                <div className="rk-mth rk-mcol-dest">Destino</div>
                <div className="rk-mth rk-mcol-val">Frete empresa (R$)</div>
                <div className="rk-mth rk-mcol-val">Frete motorista (R$)</div>
                <div className="rk-mth rk-mcol-val">RT do manifesto (R$)</div>
              </div>

              <div className="rk-manif-body" role="rowgroup">
                {detalhes.manifestos.length === 0 ? (
                  <div className="rk-manif-empty">
                    Nenhum manifesto registrado no período.
                  </div>
                ) : (
                  detalhes.manifestos.map((m: ManifestoItemDetalheDTO, idx: number) => {
                    const isNegativo = m.rtManifesto < 0;
                    return (
                      <div
                        key={m.idManifesto || idx}
                        className={`rk-manif-row ${idx % 2 === 0 ? "rk-manif-row-even" : "rk-manif-row-odd"}`}
                        role="row"
                      >
                        <div className="rk-mcell rk-mcol-id">
                          {m.numeroManifesto}
                        </div>
                        <div className="rk-mcell rk-mcol-data">
                          {m.dataManifesto}
                        </div>
                        <div className="rk-mcell rk-mcol-dest" title={m.destino}>
                          {m.destino}
                        </div>
                        <div className="rk-mcell rk-mcol-val">
                          {formatarMoedaBr(m.freteEmpresa, false)}
                        </div>
                        <div className="rk-mcell rk-mcol-val">
                          {formatarMoedaBr(m.freteMotorista, false)}
                        </div>
                        <div
                          className={`rk-mcell rk-mcol-val rk-mcol-rt ${isNegativo ? "rk-text-negative" : "rk-text-positive"}`}
                        >
                          {isNegativo ? "" : "+"}
                          {formatarMoedaBr(m.rtManifesto, false)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Rodapé com Totais */}
            <footer className="rk-manif-footer">
              <div className="rk-manif-footer-stats">
                <span className="rk-manif-footer-item">
                  Total das RT:{" "}
                  <strong className="rk-text-negative">
                    {formatarMoedaBr(detalhes.rentabilidadeTotal, false)}
                  </strong>
                </span>
                <span className="rk-manif-footer-item">
                  Média (÷ {detalhes.totalManifestos} manifestos):{" "}
                  <strong className="rk-text-negative">
                    {formatarMoedaBr(detalhes.rentabilidadeMedia, false)}
                  </strong>
                </span>
              </div>
            </footer>
          </>
        ) : null}
      </div>
    </div>
  );
}
