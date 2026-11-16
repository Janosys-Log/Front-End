export type VisaoRanking = "GERAL" | "GRANDE_SP";

export type StatusVariacaoRanking =
  | "AUMENTO"
  | "QUEDA"
  | "IGUAL"
  | "NOVO"
  | "SEM_MES_ANTERIOR";

export type CorDestaqueRanking = "VERDE" | "NEUTRO" | "AMARELO" | "VERMELHO";

export type CorBarraGrafico = "VERMELHO" | "AMARELO" | "AZUL";

export interface ResumoRankingDTO {
  mesReferencia: string;
  mesAnterior: string;
  visao: VisaoRanking;
  mediaFrotaMes: number | null;
  mediaFrotaMesAnterior: number | null;
  variacaoFrotaPercentual: number | null;
  totalMotoristas: number;
  totalMotoristasNegativos: number;
  totalManifestos: number;
  possuiDadosMes: boolean;
  possuiManifestosImportadosNoMes: boolean;
  possuiDadosMesAnterior: boolean;
}

export interface RankingMotoristaItemDTO {
  posicao: number;
  motoristaId: number;
  nomeMotorista: string;
  cpfMotorista?: string | null;
  tipoVeiculo: string;
  subtipoVeiculo: string;
  subtipoLabel: string;
  numeroManifestos: number;
  rentabilidadeMedia: number;
  variacaoMesAnterior: number | null;
  statusVariacao: StatusVariacaoRanking;
  margemPercentual: number | null;
  rentabilidadeTotal: number;
  top3: boolean;
  ultimos3: boolean;
  abaixoMediaFrota: boolean;
  rentabilidadeNegativa: boolean;
  corDestaque: CorDestaqueRanking;
}

export interface GraficoFaixaItemDTO {
  codigoFaixa: string;
  rotulo: string;
  limiteInferior: number | null;
  limiteSuperior: number | null;
  quantidadeMotoristas: number;
  cor: CorBarraGrafico;
  contemMediaFrota: boolean;
}

export interface GraficoSubcategoriaItemDTO {
  subtipoVeiculo: string;
  subtipoLabel: string;
  quantidadeMotoristas: number;
  quantidadeManifestos: number;
  rentabilidadeMedia: number;
  cor: CorBarraGrafico;
}

export interface GraficoDestinoComparativoDTO {
  mediaFrotaGeralMes: number | null;
  rentabilidadeMediaGrandeSp: number | null;
  manifestosGrandeSp: number;
  corGrandeSp: CorBarraGrafico;
  rentabilidadeMediaDemaisDestinos: number | null;
  manifestosDemaisDestinos: number;
  corDemaisDestinos: CorBarraGrafico;
}

export interface RankingRentabilidadeResponseDTO {
  resumo: ResumoRankingDTO;
  itens: RankingMotoristaItemDTO[];
  graficoFaixas: GraficoFaixaItemDTO[];
  graficoSubcategorias: GraficoSubcategoriaItemDTO[];
  graficoGrandeSpVsDemais: GraficoDestinoComparativoDTO;
  mesesDisponiveis: string[];
}
