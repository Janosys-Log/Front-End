import type { ResultadoImportacao, InfoUltimaImportacao } from '../../types/importacao';
import { ListChecks, Truck } from 'lucide-react';
import { UploadCard } from './Uploadcard';
import '../../styles/painelUploadSection.css';

type UploadSectionProps = {
  arquivoVeiculos: File | null;
  arquivoManifestos: File | null;
  onSelecionarVeiculos: (arquivo: File | null) => void;
  onSelecionarManifestos: (arquivo: File | null) => void;
  resultadoVeiculos: ResultadoImportacao | null;
  resultadoManifestos: ResultadoImportacao | null;
  enviando: boolean;
  /** Data / info da última importação */
  ultimaImportacao?: string | Date | InfoUltimaImportacao | null;
  ultimaImportacaoVeiculos?: string | Date | InfoUltimaImportacao | null;
  ultimaImportacaoManifestos?: string | Date | InfoUltimaImportacao | null;
  onImportarVeiculos?: () => void;
  onImportarManifestos?: () => void;
};

export function UploadSection({
  arquivoVeiculos,
  arquivoManifestos,
  onSelecionarVeiculos,
  onSelecionarManifestos,
  resultadoVeiculos,
  resultadoManifestos,
  enviando,
  ultimaImportacao,
  ultimaImportacaoVeiculos,
  ultimaImportacaoManifestos,
  onImportarVeiculos,
  onImportarManifestos,
}: UploadSectionProps) {
  return (
    <div className="painel-upload-section">
      <UploadCard
        titulo="VEÍCULOS"
        icone={<Truck size={40} strokeWidth={1.5} />}
        kind="veiculos"
        arquivo={arquivoVeiculos}
        onSelecionar={onSelecionarVeiculos}
        resultado={resultadoVeiculos}
        enviando={enviando}
        ultimaImportacao={ultimaImportacaoVeiculos ?? ultimaImportacao}
        onImportar={onImportarVeiculos}
      />

      <span className="painel-upload-section__seta" aria-hidden="true">
        e/ou
      </span>

      <UploadCard
        titulo="MANIFESTOS"
        icone={<ListChecks size={40} strokeWidth={1.5} />}
        kind="manifestos"
        arquivo={arquivoManifestos}
        onSelecionar={onSelecionarManifestos}
        resultado={resultadoManifestos}
        enviando={enviando}
        ultimaImportacao={ultimaImportacaoManifestos ?? ultimaImportacao}
        onImportar={onImportarManifestos}
      />
    </div>
  );
}
