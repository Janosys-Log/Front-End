import { useEffect, useState } from 'react';
import type { ResultadoImportacao } from '../types/importacao';
import { AlertCircle, Loader2 } from 'lucide-react';
import { UploadSection } from '../components/componentesPageUpload/Uploadsection';
import { importarCsvs, validarArquivos } from '../services/importacao.service';
import { buscarDataUltimaImportacao } from '../services/manifestoService';
import '../styles/uploadPage.css';
import '../styles/Uploadpageacoes.css';

export function UploadPage() {
  const [arqVeiculos, setArqVeiculos] = useState<File | null>(null);
  const [arqManifestos, setArqManifestos] = useState<File | null>(null);
  const [resVeiculos, setResVeiculos] = useState<ResultadoImportacao | null>(null);
  const [resManifestos, setResManifestos] = useState<ResultadoImportacao | null>(null);
  const [dataImportacao, setDataImportacao] = useState<Date | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // A data vem do backend (/api/manifestos/dataDoUltimoManifesto), não do relógio do navegador.
  useEffect(() => {
    let ativo = true;
    buscarDataUltimaImportacao().then(data => {
      if (ativo) setDataImportacao(data);
    });
    return () => {
      ativo = false;
    };
  }, []);

  // Trocar o arquivo invalida o resultado anterior daquele CSV
  function escolherVeiculos(arquivo: File | null) {
    setArqVeiculos(arquivo);
    setResVeiculos(null);
    setErro(null);
  }

  function escolherManifestos(arquivo: File | null) {
    setArqManifestos(arquivo);
    setResManifestos(null);
    setErro(null);
  }

  async function enviar() {
    const mensagem = validarArquivos(arqVeiculos, arqManifestos);
    if (mensagem || !arqVeiculos || !arqManifestos) {
      setErro(mensagem);
      return;
    }

    setErro(null);
    setEnviando(true);
    try {
      const resultado = await importarCsvs(arqVeiculos, arqManifestos);
      setResVeiculos(resultado.veiculos);
      setResManifestos(resultado.manifestos);
      // Depois de importar, busca de novo a data no backend.
      setDataImportacao(await buscarDataUltimaImportacao());
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível importar os arquivos. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="upload-page">
      <header className="upload-page__cabecalho">
        <h1 className="upload-page__titulo">Importação de arquivos</h1>
        <p className="upload-page__descricao">
          Escolha o CSV de veículos e o de manifestos. Os dois são enviados juntos.
        </p>
      </header>

      <div className="upload-page__conteudo">
        <UploadSection
          arquivoVeiculos={arqVeiculos}
          arquivoManifestos={arqManifestos}
          onSelecionarVeiculos={escolherVeiculos}
          onSelecionarManifestos={escolherManifestos}
          resultadoVeiculos={resVeiculos}
          resultadoManifestos={resManifestos}
          enviando={enviando}
          ultimaImportacao={dataImportacao}
        />

        <div className="upload-page__acoes">
          {erro && (
            <p className="upload-page__erro" role="alert">
              <AlertCircle size={16} /> {erro}
            </p>
          )}

          <button
            type="button"
            className="upload-page__enviar"
            onClick={enviar}
            disabled={enviando}
          >
            {enviando ? (
              <><Loader2 size={16} className="painel-upload-card__spin" /> Importando…</>
            ) : (
              'Importar arquivos'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}