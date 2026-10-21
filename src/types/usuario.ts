export type Perfil = "GERENCIA" | "OPERACIONAL";
export type Papel = "GERENTE_OPERACIONAL" | "LIDER" | "OPERADOR_LOGISTICO" | "SAC";

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  login: string | null;
  perfil: Perfil;
  papel: Papel | null;
  ativo: boolean;
  primario: boolean;
};

export type UsuarioPayload = {
  nome: string;
  email: string;
  senha?: string; // opcional na edição
  login: string;
  perfil: Perfil;
  papel: Papel;
};
