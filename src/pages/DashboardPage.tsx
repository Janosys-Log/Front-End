// src/pages/DashboardPage.tsx
import type { ComponentProps } from "react";
import type { Driver, DriverStatus, ResultadoSalvarStatus } from "../types/driver";
import RentabilidadeMediaCard from "../components/cardRentabilidade/RentabilidadeMediaCard";
import PainelStatusMotoristas from "../components/dashboard/PainelStatusMotoristas";

import "../styles/dashboardPage.css";

type Props = {
  drivers?: Driver[];
  onChangeStatus?: (id: string, status: DriverStatus, numeroManifesto?: number) => Promise<ResultadoSalvarStatus>;
  /** Chamado ao clicar no card de rentabilidade (abrir o ranking completo). */
  onOpenRanking?: ComponentProps<typeof RentabilidadeMediaCard>["onOpenRanking"];
};

export default function DashboardPage({ drivers = [], onChangeStatus, onOpenRanking }: Props) {
  return (
    <main className="dash-page">
      <header className="dash-header">
        <h1>Dashboard</h1>
      </header>

      <div className="dash-grid">
        {/* Coluna esquerda: tabelas de motoristas em rota e indesejados */}
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
        </section>

        {/* Coluna direita: card de rentabilidade */}
        <aside className="dash-side">
          <RentabilidadeMediaCard onOpenRanking={onOpenRanking} />
        </aside>
      </div>
    </main>
  );
}
