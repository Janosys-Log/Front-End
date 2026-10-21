import type { Theme, View } from "../types/app";
import type { StatusFilter } from "../types/driver";
import type { CategoriaVeiculo, TipoVeiculo } from "../constants/vehicles";
import { useState } from "react";
import DriverDetail from "../components/drivers/DriverDetail";
import DriverList from "../components/drivers/DriverList";
import ListToolbar from "../components/drivers/ListToolbar";
import Sidebar from "../components/layout/Sidebar";
import EvalModal from "../components/modals/EvalModal";
import ImportModal from "../components/modals/ImportModal";
import { useDrivers } from "../hooks/useDrivers";
import { useResizableWidth } from "../hooks/useResizableWidth";
import useUsuario from "../hooks/useUsuario";
import UsuariosPage from "./UsuariosPage";

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
};

export default function PainelPage({ theme, onToggleTheme }: Props) {
  const { session, logout } = useUsuario();
  const { drivers, sortedDrivers, selected, selectedId, select, closeDetail, changeStatus, reset, importar } = useDrivers(session.userName);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoriaVeiculo | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TipoVeiculo | "all">("all");
  const [importOpen, setImportOpen] = useState(false);
  const [evalDriverId, setEvalDriverId] = useState<string | null>(null);
  const [viewEscolhida, setViewEscolhida] = useState<View>("painel");

  // Operacional nunca vê a tela de usuários, mesmo se o estado for alterado
  const view: View = session.role === "gerente" ? viewEscolhida : "painel";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { width: listWidth, resizing, containerRef, handleProps } = useResizableWidth();

  const evalDriver = drivers.find(d => d.id === evalDriverId) ?? null;


return (
  <>
    <div className={`app-shell${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <Sidebar
        role={session.role}
        userName={session.userName}
        theme={theme}
        view={view}
        onNavigate={setViewEscolhida}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        onToggleTheme={onToggleTheme}
        onLogout={logout}
        onReset={() => {
          reset();
          reload();
        }}
        onImport={() => setImportOpen(true)}
      />

      {view === "usuarios" ? (
        <div className="app-content">
          <UsuariosPage />
        </div>
      ) : (
        <div
          ref={containerRef}
          className={`app-content${resizing ? " resizing" : ""}`}
        >
          <div className="col list-col" style={{ width: listWidth }}>
            <ListToolbar
              query={query}
              setQuery={setQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              count={sortedDrivers.length}
            />

            <DriverList
              drivers={sortedDrivers}
              selectedId={selectedId}
              onSelect={select}
              query={query}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              typeFilter={typeFilter}
            />
          </div>

          <div
            className="resize-handle"
            role="separator"
            aria-orientation="vertical"
            aria-label="Redimensionar lista de motoristas"
            tabIndex={0}
            title="Arraste para redimensionar (duplo clique para restaurar)"
            {...handleProps}
          />

          <div className="col detail-col">
            <DriverDetail
              driver={selected}
              role={session.role}
              onChangeStatus={changeStatus}
              onOpenEvalModal={setEvalDriverId}
              onClose={selected ? closeDetail : null}
            />
          </div>
        </div>
      )}
    </div>

    {importOpen && (
      <ImportModal
        onClose={() => setImportOpen(false)}
        onImport={(res) => {
          importar(res.veiculosValidos);
          setImportOpen(false);
        }}
      />
    )}

    {evalDriver && (
      <EvalModal
        driver={evalDriver}
        onClose={() => setEvalDriverId(null)}
        avaliacao={avaliacao}
        setAvaliacao={setAvaliacao}
        sendAvaliacao={sendAvaliacao}
        error={error}
      />
    )}
  </>
);
}
