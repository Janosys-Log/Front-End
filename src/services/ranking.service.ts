import type {
  DetalheMotoristaManifestosResponseDTO,
  PaginaNegativosResponseDTO,
  RankingRentabilidadeResponseDTO,
  VisaoRanking,
} from "../types/ranking";
import { apiFetch } from "./apiFetch";

const MOTORISTA_URL = "http://localhost:8083";

export async function listarMesesDisponiveisRanking(): Promise<string[]> {
  const response = await apiFetch(
    `${MOTORISTA_URL}/api/rankings/meses-disponiveis`,
  );
  if (response.status === 403) {
    throw new Error("Você não tem permissão para acessar o ranking.");
  }
  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar os dados do ranking. Tente novamente.",
    );
  }
  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as string[]) : [];
}

export async function buscarRankingRentabilidade(
  mes?: string,
  visao: VisaoRanking = "GERAL",
): Promise<RankingRentabilidadeResponseDTO> {
  const params = new URLSearchParams();
  if (mes) {
    params.set("mes", mes);
  }
  params.set("visao", visao);

  const response = await apiFetch(
    `${MOTORISTA_URL}/api/rankings/rentabilidade?${params.toString()}`,
  );

  if (response.status === 403) {
    throw new Error("Você não tem permissão para acessar o ranking.");
  }

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar os dados do ranking. Tente novamente.",
    );
  }

  return (await response.json()) as RankingRentabilidadeResponseDTO;
}

export async function buscarPaginaNegativos(
  mes?: string,
  visao: VisaoRanking = "GERAL",
): Promise<PaginaNegativosResponseDTO> {
  const params = new URLSearchParams();
  if (mes) {
    params.set("mes", mes);
  }
  params.set("visao", visao);

  const response = await apiFetch(
    `${MOTORISTA_URL}/api/rankings/rentabilidade/negativos?${params.toString()}`,
  );

  if (response.status === 403) {
    throw new Error("Você não tem permissão para acessar a análise de rentabilidade negativa.");
  }

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar os dados dos motoristas com rentabilidade negativa.",
    );
  }

  return (await response.json()) as PaginaNegativosResponseDTO;
}

export async function buscarManifestosMotoristaNegativo(
  motoristaId: number,
  mes?: string,
  visao: VisaoRanking = "GERAL",
): Promise<DetalheMotoristaManifestosResponseDTO> {
  const params = new URLSearchParams();
  if (mes) {
    params.set("mes", mes);
  }
  params.set("visao", visao);

  const response = await apiFetch(
    `${MOTORISTA_URL}/api/rankings/rentabilidade/negativos/${motoristaId}/manifestos?${params.toString()}`,
  );

  if (response.status === 403) {
    throw new Error("Você não tem permissão para acessar os manifestos deste motorista.");
  }

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar os manifestos do motorista.",
    );
  }

  return (await response.json()) as DetalheMotoristaManifestosResponseDTO;
}

const MESES_EXTENSO: Record<string, string> = {
  "01": "Janeiro",
  "02": "Fevereiro",
  "03": "Março",
  "04": "Abril",
  "05": "Maio",
  "06": "Junho",
  "07": "Julho",
  "08": "Agosto",
  "09": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro",
};

export function formatarMesNome(
  anoMes: string,
  incluirAno = false,
): string {
  if (!anoMes || !anoMes.includes("-")) return anoMes;
  const [ano, mes] = anoMes.split("-");
  const nome = MESES_EXTENSO[mes] ?? mes;
  return incluirAno ? `${nome}/${ano}` : nome;
}

export function formatarMoedaBr(
  valor: number | null | undefined,
  comSimbolo = true,
  casasDecimais = 2,
): string {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return "—";
  }
  const num = Number(valor);
  const absFormatado = Math.abs(num).toLocaleString("pt-BR", {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  });
  const sinal = num < 0 ? "−" : "";
  if (comSimbolo) {
    return `${sinal}R$ ${absFormatado}`;
  }
  return `${sinal}${absFormatado}`;
}

export function formatarInteiroBr(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
    return "0";
  }
  return Number(valor).toLocaleString("pt-BR");
}
