// src/pages/DashboardPage.tsx
import type { ComponentProps } from "react";
import RentabilidadeMediaCard from "../components/cardRentabilidade/RentabilidadeMediaCard";

import "../styles/dashboardPage.css";

type Props = {
  /** Chamado ao clicar no card de rentabilidade (abrir o ranking completo). */
  onOpenRanking?: ComponentProps<typeof RentabilidadeMediaCard>["onOpenRanking"];
};

export default function DashboardPage({ onOpenRanking }: Props) {
  return (
    <main className="dash-page">
      <header className="dash-header">
        <h1>Dashboard</h1>
      </header>

      <div className="dash-grid">
        {/* Coluna esquerda: coloque aqui os outros cards/gráficos */}
        <section className="dash-main" />

        {/* Coluna direita: card de rentabilidade */}
        <aside className="dash-side">
          <RentabilidadeMediaCard onOpenRanking={onOpenRanking} />
        </aside>
      </div>
    </main>
  );
}