import type { CardsCusto } from "../../types/cardsCusto";
import { brlComSinal, dataBr, mesExtenso } from "./cardsCustoFormat";

type Props = {
  tipo: "melhor" | "pior";
  dados: CardsCusto | null;
  carregando: boolean;
  erro: string;
};

export default function CardManifesto({ tipo, dados, carregando, erro }: Props) {
  const melhor = tipo === "melhor";
  const m = melhor ? dados?.melhorManifesto : dados?.piorManifesto;

  return (
    <section className={`cc-card cc-manifesto ${melhor ? "melhor" : "pior"}`}>
      <div className="cc-card-top">
        <div className={`cc-card-icon ${melhor ? "melhor" : "pior"}`} aria-hidden>
          {melhor ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          )}
        </div>
        <div className="cc-card-titles">
          <h3>{melhor ? "Melhor manifesto" : "Pior manifesto"}</h3>
          <small>
            {melhor ? "Maior rentabilidade total" : "Menor rentabilidade total"}
            {dados?.mes ? ` · ${mesExtenso(dados.mes)}` : ""}
          </small>
        </div>
      </div>

      {erro && <p className="cc-erro">{erro}</p>}
      {carregando && <p className="cc-msg">Carregando…</p>}
      {!carregando && !erro && dados?.semDados && (
        <p className="cc-msg">Não há manifestos importados para o mês selecionado.</p>
      )}

      {!carregando && !erro && m && (
        <>
          <div className="cc-manifesto-hero">
            <span className="cc-num-badge">#{m.numero}</span>
            <strong className={`cc-rt ${m.rt < 0 ? "ruim" : "bom"}`}>{brlComSinal(m.rt)}</strong>
          </div>

          <ul className="cc-manifesto-meta">
            <li>
              <span>Data</span>
              <b>{dataBr(m.data)}</b>
            </li>
            <li>
              <span>Destino</span>
              <b>{m.destino ?? "—"}</b>
            </li>
            <li>
              <span>Motorista</span>
              <b>
                {m.motorista ?? "—"}
                {m.tipoVeiculo ? ` · ${m.tipoVeiculo}` : ""}
              </b>
            </li>
          </ul>
        </>
      )}
    </section>
  );
}
