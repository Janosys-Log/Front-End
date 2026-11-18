import type { ChangeEvent, DragEvent, ReactNode } from 'react';
import type { ResultadoImportacao, InfoUltimaImportacao } from '../../types/importacao';
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
  /** true enquanto a página está enviando */
  enviando: boolean;
  /** Data / info da última importação. null = nunca importado */
  ultimaImportacao?: string | Date | InfoUltimaImportacao | null;
  /** Ação opcional para importar individualmente este card */
  onImportar?: () => void;
};

function extrairInfoImportacao(valor?: string | Date | InfoUltimaImportacao | null): {
  textoDataHora: string;
  nomeArquivo?: string;
  temValor: boolean;
} {
  if (!valor) return { textoDataHora: '—', temValor: false };
  if (typeof valor === 'string') {
    const d = new Date(valor);
    return {
      textoDataHora: Number.isNaN(d.getTime()) ? valor : d.toLocaleDateString('pt-BR'),
      temValor: true,
    };
  }
  if (valor instanceof Date) {
    return {
      textoDataHora: valor.toLocaleDateString('pt-BR'),
      temValor: true,
    };
  }

  let dataFormatada = '';
  if (valor.data) {
    const [y, m, d] = valor.data.slice(0, 10).split('-').map(Number);
    if (y && m && d) {
      dataFormatada = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    } else {
      dataFormatada = valor.data;
    }
  } else if (valor.dataHora) {
    const dt = new Date(valor.dataHora);
    if (!Number.isNaN(dt.getTime())) {
      dataFormatada = dt.toLocaleDateString('pt-BR');
    }
  }

  let horaFormatada = '';
  if (valor.hora) {
    horaFormatada = valor.hora.slice(0, 5);
  } else if (valor.dataHora) {
    const dt = new Date(valor.dataHora);
    if (!Number.isNaN(dt.getTime())) {
      horaFormatada = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  }

  const texto =
    dataFormatada && horaFormatada
      ? `${dataFormatada} às ${horaFormatada}`
      : dataFormatada || horaFormatada || '—';

  return {
    textoDataHora: texto,
    nomeArquivo: valor.nomeArquivo,
    temValor: Boolean(dataFormatada || horaFormatada || valor.nomeArquivo),
  };
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
  onImportar,
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

  const infoImport = extrairInfoImportacao(ultimaImportacao);

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

        <div className="painel-upload-card__acoes-arquivo">
          <button
            type="button"
            className="painel-upload-card__botao"
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
          >
            {arquivo ? 'Trocar Arquivo' : 'Selecionar Arquivo'}
          </button>

          {arquivo && !enviando && (
            <button
              type="button"
              className="painel-upload-card__botao painel-upload-card__botao--remover"
              onClick={() => onSelecionar(null)}
              title="Remover este arquivo"
            >
              Remover
            </button>
          )}

          {arquivo && onImportar && !enviando && (
            <button
              type="button"
              className="painel-upload-card__botao painel-upload-card__botao--importar"
              onClick={onImportar}
            >
              Importar {titulo.toLowerCase()}
            </button>
          )}
        </div>

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
        <div className="painel-upload-card__rodape-col">
          <span className="painel-upload-card__rodape-label">data da última importação</span>
          {infoImport.nomeArquivo && (
            <span className="painel-upload-card__arquivo-ultimo" title={infoImport.nomeArquivo}>
              <FileSpreadsheet size={13} /> {infoImport.nomeArquivo}
            </span>
          )}
        </div>
        <span className="painel-upload-card__data">
          {infoImport.textoDataHora}
          {infoImport.temValor && (
            <CheckCircle2 size={16} className="painel-upload-card__check" aria-label="Importado" />
          )}
        </span>
      </footer>
    </section>
  );
}
