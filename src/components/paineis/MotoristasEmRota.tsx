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

  const isGerente = session.role === "gerente";

  return (
    <section className="dash-panel">
      <header className="dash-panel-header rota">
        <h2>Motoristas em Rota</h2>
        <span className="dash-panel-count">{motoristas.length}</span>
      </header>

      <div className="dash-panel-scroll">
        <div className={`dash-panel-table${isGerente ? " gerente" : ""}`}>
          <div className={`dash-panel-head rota${isGerente ? " gerente" : ""}`}>
            <span>#</span>
            <span>Motorista</span>
            <span>Manifesto</span>
            {isGerente && <span>Pontuação</span>}
          </div>

          <div className="dash-panel-body">
            {motoristas.length > 0
              ? (
                  motoristas.map((motorista, index) => (
                    <button
                      key={motorista.id}
                      type="button"
                      onClick={() => adicionaMotoristaSelecionado(motorista)}
                      className={`dash-panel-row rota${isGerente ? " gerente" : ""}`}
                    >
                      <span className="dash-panel-idx">{index + 1}</span>
                      <div className="min-w-0">
                        <p className="dash-panel-name">{motorista.nome}</p>
                        <span className="dash-panel-sub">{motorista.veiculo}</span>
                      </div>
                      <span className="dash-panel-num">
                        {motorista.numeroManifesto || "—"}
                      </span>
                      {isGerente && (
                        <span className="dash-panel-num">
                          {motorista.avaliacaoMedia}
                        </span>
                      )}
                    </button>
                  ))
                )
              : (
                  <div className="dash-panel-empty">
                    <p>Nenhum motorista em rota.</p>
                  </div>
                )}
          </div>
        </div>
      </div>

      <footer className="dash-panel-footer">
        <p>Clique na linha para encerrar o frete.</p>
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
