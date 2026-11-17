import type { MotoristaEmRota } from "../../hooks/useMotoristasPainel";
import { useState } from "react";
import useMotoristasPainel from "../../hooks/useMotoristasPainel";
import useUsuario from "../../hooks/useUsuario";
import AvaliacaoModal from "../modals/AvaliacaoModal";

export default function MotoristasEmRota() {
  const { session } = useUsuario();
  const { motoristasEmRota: motoristas, setMotoristasEmRota }
    = useMotoristasPainel();
  const [avaliacaoModal, setAvaliacaoModal] = useState<boolean>(false);
  const [motoristaSelecionado, setMotoristaSelecionado]
    = useState<MotoristaEmRota | null>();

  function adicionaMotoristaSelecionado(motorista: MotoristaEmRota) {
    if (session.role !== "gerente")
      return;
    setMotoristaSelecionado(motorista);
    setAvaliacaoModal(true);
  }

  function removeMotoristaSelecionado() {
    setMotoristasEmRota(
      motoristas.filter(m => m.id !== motoristaSelecionado?.id),
    );
    setMotoristaSelecionado(null);
    setAvaliacaoModal(false);
  }

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm h-fit">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between bg-blue-600 px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white sm:text-base">
          Motoristas em Rota
        </h2>

        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 text-sm font-bold text-blue-600">
          {motoristas.length}
        </span>
      </header>

      <div className="overflow-x-auto">
        <div
          className={`${session.role === "gerente" ? "min-w-120" : "min-w-100"}`}
        >
          <div
            className={`grid ${session.role === "gerente" ? "grid-cols-[36px_minmax(0,1fr)_100px_105px]" : "grid-cols-[36px_minmax(0,1fr)_100px]"} gap-2 bg-gray-50 px-3 py-3 text-xs font-semibold uppercase text-gray-500`}
          >
            <span>#</span>
            <span>Motorista</span>
            <span>Manifesto</span>
            {session.role === "gerente" && <span>Pontuação</span>}
          </div>

          <div className="max-h-85 min-h-45 divide-y divide-gray-100 overflow-y-auto">
            {motoristas.length > 0
              ? (
                  motoristas.map((motorista, index) => (
                    <button
                      key={motorista.id}
                      type="button"
                      onClick={() => adicionaMotoristaSelecionado(motorista)}
                      className={`grid w-full ${session.role === "gerente" ? "grid-cols-[36px_minmax(0,1fr)_100px_105px]" : "grid-cols-[36px_minmax(0,1fr)_100px]"} items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500`}
                    >
                      <span className="text-sm text-gray-500">{index + 1}</span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {motorista.nome}
                        </p>
                        <span className="text-xs text-gray-500">
                          {motorista.veiculo}
                        </span>
                      </div>

                      <span className="text-sm tabular-nums text-gray-600 text-center">
                        {motorista.numeroManifesto || "Null"}
                      </span>

                      {session.role === "gerente" && (
                        <span className="text-xs font-semibold text-gray-600 text-center">
                          {motorista.avaliacaoMedia}
                        </span>
                      )}
                    </button>
                  ))
                )
              : (
                  <div className="flex min-h-45 items-center justify-center px-4">
                    <p className="text-sm text-gray-400">
                      Nenhum motorista em rota.
                    </p>
                  </div>
                )}
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 bg-gray-50 px-3 py-3 text-center">
        <p className="text-xs italic text-gray-500">
          Clique na linha para encerrar o frete.
        </p>
      </footer>

      {avaliacaoModal && motoristaSelecionado && (
        <AvaliacaoModal
          motorista={motoristaSelecionado}
          onClose={() => setAvaliacaoModal(false)}
          onRemove={removeMotoristaSelecionado}
        />
      )}
    </section>
  );
}
