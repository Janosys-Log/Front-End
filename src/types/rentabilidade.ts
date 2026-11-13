// src/types/rentabilidade.ts

export type Regiao = "GERAL" | "GRANDE_SP";

/** Item do ranking já normalizado para o card. */
export interface MotoristaRanking {
  id: number;
  nome: string;
  rentabilidadeMedia: number;
  manifestos: number;
  categoriaVeiculo: string; // ex: "3/4", "VAN", "FIORINO"
  tendencia: "UP" | "DOWN" | null;
}

/** Um ponto do gráfico (um mês). */
export interface PontoMensal {
  mes: number; // 1..12
  ano: number;
  label: string; // "Abr"
  rentabilidadeMedia: number;
  manifestos: number; // numeroDeManifestos (não mais motoristas)
}

/* ---------- Formato real da API (espelha os DTOs Java) ---------- */

export interface RentabilidadeApi {
  mes: number;
  ano: number;
  rentabilidadeMedia: number;
  crescimentoComparadoComOMesPassado: number | null;
  numeroDeManifestos: number;
  rendimentoTotal: number;
}

export interface VeiculoApi {
  // VeiculoDTO ainda não foi enviado; campos prováveis:
  idVeiculo?: number;
  placaVeiculo?: string;
  tipoVeiculo?: string; // enum TipoVeiculo
  subtipoVeiculo?: string; // enum SubtipoVeiculo
  agregadoId?: number;
}

export interface MotoristaApi {
  idMotorista: number;
  nomeMotorista: string;
  veiculo: VeiculoApi | null;
  [k: string]: unknown;
}

export interface MotoristaRendimentoApi {
  motorista: MotoristaApi;
  rentabilidade: RentabilidadeApi;
}