import { useEffect, useRef, useState } from "react";
import { Send, X, Sparkles, Trash2, Copy, RefreshCw, ArrowDownToLine } from "lucide-react";
import type { Story } from "@/lib/store";
import { updateStory, newId, useUser } from "@/lib/store";
import { generateChatResponse, generateDraft, generateNudges } from "@/lib/assistant";

interface Props {
  story: Story;
  onInsertDraft: (text: string) => void;
}

const QUICK_ACTIONS = [
  "Desbloquéame",
  "Dame 3 ideas",
  "Describe este lugar",
  "Profundiza este personaje",
  "¿Qué le falta a esta escena?",
  "Resume lo que va de la historia",
];

export function AssistantPanel({ story, onInsertDraft }: Props) {
  const user = useUser();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const nudges = user?.proactiveNudges ? generateNudges(story).filter(n => !story.nudges.find(x => x.text === n && x.dismissed)) : [];

  useEffect(() => {
    inputRef.current?.focus();
  }, [story.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [story.conversation.length, typing]);

  function sendUserMessage(text: string) {
    if (!text.trim()) return;
    const userMsg = { id: newId(), role: "user" as const, content: text, ts: Date.now() };
    updateStory(story.id, (s) => ({ ...s, conversation: [...s.conversation, userMsg] }));
    setInput("");
    setTyping(true);

    const wantsDraft = /escrib|borrador|redact|párrafo|parrafo|escena|diálogo|dialogo/i.test(text);

    setTimeout(() => {
      if (wantsDraft) {
        const draftText = generateDraft(story, text);
        const draft = { id: newId(), prompt: text, text: draftText, ts: Date.now() };
        const reply = {
          id: newId(),
          role: "assistant" as const,
          content: `Te dejé un borrador en mi lienzo, abajo. Tú decides si entra en tu historia.`,
          ts: Date.now(),
        };
        updateStory(story.id, (s) => ({
          ...s,
          conversation: [...s.conversation, reply],
          drafts: [draft, ...s.drafts],
        }));
      } else {
        const reply = {
          id: newId(),
          role: "assistant" as const,
          content: generateChatResponse(story, text),
          ts: Date.now(),
        };
        updateStory(story.id, (s) => ({ ...s, conversation: [...s.conversation, reply] }));
      }
      setTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 700 + Math.random() * 500);
  }

  function dismissNudge(text: string) {
    updateStory(story.id, (s) => ({
      ...s,
      nudges: [...s.nudges.filter((n) => n.text !== text), { id: newId(), text, dismissed: true }],
    }));
  }

  function discardDraft(id: string) {
    updateStory(story.id, (s) => ({ ...s, drafts: s.drafts.filter((d) => d.id !== id) }));
  }

  function refineDraft(id: string) {
    sendUserMessage("Refina ese borrador: hazlo un poco más corto y con más tensión.");
  }

  return (
    <div className="flex h-full flex-col bg-assistant-surface border-l border-hairline">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-hairline/70">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-assistant-accent text-paper">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="font-serif text-lg text-ink">Asistente</div>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Nudges */}
        {nudges.length > 0 && story.conversation.length === 0 && (
          <div className="space-y-2">
            {nudges.map((n) => (
              <div key={n} className="group rounded-xl border border-hairline/70 bg-paper-elevated/60 p-3 text-sm text-ink relative">
                <p className="pr-6 leading-relaxed">{n}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => sendUserMessage(n)}
                    className="text-xs font-medium text-assistant-accent hover:text-ink"
                  >
                    Explorar
                  </button>
                </div>
                <button
                  onClick={() => dismissNudge(n)}
                  className="absolute top-2 right-2 p-1 text-ink-muted/60 hover:text-ink"
                  aria-label="Descartar"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        {story.conversation.length === 0 && (
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-muted mb-2 px-1">
              ¿En qué te ayudo?
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => sendUserMessage(a)}
                  className="rounded-lg border border-hairline/70 bg-paper-elevated/40 px-3 py-2 text-xs text-ink hover:bg-paper-elevated hover:border-assistant-accent transition-colors text-left leading-snug"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {story.conversation.map((m) => (
          <div key={m.id}>
            {m.role === "user" ? (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-ember px-4 py-2.5 text-sm text-primary-foreground leading-relaxed">
                  {m.content}
                </div>
              </div>
            ) : (
              <div className="max-w-[95%] text-sm text-ink leading-relaxed whitespace-pre-wrap">
                {m.content}
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="text-sm text-ink-muted italic">Pensando…</div>
        )}

        {/* Drafts (lienzo) */}
        {story.drafts.length > 0 && (
          <div className="pt-2 mt-2 border-t border-hairline/60 space-y-3">
            <div className="text-xs uppercase tracking-wider text-ink-muted px-1">
              Lienzo del asistente
            </div>
            {story.drafts.map((d) => (
              <div key={d.id} className="rounded-xl border border-dashed border-assistant-accent/40 bg-paper-elevated p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-assistant-accent mb-2">
                  Borrador
                </div>
                <p className="font-serif text-[15px] leading-relaxed text-ink whitespace-pre-wrap">
                  {d.text}
                </p>
                <p className="mt-3 text-[11px] italic text-ink-muted">
                  Esto es un borrador del asistente. Tú decides si entra en tu historia.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <DraftBtn icon={<ArrowDownToLine className="h-3 w-3" />} onClick={() => onInsertDraft(d.text)} primary>
                    Insertar en el editor
                  </DraftBtn>
                  <DraftBtn icon={<Copy className="h-3 w-3" />} onClick={() => navigator.clipboard.writeText(d.text)}>
                    Copiar
                  </DraftBtn>
                  <DraftBtn icon={<RefreshCw className="h-3 w-3" />} onClick={() => refineDraft(d.id)}>
                    Refinar
                  </DraftBtn>
                  <DraftBtn icon={<Trash2 className="h-3 w-3" />} onClick={() => discardDraft(d.id)}>
                    Descartar
                  </DraftBtn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-hairline/70 p-3 bg-assistant-surface">
        <div className="rounded-xl border border-hairline bg-paper-elevated focus-within:border-assistant-accent transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendUserMessage(input);
              }
            }}
            rows={2}
            placeholder="Pregúntame lo que quieras sobre tu historia…"
            className="w-full resize-none bg-transparent px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 outline-none"
          />
          <div className="flex justify-end px-2 pb-2">
            <button
              onClick={() => sendUserMessage(input)}
              disabled={!input.trim()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-assistant-accent text-paper disabled:opacity-40 hover:opacity-90 transition"
              aria-label="Enviar"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DraftBtn({
  children, onClick, icon, primary,
}: { children: React.ReactNode; onClick: () => void; icon: React.ReactNode; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-colors ${
        primary
          ? "bg-ember text-primary-foreground hover:bg-ember-hover"
          : "border border-hairline bg-paper text-ink hover:bg-accent"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
