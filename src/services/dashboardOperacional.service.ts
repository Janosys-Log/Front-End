import { apiFetch } from "./apiFetch";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8083";

export type ManifestoDestaque = {
  idManifesto: number;
  valorRecebido: number;
  dataManifesto: string;
  destino: string;
  motoristaNome: string;
  veiculoDescricao: string;
};

export type DashboardOperacionalDados = {
  mesReferencia: string;
  mesAnterior: string;
  custoOperacionalTotal: number;
  custoOperacionalTotalMesAnterior: number;
  variacaoCustoTotalPercentual: number | null;
  custoMedioPorManifesto: number;
  custoMedioPorManifestoMesAnterior: number;
  variacaoCustoMedioPercentual: number | null;
  totalManifestos: number;
  melhorManifesto: ManifestoDestaque | null;
  piorManifesto: ManifestoDestaque | null;
};

export async function buscarDashboardOperacional(
  mesAno?: string
): Promise<DashboardOperacionalDados> {
  const url = mesAno
    ? `${API_URL}/api/manifestos/dashboardOperacional?mes=${mesAno}`
    : `${API_URL}/api/manifestos/dashboardOperacional`;

  const res = await apiFetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao buscar dados operacionais (${res.status})`);
  }
  return res.json() as Promise<DashboardOperacionalDados>;
}
