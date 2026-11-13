// src/services/rentabilidadeService.ts
import { apiFetch } from "./apiFetch"; // ajuste o caminho se necessário
import { MESES_ABREV } from "../constants/grandeSp";
import type {
  MotoristaRanking,
  MotoristaRendimentoApi,
  PontoMensal,
  Regiao,
  RentabilidadeApi,
} from "../types/rentabilidade";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8083";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (ano: number, mes: number, dia: number) => `${ano}-${pad(mes)}-${pad(dia)}`;
const ultimoDiaDoMes = (ano: number, mes: number) => new Date(ano, mes, 0).getDate();

async function get<T>(path: string): Promise<T> {
  const res = await apiFetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Erro ${res.status} em ${path}`);
  return res.json() as Promise<T>;
}

/** GET /api/manifestos/dataDoUltimoManifesto */
export async function buscarDataUltimoManifesto(): Promise<Date> {
  try {
    const r = await get<Record<string, string>>("/api/manifestos/dataDoUltimoManifesto");
    const s = Object.values(r).find((v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v));
    return s ? new Date(`${s.slice(0, 10)}T12:00:00`) : new Date();
  } catch {
    return new Date();
  }
}

const ROTULOS_VEICULO: Record<string, string> = {
  // "TRES_QUARTOS": "3/4",
};

function rotuloVeiculo(valor?: string | null): string {
  if (!valor) return "";
  return ROTULOS_VEICULO[valor] ?? valor.replace(/_/g, " ");
}

function tendencia(crescimento: number | null): "UP" | "DOWN" | null {
  if (crescimento == null || crescimento === 0) return null;
  return crescimento > 0 ? "UP" : "DOWN";
}

/**
 * GERAL     -> GET /api/motoristas/rankingPorData/{inicio}/{fim}
 * GRANDE_SP -> GET /api/motoristas/rankingPorDataGrandeSp/{inicio}/{fim}
 * Ordenado do melhor ao pior.
 */
export async function buscarRanking(
  ano: number,
  mes: number,
  regiao: Regiao
): Promise<MotoristaRanking[]> {
  const inicio = iso(ano, mes, 1);
  const fim = iso(ano, mes, ultimoDiaDoMes(ano, mes));
  const rota = regiao === "GRANDE_SP" ? "rankingPorDataGrandeSp" : "rankingPorData";

  const data = await get<MotoristaRendimentoApi[]>(
    `/api/motoristas/${rota}/${inicio}/${fim}`
  );

  return data
    .map(({ motorista, rentabilidade }) => ({
      id: motorista.idMotorista,
      nome: motorista.nomeMotorista,
      rentabilidadeMedia: Number(rentabilidade.rentabilidadeMedia ?? 0),
      manifestos: rentabilidade.numeroDeManifestos ?? 0,
      categoriaVeiculo: rotuloVeiculo(
        motorista.veiculo?.subtipoVeiculo ?? motorista.veiculo?.tipoVeiculo
      ),
      tendencia: tendencia(rentabilidade.crescimentoComparadoComOMesPassado),
    }))
    .sort((a, b) => b.rentabilidadeMedia - a.rentabilidadeMedia);
}

/**
 * GERAL     -> GET /api/manifestos/rentabilidadeGeral/{inicio}/{fim}
 * GRANDE_SP -> GET /api/manifestos/rentabilidadeGeralGrandeSp/{inicio}/{fim}
 * Retorna HashMap<mes, RentabilidadeDTO>.
 */
export async function buscarSerieMensal(
  ano: number,
  mes: number,
  regiao: Regiao,
  qtdMeses = 5
): Promise<PontoMensal[]> {
  const meses: { mes: number; ano: number }[] = [];
  for (let i = qtdMeses - 1; i >= 0; i--) {
    const d = new Date(ano, mes - 1 - i, 1);
    meses.push({ mes: d.getMonth() + 1, ano: d.getFullYear() });
  }
  const inicio = iso(meses[0].ano, meses[0].mes, 1);
  const fim = iso(ano, mes, ultimoDiaDoMes(ano, mes));
  const rota = regiao === "GRANDE_SP" ? "rentabilidadeGeralGrandeSp" : "rentabilidadeGeral";

  const mapa = await get<Record<string, RentabilidadeApi>>(
    `/api/manifestos/${rota}/${inicio}/${fim}`
  );

  return meses.map(({ mes: m, ano: a }) => {
    const d = mapa[String(m)];
    return {
      mes: m,
      ano: a,
      label: MESES_ABREV[m - 1],
      rentabilidadeMedia: Number(d?.rentabilidadeMedia ?? 0),
      manifestos: d?.numeroDeManifestos ?? 0,
    };
  });
}