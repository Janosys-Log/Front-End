// src/pages/DashboardPage.tsx
import { useEffect, useState, type ComponentProps } from "react";
import type { Driver, DriverStatus, ResultadoSalvarStatus } from "../types/driver";
import RentabilidadeMediaCard from "../components/cardRentabilidade/RentabilidadeMediaCard";
import PainelStatusMotoristas from "../components/dashboard/PainelStatusMotoristas";
import PainelCustoOperacional from "../components/dashboard/PainelCustoOperacional";
import { buscarDataUltimoManifesto } from "../services/rentabilidadeService";

import "../styles/dashboardPage.css";

type Props = {
  drivers?: Driver[];
  onChangeStatus?: (id: string, status: DriverStatus, numeroManifesto?: number) => Promise<ResultadoSalvarStatus>;
  /** Chamado ao clicar no card de rentabilidade (abrir o ranking completo). */
  onOpenRanking?: ComponentProps<typeof RentabilidadeMediaCard>["onOpenRanking"];
};

export default function DashboardPage({ drivers = [], onChangeStatus, onOpenRanking }: Props) {
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    buscarDataUltimoManifesto().then(d => {
      setAno(d.getFullYear());
      setMes(d.getMonth() + 1);
    });
  }, []);

  return (
    <main className="dash-page">
      <header className="dash-header">
        <h1>Dashboard</h1>
      </header>

      <div className="dash-grid">
        {/* Coluna esquerda: painel de status dos motoristas + módulo de custo operacional */}
        <section className="dash-main">
          {onChangeStatus ? (
            <PainelStatusMotoristas
              drivers={drivers}
              onChangeStatus={onChangeStatus}
            />
          ) : (
            <PainelStatusMotoristas
              drivers={drivers}
              onChangeStatus={async () => ({ ok: true })}
            />
          )}

          {/* Divisor pontilhado entre os módulos */}
          <div className="dash-separator" aria-hidden="true" />

          {/* Módulo de Custo Operacional e Destaques do Mês */}
          <PainelCustoOperacional
            mes={mes}
            ano={ano}
            onMudarMes={(novoMes, novoAno) => {
              setMes(novoMes);
              if (novoAno) setAno(novoAno);
            }}
          />
        </section>

        {/* Coluna direita: card de rentabilidade (segue o mesmo mês) */}
        <aside className="dash-side">
          <RentabilidadeMediaCard
            mes={mes}
            ano={ano}
            onMudarMes={novoMes => setMes(novoMes)}
            onOpenRanking={onOpenRanking}
          />
        </aside>
      </div>
    </main>
  );
}
