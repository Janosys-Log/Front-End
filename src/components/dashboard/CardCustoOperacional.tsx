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
      <h3>CUSTO OPERACIONAL DO MÊS</h3>
      {dados?.mes && <small>{mesExtenso(dados.mes)} · todos os destinos</small>}

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

          <div className="cc-linha">
            <span>Custo médio por manifesto</span>
            <b>
              {c.custoMedio !== null ? brl(c.custoMedio) : "—"}
              {" "}
              <Variacao valor={c.variacaoCustoMedioPercentual} />
            </b>
          </div>
          <div className="cc-linha">
            <span>Manifestos no mês</span>
            <b>{c.numeroManifestos.toLocaleString("pt-BR")}</b>
          </div>

          <p className="cc-aviso">
            Valores gerais do mês, com todos os destinos. Este card não tem visão Grande SP.
          </p>
        </>
      )}
    </section>
  );
}