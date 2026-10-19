import type { VeiculoDTO } from "../services/importacao.service";
import type { Driver, DriverStatus } from "../types/driver";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TODAY } from "../constants/app";
import { TIPO_LABEL } from "../constants/vehicles";
import { STATUS_ORDER } from "../constants/status";
import { veiculosParaDrivers } from "../services/importacao.service";

const MOTORISTA_URL = "http://localhost:8080";
const AVALIACAO_URL = "http://localhost:8082";
const VEICULO_URL = "http://localhost:8081";

type Avaliacao = {
  motoristaId: number;
  nota: number;
  feedback: string;
};

type MotoristaApi = {
  idMotorista: number;
  nomeMotorista: string;
  cpfMotorista?: string;
  contatoMotorista?: string;
  status?: string;
  ultimoManifesto?: string | null;
  veiculoId?: number;
  notaMedia?: number;
};

type VeiculoApi = {
  idVeiculo: number;
  placaVeiculo: string;
  tipoVeiculo?: string;
  categoria?: string;
};

const STATUS_API: Record<DriverStatus, string> = {
  disponivel: "Disponivel",
  em_rota: "Em_Rota",
  indisponivel: "Indisponivel",
  indesejado: "Indesejado",
};

function mapStatus(s?: string): DriverStatus {
  if (!s) return "disponivel";
  const n = s.toLowerCase().replace("-", "_");
  if (n === "disponivel" || n === "em_rota" || n === "indisponivel" || n === "indesejado") {
    return n as DriverStatus;
  }
  if (n.includes("rota")) return "em_rota";
  if (n.includes("indesej")) return "indesejado";
  if (n.includes("indispon")) return "indisponivel";
  return "disponivel";
}

function mapMotorista(m: MotoristaApi, v?: VeiculoApi): Driver {
  return {
    id: String(m.idMotorista),
    nome: m.nomeMotorista,
    veiculo: v?.tipoVeiculo
      ? (TIPO_LABEL[v.tipoVeiculo] ?? v.tipoVeiculo)
      : m.veiculoId ? `Veículo #${m.veiculoId}` : "—",
    placa: v?.placaVeiculo ?? "",
    categoria: v?.categoria,
    tipoVeiculo: v?.tipoVeiculo,
    telefone: m.contatoMotorista || "",
    manifestoData: m.ultimoManifesto || TODAY,
    status: mapStatus(m.status),
    lockedBy: null,
    avaliacoes: [],
  };
}

export function useDrivers(userName: string) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [avaliacao, setAvaliacao] = useState<Avaliacao>({ motoristaId: 0, nota: 5, feedback: "" });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadFromApi = useCallback(async () => {
    setLoading(true);
    try {
      const [resMot, resVei] = await Promise.all([
        fetch(`${MOTORISTA_URL}/api/motoristas`),
        // Se o serviço de veículo estiver fora, a lista de motoristas ainda carrega.
        fetch(`${VEICULO_URL}/api/veiculos`).catch(() => null),
      ]);
      if (!resMot.ok) throw new Error("API motoristas indisponível");
      const data: unknown = await resMot.json();
      if (!Array.isArray(data)) {
        throw new Error("A API de motoristas retornou um formato inesperado.");
      }

      let veiculos: VeiculoApi[] = [];
      if (resVei?.ok) {
        const v: unknown = await resVei.json();
        if (Array.isArray(v)) veiculos = v as VeiculoApi[];
      }
      const porId = new Map(veiculos.map(v => [v.idVeiculo, v]));

      // A resposta da API é a fonte da verdade, inclusive quando a lista está vazia.
      setDrivers((data as MotoristaApi[]).map(m =>
        mapMotorista(m, m.veiculoId ? porId.get(m.veiculoId) : undefined),
      ));
    } catch (e) {
      setDrivers([]);
      console.error("Falha ao carregar motoristas da API:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromApi();
  }, [loadFromApi]);

  const sortedDrivers = useMemo(() => {
    return [...drivers].sort((a, b) => {
      const orderA = STATUS_ORDER.indexOf(a.status);
      const orderB = STATUS_ORDER.indexOf(b.status);
      if (orderA !== orderB) return orderA - orderB;

      const hasManifestA = !!a.manifestoData;
      const hasManifestB = !!b.manifestoData;
      if (!hasManifestA && hasManifestB) return -1;
      if (hasManifestA && !hasManifestB) return 1;
      if (hasManifestA && hasManifestB) {
        const timeA = new Date(a.manifestoData).getTime();
        const timeB = new Date(b.manifestoData).getTime();
        if (timeA !== timeB) return timeA - timeB;
      }

      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [drivers]);

  const selected = drivers.find(d => d.id === selectedId) ?? null;

  function select(id: string) {
    setSelectedId(id);
    setDrivers(ds => ds.map((d) => {
      if (d.id === id)
        return d.lockedBy && d.lockedBy !== "Você" ? d : { ...d, lockedBy: "Você" };
      if (d.lockedBy === "Você")
        return { ...d, lockedBy: null };
      return d;
    }));
  }

  function closeDetail() {
    setDrivers(ds => ds.map(d => (d.id === selectedId && d.lockedBy === "Você") ? { ...d, lockedBy: null } : d));
    setSelectedId(null);
  }

  // Grava o status no banco. Retorna true se deu certo.
  async function salvarStatus(id: string, status: DriverStatus): Promise<boolean> {
    // Motoristas vindos da importação (ids "imp-...") ainda não existem no banco.
    if (!/^\d+$/.test(id)) return true;

    try {
      const res = await fetch(`${MOTORISTA_URL}/api/status/updateStatus`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motoristaId: Number(id), status: STATUS_API[status] }),
      });
      if (!res.ok) throw new Error(await res.text());
      return true;
    } catch (e) {
      console.error("Falha ao atualizar status:", e);
      return false;
    }
  }

  async function changeStatus(id: string, status: DriverStatus) {
    const anterior = drivers.find(d => d.id === id)?.status;
    setDrivers(ds => ds.map(d => d.id === id ? { ...d, status } : d));

    const ok = await salvarStatus(id, status);
    if (!ok) {
      if (anterior) {
        setDrivers(ds => ds.map(d => d.id === id ? { ...d, status: anterior } : d));
      }
      window.alert("Não foi possível salvar o novo status. O servidor recusou a mudança ou está fora do ar.");
    }
  }

  function concludeRoute(motoristaId: number, nota: number, feedback: string) {
    setDrivers(ds => ds.map(d => d.id === String(motoristaId)
      ? {
          ...d,
          status: "disponivel" as DriverStatus,
          avaliacoes: [{ nota, obs: feedback, data: TODAY, operador: userName }, ...d.avaliacoes],
        }
      : d));
  }

  async function sendAvaliacao(): Promise<boolean> {
    setError("");
    if (!avaliacao.motoristaId || avaliacao.motoristaId <= 0) {
      setError("Motorista inválido");
      return false;
    }
    if (!avaliacao.feedback.trim()) {
      setError("Feedback obrigatório");
      return false;
    }
    if (avaliacao.nota < 1 || avaliacao.nota > 5) {
      setError("Nota deve ser de 1 a 5");
      return false;
    }

    try {
      const responseAvaliacao = await fetch(`${AVALIACAO_URL}/api/avaliacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motoristaId: avaliacao.motoristaId,
          nota: avaliacao.nota,
          feedback: avaliacao.feedback,
        }),
      });

      if (!responseAvaliacao.ok) {
        const body = await responseAvaliacao.text();
        setError(`Erro na avaliação (${responseAvaliacao.status}): ${body}`);
        return false;
      }

      // Concluir a rota também volta o motorista para "Disponível" no banco.
      const statusOk = await salvarStatus(String(avaliacao.motoristaId), "disponivel");
      if (!statusOk) {
        window.alert("A avaliação foi registrada, mas não foi possível atualizar o status do motorista no servidor.");
        setAvaliacao({ motoristaId: 0, nota: 5, feedback: "" });
        void loadFromApi();
        return true;
      }

      concludeRoute(avaliacao.motoristaId, avaliacao.nota, avaliacao.feedback);
      setAvaliacao({ motoristaId: 0, nota: 5, feedback: "" });
      return true;
    } catch (e) {
      setError("Não foi possível conectar ao serviço de avaliação. Verifique se está rodando.");
      return false;
    }
  }

  function reset() {
    setSelectedId(null);
    void loadFromApi();
  }

  function importar(veiculos: VeiculoDTO[]) {
    setDrivers(veiculosParaDrivers(veiculos));
    setSelectedId(null);
  }

  return {
    drivers,
    sortedDrivers,
    selected,
    selectedId,
    select,
    closeDetail,
    changeStatus,
    concludeRoute,
    reset,
    importar,
    avaliacao,
    setAvaliacao,
    sendAvaliacao,
    error,
    loading,
    reload: loadFromApi,
  };
}