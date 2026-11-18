export function brl(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\u00A0/g, " ");
}

export function brlComSinal(v: number): string {
  const abs = brl(Math.abs(v));
  if (v > 0)
    return `+${abs}`;
  if (v < 0)
    return `−${abs}`;
  return abs;
}

export function dataBr(iso: string | null): string {
  if (!iso)
    return "—";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export function mesExtenso(mes: string | null): string {
  if (!mes)
    return "";
  const [a, m] = mes.split("-");
  return `${MESES[Number(m) - 1]} de ${a}`;
}