import type {
  GraficoDestinoComparativoDTO,
  GraficoFaixaItemDTO,
  GraficoSubcategoriaItemDTO,
} from "../../types/ranking";
import {
  formatarInteiroBr,
  formatarMoedaBr,
} from "../../services/ranking.service";

interface Props {
  faixas: GraficoFaixaItemDTO[];
  subcategorias: GraficoSubcategoriaItemDTO[];
  destinoComparativo: GraficoDestinoComparativoDTO;
  mediaFrotaMes: number | null;
  totalMotoristas: number;
}

export default function RankingChartsColumn({
  faixas,
  subcategorias,
  destinoComparativo,
  mediaFrotaMes,
  totalMotoristas,
}: Props) {
  // --- Cálculo para Gráfico 1 (Barras Verticais por Faixa de R$ 500) ---
  const maxContagemFaixa = Math.max(
    1,
    ...faixas.map(f => f.quantidadeMotoristas),
  );
  const idxMediaFrota = faixas.findIndex(f => f.contemMediaFrota);

  // Posição horizontal (%) da linha tracejada da média da frota no Gráfico 1
  const posicaoLinhaMediaFaixa =
    idxMediaFrota >= 0 ? ((idxMediaFrota + 0.5) / Math.max(1, faixas.length)) * 100 : null;

  // --- Cálculo para Gráfico 2 (Barras Horizontais Top 4 Subcategorias) ---
  const maxValorSubcat = Math.max(
    1,
    mediaFrotaMes ?? 0,
    ...subcategorias.map(s => Math.abs(s.rentabilidadeMedia)),
  ) * 1.15;

  const posLinhaMediaSubcat =
    mediaFrotaMes !== null && mediaFrotaMes > 0
      ? Math.min(92, Math.max(10, (mediaFrotaMes / maxValorSubcat) * 100))
      : null;

  // --- Cálculo para Gráfico 3 (Grande SP vs Demais Destinos) ---
  const rmGrandeSp = destinoComparativo?.rentabilidadeMediaGrandeSp ?? null;
  const rmDemais = destinoComparativo?.rentabilidadeMediaDemaisDestinos ?? null;
  const mediaGeral = destinoComparativo?.mediaFrotaGeralMes ?? null;

  const maxValorDestino = Math.max(
    1,
    Math.abs(mediaGeral ?? 0),
    Math.abs(rmGrandeSp ?? 0),
    Math.abs(rmDemais ?? 0),
  ) * 1.18;

  const posLinhaMediaDestino =
    mediaGeral !== null && mediaGeral > 0
      ? Math.min(92, Math.max(10, (mediaGeral / maxValorDestino) * 100))
      : null;

  return (
    <div className="rk-charts-col">
      {/* GRÁFICO 1 (Item 6 do Mockup): Motoristas por faixa de Rentabilidade Média (R$ 500) */}
      <section className="rk-chart-card" aria-label="Motoristas por faixa de Rentabilidade Média">
        <h3 className="rk-chart-title">
          Motoristas por faixa de Rentabilidade Média (R$ 500)
        </h3>

        <div className="rk-vchart-wrapper">
          {mediaFrotaMes !== null && posicaoLinhaMediaFaixa !== null && (
            <div
              className="rk-vchart-avg-line"
              style={{ left: `${posicaoLinhaMediaFaixa}%` }}
            >
              <span className="rk-avg-badge">
                Média da frota {formatarMoedaBr(mediaFrotaMes, true, 0)}
              </span>
            </div>
          )}

          <div className="rk-vchart-bars">
            {faixas.map(faixa => {
              const alturaPct =
                faixa.quantidadeMotoristas > 0
                  ? Math.max(
                      6,
                      Math.round(
                        (faixa.quantidadeMotoristas / maxContagemFaixa) * 100,
                      ),
                    )
                  : 2;

              const corClasse =
                faixa.cor === "VERMELHO"
                  ? "rk-bar-red"
                  : faixa.cor === "AMARELO"
                    ? "rk-bar-yellow"
                    : "rk-bar-blue";

              return (
                <div key={faixa.codigoFaixa} className="rk-vchart-col">
                  <div className="rk-vchart-bar-area">
                    <span className="rk-vchart-count">
                      {faixa.quantidadeMotoristas}
                    </span>
                    <div
                      className={`rk-vchart-bar ${corClasse}`}
                      style={{ height: `${alturaPct}%` }}
                      title={`${faixa.rotulo}: ${faixa.quantidadeMotoristas} motorista(s)`}
                    />
                  </div>
                  <span className="rk-vchart-label">{faixa.rotulo}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rk-chart-footer">
          <div className="rk-chart-legend">
            <span className="rk-legend-item">
              <i className="rk-legend-dot rk-bar-red" /> negativa
            </span>
            <span className="rk-legend-item">
              <i className="rk-legend-dot rk-bar-yellow" /> abaixo da média da frota
            </span>
            <span className="rk-legend-item">
              <i className="rk-legend-dot rk-bar-blue" /> faixa da média e acima
            </span>
          </div>
          <span className="rk-chart-note">
            total: {formatarInteiroBr(totalMotoristas)} motoristas
          </span>
        </div>
      </section>

      {/* GRÁFICO 2 (Item 7 do Mockup): Rentabilidade Média por subcategoria (4 mais usadas) */}
      <section className="rk-chart-card" aria-label="Rentabilidade Média por subcategoria">
        <h3 className="rk-chart-title">
          Rentabilidade Média por subcategoria (4 mais usadas)
        </h3>

        {subcategorias.length === 0 ? (
          <p className="rk-chart-empty">Sem dados de subcategorias no período.</p>
        ) : (
          <div className="rk-hchart-wrapper">
            <div className="rk-hchart-rows">
              {posLinhaMediaSubcat !== null && mediaFrotaMes !== null && (
                <div
                  className="rk-hchart-avg-line"
                  style={{ left: `${posLinhaMediaSubcat}%` }}
                >
                  <span className="rk-avg-badge">
                    Média da frota {formatarMoedaBr(mediaFrotaMes, true, 0)}
                  </span>
                </div>
              )}

              {subcategorias.map(sub => {
                const larguraPct = Math.max(
                  4,
                  Math.min(
                    100,
                    Math.round(
                      (Math.abs(sub.rentabilidadeMedia) / maxValorSubcat) * 100,
                    ),
                  ),
                );
                const corClasse =
                  sub.cor === "AMARELO" ? "rk-bar-yellow" : "rk-bar-blue";

                return (
                  <div key={sub.subtipoVeiculo} className="rk-hchart-row">
                    <div className="rk-hchart-meta">
                      <strong className="rk-hchart-name">{sub.subtipoLabel}</strong>
                      <span className="rk-hchart-sub">
                        {formatarInteiroBr(sub.quantidadeMotoristas)} mot. ·{" "}
                        {formatarInteiroBr(sub.quantidadeManifestos)} manif.
                      </span>
                    </div>

                    <div className="rk-hchart-track">
                      <div
                        className={`rk-hchart-bar ${corClasse}`}
                        style={{ width: `${larguraPct}%` }}
                      />
                    </div>

                    <span className="rk-hchart-val">
                      {formatarMoedaBr(sub.rentabilidadeMedia, true, 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rk-chart-footer">
          <span className="rk-chart-note">
            amarelo = abaixo da média da frota · azul = na média ou acima · ordenado por nº de manifestos
          </span>
        </div>
      </section>

      {/* GRÁFICO 3 (Item 9 do Mockup): Rentabilidade Média: Grande SP x demais destinos */}
      <section className="rk-chart-card" aria-label="Rentabilidade Média Grande SP vs demais destinos">
        <h3 className="rk-chart-title">
          Rentabilidade Média: Grande SP × demais destinos
        </h3>

        <div className="rk-hchart-wrapper rk-hchart-destino">
          <div className="rk-hchart-rows">
            {posLinhaMediaDestino !== null && mediaGeral !== null && (
              <div
                className="rk-hchart-avg-line"
                style={{ left: `${posLinhaMediaDestino}%` }}
              >
                <span className="rk-avg-badge">
                  Média da frota {formatarMoedaBr(mediaGeral, true, 0)}
                </span>
              </div>
            )}

            {/* Barra Grande SP */}
            <div className="rk-hchart-row">
              <div className="rk-hchart-meta">
                <strong className="rk-hchart-name">Grande SP</strong>
                <span className="rk-hchart-sub">
                  {formatarInteiroBr(destinoComparativo?.manifestosGrandeSp ?? 0)} manif.
                </span>
              </div>

              <div className="rk-hchart-track">
                {rmGrandeSp !== null ? (
                  <div
                    className={`rk-hchart-bar ${
                      destinoComparativo.corGrandeSp === "AMARELO"
                        ? "rk-bar-yellow"
                        : "rk-bar-blue"
                    }`}
                    style={{
                      width: `${Math.max(
                        4,
                        Math.min(
                          100,
                          Math.round((Math.abs(rmGrandeSp) / maxValorDestino) * 100),
                        ),
                      )}%`,
                    }}
                  />
                ) : (
                  <span className="rk-hchart-nodata">Sem manifestos no período</span>
                )}
              </div>

              <span className="rk-hchart-val">
                {rmGrandeSp !== null ? formatarMoedaBr(rmGrandeSp, true, 0) : "—"}
              </span>
            </div>

            {/* Barra Demais destinos */}
            <div className="rk-hchart-row">
              <div className="rk-hchart-meta">
                <strong className="rk-hchart-name">Demais destinos</strong>
                <span className="rk-hchart-sub">
                  {formatarInteiroBr(destinoComparativo?.manifestosDemaisDestinos ?? 0)} manif.
                </span>
              </div>

              <div className="rk-hchart-track">
                {rmDemais !== null ? (
                  <div
                    className={`rk-hchart-bar ${
                      destinoComparativo.corDemaisDestinos === "AMARELO"
                        ? "rk-bar-yellow"
                        : "rk-bar-blue"
                    }`}
                    style={{
                      width: `${Math.max(
                        4,
                        Math.min(
                          100,
                          Math.round((Math.abs(rmDemais) / maxValorDestino) * 100),
                        ),
                      )}%`,
                    }}
                  />
                ) : (
                  <span className="rk-hchart-nodata">Sem manifestos no período</span>
                )}
              </div>

              <span className="rk-hchart-val">
                {rmDemais !== null ? formatarMoedaBr(rmDemais, true, 0) : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="rk-chart-footer">
          <span className="rk-chart-note">
            não depende da opção Geral / Grande SP · acompanha o mês
          </span>
        </div>
      </section>
    </div>
  );
}
