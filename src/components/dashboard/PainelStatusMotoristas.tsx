import { useState } from "react";
import type { Driver, DriverStatus, ResultadoSalvarStatus } from "../../types/driver";
import { ageDays } from "../../utils/date";
import { listarManifestosEmUso } from "../../utils/manifesto";
import ModalAtualizarStatus from "./ModalAtualizarStatus";
import "../../styles/painelStatusMotoristas.css";

type Props = {
  drivers: Driver[];
  onChangeStatus: (id: string, status: DriverStatus, numeroManifesto?: number) => Promise<ResultadoSalvarStatus>;
};

function formatarDataBr(iso?: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function PainelStatusMotoristas({ drivers, onChangeStatus }: Props) {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const motoristasEmRota = drivers.filter(d => d.status === "em_rota");
  const motoristasIndesejados = drivers.filter(d => d.status === "indesejado");

  const manifestosEmUso = listarManifestosEmUso(drivers, selectedDriver?.id ?? "");

  return (
    <div className="psm-container">
      <div className="psm-tables-grid">
        {/* Tabela 1: Motoristas Em Rota */}
        <div className="psm-card psm-card--rota">
          <div className="psm-card-header psm-card-header--rota">
            <span className="psm-indicator-num">1</span>
            <h3 className="psm-card-title">MOTORISTAS EM ROTA</h3>
            <span className="psm-badge psm-badge--rota">
              Total: {motoristasEmRota.length}
            </span>
          </div>

          <div className="psm-table-wrap">
            <table className="psm-table psm-table--rota">
              <thead>
                <tr>
                  <th className="psm-th-num">
                    <span className="psm-indicator-num psm-indicator-num--col">2</span>
                    #
                  </th>
                  <th>Motorista</th>
                  <th>Manifesto</th>
                  <th>Pontuação</th>
                </tr>
              </thead>
              <tbody>
                {motoristasEmRota.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="psm-td-empty">
                      Nenhum motorista em rota no momento.
                    </td>
                  </tr>
                ) : (
                  motoristasEmRota.map((m, idx) => {
                    const nota = m.notaMedia && m.notaMedia > 0 ? m.notaMedia : 5.0;
                    return (
                      <tr
                        key={m.id}
                        className="psm-tr"
                        onClick={() => setSelectedDriver(m)}
                        title="Clique para alterar status"
                      >
                        <td className="psm-td-num">{idx + 1}</td>
                        <td className="psm-td-driver">
                          {m.nome}
                          {m.veiculo && m.veiculo !== "—" ? ` - ${m.veiculo}` : ""}
                        </td>
                        <td className="psm-td-manifesto">
                          {m.manifestoAtual ? m.manifestoAtual : "—"}
                        </td>
                        <td className="psm-td-score">
                          <span className="psm-score-val">
                            {nota.toFixed(1).replace(".", ",")}
                          </span>{" "}
                          <span className="psm-stars">★★★★★</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabela 2: Motoristas Indesejados */}
        <div className="psm-card psm-card--indesejado">
          <div className="psm-card-header psm-card-header--indesejado">
            <span className="psm-indicator-num">3</span>
            <h3 className="psm-card-title">MOTORISTAS INDESEJADOS</h3>
            <span className="psm-badge psm-badge--indesejado">
              Total: {motoristasIndesejados.length}
            </span>
          </div>

          <div className="psm-table-wrap">
            <table className="psm-table psm-table--indesejado">
              <thead>
                <tr>
                  <th className="psm-th-num">
                    <span className="psm-indicator-num psm-indicator-num--col">4</span>
                    #
                  </th>
                  <th>Motorista</th>
                  <th>Data</th>
                  <th>Dias</th>
                </tr>
              </thead>
              <tbody>
                {motoristasIndesejados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="psm-td-empty">
                      Nenhum motorista com status indesejado.
                    </td>
                  </tr>
                ) : (
                  motoristasIndesejados.map((m, idx) => {
                    const dataRef = m.statusUpdatedAt || m.manifestoData || "";
                    const dias = dataRef ? ageDays(dataRef) : "—";
                    return (
                      <tr
                        key={m.id}
                        className="psm-tr"
                        onClick={() => setSelectedDriver(m)}
                        title="Clique para alterar status"
                      >
                        <td className="psm-td-num">{idx + 1}</td>
                        <td className="psm-td-driver">
                          {m.nome}
                          {m.veiculo && m.veiculo !== "—" ? ` - ${m.veiculo}` : ""}
                        </td>
                        <td className="psm-td-data">{formatarDataBr(dataRef)}</td>
                        <td className="psm-td-dias">{dias}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Nota / Instrução de Interatividade (Item 5 do Mockup) */}
      <div className="psm-footer-legend">
        <span className="psm-indicator-num psm-indicator-num--legend">5</span>
        <span className="psm-legend-text">
          Clique em uma linha para abrir o modal de atualização de status
        </span>
      </div>

      {/* Modal de Atualização de Status */}
      <ModalAtualizarStatus
        driver={selectedDriver}
        isOpen={!!selectedDriver}
        onClose={() => setSelectedDriver(null)}
        onConfirm={onChangeStatus}
        manifestosEmUso={manifestosEmUso}
      />
    </div>
  );
}
