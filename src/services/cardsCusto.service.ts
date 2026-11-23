import type { CardsCusto } from "../types/cardsCusto";
import { criarAuthHeaders } from "./auth.service";

const API_URL = import.meta.env.VITE_MOTORISTA_API_URL || "http://localhost:8083/api/manifestos";

export class CardsCustoError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function buscarCardsCusto(mes?: string): Promise<CardsCusto> {
  const query = mes ? `?mes=${encodeURIComponent(mes)}` : "";
  let response: Response;

  try {
    response = await fetch(`${API_URL}/dashboard/cards-custo${query}`, {
      headers: { "Content-Type": "application/json", ...criarAuthHeaders() },
    });
  }
  catch {
    throw new CardsCustoError("Não foi possível conectar ao servidor.", 0);
  }

  if (response.status === 401)
    throw new CardsCustoError("Sua sessão expirou. Faça login novamente.", 401);
  if (response.status === 403)
    throw new CardsCustoError("Você não tem permissão para acessar estes dados.", 403);
  if (!response.ok)
    throw new CardsCustoError("Não foi possível carregar os cards.", response.status);

  return response.json() as Promise<CardsCusto>;
}