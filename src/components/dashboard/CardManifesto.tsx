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
      <h3>{melhor ? "MELHOR MANIFESTO DO MÊS" : "PIOR MANIFESTO DO MÊS"}</h3>
      <small>
        {melhor ? "Maior rentabilidade total do manifesto" : "Menor rentabilidade total do manifesto"}
        {dados?.mes ? ` · ${mesExtenso(dados.mes)}` : ""}
      </small>

      {erro && <p className="cc-erro">{erro}</p>}
      {carregando && <p className="cc-msg">Carregando…</p>}
      {!carregando && !erro && dados?.semDados && (
        <p className="cc-msg">Não há manifestos importados para o mês selecionado.</p>
      )}

      {!carregando && !erro && m && (
        <>
          <p className="cc-num">
            Manifesto
            {" "}
            {m.numero}
          </p>
          <strong className={`cc-rt ${m.rt < 0 ? "ruim" : "bom"}`}>{brlComSinal(m.rt)}</strong>
          <ul>
            <li>
              <b>Data:</b>
              {" "}
              {dataBr(m.data)}
            </li>
            <li>
              <b>Destino:</b>
              {" "}
              {m.destino ?? "—"}
            </li>
            <li>
              <b>Motorista:</b>
              {" "}
              {m.motorista ?? "—"}
              {m.tipoVeiculo ? ` · ${m.tipoVeiculo}` : ""}
            </li>
          </ul>
        </>
      )}
    </section>
  );
}