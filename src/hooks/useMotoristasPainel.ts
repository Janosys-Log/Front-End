import { useEffect, useState } from "react";
import useUsuario from "./useUsuario";

export type Motorista = {
  idMotorista: number;
  nomeMotorista: string;
  cpfMotorista: string;
  contatoMotorista: string;
  status: string;
  statusUpdatedAt: string;
  manifestoAtual: string | null;
  contadorRotaSp: number;
  notaMedia: number;
  veiculo: {
    idVeiculo: number;
    placaVeiculo: string;
    tipoVeiculo: string;
    subtipoVeiculo: string;
    agregadoId: number;
  };
  agregadoId: number;
};

export type MotoristaEmRota = {
  id: number;
  nome: string;
  veiculo: string;
  numeroManifesto: string | null;
  avaliacaoMedia: number;
};

export type MotoristaIndesejado = {
  id: number;
  nome: string;
  veiculo: string;
  updatedAt: Date;
};

export default function useMotoristasPainel() {
  const { session } = useUsuario();
  const [motoristasEmRota, setMotoristasEmRota] = useState<MotoristaEmRota[]>([]);
  const [motoristasIndesejados, setMotoristasIndesejados] = useState<MotoristaIndesejado[]>([]);

  async function disponibilizaMotorista(motoristaId: number) {
    await fetch("http://localhost:8083/api/status/updateStatus", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${session.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ motoristaId, status: "Disponivel" }),
    });
  }

  async function fetchMotoristas() {
    fetch("http://127.0.0.1:8083/api/motoristas?status=Em_Rota", {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao executar o fetch");
        }
        return response.json();
      })
      .then((responseJson: Motorista[]) => {
        const motoristasEmRota: MotoristaEmRota[] = responseJson.map(m => ({ id: m.idMotorista, nome: m.nomeMotorista, veiculo: m.veiculo.subtipoVeiculo, numeroManifesto: m.manifestoAtual ?? "10000", avaliacaoMedia: m.notaMedia }));
        setMotoristasEmRota(motoristasEmRota);
      });

    fetch("http://127.0.0.1:8083/api/motoristas?status=Indesejado", {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao executar o fetch");
        }
        return response.json();
      })
      .then((responseJson: Motorista[]) => {
        const motoristasIndesejados: MotoristaIndesejado[] = responseJson.map(m => ({ id: m.idMotorista, nome: m.nomeMotorista, veiculo: m.veiculo.subtipoVeiculo, updatedAt: new Date(m.statusUpdatedAt) }));
        setMotoristasIndesejados(motoristasIndesejados);
      });
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <fetchMotoristas é uma função>
  useEffect(() => {
    fetchMotoristas();
  // eslint-disable-next-line react/exhaustive-deps
  }, []);

  return { motoristasEmRota, motoristasIndesejados, setMotoristasEmRota, setMotoristasIndesejados, disponibilizaMotorista };
}
