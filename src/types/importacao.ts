export type ErroLinha = {
  linha: number;
  mensagem: string[];
};

export type ResultadoImportacao<T = unknown> = {
  validos: T[];
  invalidos: ErroLinha[];
};

/** Resposta única do back: um resultado para cada CSV */
export type ResultadoImportacaoDupla<TVeiculo = unknown, TManifesto = unknown> = {
  veiculos: ResultadoImportacao<TVeiculo>;
  manifestos: ResultadoImportacao<TManifesto>;
};