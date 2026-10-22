export type Role = "operador" | "gerente";
export type Theme = "dark" | "light";
export type View = "painel" | "usuarios";
export type Session = {
  role: Role;
  userName: string;
  token?: string;
  email?: string;
  idUsuario?: number;
};
