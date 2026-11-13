// src/components/RentabilidadeMediaCard/index.tsx
import type { MotoristaRanking, PontoMensal, Regiao } from "../../types/rentabilidade";
import { useEffect, useMemo, useState } from "react";

import { CIDADES_GRANDE_SP, MESES } from "../../constants/grandeSp";
import { useRentabilidadeMedia } from "../../hooks/useRentabilidadeMedia";
import { buscarDataUltimoManifesto } from "../../services/rentabilidadeService";

import "../../styles/cardRent.css";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\u00A0/g, " ");
}
const num = (v: number) => v.toLocaleString("pt-BR");

type Props = {
  /** Chamado ao clicar no card (abrir o ranking completo). */
  onOpenRanking?: (ctx: { mes: number; ano: number; regiao: Regiao }) => void;
};

export default function RentabilidadeMediaCard({ onOpenRanking }: Props) {
  const [ano, setAno] = useState<number | null>(null);
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [regiao, setRegiao] = useState<Regiao>("GERAL");

  // mês/ano iniciais = data do último manifesto
  useEffect(() => {
    buscarDataUltimoManifesto().then((d) => {
      setAno(d.getFullYear());
      setMes(d.getMonth() + 1);
    });
  }, []);

  const { ranking, serie, loading, erro } = useRentabilidadeMedia(ano, mes, regiao);
  console.log("CARD recebeu:", regiao, mes, ranking.length, ranking.slice(-3).map(r => [r.nome, r.rentabilidadeMedia]));   // 👈 ESSA LINHA

  const melhores = ranking.slice(0, 3);
  // piores: do pior colocado para cima (93º, 92º, 91º)
  const piores = ranking
    .slice(-3)
    .map((m, i, arr) => ({ ...m, posicao: ranking.length - (arr.length - 1 - i) }))
    .reverse();

  const abrir = () => ano !== null && onOpenRanking?.({ mes, ano, regiao });
  const parar = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <section className="rm-card" onClick={abrir} role="button" tabIndex={0}>
      <div className="rm-top">
        <div className="rm-seg" onClick={parar}>
          <button
            className={regiao === "GERAL" ? "ativo" : ""}
            onClick={() => setRegiao("GERAL")}
          >
            Geral
          </button>
          <button
            className={regiao === "GRANDE_SP" ? "ativo" : ""}
            onClick={() => setRegiao("GRANDE_SP")}
          >
            Grande SP
          </button>
        </div>
        <select
          className="rm-mes"
          value={mes}
          onClick={parar}
          onChange={e => setMes(Number(e.target.value))}
        >
          {MESES.map((nome, i) => (
            <option key={nome} value={i + 1}>
              {nome.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <header className="rm-header">
        <h2>RENTABILIDADE MÉDIA</h2>
        <small>Rentabilidade Total / Nº de Manifestos</small>
      </header>

      {erro && (
        <p className="rm-erro">
          Não foi possível carregar:
          {erro}
        </p>
      )}
      {loading && <p className="rm-loading">Carregando…</p>}

      <h3 className="rm-sub melhores">▲ 3 MELHORES</h3>
      <div className="rm-linha">
        {melhores.map((m, i) => (
          <MelhorItem key={m.id} m={m} pos={i + 1} />
        ))}
      </div>

      <h3 className="rm-sub piores">▼ 3 PIORES (últimas posições)</h3>
      <div className="rm-linha">
        {piores.map(m => (
          <div className="rm-item" key={m.id}>
            <span className="rm-pos-ruim">
              {m.posicao}
              º
            </span>
            <strong className="rm-valor ruim">{brl(m.rentabilidadeMedia)}</strong>
            <span className="rm-nome">{m.nome}</span>
            <span className="rm-meta">
              {m.manifestos}
              {" "}
              manif. ·
              {m.categoriaVeiculo}
            </span>
          </div>
        ))}
      </div>

      <Grafico serie={serie} />

      {regiao === "GRANDE_SP" && (
        <p className="rm-cidades">
          <b>GRANDE SP:</b>
          {" "}
          {CIDADES_GRANDE_SP.join(" | ")}
        </p>
      )}

      <p className="rm-rodape">Clique no card para abrir o ranking completo</p>
    </section>
  );
}

function MelhorItem({ m, pos }: { m: MotoristaRanking; pos: number }) {
  return (
    <div className="rm-item">
      <span className={`rm-medalha m${pos}`}>{pos}</span>
      <strong className="rm-valor">{brl(m.rentabilidadeMedia)}</strong>
      {m.tendencia && (
        <span className={m.tendencia === "UP" ? "seta up" : "seta down"}>
          {m.tendencia === "UP" ? "▲" : "▼"}
        </span>
      )}
      <span className="rm-nome">{m.nome}</span>
      <span className="rm-meta">
        {m.manifestos}
        {" "}
        manif. ·
        {m.categoriaVeiculo}
      </span>
    </div>
  );
}

function Grafico({ serie }: { serie: PontoMensal[] }) {
  const W = 440;
  const H = 120;
  const PAD_X = 50;
  const PAD_Y = 28;

  const { pontos, media, min } = useMemo(() => {
    if (!serie.length)
      return { pontos: [], media: 0, min: 0 };
    const valores = serie.map(s => s.rentabilidadeMedia);
    const mn = Math.min(...valores);
    const mx = Math.max(...valores);
    const range = mx - mn || 1;
    const x = (i: number) =>
      PAD_X + (i * (W - PAD_X * 2)) / Math.max(serie.length - 1, 1);
    const y = (v: number) => PAD_Y + (1 - (v - mn) / range) * (H - PAD_Y * 2);
    const m = valores.reduce((a, b) => a + b, 0) / valores.length;
    return {
      pontos: serie.map((s, i) => ({ ...s, x: x(i), y: y(s.rentabilidadeMedia) })),
      media: m,
      min: mn,
      yMedia: y(m),
    };
  }, [serie]);

  if (!pontos.length)
    return null;
  const yMedia
    = PAD_Y
      + (1
        - (media - min)
        / ((Math.max(...serie.map(s => s.rentabilidadeMedia)) - min) || 1))
      * (H - PAD_Y * 2);

  return (
    <div className="rm-grafico">
      <div className="rm-grafico-head">
        <b>Média da frota (R$ por manifesto)</b>
        <span>manif. = manifestos emitidos no mês</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Média da frota por mês">
        <line x1={PAD_X - 20} x2={W - PAD_X + 20} y1={yMedia} y2={yMedia} className="rm-media-linha" />
        <text x={W - 6} y={yMedia - 3} textAnchor="end" className="rm-media-txt">
          {brl(media)}
        </text>

        <polyline
          fill="none"
          className="rm-linha-graf"
          points={pontos.map(p => `${p.x},${p.y}`).join(" ")}
        />
        {pontos.map((p) => {
          const abaixo = p.rentabilidadeMedia === min;
          return (
            <g key={`${p.ano}-${p.mes}`}>
              <circle cx={p.x} cy={p.y} r={5} className="rm-ponto" />
              <text x={p.x} y={abaixo ? p.y + 18 : p.y - 10} textAnchor="middle" className="rm-ponto-txt">
                {num(Number(p.rentabilidadeMedia.toFixed(2))).replace(/^(\d+)$/, "$1,00")}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="rm-meses">
        {serie.map(s => (
          <div key={`${s.ano}-${s.mes}`}>
            <b>{s.label}</b>
            <span>
              {num(s.manifestos)}
              {" "}
              manif.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
