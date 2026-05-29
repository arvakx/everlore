import { useEffect, useRef, useState } from "react";
import { Download, FileText, FileType, BookOpen, Globe, FileCode } from "lucide-react";

interface Props {
  label?: string;
  variant?: "button" | "icon";
  align?: "left" | "right";
}

const FORMATS = [
  { id: "pdf",   label: "PDF",            ext: ".pdf",   icon: FileType,  hint: "Listo para imprimir" },
  { id: "docx",  label: "Word",           ext: ".docx",  icon: FileText,  hint: "Editable en Word/Docs" },
  { id: "epub",  label: "EPUB",           ext: ".epub",  icon: BookOpen,  hint: "Para lectores digitales" },
  { id: "mobi",  label: "Kindle",         ext: ".mobi",  icon: BookOpen,  hint: "Compatible Amazon Kindle" },
  { id: "md",    label: "Markdown",       ext: ".md",    icon: FileCode,  hint: "Texto plano enriquecido" },
  { id: "html",  label: "Página web",     ext: ".html",  icon: Globe,     hint: "Publicable online" },
  { id: "txt",   label: "Texto plano",    ext: ".txt",   icon: FileText,  hint: "Texto sin formato" },
];

export function ExportMenu({ label = "Exportar", variant = "button", align = "right" }: Props) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function fakeExport(label: string) {
    setOpen(false);
    setToast(`Exportando como ${label}…`);
    setTimeout(() => setToast(null), 1800);
  }

  return (
    <div className="relative" ref={ref}>
      {variant === "icon" ? (
        <button
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
          className="rounded-md p-1.5 text-ink-muted hover:bg-accent hover:text-mint transition"
          aria-label="Exportar"
          title="Exportar"
        >
          <Download className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-paper-elevated px-2.5 py-1.5 text-xs text-ink hover:border-emerald hover:text-mint transition"
        >
          <Download className="h-3.5 w-3.5" /> {label}
        </button>
      )}

      {open && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-1.5 w-64 rounded-xl glass-strong border border-hairline p-1.5 z-50 animate-fade-up`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-mint">Elige un formato</div>
          {FORMATS.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => fakeExport(f.label)}
                className="w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-accent transition text-left"
              >
                <Icon className="h-4 w-4 text-mint mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink leading-tight">
                    {f.label} <span className="text-ink-muted text-[10px]">{f.ext}</span>
                  </div>
                  <div className="text-[10px] text-ink-muted leading-tight">{f.hint}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-xl glass-strong border border-emerald/40 px-4 py-2.5 text-sm text-ink glow-border animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}
