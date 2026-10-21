import type { ErroLinha } from "../../types/importacao";
import { AlertCircle, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import "../../styles/linhasInvalidasModal.css";

type Props = {
  titulo: string;
  totalValidos: number;
  erros: ErroLinha[];
  onClose: () => void;
};

export default function LinhasInvalidasModal({ titulo, totalValidos, erros, onClose }: Props) {
  // Fecha com a tecla Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Cada item do back já traz a lista de mensagens da linha.
  // Se a mesma linha vier repetida, junta as mensagens.
  const grupos = useMemo(() => {
    const mapa = new Map<number, string[]>();
    for (const e of erros) {
      mapa.set(e.linha, [...(mapa.get(e.linha) ?? []), ...e.mensagem]);
    }
    return [...mapa.entries()].sort((a, b) => a[0] - b[0]);
  }, [erros]);

  return createPortal(
    <div className="linhas-modal__overlay" onClick={onClose}>
      <div
        className="linhas-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="linhas-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <header className="linhas-modal__header">
          <div>
            <h2 id="linhas-modal-title">Linhas com erro — {titulo}</h2>
            <p className="linhas-modal__resumo">
              <span className="linhas-modal__pill linhas-modal__pill--ok">
                {totalValidos} {totalValidos === 1 ? "válida" : "válidas"}
              </span>
              <span className="linhas-modal__pill linhas-modal__pill--erro">
                {grupos.length} {grupos.length === 1 ? "inválida" : "inválidas"}
              </span>
            </p>
          </div>
          <button className="linhas-modal__close" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <ul className="linhas-modal__lista">
          {grupos.map(([linha, mensagens]) => (
            <li key={linha} className="linhas-modal__item">
              <div className="linhas-modal__item-head">
                <span className="linhas-modal__linha">Linha {linha}</span>
                <span className="linhas-modal__badge">
                  {mensagens.length} {mensagens.length === 1 ? "erro" : "erros"}
                </span>
              </div>

              <ul className="linhas-modal__erros">
                {mensagens.map((msg, i) => (
                  <li key={`${msg}-${i}`}>
                    <AlertCircle size={14} />
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}