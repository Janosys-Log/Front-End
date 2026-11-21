import type { Role } from "../../types/app";
import type { Driver, DriverStatus, ResultadoSalvarStatus } from "../../types/driver";
import { useEffect, useState } from "react";
import { Calendar, Check, FileText, LayoutGrid, Lock, Pencil, Phone, Star, Truck, X } from "lucide-react";
import { STATUS, STATUS_KEYS } from "../../constants/status";
import { ageDays, formatPhone } from "../../utils/date";
import Stars from "../common/Stars";
import StatusPill from "../common/StatusPill";

type Props = {
  driver: Driver | null;
  role: Role;
  onChangeStatus: (id: string, status: DriverStatus) => void;
  onUpdatePhone?: (id: string, telefone: string) => Promise<ResultadoSalvarStatus>;
  onOpenEvalModal: (id: string) => void;
  onOpenManifestoModal: (id: string) => void;
  onClose: (() => void) | null;
};

// Avaliação só aparece ao concluir uma rota (modal) e no histórico da gerência
export default function DriverDetail({ driver, role, onChangeStatus, onUpdatePhone, onOpenEvalModal, onOpenManifestoModal, onClose }: Props) {
  const [editandoTelefone, setEditandoTelefone] = useState(false);
  const [telefoneDraft, setTelefoneDraft] = useState("");
  const [salvandoTelefone, setSalvandoTelefone] = useState(false);

  useEffect(() => {
    setEditandoTelefone(false);
    setTelefoneDraft(driver?.telefone ?? "");
    setSalvandoTelefone(false);
  }, [driver?.id, driver?.telefone]);

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

  async function salvarTelefone() {
    if (!driver || !onUpdatePhone || salvandoTelefone) return;
    setSalvandoTelefone(true);
    const res = await onUpdatePhone(driver.id, telefoneDraft);
    setSalvandoTelefone(false);
    if (!res.ok) {
      window.alert(res.mensagem);
      return;
    }
    setEditandoTelefone(false);
  }

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
          {editandoTelefone
            ? (
                <div className="phone-edit-form">
                  <input
                    className="phone-input"
                    type="text"
                    maxLength={20}
                    value={telefoneDraft}
                    onChange={e => setTelefoneDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void salvarTelefone();
                      if (e.key === "Escape") {
                        setEditandoTelefone(false);
                        setTelefoneDraft(driver.telefone);
                      }
                    }}
                    placeholder="(11) 99999-9999"
                    disabled={salvandoTelefone}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="phone-action-btn save"
                    title="Salvar telefone"
                    onClick={() => void salvarTelefone()}
                    disabled={salvandoTelefone}
                  >
                    <Check size={13} />
                  </button>
                  <button
                    type="button"
                    className="phone-action-btn cancel"
                    title="Cancelar"
                    onClick={() => {
                      setEditandoTelefone(false);
                      setTelefoneDraft(driver.telefone);
                    }}
                    disabled={salvandoTelefone}
                  >
                    <X size={13} />
                  </button>
                </div>
              )
            : (
                <strong className="phone-row">
                  <Phone size={12} />
                  {" "}
                  <span>{formatPhone(driver.telefone) || "Não informado"}</span>
                  {onUpdatePhone && !isLockedByOther && (
                    <button
                      type="button"
                      className="phone-edit-btn"
                      title="Editar telefone"
                      onClick={() => {
                        setTelefoneDraft(driver.telefone);
                        setEditandoTelefone(true);
                      }}
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </strong>
              )}
        </div>
        <div className="info-cell">
          <span>Manifesto</span>
          <strong>
            <Calendar size={12} />
            {" "}
            {driver.manifestoData
              ? `${driver.manifestoData} (${ageDays(driver.manifestoData)}d)`
              : "Sem manifesto"}
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
