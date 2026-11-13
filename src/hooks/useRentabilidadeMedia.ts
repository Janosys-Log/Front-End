// src/hooks/useRentabilidadeMedia.ts
import type { MotoristaRanking, PontoMensal, Regiao } from "../types/rentabilidade";
import { useEffect, useState } from "react";
import { buscarRanking, buscarSerieMensal } from "../services/rentabilidadeService";

export function useRentabilidadeMedia(ano: number | null, mes: number, regiao: Regiao) {
  const [ranking, setRanking] = useState<MotoristaRanking[]>([]);
  const [serie, setSerie] = useState<PontoMensal[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (ano === null) return;

    let cancelado = false;
    setLoading(true);
    setErro(null);

    Promise.all([
      buscarRanking(ano, mes, regiao),
      buscarSerieMensal(ano, mes, regiao),
    ])
      .then(([r, s]) => {
        if (cancelado) return;
        setRanking(r);
        setSerie(s);
      })
      .catch((e: Error) => {
        if (cancelado) return;
        // limpa os dados para não mostrar a região/mês anterior junto do erro
        setRanking([]);
        setSerie([]);
        setErro(e.message);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [ano, mes, regiao]);

  return { ranking, serie, loading, erro };
}