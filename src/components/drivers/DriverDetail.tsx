import type { Role } from "../../types/app";
import type { Driver, DriverStatus } from "../../types/driver";
import { Calendar, FileText, LayoutGrid, Lock, Phone, Star, Truck, X } from "lucide-react";
import { STATUS, STATUS_KEYS } from "../../constants/status";
import { ageDays, formatPhone } from "../../utils/date";
import Stars from "../common/Stars";
import StatusPill from "../common/StatusPill";

type Props = {
  driver: Driver | null;
  role: Role;
  onChangeStatus: (id: string, status: DriverStatus) => void;
  onOpenEvalModal: (id: string) => void;
  onOpenManifestoModal: (id: string) => void;
  onClose: (() => void) | null;
};

// Avaliação só aparece ao concluir uma rota (modal) e no histórico da gerência
export default function DriverDetail({ driver, role, onChangeStatus, onOpenEvalModal, onOpenManifestoModal, onClose }: Props) {
  if (!driver) {
    return (
      <div className="detail-empty">
        <LayoutGrid size={28} strokeWidth={1.4} />
        <p>Selecione um motorista na lista para ver os detalhes.</p>
      </div>
    );
  }

  const avg = driver.avaliacoes.length
    ? (driver.avaliacoes.reduce((s, a) => s + a.nota, 0) / driver.avaliacoes.length).toFixed(1)
    : "—";
  const isLockedByOther = !!driver.lockedBy && driver.lockedBy !== "Você";
  const emRota = driver.status === "em_rota";

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <h3>{driver.nome}</h3>
          <span className="detail-sub">
            <Truck size={13} />
            {" "}
            {driver.veiculo}
            {" "}
            ·
            {" "}
            {driver.placa}
          </span>
        </div>
        <div className="detail-header-right">
          <StatusPill status={driver.status} />
          {onClose && <button className="icon-btn" title="Fechar" onClick={onClose}><X size={14} /></button>}
        </div>
      </div>

      <div className="detail-grid">
        <div className="info-cell">
          <span>Telefone</span>
          <strong>
            <Phone size={12} />
            {" "}
            {formatPhone(driver.telefone)}
          </strong>
        </div>
        <div className="info-cell">
          <span>Manifesto</span>
          <strong>
            <Calendar size={12} />
            {" "}
            {driver.manifestoData}
            {" "}
            (
            {ageDays(driver.manifestoData)}
            d)
          </strong>
        </div>
        {driver.manifestoAtual !== undefined && driver.manifestoAtual !== null && (
          <div className="info-cell">
            <span>Manifesto em rota</span>
            <strong>
              <FileText size={12} />
              {" "}
              {driver.manifestoAtual}
            </strong>
          </div>
        )}
        {role === "gerente" && (
          <div className="info-cell">
            <span>Média geral</span>
            <strong>
              <Star size={12} />
              {" "}
              {avg}
              {" "}
              / 5
            </strong>
          </div>
        )}
      </div>

      {isLockedByOther
        ? (
            <div className="lock-warning">
              <Lock size={14} />
              {" "}
              Em contato por
              {" "}
              <b>{driver.lockedBy}</b>
              {" "}
              — aguarde a liberação.
            </div>
          )
        : (
            <div className="contact-note">
              <Lock size={12} />
              {" "}
              Em contato com você
            </div>
          )}

      <div className="status-actions">
        <span className="section-label">Alterar status</span>
        <div className={`status-buttons${emRota ? " em-rota" : ""}`}>
          {STATUS_KEYS.map((key) => {
            const s = STATUS[key];
            const isConclude = key === "disponivel" && emRota;
            const isEnterRoute = key === "em_rota" && !emRota;
            // Em rota: só o botão "Concluir rota" fica habilitado
            const bloqueadoPorRota = emRota && !isConclude;
            const disabled = isLockedByOther || bloqueadoPorRota;

            if (emRota && key === "disponivel") {
              return (
                <button
                  key={key}
                  disabled={isLockedByOther}
                  className="status-btn conclude"
                  onClick={() => onOpenEvalModal(driver.id)}
                >
                  Concluir rota (avaliar)
                </button>
              );
            }

            return (
              <button
                key={key}
                disabled={disabled}
                className={`status-btn${driver.status === key ? " active" : ""}`}
                style={driver.status === key ? { borderColor: s.color, color: s.color } : {}}
                onClick={() => {
                  if (disabled) return;
                  if (isEnterRoute)
                    onOpenManifestoModal(driver.id);
                  else
                    onChangeStatus(driver.id, key);
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {role === "gerente" && (
        <div className="eval-history">
          <span className="section-label">Histórico de avaliações</span>
          {driver.avaliacoes.length === 0 && <p className="empty-hint">Sem avaliações registradas.</p>}
          {driver.avaliacoes.map((a, i) => (
            <div className="eval-item" key={i}>
              <Stars value={a.nota} />
              <div>
                <p>{a.obs}</p>
                <span className="eval-meta">
                  {a.manifesto != null && (
                    <>
                      Manifesto
                      {" "}
                      {a.manifesto}
                      {" "}
                      ·
                      {" "}
                    </>
                  )}
                  {a.operador}
                  {" "}
                  ·
                  {" "}
                  {a.data}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
