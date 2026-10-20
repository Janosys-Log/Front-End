const MOTORISTA_URL = "http://localhost:8083";

// GET /api/manifestos/dataDoUltimoManifesto  ->  { data: "2026-10-19" }
export async function buscarDataUltimaImportacao(): Promise<Date | null> {
  try {
    const res = await fetch(`${MOTORISTA_URL}/api/manifestos/dataDoUltimoManifesto`);
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