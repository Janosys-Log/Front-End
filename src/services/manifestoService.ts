const MOTORISTA_URL = "http://localhost:8083";

// Chave onde o auth.service.ts guarda o token no localStorage.
// Confira com: grep -n "localStorage" src/services/auth.service.ts

// manifestoService.ts e importacao.service.ts
import { apiFetch } from "./apiFetch";

// GET /api/manifestos/dataDoUltimoManifesto  ->  { data: "2026-10-19" }
export async function buscarDataUltimaImportacao(): Promise<Date | null> {
  try {
    const res = await apiFetch(`${MOTORISTA_URL}/api/manifestos/dataDoUltimoManifesto`);
    if (!res.ok) return null;
    const { data } = await res.json();
    if (!data) return null;
    // Date local (evita voltar um dia por fuso)
    const [y, m, d] = String(data).slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d);
  } catch {
    return null;
  }
}