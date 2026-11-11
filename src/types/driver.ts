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

export type Driver = {
  id: string;
  nome: string;
  veiculo: string;
  placa: string;
  telefone: string;
  manifestoData: string;
  status: DriverStatus;
  lockedBy: string | null;
  manifestoAtual?: number;
  avaliacoes: Evaluation[];
  categoria?: string;
  tipoVeiculo?: string;
};

export type ResultadoSalvarStatus = { ok: true } | { ok: false; mensagem: string };
