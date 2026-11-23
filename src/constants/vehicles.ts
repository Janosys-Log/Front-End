export type CategoriaVeiculo = "URBANOS_EXPRESS" | "URBANOS_DE_CARGA" | "PESADOS" | "ARTICULADOS";

export type TipoVeiculo =
  | "FIORINO"
  | "VAN"
  | "HR"
  | "UTILITARIO"
  | "VUC"
  | "TRES_QUARTOS"
  | "TOCO"
  | "TRUCK_LEVE"
  | "TRUCK"
  | "CARRETA"
  | "BITRUCK"
  | "CAVALO"
  | "BITREM"
  | "RODOTREM"
  | "SEMI_REBOQUE_2_EIXOS"
  | "SEMI_REBOQUE_4_EIXOS";

export const CATEGORIAS: Record<CategoriaVeiculo, string> = {
  URBANOS_EXPRESS: "Urbanos Express",
  URBANOS_DE_CARGA: "Urbanos de Carga",
  PESADOS: "Pesados",
  ARTICULADOS: "Articulados",
};

/** Opções do filtro da UI (sem HR; Truck Leve vira Truck; Semi-reboque 2/4 nos articulados). */
export const TIPOS_POR_CATEGORIA: Record<CategoriaVeiculo, { value: TipoVeiculo; label: string }[]> = {
  URBANOS_EXPRESS: [
    { value: "FIORINO", label: "Fiorino" },
    { value: "VAN", label: "Van" },
    { value: "UTILITARIO", label: "Utilitário" },
  ],
  URBANOS_DE_CARGA: [
    { value: "VUC", label: "VUC" },
    { value: "TRES_QUARTOS", label: "3/4" },
    { value: "TOCO", label: "Toco" },
    { value: "TRUCK", label: "Truck" },
  ],
  PESADOS: [
    { value: "TRUCK", label: "Truck" },
    { value: "CARRETA", label: "Carreta" },
    { value: "BITRUCK", label: "Bi-Truck" },
    { value: "CAVALO", label: "Cavalo" },
  ],
  ARTICULADOS: [
    { value: "BITREM", label: "Bitrem" },
    { value: "RODOTREM", label: "Rodotrem" },
    { value: "SEMI_REBOQUE_2_EIXOS", label: "Semi-reboque 2 eixos" },
    { value: "SEMI_REBOQUE_4_EIXOS", label: "Semi-reboque 4 eixos" },
  ],
};

export const TODOS_TIPOS: TipoVeiculo[] = [
  "FIORINO",
  "VAN",
  "HR",
  "UTILITARIO",
  "VUC",
  "TRES_QUARTOS",
  "TOCO",
  "TRUCK_LEVE",
  "TRUCK",
  "CARRETA",
  "BITRUCK",
  "CAVALO",
  "BITREM",
  "RODOTREM",
  "SEMI_REBOQUE_2_EIXOS",
  "SEMI_REBOQUE_4_EIXOS",
];

export const TIPO_LABEL: Record<string, string> = {
  FIORINO: "Fiorino",
  VAN: "Van",
  HR: "HR",
  UTILITARIO: "Utilitário",
  VUC: "VUC",
  TRES_QUARTOS: "3/4",
  TOCO: "Toco",
  TRUCK_LEVE: "Truck",
  TRUCK: "Truck",
  CARRETA: "Carreta",
  BITRUCK: "Bi-Truck",
  CAVALO: "Cavalo",
  BITREM: "Bitrem",
  RODOTREM: "Rodotrem",
  SEMI_REBOQUE_2_EIXOS: "Semi-reboque 2 eixos",
  SEMI_REBOQUE_4_EIXOS: "Semi-reboque 4 eixos",
};

export function normalizarTipo(valor?: string): TipoVeiculo | undefined {
  if (!valor)
    return undefined;
  const n = valor
    .trim()
    .toUpperCase()
    .replace("3/4", "TRES_QUARTOS")
    .replace(/[\s-]+/g, "_")
    .replace("BI_TRUCK", "BITRUCK")
    .replace("Ç", "C")
    .replace("Ã", "A")
    .replace("Õ", "O")
    .replace("Á", "A");

  // aliases
  if (n === "TRUCK_LEVE" || n === "TRUCKLEVE")
    return "TRUCK";
  if (n === "SEMI_REBOQUE_2" || n === "SEMI_REBOQUE_02_EIXOS" || n === "SEMI_REBOQUE_COM_02_EIXOS")
    return "SEMI_REBOQUE_2_EIXOS";
  if (n === "SEMI_REBOQUE_4" || n === "SEMI_REBOQUE_04_EIXOS" || n === "SEMI_REBOQUE_COM_04_EIXOS")
    return "SEMI_REBOQUE_4_EIXOS";

  return (TODOS_TIPOS as string[]).includes(n) ? (n as TipoVeiculo) : undefined;
}

export function categoriaDoTipo(tipo?: string): CategoriaVeiculo | undefined {
  const t = normalizarTipo(tipo);
  if (!t)
    return undefined;

  // HR legado continua classificado como Urbanos Express (mesmo fora do filtro)
  if (t === "HR")
    return "URBANOS_EXPRESS";
  // Truck Leve normalizado vira TRUCK — pode ser Urbanos de Carga ou Pesados; preferir Carga se veio como leve
  if (t === "TRUCK_LEVE")
    return "URBANOS_DE_CARGA";

  return (Object.keys(TIPOS_POR_CATEGORIA) as CategoriaVeiculo[])
    .find(cat => TIPOS_POR_CATEGORIA[cat].some(x => x.value === t));
}
