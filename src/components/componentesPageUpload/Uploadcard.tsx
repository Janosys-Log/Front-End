import type { ChangeEvent, DragEvent, ReactNode } from 'react';
import type { ResultadoImportacao } from '../../types/importacao';
import type { CsvKind } from './csvInfo';
import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import CsvInfoModal from './csvInfoModal';
import LinhasInvalidasModal from './linhasInvalidasModal';
import '../../styles/painelUploadCard.css';

type UploadCardProps = {
  titulo: string;
  icone: ReactNode;
  kind: CsvKind;
  /** Arquivo escolhido (o estado fica na página) */
  arquivo: File | null;
  onSelecionar: (arquivo: File | null) => void;
  /** Resultado deste CSV depois do envio. null = ainda não enviado */
  resultado: ResultadoImportacao | null;
  /** true enquanto a página está enviando os dois arquivos */
  enviando: boolean;
  /** Data da última importação (ISO string ou Date). null = nunca importado */
  ultimaImportacao?: string | Date | null;
};

function formatarData(valor?: string | Date | null) {
  if (!valor) return '—';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

export function UploadCard({
  titulo,
  icone,
  kind,
  arquivo,
  onSelecionar,
  resultado,
  enviando,
  ultimaImportacao,
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [erroArquivo, setErroArquivo] = useState('');
  const [infoAberto, setInfoAberto] = useState(false);
  const [erroAberto, setErroAberto] = useState(false);

  function selecionar(novo?: File) {
    if (!novo) return;

    if (!novo.name.toLowerCase().endsWith('.csv')) {
      setErroArquivo('Envie um arquivo no formato CSV.');
      return;
    }

    setErroArquivo('');
    onSelecionar(novo);
  }

  function aoSoltar(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setArrastando(false);
    selecionar(e.dataTransfer.files?.[0]);
  }

  function aoEscolher(e: ChangeEvent<HTMLInputElement>) {
    selecionar(e.target.files?.[0]);
    e.target.value = ''; // permite selecionar o mesmo arquivo de novo
  }

  const invalidos = resultado?.invalidos ?? [];
  const totalLinhasComErro = new Set(invalidos.map(e => e.linha)).size;

  const status = enviando
    ? 'loading'
    : erroArquivo
      ? 'error'
      : resultado
        ? 'success'
        : 'idle';

  return (
    <section className="painel-upload-card">
      <h2 className="painel-upload-card__titulo">{titulo}</h2>

      <button
        type="button"
        className="csv-info-btn"
        onClick={() => setInfoAberto(true)}
      >
        Saber mais sobre o arquivo
      </button>

      {infoAberto && (
        <CsvInfoModal kind={kind} onClose={() => setInfoAberto(false)} />
      )}

      {erroAberto && resultado && (
        <LinhasInvalidasModal
          titulo={titulo}
          totalValidos={resultado.validos.length}
          erros={invalidos}
          onClose={() => setErroAberto(false)}
        />
      )}

      <div
        className={`painel-upload-card__dropzone ${arrastando ? 'painel-upload-card__dropzone--ativo' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={aoSoltar}
      >
        <div className="painel-upload-card__icones" aria-hidden="true">
          {icone}
          <FileSpreadsheet size={40} strokeWidth={1.5} />
        </div>

        <p className="painel-upload-card__texto">
          {arquivo ? arquivo.name : 'Arraste e Solte o arquivo CSV'}
        </p>

        {totalLinhasComErro > 0 && (
          <button
            type="button"
            className="linhas-invalidas-btn"
            onClick={() => setErroAberto(true)}
          >
            <AlertCircle size={14} />
            Ver {totalLinhasComErro} {totalLinhasComErro === 1 ? 'linha com erro' : 'linhas com erro'}
          </button>
        )}

        <button
          type="button"
          className="painel-upload-card__botao"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
        >
          {arquivo ? 'Trocar Arquivo' : 'Selecionar Arquivo'}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={aoEscolher}
        />

        <p
          className={`painel-upload-card__feedback painel-upload-card__feedback--${status}`}
          role="status"
          aria-live="polite"
        >
          {status === 'loading' && (
            <><Loader2 size={14} className="painel-upload-card__spin" /> Importando {arquivo?.name}…</>
          )}
          {status === 'error' && <><AlertCircle size={14} /> {erroArquivo}</>}
          {status === 'success' && resultado && (
            <><CheckCircle2 size={14} /> {resultado.validos.length} {resultado.validos.length === 1 ? 'linha válida' : 'linhas válidas'}</>
          )}
        </p>
      </div>

      <footer className="painel-upload-card__rodape">
        <span>data da última importação</span>
        <span className="painel-upload-card__data">
          {formatarData(ultimaImportacao)}
          {ultimaImportacao && (
            <CheckCircle2 size={16} className="painel-upload-card__check" aria-label="Importado" />
          )}
        </span>
      </footer>
    </section>
  );
}