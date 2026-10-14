import type { VeiculoDTO } from "../services/importacao.service";
import type { Driver, DriverStatus } from "../types/driver";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TODAY } from "../constants/app";
import { STATUS_ORDER } from "../constants/status";
import { seedDrivers } from "../services/drivers.service";
import { veiculosParaDrivers } from "../services/importacao.service";

const MOTORISTA_URL = "http://localhost:8080";
const AVALIACAO_URL = "http://localhost:8082";

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

function mapMotorista(m: MotoristaApi): Driver {
  return {
    id: String(m.idMotorista),
    nome: m.nomeMotorista,
    veiculo: m.veiculoId ? `Veículo #${m.veiculoId}` : "—",
    placa: "",
    telefone: m.contatoMotorista || "",
    manifestoData: m.ultimoManifesto || TODAY,
    status: mapStatus(m.status),
    lockedBy: null,
    avaliacoes: [],
  };
}

export function useDrivers(userName: string) {
  const [drivers, setDrivers] = useState<Driver[]>(() => seedDrivers());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [avaliacao, setAvaliacao] = useState<Avaliacao>({ motoristaId: 0, nota: 5, feedback: "" });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const loadFromApi = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${MOTORISTA_URL}/api/motoristas`);
      if (!res.ok) throw new Error("API motoristas indisponível");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setDrivers(data.map(mapMotorista));
      }
    } catch {
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

  function changeStatus(id: string, status: DriverStatus) {
    setDrivers(ds => ds.map(d => d.id === id ? { ...d, status } : d));
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

      concludeRoute(avaliacao.motoristaId, avaliacao.nota, avaliacao.feedback);
      setAvaliacao({ motoristaId: 0, nota: 5, feedback: "" });
      return true;
    } catch (e) {
      setError("Não foi possível conectar ao serviço de avaliação. Verifique se está rodando.");
      return false;
    }
  }

  function reset() {
    setDrivers(seedDrivers());
    setSelectedId(null);
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
