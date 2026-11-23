import type { SubmitEventHandler } from "react";
import type { MotoristaEmRota } from "../../hooks/useMotoristasPainel";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDrivers } from "../../hooks/useDrivers";
import useUsuario from "../../hooks/useUsuario";
import Modal from "../common/Modal";

type Props = {
  motorista: MotoristaEmRota;
  onClose: () => void;
  onRemove: () => void;
};

export default function AvaliacaoModal({
  motorista,
  onClose,
  onRemove,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const { session } = useUsuario();
  const { avaliacao, setAvaliacao, sendAvaliacao, error } = useDrivers(
    session.userName,
  );
  const semManifestoNaRota = motorista.numeroManifesto === null;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await sendAvaliacao();
    setSubmitting(false);
    if (ok)
      onRemove();
  };

  useEffect(() => {
    const id = Number(motorista.id);
    const numeroManifesto = Number(motorista.numeroManifesto ?? 0);

    setAvaliacao(prev => ({
      ...prev,
      motoristaId: Number.isFinite(id) ? id : 0,
      nota: 5,
      numeroManifesto,
      feedback: "",
    }));
  }, [motorista.id, motorista.numeroManifesto, setAvaliacao]);

  return (
    <Modal title={`Concluir rota · ${motorista.nome}`} onClose={onClose}>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <p className="modal-copy">
          Registre a avaliação do frete antes de liberar
          {" "}
          {motorista.nome.split(" ")[0]}
          {" "}
          como disponível.
        </p>
        {semManifestoNaRota
          ? (
              <p className="modal-error" role="alert">
                Esta rota foi iniciada antes do registro do número do manifesto e
                não pode ser avaliada. Altere o status do motorista para outro e
                coloque-o em rota novamente informando o manifesto.
              </p>
            )
          : (
              <p className="modal-copy">
                Manifesto:
                {motorista.numeroManifesto}
              </p>
            )}
        <label className="eval-score modal-score">
          Nota (1 a 5):
          <select
            required
            className="ml-2"
            value={avaliacao.nota}
            onChange={e =>
              setAvaliacao(prev => ({
                ...prev,
                nota: Number(e.target.value),
              }))}
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <textarea
          required
          placeholder="Observação sobre o frete realizado..."
          value={avaliacao.feedback}
          onChange={e =>
            setAvaliacao(prev => ({ ...prev, feedback: e.target.value }))}
        />
        {error && (
          <p className="modal-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={
              !avaliacao.feedback.trim() || submitting || semManifestoNaRota
            }
          >
            <CheckCircle2 size={15} />
            {" "}
            {submitting ? "Salvando..." : "Concluir e liberar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
