import type { Usuario, UsuarioPayload } from "../types/usuario";
import { criarAuthHeaders } from "./auth.service";

const API_URL = import.meta.env.VITE_USUARIOS_API_URL || "http://localhost:8082/api/usuarios";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...criarAuthHeaders(),
      },
    });
  }
  catch {
    throw new ApiError("Não foi possível conectar ao servidor. Verifique se o backend está em execução.", 0);
  }

  if (!response.ok) {
    let mensagem = "Não foi possível concluir a operação.";
    if (response.status === 401)
      mensagem = "Sua sessão expirou. Faça login novamente.";
    if (response.status === 403)
      mensagem = "Você não tem permissão para acessar este recurso.";

    try {
      const corpo = await response.json();
      if (corpo?.mensagem)
        mensagem = corpo.mensagem;
    }
    catch {
      // corpo sem JSON: mantém a mensagem padrão
    }
    throw new ApiError(mensagem, response.status);
  }

  return response.json() as Promise<T>;
}

export function listarUsuarios(): Promise<Usuario[]> {
  return request<Usuario[]>("");
}

export function criarUsuario(dados: UsuarioPayload): Promise<Usuario> {
  return request<Usuario>("", { method: "POST", body: JSON.stringify(dados) });
}

export function atualizarUsuario(id: number, dados: UsuarioPayload): Promise<Usuario> {
  return request<Usuario>(`/${id}`, { method: "PUT", body: JSON.stringify(dados) });
}

export function desativarUsuario(id: number): Promise<Usuario> {
  return request<Usuario>(`/${id}/desativar`, { method: "PATCH" });
}

export function ativarUsuario(id: number): Promise<Usuario> {
  return request<Usuario>(`/${id}/ativar`, { method: "PATCH" });
}
