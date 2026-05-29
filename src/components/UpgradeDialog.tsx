import { X } from "lucide-react";
import { updateUser } from "@/lib/store";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function UpgradeDialog({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-paper-elevated p-7 shadow-paper">
        <div className="flex justify-end -mt-2 -mr-2">
          <button onClick={onClose} className="rounded-md p-1 text-ink-muted hover:bg-accent hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h2 className="font-serif text-2xl text-ink">Has alcanzado el límite de tu plan</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          El Plan Gratuito incluye una historia. Mejora a Plan Autor para escribir todas las que quieras.
        </p>

        <div className="mt-5 rounded-xl border border-hairline bg-paper p-4">
          <div className="font-medium text-ink">Plan Autor</div>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
            <li>· Historias ilimitadas</li>
            <li>· Biblia completa por historia</li>
            <li>· Asistente avanzado (próximamente)</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-ink-muted hover:text-ink">
            Ahora no
          </button>
          <button
            onClick={() => { updateUser({ plan: "author" }); onClose(); }}
            className="rounded-lg bg-ember px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-ember-hover"
          >
            Mejorar plan
          </button>
        </div>
      </div>
    </div>
  );
}
