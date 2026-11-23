import { useCallback, useEffect, useMemo, useState } from "react";
import { TODAY } from "../constants/app";
import { STATUS_ORDER } from "../constants/status";
import { TIPO_LABEL } from "../constants/vehicles";
import { apiFetch } from "../services/apiFetch";
import type { VeiculoDTO } from "../services/importacao.service";
import { veiculosParaDrivers } from "../services/importacao.service";
import type { AtualizarContatoPayload, Driver, DriverStatus, ResultadoSalvarStatus, TipoContato } from "../types/driver";
import { ehNumeroManifestoValido } from "../utils/manifesto";

// manifestoService.ts e importacao.service.ts

const MOTORISTA_URL = "http://localhost:8083";
const AVALIACAO_URL = "http://localhost:8082";

const STATUS_SALVO: ResultadoSalvarStatus = { ok: true };
const MENSAGEM_FALHA_AO_SALVAR_STATUS =
	"Não foi possível salvar o novo status. O servidor recusou a mudança ou está fora do ar.";

// Chave onde o auth.service.ts guarda o token no localStorage.
// Confira com: grep -n "localStorage" src/services/auth.service.ts
// useDrivers.ts

type Avaliacao = {
	motoristaId: number;
	nota: number;
	numeroManifesto: number;
	feedback: string;
};

type ContatoMotoristaApi = {
	motoristaId: number;
	email: string;
	nome: string;
	expiraEm: string;
};

function resolverLockedBy(
	contato: ContatoMotoristaApi | undefined,
	userEmail?: string,
): string | null {
	if (!contato) return null;
	if (userEmail && contato.email.toLowerCase() === userEmail.toLowerCase()) {
		return "Você";
	}
	return contato.nome || contato.email;
}

// Veiculo.java -> vem aninhado dentro de Motorista
type VeiculoApi = {
	idVeiculo: number;
	placaVeiculo: string;
	tipoVeiculo?: string; // enum TipoVeiculo, ex: URBANOS_EXPRESS
	subtipoVeiculo?: string; // enum SubtipoVeiculo, ex: VAN
};

// Motorista.java
type MotoristaApi = {
	idMotorista: number;
	nomeMotorista: string;
	cpfMotorista?: string;
	contatoMotorista?: string;
	tipoContato?: TipoContato | null;
	contatoSecundario?: string | null;
	tipoContatoSecundario?: TipoContato | null;
	status?: string;
	statusUpdatedAt?: string | number[] | null;
	manifestoAtual?: number | null;
	dataUltimoManifesto?: string | number[] | null;
	notaMedia?: number;
	veiculo?: VeiculoApi | null;
};

// Manifesto.java (só o que interessa)
type ManifestoApi = {
	idManifesto: number;
	dataManifesto?: string | number[] | null;
	motorista?: { idMotorista: number } | null;
};

type AvaliacaoApi = {
	motoristaId: number;
	nota: number;
	feedback: string;
	dataRegistro: string;
	numeroManifesto?: number;
};

async function carregarAvaliacoes(motoristaId: number) {
	const response = await apiFetch(
		`${AVALIACAO_URL}/api/avaliacoes?motoristaId=${motoristaId}`,
	);
	if (!response.ok) throw new Error(`Falha ao carregar avaliações (${response.status})`);
	const data: unknown = await response.json();
	if (!Array.isArray(data)) throw new Error("Formato de avaliações inesperado");
	return (data as AvaliacaoApi[])
		.filter((a) => a.motoristaId === motoristaId)
		.map((a) => ({
		nota: a.nota,
		obs: a.feedback,
		data: a.dataRegistro?.slice(0, 10) ?? "",
		operador: "",
		manifesto: a.numeroManifesto,
	}));
}

async function lerMensagemDeErro(resposta: Response): Promise<string> {
	const corpo: { mensagem?: string } | null = await resposta.json().catch(() => null);
	return corpo?.mensagem ?? MENSAGEM_FALHA_AO_SALVAR_STATUS;
}

const STATUS_API: Record<DriverStatus, string> = {
	disponivel: "Disponivel",
	em_rota: "Em_Rota",
	indisponivel: "Indisponivel",
	indesejado: "Indesejado",
};

function mapStatus(s?: string): DriverStatus {
	if (!s) return "disponivel";
	const n = s.toLowerCase().replace("-", "_");
	if (
		n === "disponivel" ||
		n === "em_rota" ||
		n === "indisponivel" ||
		n === "indesejado"
	) {
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
function ultimoManifestoPorMotorista(
	manifestos: ManifestoApi[],
): Map<number, string> {
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
	const dataRotaConcluida = normalizarData(m.dataUltimoManifesto);
	const manifestoMaisRecente =
		ultimoManifesto && dataRotaConcluida
			? ultimoManifesto > dataRotaConcluida
				? ultimoManifesto
				: dataRotaConcluida
			: ultimoManifesto || dataRotaConcluida || "";
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
		tipoContato: m.tipoContato ?? undefined,
		telefoneSecundario: m.contatoSecundario || undefined,
		tipoContatoSecundario: m.tipoContatoSecundario ?? undefined,
		// Usa a data mais recente entre os manifestos do CSV e a última rota concluída.
		manifestoData: manifestoMaisRecente,
		status: mapStatus(m.status),
		manifestoAtual: m.manifestoAtual ?? undefined,
		lockedBy: null,
		avaliacoes: [],
		notaMedia: m.notaMedia ?? undefined,
		statusUpdatedAt: normalizarData(m.statusUpdatedAt),
	};
}

export function useDrivers(userName: string, onlyEmRota = false, userEmail?: string) {
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [avaliacao, setAvaliacao] = useState<Avaliacao>({
		motoristaId: 0,
		nota: 5,
		numeroManifesto: 0,
		feedback: "",
	});
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [loadFailed, setLoadFailed] = useState(false);

	const loadFromApi = useCallback(async () => {
		setLoading(true);
		setLoadFailed(false);
		try {
			const [resMot, resMan, resContatos] = await Promise.all([
				apiFetch(`${MOTORISTA_URL}/api/motoristas${onlyEmRota ? "?status=Em_Rota" : ""}`),
				// Se manifestos falhar, a lista de motoristas ainda carrega.
				onlyEmRota ? Promise.resolve(null) : apiFetch(`${MOTORISTA_URL}/api/manifestos`).catch(() => null),
				onlyEmRota ? Promise.resolve(null) : apiFetch(`${MOTORISTA_URL}/api/motoristas/contatos`).catch(() => null),
			]);
			if (resMot.status === 401)
				throw new Error("Sessão expirada. Faça login novamente.");
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

			let contatosMap: Record<string, ContatoMotoristaApi> = {};
			if (resContatos?.ok) {
				const ct: unknown = await resContatos.json();
				if (ct && typeof ct === "object") {
					contatosMap = ct as Record<string, ContatoMotoristaApi>;
				}
			}

			// A resposta da API é a fonte da verdade, inclusive quando a lista está vazia.
			const motoristas = data as MotoristaApi[];
			const driversComAvaliacoes = await Promise.all(
				motoristas.map(async (m) => {
					const driver = mapMotorista(m, ultimoPorMotorista.get(m.idMotorista));
					driver.lockedBy = resolverLockedBy(contatosMap[String(m.idMotorista)], userEmail);
					if (!onlyEmRota) {
						try {
							driver.avaliacoes = await carregarAvaliacoes(m.idMotorista);
						} catch (e) {
							console.error(`Falha ao carregar avaliações do motorista ${m.idMotorista}:`, e);
						}
					}
					return driver;
				}),
			);
			setDrivers(driversComAvaliacoes);
		} catch (e) {
			setDrivers([]);
			setLoadFailed(true);
			console.error("Falha ao carregar motoristas da API:", e);
		} finally {
			setLoading(false);
		}
	}, [onlyEmRota, userEmail]);

	useEffect(() => {
		loadFromApi();
	}, [loadFromApi]);

	const sincronizarContatos = useCallback(async () => {
		if (onlyEmRota) return;
		try {
			const res = await apiFetch(`${MOTORISTA_URL}/api/motoristas/contatos`);
			if (!res.ok) return;
			const contatosMap = (await res.json()) as Record<string, ContatoMotoristaApi>;
			setDrivers((ds) =>
				ds.map((d) => {
					const nextLockedBy = resolverLockedBy(contatosMap[d.id], userEmail);
					return d.lockedBy === nextLockedBy ? d : { ...d, lockedBy: nextLockedBy };
				}),
			);
		} catch {
			// ignora falha transitória de polling
		}
	}, [onlyEmRota, userEmail]);

	useEffect(() => {
		if (onlyEmRota) return;
		const timer = window.setInterval(() => {
			void sincronizarContatos();
		}, 5000);
		return () => window.clearInterval(timer);
	}, [onlyEmRota, sincronizarContatos]);

	const sortedDrivers = useMemo(() => {
		return [...drivers].sort((a, b) => {
			const orderA = STATUS_ORDER.indexOf(a.status);
			const orderB = STATUS_ORDER.indexOf(b.status);
			if (orderA !== orderB) return orderA - orderB;

			const hasManifestA = !!a.manifestoData;
			const hasManifestB = !!b.manifestoData;
			// Motoristas com histórico (manifesto) aparecem primeiro; sem manifesto vão para o final.
			if (hasManifestA && !hasManifestB) return -1;
			if (!hasManifestA && hasManifestB) return 1;
			if (hasManifestA && hasManifestB) {
				const timeA = new Date(a.manifestoData).getTime();
				const timeB = new Date(b.manifestoData).getTime();
				if (timeA !== timeB) return timeA - timeB;
			}

			return a.nome.localeCompare(b.nome, "pt-BR");
		});
	}, [drivers]);

	const selected = drivers.find((d) => d.id === selectedId) ?? null;

	function select(id: string) {
		setSelectedId(id);
		if (!/^\d+$/.test(id)) {
			setDrivers((ds) =>
				ds.map((d) => {
					if (d.id === id)
						return d.lockedBy && d.lockedBy !== "Você"
							? d
							: { ...d, lockedBy: "Você" };
					if (d.lockedBy === "Você") return { ...d, lockedBy: null };
					return d;
				}),
			);
			return;
		}

		void (async () => {
			try {
				const res = await apiFetch(`${MOTORISTA_URL}/api/motoristas/${id}/contato`, {
					method: "POST",
				});
				if (res.ok) {
					setDrivers((ds) =>
						ds.map((d) => {
							if (d.id === id) return { ...d, lockedBy: "Você" };
							if (d.lockedBy === "Você") return { ...d, lockedBy: null };
							return d;
						}),
					);
				} else if (res.status === 409) {
					const contato = (await res.json()) as ContatoMotoristaApi;
					const holder = resolverLockedBy(contato, userEmail);
					setDrivers((ds) =>
						ds.map((d) => {
							if (d.id === id) return { ...d, lockedBy: holder };
							if (d.lockedBy === "Você") return { ...d, lockedBy: null };
							return d;
						}),
					);
				}
			} catch (e) {
				console.error("Falha ao registrar contato com motorista:", e);
			}
		})();
	}

	const closeDetail = useCallback(() => {
		const idAtual = selectedId;
		if (idAtual && /^\d+$/.test(idAtual)) {
			void apiFetch(`${MOTORISTA_URL}/api/motoristas/${idAtual}/contato`, {
				method: "DELETE",
			}).catch(() => null);
		}
		setDrivers((ds) =>
			ds.map((d) =>
				d.id === idAtual && d.lockedBy === "Você"
					? { ...d, lockedBy: null }
					: d,
			),
		);
		setSelectedId(null);
	}, [selectedId]);

	// Renova o TTL do contato a cada 30s enquanto o detalhe estiver aberto para este usuário.
	const isMeuLockAtual = selected?.lockedBy === "Você";
	useEffect(() => {
		if (!selectedId || !/^\d+$/.test(selectedId) || !isMeuLockAtual) return;
		const heartbeat = window.setInterval(() => {
			void (async () => {
				try {
					const res = await apiFetch(`${MOTORISTA_URL}/api/motoristas/${selectedId}/contato`, {
						method: "POST",
					});
					if (res.status === 409) {
						const contato = (await res.json()) as ContatoMotoristaApi;
						const holder = resolverLockedBy(contato, userEmail);
						setDrivers((ds) =>
							ds.map((d) => (d.id === selectedId ? { ...d, lockedBy: holder } : d)),
						);
					}
				} catch {
					// ignora falha transitória de heartbeat
				}
			})();
		}, 30_000);
		return () => window.clearInterval(heartbeat);
	}, [selectedId, isMeuLockAtual, userEmail]);

	// Libera qualquer contato ativo ao fechar a aba ou desmontar a tela.
	useEffect(() => {
		const liberarAoSair = () => {
			void apiFetch(`${MOTORISTA_URL}/api/motoristas/contatos/meus`, {
				method: "DELETE",
				keepalive: true,
			}).catch(() => null);
		};
		window.addEventListener("beforeunload", liberarAoSair);
		return () => {
			window.removeEventListener("beforeunload", liberarAoSair);
			liberarAoSair();
		};
	}, []);

	// Grava o status no banco. O manifesto só é enviado ao entrar em rota.
	async function salvarStatus(
		id: string,
		status: DriverStatus,
		numeroManifesto?: number,
	): Promise<ResultadoSalvarStatus> {
		// Motoristas vindos da importação (ids "imp-...") ainda não existem no banco.
		if (!/^\d+$/.test(id)) {
			console.log("[salvarStatus] id não numérico, não grava no banco:", id);
			return STATUS_SALVO;
		}

		try {
			const res = await apiFetch(`${MOTORISTA_URL}/api/status/updateStatus`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					motoristaId: Number(id),
					status: STATUS_API[status],
					numeroManifesto,
				}),
			});
			console.log("[salvarStatus] resposta", res.status);
			if (!res.ok) return { ok: false, mensagem: await lerMensagemDeErro(res) };
			return STATUS_SALVO;
		} catch (e) {
			console.error("Falha ao atualizar status:", e);
			return { ok: false, mensagem: MENSAGEM_FALHA_AO_SALVAR_STATUS };
		}
	}

	async function changeStatus(
		id: string,
		status: DriverStatus,
		numeroManifesto?: number,
	): Promise<ResultadoSalvarStatus> {
		const motoristaAnterior = drivers.find((d) => d.id === id);
		console.log("[changeStatus] chamado", { id, de: motoristaAnterior?.status, para: status });
		// O backend recusa (400) quando o status novo é igual ao atual de quem está Disponível.
		if (motoristaAnterior?.status === status) return STATUS_SALVO;

		const manifestoAtual = status === "em_rota" ? numeroManifesto : undefined;
		setDrivers((ds) => ds.map((d) => (d.id === id ? { ...d, status, manifestoAtual } : d)));

		const resultado = await salvarStatus(id, status, numeroManifesto);
		if (!resultado.ok && motoristaAnterior) {
			const { status: statusAnterior, manifestoAtual: manifestoAnterior } = motoristaAnterior;
			setDrivers((ds) =>
				ds.map((d) => (d.id === id ? { ...d, status: statusAnterior, manifestoAtual: manifestoAnterior } : d)),
			);
		}
		return resultado;
	}

	function concludeRoute(motoristaId: number, nota: number, feedback: string) {
		setDrivers((ds) =>
			ds.map((d) =>
				d.id === String(motoristaId)
					? {
							...d,
							status: "disponivel" as DriverStatus,
							manifestoAtual: undefined,
							manifestoData: TODAY,
							avaliacoes: [
								{ nota, obs: feedback, data: TODAY, operador: userName, manifesto: d.manifestoAtual },
								...d.avaliacoes,
							],
						}
					: d,
			),
		);
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
		if (!ehNumeroManifestoValido(avaliacao.numeroManifesto)) {
			setError("Número do manifesto inválido");
			return false;
		}

		try {
			const responseAvaliacao = await apiFetch(
				`${AVALIACAO_URL}/api/avaliacoes`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						motoristaId: avaliacao.motoristaId,
						numeroManifesto: avaliacao.numeroManifesto,
						nota: avaliacao.nota,
						feedback: avaliacao.feedback,
					}),
				},
			);

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
			const atual = drivers.find(
				(d) => d.id === String(avaliacao.motoristaId),
			)?.status;
			const statusSalvo =
				atual === "disponivel"
					? STATUS_SALVO
					: await salvarStatus(String(avaliacao.motoristaId), "disponivel");
			if (!statusSalvo.ok) {
				window.alert(
					"A avaliação foi registrada, mas não foi possível atualizar o status do motorista no servidor.",
				);
				setAvaliacao({ motoristaId: 0, nota: 5, numeroManifesto: 0, feedback: "" });
				void loadFromApi();
				return true;
			}

			concludeRoute(avaliacao.motoristaId, avaliacao.nota, avaliacao.feedback);
			setAvaliacao({ motoristaId: 0, nota: 5, numeroManifesto: 0, feedback: "" });
			return true;
		} catch (e) {
			setError(
				"Não foi possível conectar ao serviço de avaliação. Verifique se está rodando.",
			);
			return false;
		}
	}

	const reset = useCallback(() => {
		setSelectedId(null);
		void loadFromApi();
	}, [loadFromApi]);

	function importar(veiculos: VeiculoDTO[]) {
		setDrivers(veiculosParaDrivers(veiculos));
		setSelectedId(null);
	}

	const atualizarTelefone = useCallback(
		async (id: string, payload: AtualizarContatoPayload): Promise<ResultadoSalvarStatus> => {
			const limpo = payload.contatoMotorista.trim();
			const secundarioLimpo = payload.contatoSecundario?.trim() || "";
			if (!limpo) return { ok: false, mensagem: "Informe o contato principal." };
			if (limpo.length > 20 || secundarioLimpo.length > 20) {
				return { ok: false, mensagem: "Cada contato deve ter no máximo 20 caracteres." };
			}

			const body = {
				contatoMotorista: limpo,
				tipoContato: payload.tipoContato ?? null,
				contatoSecundario: secundarioLimpo || null,
				tipoContatoSecundario: secundarioLimpo ? (payload.tipoContatoSecundario ?? null) : null,
			};

			const aplicarLocal = (d: Driver): Driver => ({
				...d,
				telefone: limpo,
				tipoContato: payload.tipoContato,
				telefoneSecundario: secundarioLimpo || undefined,
				tipoContatoSecundario: secundarioLimpo ? payload.tipoContatoSecundario : undefined,
			});

			if (!/^\d+$/.test(id)) {
				setDrivers((ds) => ds.map((d) => (d.id === id ? aplicarLocal(d) : d)));
				return STATUS_SALVO;
			}

			try {
				const res = await apiFetch(`${MOTORISTA_URL}/api/motoristas/${id}/telefone`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				});
				if (!res.ok) {
					return { ok: false, mensagem: await lerMensagemDeErro(res) };
				}
				setDrivers((ds) => ds.map((d) => (d.id === id ? aplicarLocal(d) : d)));
				return STATUS_SALVO;
			} catch {
				return { ok: false, mensagem: "Não foi possível salvar os contatos do motorista." };
			}
		},
		[],
	);

	return {
		drivers,
		sortedDrivers,
		selected,
		selectedId,
		select,
		closeDetail,
		changeStatus,
		atualizarTelefone,
		concludeRoute,
		reset,
		importar,
		avaliacao,
		setAvaliacao,
		sendAvaliacao,
		error,
		loading,
		loadFailed,
		reload: loadFromApi,
	};
}
