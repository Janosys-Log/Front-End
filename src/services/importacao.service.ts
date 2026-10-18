import type { Driver } from "../types/driver";
import type {
  ErroLinha,
  ResultadoImportacao,
  ResultadoImportacaoDupla,
} from "../types/importacao";
import { TODAY } from "../constants/app";

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
  raw: Raw | undefined,
  normalizeItem: (r: Raw) => T,
): ResultadoImportacao<T> {
  const validos = (raw?.validos ?? []) as Raw[];
  const invalidos = (raw?.invalidos ?? []) as Raw[];
  return {
    validos: validos.map(normalizeItem),
    invalidos: invalidos.map(normalizeErro),
  };
}

/** Devolve a mensagem de erro, ou null se os dois arquivos foram escolhidos. */
export function validarArquivos(
  veiculos: File | null,
  manifestos: File | null,
): string | null {
  if (!veiculos && !manifestos) return "Faltam os dois arquivos: o CSV de veículos e o CSV de manifestos.";
  if (!veiculos) return "Falta o CSV de veículos.";
  if (!manifestos) return "Falta o CSV de manifestos.";
  return null;
}

/**
 * Envia os dois CSVs numa única requisição.
 * Os nomes dos campos ("veiculos" e "manifestos") precisam bater com os
 * @RequestParam / @RequestPart do controller.
 * Resposta esperada do back:
 * { veiculos: { validos, invalidos }, manifestos: { validos, invalidos } }
 */
export async function importarCsvs(
  veiculos: File,
  manifestos: File,
): Promise<ResultadoImportacaoDupla<VeiculoDTO, ManifestoDTO>> {
  const formData = new FormData();
  formData.append("csvVeiculo", veiculos);
  formData.append("csvManifesto", manifestos);

  const response = await fetch("/csv/veiculo", { method: "POST", body: formData });

  if (!response.ok) {
    throw new Error(
      `Falha na importação (HTTP ${response.status}). Verifique se os arquivos são .csv válidos em UTF-8.`,
    );
  }

  const data = await response.json();

  // Hoje o back serializa ResultadoCsv com estes nomes (veja os getters da classe);
  // aceita também "veiculos"/"manifestos" caso você renomeie com @JsonProperty.
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
    placa: v.placa,
    telefone: "",
    manifestoData: TODAY,
    status: v.status === "Ativo" ? "disponivel" : "outros",
    lockedBy: null,
    avaliacoes: [],
  }));
}