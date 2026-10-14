import type { Driver, StatusFilter } from "../../types/driver";
import type { CategoriaVeiculo, TipoVeiculo } from "../../constants/vehicles";
import { Calendar, Lock, Truck } from "lucide-react";
import { formatDate } from "../../utils/date";
import StatusPill from "../common/StatusPill";
import { STATUS, STATUS_ORDER } from "../../constants/status";
import { TIPOS_POR_CATEGORIA } from "../../constants/vehicles";

type Props = {
  drivers: Driver[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  query: string;
  statusFilter: StatusFilter;
  categoryFilter: CategoriaVeiculo | "all";
  typeFilter: TipoVeiculo | "all";
};

export default function DriverList({
  drivers,
  selectedId,
  onSelect,
  query,
  statusFilter,
  categoryFilter,
  typeFilter,
}: Props) {
  const q = query.toLowerCase();

  const tiposDaCategoria =
    categoryFilter !== "all"
      ? TIPOS_POR_CATEGORIA[categoryFilter].map(t => t.value)
      : null;

  const filtered = drivers.filter((d) => {
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchQuery =
      d.nome.toLowerCase().includes(q)
      || d.veiculo.toLowerCase().includes(q)
      || (d.placa && d.placa.toLowerCase().includes(q));
    const matchTipo =
      typeFilter === "all"
        ? true
        : (d.tipoVeiculo || d.veiculo || "").toUpperCase().includes(typeFilter)
          || (d.veiculo || "").toUpperCase().includes(typeFilter.replace("_", " "));
    const matchCategoria =
      categoryFilter === "all"
        ? true
        : tiposDaCategoria
          ? tiposDaCategoria.some(
              t =>
                (d.tipoVeiculo || d.veiculo || "").toUpperCase().includes(t)
                || (d.veiculo || "").toUpperCase().includes(t.replace("_", " ")),
            )
          : true;
    return matchStatus && matchQuery && matchTipo && matchCategoria;
  });

  if (filtered.length === 0) {
    return (
      <div className="driver-list">
        <div className="empty-hint">
          Nenhum motorista encontrado para os filtros selecionados.
        </div>
      </div>
    );
  }

  const grupos = STATUS_ORDER.map((status) => ({
    status,
    items: filtered.filter(d => d.status === status),
  })).filter(g => g.items.length > 0);

  return (
    <div className="driver-list">
      {grupos.map(({ status, items }) => (
        <div key={status} className="status-block">
          <div className="status-block-header" style={{ borderLeftColor: STATUS[status].color }}>
            <span className="status-block-title">{STATUS[status].label}</span>
            <span className="status-block-count">{items.length}</span>
          </div>
          {items.map((d) => {
            const locked = !!d.lockedBy && d.lockedBy !== "Você" && d.id !== selectedId;
            return (
              <button
                key={d.id}
                className={`driver-row${d.id === selectedId ? " active" : ""}${locked ? " locked" : ""}`}
                onClick={() => onSelect(d.id)}
              >
                <div className="driver-row-main">
                  <span className="driver-name">{d.nome}</span>
                  <span className="driver-meta">
                    <Truck size={12} />
                    {" "}
                    {d.veiculo}
                  </span>
                </div>
                <div className="driver-row-side">
                  <span className="manifest-age">
                    <Calendar size={11} />
                    {" "}
                    {formatDate(d.manifestoData)}
                  </span>
                  <StatusPill status={d.status} compact />
                </div>
                {locked && (
                  <span className="locked-tag">
                    <Lock size={11} />
                    {" "}
                    {d.lockedBy}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
