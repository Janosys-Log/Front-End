export type CustoOperacional = {
  total: number;
  totalMesAnterior: number | null;
  variacaoTotalPercentual: number | null;
  custoMedio: number | null;
  custoMedioMesAnterior: number | null;
  variacaoCustoMedioPercentual: number | null;
  numeroManifestos: number;
};

export type ManifestoDestaque = {
  numero: number;
  rt: number;
  data: string | null;
  destino: string | null;
  motorista: string | null;
  tipoVeiculo: string | null;
};

export type CardsCusto = {
  mes: string | null;
  semDados: boolean;
  custoOperacional: CustoOperacional | null;
  melhorManifesto: ManifestoDestaque | null;
  piorManifesto: ManifestoDestaque | null;
};