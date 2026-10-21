import type { CsvKind } from "./csvInfo";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CSV_INFO } from "./csvInfo";
import "../../styles/csvInfoModal.css";

type Props = {
  kind: CsvKind;
  onClose: () => void;
};

export default function CsvInfoModal({ kind, onClose }: Props) {
  const info = CSV_INFO[kind];

  // Fecha com a tecla Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!info) return null;

  return createPortal(
    <div className="csv-modal__overlay" onClick={onClose}>
      <div
        className="csv-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <header className="csv-modal__header">
          <h2 id="csv-modal-title">{info.titulo}</h2>
          <button className="csv-modal__close" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <p className="csv-modal__desc">{info.descricao}</p>

        <div className="csv-modal__table-wrap">
          <table className="csv-modal__table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Obrigatório</th>
                <th>Formato esperado</th>
                <th>Para que serve</th>
              </tr>
            </thead>
            <tbody>
              {info.colunas.map(c => (
                <tr key={c.nome}>
                  <td>{c.nome}</td>
                  <td>{c.obrigatorio ? "Sim" : "Não"}</td>
                  <td>{c.formato}</td>
                  <td>{c.uso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body,
  );
}