import type { SubmitEventHandler } from "react";
import type { Driver } from "../../types/driver";
import { CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import useManifesto from "../../hooks/useManifesto";
import useUsuario from "../../hooks/useUsuario";
import Modal from "../common/Modal";

type AvaliacaoState = {
  motoristaId: number;
  nota: number;
  numeroManifesto: number;
  feedback: string;
};

type Props = {
  driver: Driver;
  onClose: () => void;
  avaliacao: AvaliacaoState;
  setAvaliacao: React.Dispatch<React.SetStateAction<AvaliacaoState>>;
  sendAvaliacao: () => Promise<boolean>;
  error: string;
};

export default function EvalModal({
  driver,
  onClose,
  avaliacao,
  setAvaliacao,
  sendAvaliacao,
  error,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const { manifestoIds } = useManifesto();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await sendAvaliacao();
    setSubmitting(false);
    if (ok)
      onClose();
  };

  useEffect(() => {
    const id = Number(driver.id);
    setAvaliacao(prev => ({
      ...prev,
      motoristaId: Number.isFinite(id) ? id : 0,
      nota: 5,
      numeroManifesto: 0,
      feedback: "",
    }));
  }, [driver.id, setAvaliacao]);

  return (
    <Modal title={`Concluir rota · ${driver.nome}`} onClose={onClose}>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <p className="modal-copy">
          Registre a avaliação do frete antes de liberar
          {" "}
          {driver.nome.split(" ")[0]}
          {" "}
          como disponível.
        </p>
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
        <label className="modal-score">
          Número do manifesto:
          <select
            required
            value={avaliacao.numeroManifesto}
            className="ml-2"
            onChange={e =>
              setAvaliacao(prev => ({
                ...prev,
                numeroManifesto: Number(e.target.value),
              }))}
          >
            <option disabled value="" selected>
              Selecione um manifesto
            </option>
            {manifestoIds.map(id => (
              <option key={id} value={id}>
                {id}
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
          <p style={{ color: "#E5484D", fontSize: 12, margin: 0 }}>{error}</p>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={!avaliacao.feedback.trim() || submitting}
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
