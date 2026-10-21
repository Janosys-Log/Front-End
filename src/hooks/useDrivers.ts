import type { VeiculoDTO } from "../services/importacao.service";
import type { Driver, DriverStatus } from "../types/driver";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TODAY } from "../constants/app";
import { TIPO_LABEL } from "../constants/vehicles";
import { STATUS_ORDER } from "../constants/status";
import { veiculosParaDrivers } from "../services/importacao.service";
import { apiFetch } from "../services/apiFetch";

// manifestoService.ts e importacao.service.ts

const MOTORISTA_URL = "http://localhost:8083";
const AVALIACAO_URL = "http://localhost:8082";

// Chave onde o auth.service.ts guarda o token no localStorage.
// Confira com: grep -n "localStorage" src/services/auth.service.ts
// useDrivers.ts


type Avaliacao = {
  motoristaId: number;
  nota: number;
  feedback: string;
};

// Veiculo.java -> vem aninhado dentro de Motorista
type VeiculoApi = {
  idVeiculo: number;
  placaVeiculo: string;
  tipoVeiculo?: string;    // enum TipoVeiculo, ex: URBANOS_EXPRESS
  subtipoVeiculo?: string; // enum SubtipoVeiculo, ex: VAN
};

// Motorista.java
type MotoristaApi = {
  idMotorista: number;
  nomeMotorista: string;
  cpfMotorista?: string;
  contatoMotorista?: string;
  status?: string;
  notaMedia?: number;
  veiculo?: VeiculoApi | null;
};

// Manifesto.java (só o que interessa)
type ManifestoApi = {
  idManifesto: number;
  dataManifesto?: string | number[] | null;
  motorista?: { idMotorista: number } | null;
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

// LocalDate pode vir como "2026-10-12" ou como [2026, 10, 12], dependendo da config do Jackson.
function normalizarData(d?: string | number[] | null): string {
  if (!d) return "";
  if (Array.isArray(d)) {
    const [y, m, day] = d;
    return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return d.slice(0, 10);
}

// motoristaId -> data do manifesto mais recente (yyyy-MM-dd)
function ultimoManifestoPorMotorista(manifestos: ManifestoApi[]): Map<number, string> {
  const mapa = new Map<number, string>();
  for (const mf of manifestos) {
    const id = mf.motorista?.idMotorista;
    const data = normalizarData(mf.dataManifesto);
    if (id == null || !data) continue;
    const atual = mapa.get(id);
    if (!atual || data > atual) mapa.set(id, data);
  }
  return mapa;
}

// Nomes amigáveis dos enums SubtipoVeiculo / TipoVeiculo (usado quando TIPO_LABEL não tem a chave).
const SUBTIPO_LABEL: Record<string, string> = {
  MOTOCICLETAS: "Motocicletas",
  AUTOMOVEIS: "Automóveis",
  FIORINO: "Fiorino",
  VAN: "Van",
  VUC: "VUC",
  TRES_QUARTOS: "3/4",
  TOCO: "Toco",
  TRUCK: "Truck",
  BI_TRUCK: "Bi-truck",
  CAVALO_MECANICO: "Cavalo Mecânico",
  CAVALO_MECANICO_TRUCADO: "Cavalo Mecânico Trucado",
  SEMI_REBOQUE_2_EIXOS: "Semi-reboque 2 eixos",
  SEMI_REBOQUE_3_EIXOS: "Semi-reboque 3 eixos",
  SEMI_REBOQUE_4_EIXOS: "Semi-reboque 4 eixos",
};

function humanizarEnum(k: string): string {
  const t = k.toLowerCase().replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function rotuloVeiculo(k: string): string {
  return TIPO_LABEL[k] ?? SUBTIPO_LABEL[k] ?? humanizarEnum(k);
}

function mapMotorista(m: MotoristaApi, ultimoManifesto?: string): Driver {
  const v = m.veiculo ?? undefined;
  return {
    id: String(m.idMotorista),
    nome: m.nomeMotorista,
    veiculo: v?.subtipoVeiculo
      ? rotuloVeiculo(v.subtipoVeiculo)
      : v?.tipoVeiculo
        ? rotuloVeiculo(v.tipoVeiculo)
        : "—",
    placa: v?.placaVeiculo ?? "",
    categoria: v?.tipoVeiculo,
    tipoVeiculo: v?.subtipoVeiculo,
    telefone: m.contatoMotorista || "",
    // Sem manifesto = string vazia (o sort já trata como "sem manifesto" e coloca na frente).
    manifestoData: ultimoManifesto ?? "",
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
      const [resMot, resMan] = await Promise.all([
        apiFetch(`${MOTORISTA_URL}/api/motoristas`),
        // Se manifestos falhar, a lista de motoristas ainda carrega.
        apiFetch(`${MOTORISTA_URL}/api/manifestos`).catch(() => null),
      ]);
      if (resMot.status === 401) throw new Error("Sessão expirada. Faça login novamente.");
      if (!resMot.ok) throw new Error("API motoristas indisponível");
      const data: unknown = await resMot.json();
      if (!Array.isArray(data)) {
        throw new Error("A API de motoristas retornou um formato inesperado.");
      }

      let manifestos: ManifestoApi[] = [];
      if (resMan?.ok) {
        const mf: unknown = await resMan.json();
        if (Array.isArray(mf)) manifestos = mf as ManifestoApi[];
      }
      const ultimoPorMotorista = ultimoManifestoPorMotorista(manifestos);

      // A resposta da API é a fonte da verdade, inclusive quando a lista está vazia.
      setDrivers((data as MotoristaApi[]).map(m =>
        mapMotorista(m, ultimoPorMotorista.get(m.idMotorista)),
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
    if (!/^\d+$/.test(id)) {
      console.log("[salvarStatus] id não numérico, não grava no banco:", id);
      return true;
    }

    try {
      const res = await apiFetch(`${MOTORISTA_URL}/api/status/updateStatus`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motoristaId: Number(id), status: STATUS_API[status] }),
      });
      console.log("[salvarStatus] resposta", res.status);
      if (!res.ok) throw new Error(await res.text());
      return true;
    } catch (e) {
      console.error("Falha ao atualizar status:", e);
      return false;
    }
  }

  async function changeStatus(id: string, status: DriverStatus) {
    const anterior = drivers.find(d => d.id === id)?.status;
    console.log("[changeStatus] chamado", { id, de: anterior, para: status });
    // O backend recusa (400) quando o status novo é igual ao atual de quem está Disponível.
    if (anterior === status) return;
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
      const responseAvaliacao = await apiFetch(`${AVALIACAO_URL}/api/avaliacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motoristaId: avaliacao.motoristaId,
          nota: avaliacao.nota,
          feedback: avaliacao.feedback,
        }),
      });

      if (responseAvaliacao.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
        return false;
      }

      if (!responseAvaliacao.ok) {
        const body = await responseAvaliacao.text();
        setError(`Erro na avaliação (${responseAvaliacao.status}): ${body}`);
        return false;
      }

      // Concluir a rota também volta o motorista para "Disponível" no banco.
      const atual = drivers.find(d => d.id === String(avaliacao.motoristaId))?.status;
      const statusOk = atual === "disponivel"
        ? true
        : await salvarStatus(String(avaliacao.motoristaId), "disponivel");
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