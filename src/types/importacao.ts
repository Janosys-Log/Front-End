export type ErroLinha = {
  linha: number;
  mensagem: string[];
};

export type ResultadoImportacao<T = unknown> = {
  validos: T[];
  invalidos: ErroLinha[];
  nomeArquivo?: string;
  dataHora?: string;
};

export type InfoUltimaImportacao = {
  data: string;
  hora?: string;
  dataHora?: string;
  nomeArquivo?: string;
  tipoArquivo?: string;
};

/** Resposta do back: um resultado para cada CSV (pode ser null se o arquivo não foi enviado) */
export type ResultadoImportacaoDupla<TVeiculo = unknown, TManifesto = unknown> = {
  veiculos: ResultadoImportacao<TVeiculo> | null;
  manifestos: ResultadoImportacao<TManifesto> | null;
};
