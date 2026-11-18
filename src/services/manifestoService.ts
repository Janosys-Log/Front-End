const MOTORISTA_URL = "http://localhost:8083";

import { apiFetch } from "./apiFetch";
import type { InfoUltimaImportacao } from "../types/importacao";

export type { InfoUltimaImportacao };

/**
 * Busca os dados completos da última importação (data, hora, nome do arquivo).
 * Se tipo não for fornecido, traz o último arquivo subido de forma geral.
 */
export async function buscarUltimaImportacao(
  tipo?: "veiculos" | "manifestos"
): Promise<InfoUltimaImportacao | null> {
  try {
    const url = tipo
      ? `${MOTORISTA_URL}/api/manifestos/ultimaImportacao?tipo=${tipo.toUpperCase()}`
      : `${MOTORISTA_URL}/api/manifestos/dataDoUltimoManifesto`;

    const res = await apiFetch(url);
    if (!res.ok) return null;
    const body = await res.json();
    if (!body || (!body.data && !body.dataHora)) return null;

    return {
      data: body.data ? String(body.data) : "",
      hora: body.hora ? String(body.hora) : undefined,
      dataHora: body.dataHora ? String(body.dataHora) : undefined,
      nomeArquivo: body.nomeArquivo ? String(body.nomeArquivo) : undefined,
      tipoArquivo: body.tipoArquivo ? String(body.tipoArquivo) : undefined,
    };
  } catch {
    return null;
  }
}

// Mantido para compatibilidade com outros componentes
export async function buscarDataUltimaImportacao(): Promise<Date | null> {
  try {
    const info = await buscarUltimaImportacao();
    if (!info || !info.data) return null;
    const [y, m, d] = String(info.data).slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d);
  } catch {
    return null;
  }
}
