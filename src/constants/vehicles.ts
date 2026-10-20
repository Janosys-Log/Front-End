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
  | "RODOTREM";

export const CATEGORIAS: Record<CategoriaVeiculo, string> = {
  URBANOS_EXPRESS: "Urbanos Express",
  URBANOS_DE_CARGA: "Urbanos de Carga",
  PESADOS: "Pesados",
  ARTICULADOS: "Articulados",
};

export const TIPOS_POR_CATEGORIA: Record<CategoriaVeiculo, { value: TipoVeiculo; label: string }[]> = {
  URBANOS_EXPRESS: [
    { value: "FIORINO", label: "Fiorino" },
    { value: "VAN", label: "Van" },
    { value: "HR", label: "HR" },
    { value: "UTILITARIO", label: "Utilitário" },
  ],
  URBANOS_DE_CARGA: [
    { value: "VUC", label: "VUC" },
    { value: "TRES_QUARTOS", label: "3/4" },
    { value: "TOCO", label: "Toco" },
    { value: "TRUCK_LEVE", label: "Truck Leve" },
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
  ],
};

export const TODOS_TIPOS: TipoVeiculo[] = Object.values(TIPOS_POR_CATEGORIA).flatMap(t => t.map(x => x.value));

export const TIPO_LABEL: Record<string, string> = Object.fromEntries(
  Object.values(TIPOS_POR_CATEGORIA).flat().map(t => [t.value, t.label]),
);

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
  return (TODOS_TIPOS as string[]).includes(n) ? (n as TipoVeiculo) : undefined;
}

export function categoriaDoTipo(tipo?: string): CategoriaVeiculo | undefined {
  const t = normalizarTipo(tipo);
  if (!t)
    return undefined;
  return (Object.keys(TIPOS_POR_CATEGORIA) as CategoriaVeiculo[])
    .find(cat => TIPOS_POR_CATEGORIA[cat].some(x => x.value === t));
}
