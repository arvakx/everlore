import { useState } from "react";
import { X, History, RotateCcw, Trash2, Clock, Eye } from "lucide-react";
import { useSceneSnapshots, deleteSnapshot, snapshot } from "@/lib/history";
import { relativeEs } from "@/lib/store";

interface Props {
  open: boolean;
  onClose: () => void;
  storyId: string;
  sceneId: string;
  currentContent: string;
  onRestore: (html: string) => void;
}

export function VersionHistoryDialog({ open, onClose, storyId, sceneId, currentContent, onRestore }: Props) {
  const snaps = useSceneSnapshots(sceneId);
  const [previewId, setPreviewId] = useState<string | null>(null);
  if (!open) return null;
  const preview = snaps.find((s) => s.id === previewId) ?? snaps[0];

  function restore(html: string) {
    // save current as a snapshot before restoring so it can be undone
    snapshot(storyId, sceneId, currentContent, "Antes de restaurar");
    onRestore(html);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-up" onClick={onClose}>
      <div className="w-full max-w-4xl h-[80vh] rounded-3xl glass-strong shadow-paper glow-border flex overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Timeline */}
        <div className="w-72 shrink-0 border-r border-hairline flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-hairline">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-mint" />
              <h3 className="font-serif text-base text-ink">Historial</h3>
            </div>
            <button onClick={onClose} className="rounded-md p-1 text-ink-muted hover:bg-accent hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {snaps.length === 0 && (
              <div className="text-xs text-ink-muted p-4 italic text-center">
                Aún no hay versiones. Lumi guardará una cada pocos minutos mientras escribes.
              </div>
            )}
            {snaps.map((s, idx) => {
              const active = (preview?.id ?? snaps[0]?.id) === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setPreviewId(s.id)}
                  className={`w-full text-left rounded-lg p-2.5 border transition-all ${
                    active ? "border-emerald bg-accent/60 glow-border" : "border-transparent hover:bg-accent/30 border-hairline"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-mint">
                    <Clock className="h-3 w-3" /> {relativeEs(s.ts)}
                    {idx === 0 && <span className="ml-auto text-[9px] text-ink-muted normal-case">Más reciente</span>}
                  </div>
                  <div className="mt-1 text-xs text-ink line-clamp-1">{s.label}</div>
                  <div className="mt-0.5 text-[10px] text-ink-muted">{s.words.toLocaleString("es")} palabras</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between p-4 border-b border-hairline">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-mint flex items-center gap-1">
                <Eye className="h-3 w-3" /> Vista previa
              </div>
              <div className="font-serif text-lg text-ink mt-0.5">{preview?.label ?? "Selecciona una versión"}</div>
            </div>
            {preview && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { deleteSnapshot(preview.id); setPreviewId(null); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-paper-elevated px-3 py-1.5 text-xs text-ink-muted hover:text-ink hover:border-hairline"
                  title="Eliminar versión"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
                <button
                  onClick={() => restore(preview.content)}
                  className="inline-flex items-center gap-1.5 rounded-xl gradient-emerald px-4 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Restaurar esta versión
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-8">
            {preview ? (
              <div
                className="prose-manuscript max-w-2xl mx-auto opacity-90"
                dangerouslySetInnerHTML={{ __html: preview.content || "<p><em>Versión vacía</em></p>" }}
              />
            ) : (
              <div className="text-sm text-ink-muted italic text-center mt-20">
                Tus historias están a salvo. Selecciona una versión para previsualizarla.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
