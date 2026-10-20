export type DriverStatus = "disponivel" | "em_rota" | "indisponivel" | "indesejado";
export type StatusFilter = DriverStatus | "all";

export type Evaluation = {
  nota: number;
  obs: string;
  data: string;
  operador: string;
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
  avaliacoes: Evaluation[];
  categoria?: string;
  tipoVeiculo?: string;
};
