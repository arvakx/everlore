import { Undo2, Redo2 } from "lucide-react";
import { useEffect } from "react";
import { useHistoryState, undo as doUndo, redo as doRedo } from "@/lib/history";

interface Props {
  sceneId: string;
  current: string;
  onApply: (html: string) => void;
}

export function UndoRedo({ sceneId, current, onApply }: Props) {
  const { canUndo, canRedo } = useHistoryState(sceneId);

  function handleUndo() {
    const v = doUndo(sceneId, current);
    if (v !== null) onApply(v);
  }
  function handleRedo() {
    const v = doRedo(sceneId, current);
    if (v !== null) onApply(v);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault(); handleUndo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault(); handleRedo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId, current]);

  const btn = "inline-flex items-center justify-center rounded-md border border-hairline bg-paper-elevated p-1.5 text-ink transition-all hover:border-emerald hover:text-mint hover:shadow-glow disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-hairline disabled:hover:text-ink disabled:hover:shadow-none";

  return (
    <div className="flex items-center gap-1">
      <button onClick={handleUndo} disabled={!canUndo} className={btn} title="Deshacer (Ctrl/Cmd+Z)" aria-label="Deshacer">
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button onClick={handleRedo} disabled={!canRedo} className={btn} title="Rehacer (Ctrl/Cmd+Shift+Z)" aria-label="Rehacer">
        <Redo2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
