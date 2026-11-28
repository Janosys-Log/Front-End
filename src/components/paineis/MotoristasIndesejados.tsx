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
    <section className="dash-panel">
      <header className="dash-panel-header indesejados">
        <h2>Motoristas Indesejados</h2>
        <span className="dash-panel-count">{motoristas.length}</span>
      </header>

      <div className="dash-panel-scroll">
        <div className="dash-panel-table">
          <div className="dash-panel-head indesejados">
            <span>#</span>
            <span>Motorista</span>
            <span>Data</span>
            <span>Dias</span>
          </div>

          <div className="dash-panel-body">
            {motoristas.length > 0
              ? (
                  motoristas.map((motorista, index) => (
                    <button
                      key={motorista.id}
                      type="button"
                      onClick={() => adicionaMotoristaSelecionado(motorista)}
                      className="dash-panel-row indesejados"
                    >
                      <span className="dash-panel-idx">{index + 1}</span>
                      <div className="min-w-0">
                        <p className="dash-panel-name">{motorista.nome}</p>
                        <span className="dash-panel-sub">{motorista.veiculo}</span>
                      </div>
                      <span className="dash-panel-num">
                        {motorista.updatedAt.toLocaleDateString()}
                      </span>
                      <span className="dash-panel-num">
                        {motorista.diasComIndesejado}
                      </span>
                    </button>
                  ))
                )
              : (
                  <div className="dash-panel-empty">
                    <p>Nenhum motorista indesejado.</p>
                  </div>
                )}
          </div>
        </div>
      </div>

      <footer className="dash-panel-footer">
        <p>Clique na linha para reverter o status.</p>
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
