import type { Driver } from "../types/driver";

const SOMENTE_DIGITOS = /^\d+$/;

const MENSAGEM_VAZIO = "Informe o número do manifesto.";
const MENSAGEM_NAO_INTEIRO = "Use apenas números inteiros, sem sinais, vírgulas ou pontos.";
const MENSAGEM_NAO_POSITIVO = "O número do manifesto deve ser maior que zero.";
const MENSAGEM_MUITO_GRANDE = "O número do manifesto é grande demais.";
const MENSAGEM_EM_USO = "Este manifesto já está em uso por outro motorista em rota.";

export function ehNumeroManifestoValido(numero: number): boolean {
  return Number.isSafeInteger(numero) && numero > 0;
}

export function listarManifestosEmUso(drivers: Driver[], idMotoristaAtual: string): number[] {
  return drivers.flatMap(driver =>
    driver.id !== idMotoristaAtual && driver.manifestoAtual !== undefined ? [driver.manifestoAtual] : [],
  );
}

export function validarNumeroManifesto(valor: string, manifestosEmUso: number[]): string | null {
  const texto = valor.trim();
  if (texto === "")
    return MENSAGEM_VAZIO;
  if (!SOMENTE_DIGITOS.test(texto))
    return MENSAGEM_NAO_INTEIRO;

  const numero = Number(texto);
  if (numero <= 0)
    return MENSAGEM_NAO_POSITIVO;
  if (!ehNumeroManifestoValido(numero))
    return MENSAGEM_MUITO_GRANDE;
  if (manifestosEmUso.includes(numero))
    return MENSAGEM_EM_USO;

  return null;
}
