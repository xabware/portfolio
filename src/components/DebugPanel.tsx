import { memo, useState } from 'react';
import { Bug, ChevronDown, ChevronRight, FileText, Search, MessageSquare, ArrowRightLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { RAGDebugInfo, RAGPipelineStatus } from '../utils/vectorStore';
import './DebugPanel.css';

interface DebugPanelProps {
  debugInfo: RAGDebugInfo | null;
  translations: {
    title: string;
    noData: string;
    query: string;
    sourcesFound: string;
    ragPrompt: string;
    rawResponse: string;
    reverseSearch: string;
    annotatedResponse: string;
    page: string;
    relevance: string;
    mainChunk: string;
    expandedContext: string;
    sentence: string;
    assigned: string;
    notAssigned: string;
    reason: string;
    scores: string;
    coverage: string;
    distinctive: string;
    // Pipeline status translations
    statusSearching?: string;
    statusPrompting?: string;
    statusGenerating?: string;
    statusAnnotating?: string;
    statusComplete?: string;
    statusError?: string;
  };
}

const CollapsibleSection = memo(({
  title,
  icon,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`debug-section ${isOpen ? 'open' : ''}`}>
      <button className="debug-section-header" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {icon}
        <span className="debug-section-title">{title}</span>
        {badge && <span className="debug-section-badge">{badge}</span>}
      </button>
      {isOpen && <div className="debug-section-content">{children}</div>}
    </div>
  );
});
CollapsibleSection.displayName = 'CollapsibleSection';

/**
 * Indicador visual del progreso del pipeline RAG
 */
const PIPELINE_STEPS: RAGPipelineStatus[] = ['searching', 'prompting', 'generating', 'annotating', 'complete'];

const PipelineStatus = memo(({ status, translations: t }: { status: RAGPipelineStatus; translations: DebugPanelProps['translations'] }) => {
  const statusLabels: Record<RAGPipelineStatus, string> = {
    searching: t.statusSearching ?? 'Buscando...',
    prompting: t.statusPrompting ?? 'Construyendo prompt...',
    generating: t.statusGenerating ?? 'Generando respuesta...',
    annotating: t.statusAnnotating ?? 'Anotando referencias...',
    complete: t.statusComplete ?? 'Completado',
    error: t.statusError ?? 'Error',
  };

  const currentIdx = PIPELINE_STEPS.indexOf(status);

  return (
    <div className="debug-pipeline-status">
      {PIPELINE_STEPS.map((step, idx) => {
        const isActive = step === status;
        const isDone = idx < currentIdx || status === 'complete';
        const isPending = idx > currentIdx && status !== 'complete';

        return (
          <div
            key={step}
            className={`pipeline-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''} ${isPending ? 'pending' : ''} ${status === 'error' && isActive ? 'error' : ''}`}
          >
            {isActive && status !== 'complete' ? (
              <Loader2 size={12} className="spinning" />
            ) : isDone ? (
              <CheckCircle2 size={12} />
            ) : (
              <span className="pipeline-step-dot" />
            )}
            <span className="pipeline-step-label">{statusLabels[step]}</span>
          </div>
        );
      })}
    </div>
  );
});
PipelineStatus.displayName = 'PipelineStatus';

const DebugPanel = memo(({ debugInfo, translations: t }: DebugPanelProps) => {
  if (!debugInfo) {
    return (
      <div className="debug-panel">
        <div className="debug-panel-header">
          <Bug size={16} />
          <span>{t.title}</span>
        </div>
        <div className="debug-panel-empty">
          <p>{t.noData}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="debug-panel">
      <div className="debug-panel-header">
        <Bug size={16} />
        <span>{t.title}</span>
        <span className="debug-timestamp">
          {debugInfo.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Pipeline status bar */}
      <PipelineStatus status={debugInfo.status} translations={t} />

      <div className="debug-panel-body">
        {/* 1. Query */}
        <CollapsibleSection
          title={t.query}
          icon={<Search size={14} />}
          defaultOpen={true}
        >
          <pre className="debug-pre debug-query">{debugInfo.query}</pre>
        </CollapsibleSection>

        {/* 2. Sources found */}
        <CollapsibleSection
          title={t.sourcesFound}
          icon={<FileText size={14} />}
          defaultOpen={true}
          badge={`${debugInfo.sources.length}`}
        >
          {debugInfo.sources.length === 0 ? (
            <p className="debug-muted">No sources found</p>
          ) : (
            debugInfo.sources.map((source) => (
              <div key={source.refId} className="debug-source">
                <div className="debug-source-header">
                  <span className="debug-ref-badge">[{source.refId}]</span>
                  <span className="debug-source-file">{source.fileName}</span>
                  <span className="debug-source-page">{t.page} {source.pageNumber}</span>
                  <span className="debug-source-relevance">{t.relevance}: {source.relevance}%</span>
                </div>
                <details className="debug-details">
                  <summary>{t.mainChunk}</summary>
                  <pre className="debug-pre">{source.mainChunkText}</pre>
                </details>
                <details className="debug-details">
                  <summary>{t.expandedContext}</summary>
                  <pre className="debug-pre">{source.expandedText}</pre>
                </details>
              </div>
            ))
          )}
        </CollapsibleSection>

        {/* 3. RAG Prompt */}
        {debugInfo.ragPrompt && (
          <CollapsibleSection
            title={t.ragPrompt}
            icon={<MessageSquare size={14} />}
          >
            <pre className="debug-pre debug-prompt">{debugInfo.ragPrompt}</pre>
          </CollapsibleSection>
        )}

        {/* 4. Raw LLM Response */}
        <CollapsibleSection
          title={t.rawResponse}
          icon={<MessageSquare size={14} />}
        >
          <pre className="debug-pre">{debugInfo.rawResponse}</pre>
        </CollapsibleSection>

        {/* 5. Reverse Search Details */}
        <CollapsibleSection
          title={t.reverseSearch}
          icon={<ArrowRightLeft size={14} />}
          defaultOpen={true}
          badge={`${debugInfo.reverseSearchDetails.filter(d => d.assignedRefId !== null).length}/${debugInfo.reverseSearchDetails.length}`}
        >
          {debugInfo.reverseSearchDetails.map((detail, idx) => (
            <div key={idx} className={`debug-reverse-item ${detail.assignedRefId !== null ? 'assigned' : 'unassigned'}`}>
              <div className="debug-reverse-header">
                {detail.assignedRefId !== null ? (
                  <CheckCircle2 size={12} className="debug-icon-ok" />
                ) : (
                  <XCircle size={12} className="debug-icon-no" />
                )}
                <span className="debug-reverse-sentence">
                  &ldquo;{detail.sentence.substring(0, 100)}{detail.sentence.length > 100 ? '…' : ''}&rdquo;
                </span>
                {detail.assignedRefId !== null && (
                  <span className="debug-ref-badge">[{detail.assignedRefId}]</span>
                )}
              </div>
              <div className="debug-reverse-reason">
                <span className="debug-label">{t.reason}:</span> {detail.reason}
              </div>
              {detail.scores.length > 0 && (
                <div className="debug-reverse-scores">
                  <span className="debug-label">{t.scores}:</span>
                  {detail.scores.map((s, si) => (
                    <span key={si} className={`debug-score ${s.refId === detail.assignedRefId ? 'winner' : ''}`}>
                      [{s.refId}] {t.coverage}: {(s.coverage * 100).toFixed(0)}%
                      · {t.distinctive}: {(s.distinctiveScore * 100).toFixed(1)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CollapsibleSection>

        {/* 6. Final Annotated Response */}
        <CollapsibleSection
          title={t.annotatedResponse}
          icon={<MessageSquare size={14} />}
        >
          <pre className="debug-pre">{debugInfo.annotatedResponse}</pre>
        </CollapsibleSection>
      </div>
    </div>
  );
});

DebugPanel.displayName = 'DebugPanel';

export default DebugPanel;
