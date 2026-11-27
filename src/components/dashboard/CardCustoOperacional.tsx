import type { CardsCusto } from "../../types/cardsCusto";
import { brl, mesExtenso } from "./cardsCustoFormat";

type Props = {
  dados: CardsCusto | null;
  carregando: boolean;
  erro: string;
};

function Variacao({ valor }: { valor: number | null }) {
  if (valor === null)
    return <span className="cc-var neutra">—</span>;
  if (valor === 0)
    return <span className="cc-var neutra">0,0%</span>;
  const aumento = valor > 0;
  const texto = `${aumento ? "▲ +" : "▼ −"}${Math.abs(valor).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  return <span className={`cc-var ${aumento ? "ruim" : "bom"}`}>{texto}</span>;
}

export default function CardCustoOperacional({ dados, carregando, erro }: Props) {
  const c = dados?.custoOperacional;

  return (
    <section className="cc-card cc-custo">
      <div className="cc-card-top">
        <div className="cc-card-icon custo" aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="cc-card-titles">
          <h3>Custo operacional do mês</h3>
          {dados?.mes && <small>{mesExtenso(dados.mes)} · todos os destinos</small>}
        </div>
      </div>

      {erro && <p className="cc-erro">{erro}</p>}
      {carregando && <p className="cc-msg">Carregando…</p>}
      {!carregando && !erro && dados?.semDados && (
        <p className="cc-msg">Não há manifestos importados para o mês selecionado.</p>
      )}

      {!carregando && !erro && c && (
        <>
          <div className="cc-total">
            <strong>{brl(c.total)}</strong>
            <Variacao valor={c.variacaoTotalPercentual} />
          </div>
          <p className="cc-ant">
            {c.totalMesAnterior !== null ? `Mês anterior: ${brl(c.totalMesAnterior)}` : "Mês anterior: —"}
          </p>

          <div className="cc-metrics">
            <div className="cc-metric">
              <span className="cc-metric-label">Custo médio / manifesto</span>
              <span className="cc-metric-value">
                {c.custoMedio !== null ? brl(c.custoMedio) : "—"}
                {" "}
                <Variacao valor={c.variacaoCustoMedioPercentual} />
              </span>
            </div>
            <div className="cc-metric">
              <span className="cc-metric-label">Manifestos no mês</span>
              <span className="cc-metric-value">{c.numeroManifestos.toLocaleString("pt-BR")}</span>
            </div>
          </div>

          <p className="cc-aviso">
            Valores gerais do mês, com todos os destinos. Este card não tem visão Grande SP.
          </p>
        </>
      )}
    </section>
  );
}
