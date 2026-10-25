/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */
/** biome-ignore-all lint/a11y/useAriaPropsForRole: <explanation> */

import type { CategoriaVeiculo, TipoVeiculo } from "../constants/vehicles";
import type { Theme, View } from "../types/app";
import type { StatusFilter } from "../types/driver";
import { useEffect, useRef, useState } from "react";
import DriverDetail from "../components/drivers/DriverDetail";
import DriverList from "../components/drivers/DriverList";
import ListToolbar from "../components/drivers/ListToolbar";
import NavbarPilula from "../components/layout/NavbarPilula";
import EvalModal from "../components/modals/EvalModal";
import { useDrivers } from "../hooks/useDrivers";
import { useResizableWidth } from "../hooks/useResizableWidth";
import useUsuario from "../hooks/useUsuario";
import { UploadPage } from "./UploadPage";
import UsuariosPage from "./UsuariosPage";

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
};

const viewPaths: Record<View, string> = {
  dashboard: "/dashboard",
  motoristas: "/motoristas",
  upload: "/upload",
  usuarios: "/usuarios",
};

function viewFromPath(pathname: string): View {
  const match = (Object.entries(viewPaths) as [View, string][]).find(([, path]) => path === pathname);
  return match?.[0] ?? "motoristas";
}

export default function PainelPage({ theme, onToggleTheme }: Props) {
  const { session, logout } = useUsuario();
  const {
    drivers,
    sortedDrivers,
    selected,
    selectedId,
    select,
    closeDetail,
    changeStatus,
    reset: resetDrivers,
    avaliacao,
    setAvaliacao,
    sendAvaliacao,
    error,
  } = useDrivers(session.userName);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoriaVeiculo | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TipoVeiculo | "all">("all");
  const [evalDriverId, setEvalDriverId] = useState<string | null>(null);
  const initialView = viewFromPath(window.location.pathname);
  const [view, setView] = useState<View>(() => session.role !== "gerente" && initialView === "usuarios" ? "motoristas" : initialView);
  const previousView = useRef(view);
  const {
    width: listWidth,
    resizing,
    containerRef,
    handleProps,
  } = useResizableWidth();

  const evalDriver = drivers.find(d => d.id === evalDriverId) ?? null;

  useEffect(() => {
    if (previousView.current === view) return;
    previousView.current = view;
    setQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setTypeFilter("all");
    setEvalDriverId(null);
    setAvaliacao({ motoristaId: 0, nota: 5, numeroManifesto: 0, feedback: "" });
    closeDetail();
    if (view === "motoristas") resetDrivers();
  }, [view, closeDetail, resetDrivers, setAvaliacao]);

  useEffect(() => {
    const handlePopState = () => {
      const requestedView = viewFromPath(window.location.pathname);
      if (requestedView === "usuarios" && session.role !== "gerente") {
        window.history.replaceState(null, "", viewPaths.motoristas);
        setView("motoristas");
        return;
      }
      setView(requestedView);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [session.role]);

  useEffect(() => {
    if (window.location.pathname !== viewPaths[view])
      window.history.replaceState(null, "", viewPaths[view]);
  }, [session.role, view]);

  function navigateTo(nextView: View) {
    if (nextView === "usuarios" && session.role !== "gerente") {
      return;
    }
    setView(nextView);
    window.history.pushState(null, "", viewPaths[nextView]);
  }

  return (
    <>
      <div className="app-shell">
        <NavbarPilula
          role={session.role}
          userName={session.userName}
          theme={theme}
          view={view}
          onNavigate={navigateTo}
          onToggleTheme={onToggleTheme}
          onLogout={logout}
        />

        {view === "dashboard"
          ? <main className="app-content dashboard-empty" aria-label="Dashboard" />
          : view === "usuarios"
          ? (
              <div className="app-content">
                <UsuariosPage />
              </div>
            )
          : view === "upload"
            ? (
                <div className="app-content">
                  <UploadPage />
                </div>
              )
          : view === "motoristas"
            ? (
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
              )
            : null}
      </div>

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
