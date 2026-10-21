import { obterToken } from "./auth.service";

/** fetch que anexa o header Authorization com o token da sessão. */
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = obterToken();

  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(url, { ...options, headers });
}