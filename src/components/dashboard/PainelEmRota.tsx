import type { Driver } from "../../types/driver";
import { ArrowRight, Truck } from "lucide-react";

type Props = {
  drivers: Driver[];
  loading: boolean;
  loadFailed: boolean;
  onSelect: (driver: Driver) => void;
};

export default function PainelEmRota({ drivers, loading, loadFailed, onSelect }: Props) {
  const emRota = drivers
    .filter((driver) => driver.status === "em_rota")
    .sort((a, b) => {
      const dateA = a.statusUpdatedAt ? new Date(a.statusUpdatedAt).getTime() : 0;
      const dateB = b.statusUpdatedAt ? new Date(b.statusUpdatedAt).getTime() : 0;
      return dateA - dateB || a.nome.localeCompare(b.nome, "pt-BR");
    });

  return (
    <section className="dashboard-route-panel" aria-labelledby="dashboard-route-title">
      <header className="dashboard-route-header">
        <div>
          <p className="dashboard-route-eyebrow">Acompanhamento operacional</p>
          <h1 id="dashboard-route-title">Motoristas Em Rota</h1>
        </div>
        <span className="dashboard-route-total" aria-label={`${emRota.length} motoristas em rota`}>{emRota.length}</span>
      </header>
      {loading
        ? <p className="dashboard-route-message" role="status">Carregando painel...</p>
        : loadFailed
          ? <p className="dashboard-route-message dashboard-route-error" role="alert">Não foi possível carregar o painel. Tente novamente.</p>
          : emRota.length === 0
            ? <p className="dashboard-route-message">Nenhum motorista em rota.</p>
            : (
                <ol className="dashboard-route-list" aria-label="Motoristas em rota">
                  {emRota.map((driver, index) => (
                    <li key={driver.id}>
                      <button className="dashboard-route-row" type="button" onClick={() => onSelect(driver)}>
                        <span className="dashboard-route-position">{index + 1}</span>
                        <span className="dashboard-route-driver">
                          <strong>{driver.nome}</strong>
                          <span><Truck size={14} />{driver.veiculo}</span>
                        </span>
                        <span className="dashboard-route-manifest">
                          <small>Manifesto</small>
                          <strong>{driver.manifestoAtual ?? "—"}</strong>
                        </span>
                        <ArrowRight className="dashboard-route-arrow" size={17} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ol>
              )}
    </section>
  );
}
