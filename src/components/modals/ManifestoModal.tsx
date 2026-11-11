import type { SubmitEventHandler } from "react";
import type { Driver, ResultadoSalvarStatus } from "../../types/driver";
import { useState } from "react";
import { validarNumeroManifesto } from "../../utils/manifesto";
import Modal from "../common/Modal";

type Props = {
  driver: Driver;
  manifestosEmUso: number[];
  onClose: () => void;
  onConfirm: (numeroManifesto: number) => Promise<ResultadoSalvarStatus>;
};

export default function ManifestoModal({ driver, manifestosEmUso, onClose, onConfirm }: Props) {
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const mensagemInvalida = validarNumeroManifesto(valor, manifestosEmUso);
    if (mensagemInvalida) {
      setErro(mensagemInvalida);
      return;
    }

    setEnviando(true);
    const resultado = await onConfirm(Number(valor));
    setEnviando(false);

    if (resultado.ok) {
      onClose();
      return;
    }
    setErro(resultado.mensagem);
  };

  const handleChange = (novoValor: string) => {
    // Apenas dígitos — sem setas de incremento/decremento
    const apenasDigitos = novoValor.replace(/\D/g, "");
    setValor(apenasDigitos);
    setErro(null);
  };

  return (
    <Modal title={`Colocar em rota · ${driver.nome}`} onClose={onClose}>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit} noValidate>
        <p className="modal-copy">
          Informe o número do manifesto da rota de
          {" "}
          {driver.nome.split(" ")[0]}
          . Ele será usado na avaliação ao concluir a rota.
        </p>
        <div className="manifesto-field">
          <label htmlFor="numero-manifesto">Número do manifesto</label>
          <input
            id="numero-manifesto"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            autoFocus
            value={valor}
            aria-invalid={erro !== null}
            aria-describedby={erro ? "numero-manifesto-erro" : undefined}
            onChange={e => handleChange(e.target.value)}
            placeholder="Somente números"
          />
        </div>
        {erro && (
          <p id="numero-manifesto-erro" className="modal-error" role="alert">
            {erro}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={enviando}>
            {enviando ? "Salvando..." : "Confirmar e colocar em rota"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
