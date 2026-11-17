import type { SubmitEventHandler } from "react";
import type { MotoristaIndesejado } from "../../hooks/useMotoristasPainel";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import useMotoristasPainel from "../../hooks/useMotoristasPainel";
import Modal from "../common/Modal";

type Props = {
  motorista: MotoristaIndesejado;
  onClose: () => void;
  onRemove: () => void;
};

export default function IndesejadoModal({
  motorista,
  onClose,
  onRemove,
}: Props) {
  const { disponibilizaMotorista } = useMotoristasPainel();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    disponibilizaMotorista(motorista.id);
    setSubmitting(false);
    onRemove();
  };

  return (
    <Modal
      title={`Reverter Indesejado · ${motorista.nome} · ${motorista.diasComIndesejado} ${motorista.diasComIndesejado > 1 ? "dias" : "dia"}`}
      onClose={onClose}
    >
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <p className="modal-copy">
          Remover status <strong>Indesejado</strong> do {motorista.nome} depois de {motorista.diasComIndesejado} dias?
        </p>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            <CheckCircle2 size={15} />

            {submitting ? "Salvando..." : "Concluir"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
