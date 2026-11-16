import type { MotoristaIndesejado } from "../../hooks/useMotoristasPainel";
import { useState } from "react";
import useMotoristasPainel from "../../hooks/useMotoristasPainel";
import IndesejadoModal from "../modals/IndesejadoModal";

export function MotoristasIndesejados() {
  const { motoristasIndesejados: motoristas, setMotoristasIndesejados }
    = useMotoristasPainel();
  const [avaliacaoModal, setAvaliacaoModal] = useState<boolean>(false);
  const [motoristaSelecionado, setMotoristaSelecionado]
    = useState<MotoristaIndesejado | null>();

  function adicionaMotoristaSelecionado(motorista: MotoristaIndesejado) {
    setMotoristaSelecionado(motorista);
    setAvaliacaoModal(true);
  }

  function removeMotoristaSelecionado() {
    setMotoristasIndesejados(
      motoristas.filter(m => m.id !== motoristaSelecionado?.id),
    );
    setMotoristaSelecionado(null);
    setAvaliacaoModal(false);
  }

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm h-fit">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between bg-red-600 px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white sm:text-base">
          Motoristas Indesejados
        </h2>

        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 text-sm font-bold text-red-600">
          {motoristas.length}
        </span>
      </header>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <div className="min-w-120">
          <div className="grid grid-cols-[36px_minmax(0,1fr)_100px_75px] gap-2 bg-gray-50 px-3 py-3 text-xs font-semibold uppercase text-gray-500">
            <span>#</span>
            <span>Motorista</span>
            <span>Data</span>
            <span>Dias</span>
          </div>

          <div className="max-h-85 min-h-45 divide-y divide-gray-100 overflow-y-auto">
            {motoristas.length > 0
              ? (
                  motoristas.map((motorista, index) => (
                    <button
                      key={motorista.id}
                      type="button"
                      onClick={() => adicionaMotoristaSelecionado(motorista)}
                      className="grid w-full grid-cols-[36px_minmax(0,1fr)_100px_75px] items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"
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

                      <span className="text-xs tabular-nums text-gray-600">
                        {new Date(motorista.updatedAt).toDateString()}
                      </span>

                      <span className="text-sm font-medium tabular-nums text-gray-600">
                        {Math.max(
                          0,
                          Math.floor(
                            (Date.now() - new Date(motorista.updatedAt).getTime())
                            / (1000 * 60 * 60 * 24),
                          ),
                        )}
                      </span>
                    </button>
                  ))
                )
              : (
                  <div className="flex min-h-45 items-center justify-center px-4">
                    <p className="text-sm text-gray-400">
                      Nenhum motorista indesejado.
                    </p>
                  </div>
                )}
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 bg-gray-50 px-3 py-3 text-center">
        <p className="text-xs italic text-gray-500">
          Clique na linha para reverter o status.
        </p>
      </footer>

      {avaliacaoModal && motoristaSelecionado && (
        <IndesejadoModal
          motorista={motoristaSelecionado}
          onClose={() => setAvaliacaoModal(false)}
          onRemove={removeMotoristaSelecionado}
        />
      )}
    </section>
  );
}
