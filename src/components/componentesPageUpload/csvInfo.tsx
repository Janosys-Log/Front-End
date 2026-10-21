export type CsvKind = "veiculos" | "manifestos";

export type CsvColumn = {
  nome: string;
  formato: string;
  uso: string;
  obrigatorio: boolean;
};

export type CsvInfo = {
  titulo: string;
  descricao: string;
  colunas: CsvColumn[];
};

export const CSV_INFO: Record<CsvKind, CsvInfo> = {
  veiculos: {
    titulo: "CSV de Veículos",
    descricao:
      "Arquivo separado por ponto e vírgula (;), com a primeira linha sendo o cabeçalho. Os nomes das colunas devem ser exatamente os listados abaixo. Envie este arquivo antes do de manifestos.",
    colunas: [
      {
        nome: "Placa (id)",
        formato: "Exatamente 7 caracteres, letras maiúsculas e números, sem hífen, barra ou espaço (ex.: ABC1D23)",
        uso: "Identifica o veículo",
        obrigatorio: true,
      },
      {
        nome: "Agregado",
        formato: "Texto sem números",
        uso: "Vínculo com o agregado",
        obrigatorio: true,
      },
      {
        nome: "Status do Veículo",
        formato: "Somente Ativo ou Inativo",
        uso: "Situação do veículo",
        obrigatorio: true,
      },
      {
        nome: "Motorista Padrão",
        formato: "Texto sem números",
        uso: "Vínculo com o motorista",
        obrigatorio: true,
      },
      {
        nome: "Tipo Veículo",
        formato: "Um dos tipos cadastrados no sistema (ex.: Pesados, Urbanos Express)",
        uso: "Classificação",
        obrigatorio: true,
      },
      {
        nome: "Subtipo Veiculo",
        formato: "Um dos subtipos cadastrados no sistema (ex.: Fiorino, Van)",
        uso: "Classificação",
        obrigatorio: true,
      },
      {
        nome: "CPF Motorista",
        formato: "11 dígitos; pontos opcionais (123.456.789 + 2 dígitos), sem hífen",
        uso: "Vínculo com o motorista",
        obrigatorio: true,
      },
      {
        nome: "CNPJ Agregado",
        formato: "14 caracteres: 12 letras maiúsculas/números + 2 dígitos finais, sem pontuação",
        uso: "Vínculo com o agregado",
        obrigatorio: true,
      },
      {
        nome: "Contato Motorista",
        formato: "Somente números, 10 ou 11 dígitos (DDD + telefone)",
        uso: "Informativo",
        obrigatorio: false,
      },
      {
        nome: "Contato Agregado",
        formato: "Somente números, 10 ou 11 dígitos (DDD + telefone)",
        uso: "Informativo",
        obrigatorio: false,
      },
    ],
  },

  manifestos: {
    titulo: "CSV de Manifestos",
    descricao: "Cada linha é um manifesto. Todos os campos abaixo são obrigatórios.",
    colunas: [
      { nome: "Manifesto", formato: "Somente número", uso: "Identifica o manifesto", obrigatorio: true },
      { nome: "Data", formato: "Formato brasileiro (dd/mm/aaaa)", uso: "Base da fila", obrigatorio: true },
      { nome: "Motorista", formato: "Somente letras (com acentos e espaços); só o nome", uso: "Vínculo com o motorista", obrigatorio: true },
      { nome: "CPF (motorista)", formato: "Somente número, 11 dígitos", uso: "Vínculo com o motorista", obrigatorio: true },
      { nome: "Agregado", formato: "Somente letras; sem CPF/CNPJ junto ao nome", uso: "Vínculo com o agregado", obrigatorio: true },
      { nome: "CNPJ (agregado)", formato: "Somente número; CPF (11) ou CNPJ alfanumérico (14)", uso: "Vínculo com o agregado", obrigatorio: true },
      { nome: "Veículo (placa)", formato: "Letras e números, Mercosul (ABC1D23) ou antigo (ABC1234)", uso: "Vínculo com o veículo", obrigatorio: true },
      { nome: "Destino", formato: "Somente letras; só o nome", uso: "Rota", obrigatorio: true },
      { nome: "Valor Frete (agregado)", formato: "Valor em reais", uso: 'Calculos', obrigatorio: true },
      { nome: "Valor Frete (empresa)", formato: "Valor em reais", uso: 'Calculos', obrigatorio: true },
      { nome: "Observações", formato: "Somente letras", uso: "Informativo", obrigatorio: false },
    ],
  },
};