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

// US.15 - Tipos de Rentabilidade Negativa
export interface ResumoNegativosDTO {
  mesReferencia: string;
  mesAnterior: string;
  visao: VisaoRanking;
  quantidadeMotoristasNegativos: number;
  totalMotoristasFrota: number;
  percentualNegativos: number;
  rtTotalNegativos: number;
  possuiDadosMes: boolean;
}

export interface MotoristaNegativoItemDTO {
  posicao: number;
  posicaoFormatada: string;
  motoristaId: number;
  nomeMotorista: string;
  cpfMotorista?: string | null;
  tipoVeiculo: string;
  subtipoVeiculo: string;
  subtipoLabel: string;
  rentabilidadeMedia: number;
  variacaoMesAnterior: number | null;
  statusVariacao: string;
  numeroManifestos: number;
  manifestosNegativos: number;
  fracaoManifestosNegativos: string;
  rentabilidadeTotal: number;
}

export interface PaginaNegativosResponseDTO {
  resumo: ResumoNegativosDTO;
  motoristas: MotoristaNegativoItemDTO[];
  mesesDisponiveis: string[];
}

export interface ManifestoItemDetalheDTO {
  idManifesto: number;
  numeroManifesto: string;
  dataManifesto: string;
  destino: string;
  freteEmpresa: number;
  freteMotorista: number;
  rtManifesto: number;
}

export interface DetalheMotoristaManifestosResponseDTO {
  motoristaId: number;
  nomeMotorista: string;
  subtipoLabel: string;
  mesReferencia: string;
  visao: VisaoRanking;
  posicao: number;
  posicaoFormatada: string;
  rentabilidadeMedia: number;
  rentabilidadeTotal: number;
  totalManifestos: number;
  manifestosNegativos: number;
  fracaoManifestosNegativos: string;
  manifestos: ManifestoItemDetalheDTO[];
}
