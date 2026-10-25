export type Role = "operador" | "gerente";
export type Theme = "dark" | "light";
export type View = "dashboard" | "motoristas" | "upload" | "usuarios";
export type Session = {
  role: Role;
  userName: string;
  token?: string;
  email?: string;
  idUsuario?: number;
};
