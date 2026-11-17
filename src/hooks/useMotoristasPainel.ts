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
  updatedAt: Date;
};

export type MotoristaIndesejado = {
  id: number;
  nome: string;
  veiculo: string;
  updatedAt: Date;
  diasComIndesejado: number;
};

type AvaliacaoResponse = {
  mensagem: string;
  id: number;
  motoristaId: number;
  nota: number;
  numeroManifesto: number;
  descricaoNota: string;
  feedback: string;
  dataRegistro: string;
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

  async function fetchMotoristasEmRota() {
    const motoristas = await fetch("http://127.0.0.1:8083/api/motoristas?status=Em_Rota", {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao executar o fetch");
        }
        return response.json();
      })
      .then((responseJson: Motorista[]) => {
        const motoristasEmRota: MotoristaEmRota[] = responseJson.map(m => ({
          id: m.idMotorista,
          nome: m.nomeMotorista,
          veiculo: m.veiculo.subtipoVeiculo,
          numeroManifesto: m.manifestoAtual ?? "10000",
          avaliacaoMedia: m.notaMedia,
          updatedAt: new Date(m.statusUpdatedAt),
        }))
          .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
        return motoristasEmRota;
      });
    return motoristas;
  }

  async function fetchMotoristasIndesejados() {
    const motoristas = await fetch("http://127.0.0.1:8083/api/motoristas?status=Indesejado", {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao executar o fetch");
        }
        return response.json();
      })
      .then((responseJson: Motorista[]) => {
        const motoristasIndesejados: MotoristaIndesejado[] = responseJson.map(m => ({
          id: m.idMotorista,
          nome: m.nomeMotorista,
          veiculo: m.veiculo.subtipoVeiculo,
          updatedAt: new Date(m.statusUpdatedAt),
          diasComIndesejado: Math.floor((Date.now() - new Date(m.statusUpdatedAt).getTime()) / (1000 * 60 * 60 * 24)),
        }))
          .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
        return motoristasIndesejados;
      });
    return motoristas;
  }

  async function buscarAvaliacoes(motoristas: MotoristaEmRota[]) {
    try {
      const resultados = await Promise.all(
        motoristas.map(async (motorista) => {
          const response = await fetch(
            `http://localhost:8082/api/avaliacoes?motoristaId=${motorista.id}`,
            {
              headers: {
                Authorization: `Bearer ${session.token}`,
              },
            },
          );

          if (!response.ok) {
            throw new Error("Erro ao buscar avaliações");
          }

          const avaliacoes: AvaliacaoResponse[] = await response.json();

          const media = avaliacoes.length > 0
            ? avaliacoes.reduce(
              (soma, avaliacao) => soma + avaliacao.nota,
              0,
            ) / avaliacoes.length
            : 0;

          const mediaFormatada = Number(media.toFixed(2));

          return {
            id: motorista.id,
            avaliacaoMedia: mediaFormatada,
          };
        }),
      );

      const motoristasEmRotaComAvaliacao = motoristas.map((m) => {
        const resultado = resultados.find(r => r.id === m.id);

        return resultado
          ? {
              ...m,
              avaliacaoMedia: resultado.avaliacaoMedia,
            }
          : m;
      });

      return motoristasEmRotaComAvaliacao;
    }
    catch (error) {
      console.error("Erro ao buscar avaliações:", error);
    }
  }

  async function fetchMotoristas() {
    try {
      const [motoristasEmRota, motoristasIndesejados] = await Promise.all([
        fetchMotoristasEmRota(),
        fetchMotoristasIndesejados(),
      ]);

      if (motoristasIndesejados.length > 0)
        setMotoristasIndesejados(motoristasIndesejados);

      if (motoristasEmRota.length === 0)
        return;

      const motoristasEmRotaComAvaliacao = await buscarAvaliacoes(motoristasEmRota);
      setMotoristasEmRota(motoristasEmRotaComAvaliacao !== undefined ? motoristasEmRotaComAvaliacao : motoristasEmRota);
    }
    catch (error) {
      console.error("Erro ao buscar motoristas:", error);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <fetchMotoristas é uma função>
  useEffect(() => {
    fetchMotoristas();
  }, []);

  return { motoristasEmRota, motoristasIndesejados, setMotoristasEmRota, setMotoristasIndesejados, disponibilizaMotorista };
}
