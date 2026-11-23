export type DriverStatus = "disponivel" | "em_rota" | "indisponivel" | "indesejado";
export type StatusFilter = DriverStatus | "all";

export type Evaluation = {
  nota: number;
  obs: string;
  data: string;
  operador: string;
  /** Número do manifesto informado no modal ao colocar em rota (num_modal) */
  manifesto?: number;
};

export type TipoContato = "TELEFONE_RESIDENCIAL" | "COMERCIAL" | "WHATSAPP" | "OUTRO";

export const TIPO_CONTATO_OPCOES: { value: TipoContato; label: string }[] = [
  { value: "TELEFONE_RESIDENCIAL", label: "Telefone Residencial" },
  { value: "COMERCIAL", label: "Comercial" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "OUTRO", label: "Outro" },
];

export const TIPO_CONTATO_LABEL: Record<TipoContato, string> = {
  TELEFONE_RESIDENCIAL: "Telefone Residencial",
  COMERCIAL: "Comercial",
  WHATSAPP: "WhatsApp",
  OUTRO: "Outro",
};

export type AtualizarContatoPayload = {
  contatoMotorista: string;
  tipoContato?: TipoContato;
  contatoSecundario?: string;
  tipoContatoSecundario?: TipoContato;
};

export type Driver = {
  id: string;
  nome: string;
  veiculo: string;
  placa: string;
  telefone: string;
  tipoContato?: TipoContato;
  telefoneSecundario?: string;
  tipoContatoSecundario?: TipoContato;
  manifestoData: string;
  status: DriverStatus;
  lockedBy: string | null;
  manifestoAtual?: number;
  statusUpdatedAt?: string;
  avaliacoes: Evaluation[];
  categoria?: string;
  tipoVeiculo?: string;
  notaMedia?: number;
};

export type ResultadoSalvarStatus = { ok: true } | { ok: false; mensagem: string };
