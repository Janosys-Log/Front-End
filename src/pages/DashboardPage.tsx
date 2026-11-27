import type { ComponentProps } from "react";
// src/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import RentabilidadeMediaCard from "../components/cardRentabilidade/RentabilidadeMediaCard";
import CardsCustoGrupo from "../components/dashboard/CardsCustoGrupo";
import MotoristasEmRota from "../components/paineis/MotoristasEmRota";
import { MotoristasIndesejados } from "../components/paineis/MotoristasIndesejados";
import useUsuario from "../hooks/useUsuario";
import { buscarDataUltimoManifesto } from "../services/rentabilidadeService";
import "../styles/dashboardPage.css";

type Props = {
  /** Chamado ao clicar no card de rentabilidade (abrir o ranking completo). */
  onOpenRanking?: ComponentProps<typeof RentabilidadeMediaCard>["onOpenRanking"];
};

export default function DashboardPage({ onOpenRanking }: Props) {
  const { session } = useUsuario();
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    buscarDataUltimoManifesto().then((d) => {
      setAno(d.getFullYear());
      setMes(d.getMonth() + 1);
    });
  }, []);

  const mesParam = `${ano}-${String(mes).padStart(2, "0")}`;

  return (
    <main className="dash-page">
      <div className="dash-grid">
        {/* Coluna esquerda: motoristas + módulo de custo operacional */}
        <section className="dash-main">
          <div className="flex flex-wrap gap-4 w-full">
            <MotoristasEmRota />
            {session.role === "gerente" && (
              <MotoristasIndesejados />
            )}
          </div>

          <CardsCustoGrupo
            mes={mesParam}
            mesNum={mes}
            ano={ano}
            onMudarPeriodo={(novoMes, novoAno) => {
              setMes(novoMes);
              setAno(novoAno);
            }}
          />
        </section>

        {/* Coluna direita: card de rentabilidade (segue o seletor do mês dos cards) */}
        <aside className="dash-side">
          <RentabilidadeMediaCard
            onOpenRanking={onOpenRanking}
            mes={mes}
            ano={ano}
            showSelector={false}
          />
        </aside>
      </div>
    </main>
  );
}
