import type { MotoristaEmRota } from "../../hooks/useMotoristasPainel";
import { useEffect, useState } from "react";
import useMotoristasPainel from "../../hooks/useMotoristasPainel";
import useUsuario from "../../hooks/useUsuario";
import AvaliacaoModal from "../modals/AvaliacaoModal";

type AvaliacaoResponse = {
  mensagem: string;
  id: number;
  motoristaId: number;
  nota: number;
  numeroManifesto: number;
  descricaoNota: string;
  feedback: string;
  dataRegistro: string;
};

export default function MotoristasEmRota() {
  const { session } = useUsuario();
  const { motoristasEmRota: motoristas, setMotoristasEmRota }
    = useMotoristasPainel();
  const [avaliacaoModal, setAvaliacaoModal] = useState<boolean>(false);
  const [motoristaSelecionado, setMotoristaSelecionado]
    = useState<MotoristaEmRota | null>();

  function adicionaMotoristaSelecionado(motorista: MotoristaEmRota) {
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

  useEffect(() => {
    if (!session.token || motoristas.length === 0)
      return;

    let ativo = true;

    async function buscarAvaliacoes() {
      try {
        const resultados = await Promise.all(
          motoristas.map(async (motorista) => {
            const response = await fetch(
              `http://localhost:8082/api/avaliacoes?motoristaId=${motorista.id}`,
              {
                headers: {
                  Authorization: `Bearer ${session.token}`,
                },
              },
            );

            if (!response.ok) {
              throw new Error("Erro ao buscar avaliações");
            }

            const avaliacoes: AvaliacaoResponse[] = await response.json();

            const media
              = avaliacoes.length > 0
                ? avaliacoes.reduce(
                  (soma, avaliacao) => soma + avaliacao.nota,
                  0,
                ) / avaliacoes.length
                : 0;

            return {
              id: motorista.id,
              avaliacaoMedia: media,
            };
          }),
        );

        if (!ativo)
          return;

        setMotoristasEmRota(atuais =>
          atuais.map((motorista) => {
            const resultado = resultados.find(r => r.id === motorista.id);

            return resultado
              ? {
                  ...motorista,
                  avaliacaoMedia: resultado.avaliacaoMedia,
                }
              : motorista;
          }),
        );
      }
      catch (error) {
        console.error("Erro ao buscar avaliações:", error);
      }
    }

    buscarAvaliacoes();

    return () => {
      ativo = false;
    };
  }, [motoristas.length, session.token, setMotoristasEmRota]);

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
        <div className="min-w-120">
          <div className="grid grid-cols-[36px_minmax(0,1fr)_100px_105px] gap-2 bg-gray-50 px-3 py-3 text-xs font-semibold uppercase text-gray-500">
            <span>#</span>
            <span>Motorista</span>
            <span>Manifesto</span>
            <span>Pontuação</span>
          </div>

          <div className="max-h-85 min-h-45 divide-y divide-gray-100 overflow-y-auto">
            {motoristas.length > 0
              ? (
                  motoristas.map((motorista, index) => (
                    <button
                      key={motorista.id}
                      type="button"
                      onClick={() => adicionaMotoristaSelecionado(motorista)}
                      className="grid w-full grid-cols-[36px_minmax(0,1fr)_100px_105px] items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
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

                      <span className="text-sm tabular-nums text-gray-600">
                        {motorista.numeroManifesto || "Null"}
                      </span>

                      <span className="text-xs font-semibold text-gray-600">
                        {motorista.avaliacaoMedia}
                      </span>
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
