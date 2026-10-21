export type PerfilAcesso = "OPERACIONAL" | "GERENCIA";

export type LoginRequest = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  token: string;
  tipo: string;
  idUsuario: number;
  nome: string;
  email: string;
  perfil: PerfilAcesso;
  expiraEm: number;
};

export type StoredSession = LoginResponse;

const STORAGE_KEY = "fleetops_auth_session";

const API_URL = import.meta.env.VITE_AUTH_API_URL || "http://localhost:8081/api/auth";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
  }
  catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique se o backend está em execução.");
  }

  if (!response.ok) {
    let mensagemErro = "Usuário ou senha inválidos.";
    try {
      const errData = await response.json();
      if (errData?.mensagem) {
        mensagemErro = errData.mensagem;
      }
    }
    catch {
      // Ignora erro de parse se o corpo não for JSON
    }
    throw new Error(mensagemErro);
  }

  const data: LoginResponse = await response.json();
  salvarSessao(data);
  return data;
}

export function salvarSessao(session: LoginResponse): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
  catch {
    console.error("Falha ao salvar sessão no localStorage.");
  }
}

export function obterSessao(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return null;

    const session: StoredSession = JSON.parse(raw);

    // Se o token já expirou, limpa a sessão
    if (session.expiraEm && Date.now() >= session.expiraEm) {
      limparSessao();
      return null;
    }

    return session;
  }
  catch {
    limparSessao();
    return null;
  }
}

export function obterToken(): string | null {
  return obterSessao()?.token ?? null;
}

export function limparSessao(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  }
  catch {
    // Ignora erro de limpeza
  }
}

export function criarAuthHeaders(): Record<string, string> {
  const token = obterToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
