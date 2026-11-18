import type { ComponentProps } from "react";
// src/pages/DashboardPage.tsx
import RentabilidadeMediaCard from "../components/cardRentabilidade/RentabilidadeMediaCard";
import MotoristasEmRota from "../components/paineis/MotoristasEmRota";
import { MotoristasIndesejados } from "../components/paineis/MotoristasIndesejados";
import useUsuario from "../hooks/useUsuario";
import "../styles/dashboardPage.css";

type Props = {
  /** Chamado ao clicar no card de rentabilidade (abrir o ranking completo). */
  onOpenRanking?: ComponentProps<typeof RentabilidadeMediaCard>["onOpenRanking"];
};

export default function DashboardPage({ onOpenRanking }: Props) {
  const { session } = useUsuario();

  return (
    <main className="dash-page">
      <header className="dash-header">
        <h1>Dashboard</h1>
      </header>

      <div className="dash-grid">
        {/* Coluna esquerda: coloque aqui os outros cards/gráficos */}
        <section className="dash-main">

          <div className="flex gap-2 w-fit">
            <MotoristasEmRota />
            {session.role === "gerente" && (
              <MotoristasIndesejados />
            )}
          </div>
        </section>

        {/* Coluna direita: card de rentabilidade */}
        <aside className="dash-side">
          <RentabilidadeMediaCard onOpenRanking={onOpenRanking} />
        </aside>
      </div>
    </main>
  );
}
