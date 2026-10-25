import type { Papel, Perfil } from "../types/usuario";

export const PERFIL_LABEL: Record<Perfil, string> = {
  GERENCIA: "Gerência",
  OPERACIONAL: "Operacional",
};

export const PAPEL_LABEL: Record<Papel, string> = {
  GERENTE_OPERACIONAL: "Gerente Operacional",
  LIDER: "Líder",
  OPERADOR_LOGISTICO: "Operador Logístico",
  SAC: "SAC",
};

// Papéis válidos por perfil (mesma regra do back-end)
export const PAPEIS_POR_PERFIL: Record<Perfil, Papel[]> = {
  GERENCIA: ["GERENTE_OPERACIONAL", "LIDER"],
  OPERACIONAL: ["OPERADOR_LOGISTICO", "SAC"],
};
