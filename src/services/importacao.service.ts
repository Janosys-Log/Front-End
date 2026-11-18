import type { Driver } from "../types/driver";
import type {
  ErroLinha,
  ResultadoImportacao,
  ResultadoImportacaoDupla,
} from "../types/importacao";
import { TODAY } from "../constants/app";
import { categoriaDoTipo, normalizarTipo } from "../constants/vehicles";
import { apiFetch } from "./apiFetch";

const CSV_URL = "http://localhost:8080/csv";

export type VeiculoDTO = {
  placa: string;
  agregado: string;
  status: string;
  motorista: string;
  tipoVeiculo: string;
};

export type ManifestoDTO = {
  manifestoid: string;
  data: string;
  motorista: string;
  cpfMotorista: string;
  agregado: string;
  cnpjAgregado: string;
  placa: string;
  destino: string;
  valorFreteAgregado: string;
  valorFreteEmpresa: string;
  observacoes: string;
};

type Raw = Record<string, unknown>;

const str = (v: unknown) => String(v ?? "");

function normalizeVeiculo(raw: Raw): VeiculoDTO {
  return {
    placa: str(raw.placa ?? raw.Placa),
    agregado: str(raw.agregado ?? raw.Agregado),
    status: str(raw.status ?? raw.Status),
    motorista: str(raw.motorista ?? raw.Motorista),
    tipoVeiculo: str(raw.tipoVeiculo ?? raw.TipoVeiculo),
  };
}

function normalizeManifesto(raw: Raw): ManifestoDTO {
  return {
    manifestoid: str(raw.manifestoid ?? raw.manifestoId ?? raw.Manifesto),
    data: str(raw.data ?? raw.Data),
    motorista: str(raw.motorista ?? raw.Motorista),
    cpfMotorista: str(raw.cpfmotorista ?? raw.cpfMotorista),
    agregado: str(raw.agregado ?? raw.Agregado),
    cnpjAgregado: str(raw.cnpjagregado ?? raw.cnpjAgregado),
    placa: str(raw.placa ?? raw.Placa),
    destino: str(raw.destino ?? raw.Destino),
    valorFreteAgregado: str(raw.valorfreteagregado ?? raw.valorFreteAgregado),
    valorFreteEmpresa: str(raw.valorfreteempresa ?? raw.valorFreteEmpresa),
    observacoes: str(raw.observacoes ?? raw.Observacoes),
  };
}

function normalizeErro(raw: Raw): ErroLinha {
  const msg = raw.mensagem ?? raw.Mensagem ?? [];
  return {
    linha: Number(raw.linha ?? raw.Linha ?? 0),
    // aceita lista (formato atual do back) ou string solta
    mensagem: Array.isArray(msg) ? msg.map(String) : [String(msg)],
  };
}

function normalizeResultado<T>(
  raw: Raw | null | undefined,
  normalizeItem: (r: Raw) => T,
): ResultadoImportacao<T> | null {
  if (!raw) return null;
  const validos = (raw?.validos ?? []) as Raw[];
  const invalidos = (raw?.invalidos ?? []) as Raw[];
  return {
    validos: validos.map(normalizeItem),
    invalidos: invalidos.map(normalizeErro),
  };
}

/** Devolve a mensagem de erro, ou null se pelo menos um arquivo foi escolhido. */
export function validarArquivos(
  veiculos: File | null,
  manifestos: File | null,
): string | null {
  if (!veiculos && !manifestos)
    return "Selecione ao menos um arquivo CSV (veículos ou manifestos) para importar.";
  return null;
}

/**
 * Envia um ou ambos os CSVs numa única requisição.
 * Os nomes dos campos ("csvVeiculo" e "csvManifesto") batem com os
 * @RequestParam do controller.
 */
export async function importarCsvs(
  veiculos?: File | null,
  manifestos?: File | null,
): Promise<ResultadoImportacaoDupla<VeiculoDTO, ManifestoDTO>> {
  if (!veiculos && !manifestos) {
    throw new Error("Selecione ao menos um arquivo CSV para importar.");
  }

  const formData = new FormData();
  if (veiculos) {
    formData.append("csvVeiculo", veiculos);
  }
  if (manifestos) {
    formData.append("csvManifesto", manifestos);
  }

  const response = await apiFetch(CSV_URL, { method: "POST", body: formData });

  if (response.status === 401) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) {
    throw new Error(
      `Falha na importação (HTTP ${response.status}). Verifique se os arquivos são .csv válidos em UTF-8.`,
    );
  }

  const data = await response.json();

  if (data.titulo || data.mensagem) {
    throw new Error(`${data.titulo ? data.titulo + ': ' : ''}${data.mensagem}`);
  }

  // O back serializa ResultadoCsv com resultadoLinhasDoCsv / resultadoLinhasDoCsv2 e veiculos / manifestos
  return {
    veiculos: normalizeResultado(data.veiculos ?? data.resultadoLinhasDoCsv, normalizeVeiculo),
    manifestos: normalizeResultado(data.manifestos ?? data.resultadoLinhasDoCsv2, normalizeManifesto),
  };
}

export function veiculosParaDrivers(veiculos: VeiculoDTO[]): Driver[] {
  return veiculos.map((v, i) => ({
    id: `imp-${v.placa || i}`,
    nome: v.motorista,
    veiculo: v.tipoVeiculo,
    tipoVeiculo: normalizarTipo(v.tipoVeiculo),
    categoria: categoriaDoTipo(v.tipoVeiculo),
    placa: v.placa,
    telefone: "",
    manifestoData: TODAY,
    status: v.status === "Ativo" ? "disponivel" : "indisponivel",
    lockedBy: null,
    avaliacoes: [],
  }));
}