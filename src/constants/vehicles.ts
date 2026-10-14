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
