import type { StatusFilter } from "../../types/driver";
import type { CategoriaVeiculo, TipoVeiculo } from "../../constants/vehicles";
import { Search } from "lucide-react";
import { STATUS, STATUS_KEYS } from "../../constants/status";
import { CATEGORIAS, TIPOS_POR_CATEGORIA } from "../../constants/vehicles";

type Props = {
  query: string;
  setQuery: (q: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (f: StatusFilter) => void;
  categoryFilter: CategoriaVeiculo | "all";
  setCategoryFilter: (c: CategoriaVeiculo | "all") => void;
  typeFilter: TipoVeiculo | "all";
  setTypeFilter: (t: TipoVeiculo | "all") => void;
  count: number;
};

export default function ListToolbar({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  typeFilter,
  setTypeFilter,
  count,
}: Props) {
  function handleCategoryChange(value: string) {
    const cat = value as CategoriaVeiculo | "all";
    setCategoryFilter(cat);
    setTypeFilter("all");
  }

  function limparFiltros() {
    setQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setTypeFilter("all");
  }

  const tiposDisponiveis =
    categoryFilter !== "all" ? TIPOS_POR_CATEGORIA[categoryFilter] : [];

  return (
    <div className="list-toolbar">
      <div className="search-box">
        <Search size={14} />
        <input
          placeholder="Buscar motorista ou veículo"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className="filter-row">
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={e => handleCategoryChange(e.target.value)}
        >
          <option value="all">Todas categorias</option>
          {(Object.keys(CATEGORIAS) as CategoriaVeiculo[]).map(c => (
            <option key={c} value={c}>
              {CATEGORIAS[c]}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as TipoVeiculo | "all")}
          disabled={categoryFilter === "all"}
        >
          <option value="all">Todos os tipos</option>
          {tiposDisponiveis.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button type="button" className="btn-limpar" onClick={limparFiltros}>
          Limpar filtros
        </button>
      </div>
      <div className="filter-chips">
        <button
          className={statusFilter === "all" ? "active" : ""}
          onClick={() => setStatusFilter("all")}
        >
          Todos
        </button>
        {STATUS_KEYS.map((key) => {
          const s = STATUS[key];
          return (
            <button
              key={key}
              className={statusFilter === key ? "active" : ""}
              style={statusFilter === key ? { borderColor: s.color, color: s.color } : {}}
              onClick={() => setStatusFilter(key)}
            >
              <span className="dot" style={{ background: s.color }} />
              {" "}
              {s.label}
            </button>
          );
        })}
      </div>
      <span className="list-count">
        {count}
        {" "}
        motoristas · fila por status e manifesto
      </span>
    </div>
  );
}
