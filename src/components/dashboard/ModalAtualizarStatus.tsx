import { useState, useEffect } from "react";
import type { Driver, DriverStatus, ResultadoSalvarStatus } from "../../types/driver";
import { STATUS } from "../../constants/status";
import { ehNumeroManifestoValido } from "../../utils/manifesto";
import "../../styles/modalAtualizarStatus.css";

type Props = {
  driver: Driver | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, novoStatus: DriverStatus, numeroManifesto?: number) => Promise<ResultadoSalvarStatus>;
  manifestosEmUso?: number[];
};

export default function ModalAtualizarStatus({
  driver,
  isOpen,
  onClose,
  onConfirm,
  manifestosEmUso = [],
}: Props) {
  const [novoStatus, setNovoStatus] = useState<DriverStatus>("disponivel");
  const [manifestoInput, setManifestoInput] = useState<string>("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    if (driver) {
      setNovoStatus(driver.status);
      setManifestoInput(driver.manifestoAtual ? String(driver.manifestoAtual) : "");
      setErro("");
    }
  }, [driver, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !driver) return null;

  async function handleSalvar() {
    setErro("");

    let numManifesto: number | undefined;
    if (novoStatus === "em_rota") {
      const valor = Number(manifestoInput.trim());
      if (!ehNumeroManifestoValido(valor)) {
        setErro("Informe um número de manifesto válido (número inteiro positivo).");
        return;
      }
      if (manifestosEmUso.includes(valor) && driver && driver.manifestoAtual !== valor) {
        setErro(`O manifesto ${valor} já está em uso por outro motorista.`);
        return;
      }
      numManifesto = valor;
    }

    if (!driver) return;

    setSalvando(true);
    try {
      const res = await onConfirm(driver.id, novoStatus, numManifesto);
      if (!res.ok) {
        setErro(res.mensagem);
      } else {
        onClose();
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao atualizar status.");
    } finally {
      setSalvando(false);
    }
  }

  const statusAtualInfo = STATUS[driver.status];

  return (
    <div className="mas-backdrop" onClick={onClose} role="presentation">
      <div
        className="mas-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mas-title"
        onClick={e => e.stopPropagation()}
      >
        <header className="mas-header">
          <h2 id="mas-title" className="mas-title">
            Atualização de Status do Motorista
          </h2>
          <button
            type="button"
            className="mas-close"
            onClick={onClose}
            aria-label="Fechar modal"
            disabled={salvando}
          >
            ✕
          </button>
        </header>

        <div className="mas-driver-info">
          <div className="mas-driver-row">
            <span className="mas-driver-label">Motorista:</span>
            <strong className="mas-driver-name">
              {driver.nome} {driver.veiculo !== "—" ? `· ${driver.veiculo}` : ""}
            </strong>
          </div>
          {driver.placa && (
            <div className="mas-driver-row">
              <span className="mas-driver-label">Placa:</span>
              <span>{driver.placa}</span>
            </div>
          )}
          <div className="mas-driver-row">
            <span className="mas-driver-label">Status atual:</span>
            <span
              className="mas-status-pill"
              style={{
                backgroundColor: `${statusAtualInfo.color}15`,
                color: statusAtualInfo.color,
                borderColor: statusAtualInfo.color,
              }}
            >
              {statusAtualInfo.label}
            </span>
          </div>
          {driver.status === "em_rota" && driver.manifestoAtual && (
            <div className="mas-driver-row">
              <span className="mas-driver-label">Manifesto em rota:</span>
              <strong>#{driver.manifestoAtual}</strong>
            </div>
          )}
        </div>

        <div className="mas-form">
          <label className="mas-section-title">Selecione o novo status:</label>
          <div className="mas-status-options">
            {(["disponivel", "em_rota", "indisponivel", "indesejado"] as DriverStatus[]).map(st => {
              const info = STATUS[st];
              const selecionado = novoStatus === st;
              return (
                <label
                  key={st}
                  className={`mas-status-option ${selecionado ? "mas-status-option--ativo" : ""}`}
                  style={selecionado ? { borderColor: info.color } : {}}
                >
                  <input
                    type="radio"
                    name="novoStatus"
                    value={st}
                    checked={selecionado}
                    onChange={() => setNovoStatus(st)}
                    disabled={salvando}
                  />
                  <span
                    className="mas-status-dot"
                    style={{ backgroundColor: info.color }}
                  />
                  <span className="mas-status-label">{info.label}</span>
                </label>
              );
            })}
          </div>

          {novoStatus === "em_rota" && (
            <div className="mas-input-group">
              <label htmlFor="mas-manifesto-input" className="mas-input-label">
                Número do Manifesto <span className="mas-required">*</span>
              </label>
              <input
                id="mas-manifesto-input"
                type="number"
                min="1"
                step="1"
                className="mas-input"
                placeholder="Ex: 123456"
                value={manifestoInput}
                onChange={e => setManifestoInput(e.target.value)}
                disabled={salvando}
                autoFocus
              />
            </div>
          )}

          {erro && (
            <p className="mas-error" role="alert">
              ⚠️ {erro}
            </p>
          )}
        </div>

        <footer className="mas-footer">
          <button
            type="button"
            className="mas-btn mas-btn--secondary"
            onClick={onClose}
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="mas-btn mas-btn--primary"
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar Alteração"}
          </button>
        </footer>
      </div>
    </div>
  );
}
