import { useEffect, useRef, useState } from "react";
import { Send, X, Trash2, Copy, RefreshCw, ArrowDownToLine, ChevronDown, MessagesSquare, User as UserIcon } from "lucide-react";
import type { Story, AiSpecialist } from "@/lib/store";
import { updateStory, newId, useUser, updateUser, SPECIALISTS, resolveSpecialist } from "@/lib/store";
import { generateChatResponse, generateDraft, generateNudges } from "@/lib/assistant";
import { LumiAvatar } from "@/components/LumiAvatar";

interface Props { story: Story; onInsertDraft: (text: string) => void; }

const QUICK_ACTIONS = [
  "Desbloquéame",
  "Dame 3 giros posibles",
  "Describe este lugar",
  "Profundiza este personaje",
  "¿Qué le falta a esta escena?",
  "Resume lo que va de la historia",
  "Analiza la tensión emocional",
  "¿Y si el villano tiene razón?",
];

export function AssistantPanel({ story, onInsertDraft }: Props) {
  const user = useUser();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [specialistOpen, setSpecialistOpen] = useState(false);
  const [characterMode, setCharacterMode] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const specialist = resolveSpecialist((user?.specialist ?? "lumi"), user);
  const nudges = user?.proactiveNudges
    ? generateNudges(story).filter((n) => !story.nudges.find((x) => x.text === n && x.dismissed))
    : [];

  useEffect(() => { inputRef.current?.focus(); }, [story.id]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [story.conversation.length, typing]);

  function setSpecialist(id: AiSpecialist) {
    updateUser({ specialist: id });
    setSpecialistOpen(false);
  }

  function sendUserMessage(text: string) {
    if (!text.trim()) return;
    const prefix = characterMode ? `[Modo Personaje: ${characterMode}] ` : "";
    const userMsg = { id: newId(), role: "user" as const, content: prefix + text, ts: Date.now() };
    updateStory(story.id, (s) => ({ ...s, conversation: [...s.conversation, userMsg] }));
    setInput("");
    setTyping(true);

    const wantsDraft = /escrib|borrador|redact|párrafo|parrafo|escena|diálogo|dialogo/i.test(text);

    setTimeout(() => {
      if (wantsDraft && !characterMode) {
        const draftText = generateDraft(story, text);
        const draft = { id: newId(), prompt: text, text: draftText, ts: Date.now() };
        const reply = {
          id: newId(), role: "assistant" as const,
          content: `Te dejé un borrador en mi lienzo, abajo. Tú decides si entra en tu historia.`,
          ts: Date.now(), specialist: specialist.id,
        };
        updateStory(story.id, (s) => ({ ...s, conversation: [...s.conversation, reply], drafts: [draft, ...s.drafts] }));
      } else {
        const content = characterMode
          ? `(Como ${characterMode}) ${generateChatResponse(story, text)}`
          : generateChatResponse(story, text);
        const reply = { id: newId(), role: "assistant" as const, content, ts: Date.now(), specialist: specialist.id };
        updateStory(story.id, (s) => ({ ...s, conversation: [...s.conversation, reply] }));
      }
      setTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 700 + Math.random() * 500);
  }

  function dismissNudge(text: string) {
    updateStory(story.id, (s) => ({
      ...s, nudges: [...s.nudges.filter((n) => n.text !== text), { id: newId(), text, dismissed: true }],
    }));
  }
  function discardDraft(id: string) {
    updateStory(story.id, (s) => ({ ...s, drafts: s.drafts.filter((d) => d.id !== id) }));
  }
  function refineDraft(_id: string) {
    sendUserMessage("Refina ese borrador: hazlo un poco más corto y con más tensión.");
  }

  return (
    <div className="flex h-full flex-col glass border-l border-hairline relative">
      {/* Header */}
      <div className="px-4 py-4 border-b border-hairline/70 space-y-3">
        <div className="flex items-center gap-3">
          <LumiAvatar size={36} state={typing ? "thinking" : "idle"} />
          <div className="flex-1 min-w-0">
            <div className="font-serif text-lg text-ink leading-tight">{specialist.name}</div>
            <div className="text-[10px] uppercase tracking-widest text-mint">{specialist.tagline}</div>
          </div>
          <button
            onClick={() => setSpecialistOpen((v) => !v)}
            className="rounded-md p-1.5 text-ink-muted hover:bg-accent hover:text-mint"
            aria-label="Cambiar especialista"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${specialistOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {specialistOpen && (
          <div className="rounded-xl border border-hairline bg-paper-elevated/80 p-2 max-h-72 overflow-y-auto animate-fade-up">
            {SPECIALISTS.map((s) => {
              const r = resolveSpecialist(s.id, user);
              return (
                <button
                  key={s.id}
                  onClick={() => setSpecialist(s.id)}
                  className={`w-full text-left flex items-start gap-2 rounded-lg px-2.5 py-2 hover:bg-accent transition ${
                    specialist.id === s.id ? "bg-accent" : ""
                  }`}
                >
                  <LumiAvatar size={22} state={s.id === "lumi" ? "mystic" : s.id === "terror" ? "thinking" : "idle"} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ink leading-tight">{r.name}</div>
                    <div className="text-[10px] text-ink-muted">{r.tagline} · {s.tone}</div>
                  </div>
                </button>
              );
            })}

          </div>
        )}

        {/* Modo Personaje */}
        {story.bible.characters.length > 0 && (
          <details className="group">
            <summary className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-ink-muted hover:text-mint cursor-pointer list-none">
              <UserIcon className="h-3 w-3" />
              Modo Personaje
              {characterMode && <span className="text-mint normal-case tracking-normal">· {characterMode}</span>}
            </summary>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                onClick={() => setCharacterMode(null)}
                className={`text-[11px] px-2 py-1 rounded-md border ${!characterMode ? "border-emerald text-mint bg-accent" : "border-hairline text-ink-muted hover:text-ink"}`}
              >
                Ninguno
              </button>
              {story.bible.characters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCharacterMode(c.name)}
                  className={`text-[11px] px-2 py-1 rounded-md border ${characterMode === c.name ? "border-emerald text-mint bg-accent" : "border-hairline text-ink-muted hover:text-ink"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {nudges.length > 0 && story.conversation.length === 0 && (
          <div className="space-y-2">
            {nudges.map((n) => (
              <div key={n} className="group rounded-xl border border-hairline/70 bg-paper-elevated/60 p-3 text-sm text-ink relative glow-border">
                <p className="pr-6 leading-relaxed italic text-mint/90">{n}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => sendUserMessage(n)}
                    className="text-xs font-medium text-mint hover:text-neon transition"
                  >
                    Explorar →
                  </button>
                </div>
                <button onClick={() => dismissNudge(n)} className="absolute top-2 right-2 p-1 text-ink-muted/60 hover:text-ink" aria-label="Descartar">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {story.conversation.length === 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-ink-muted mb-2 px-1">
              <MessagesSquare className="h-3 w-3" /> ¿En qué te ayudo?
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a} onClick={() => sendUserMessage(a)}
                  className="rounded-lg border border-hairline/70 bg-paper-elevated/40 px-3 py-2 text-xs text-ink hover:bg-paper-elevated hover:border-emerald transition-all text-left leading-snug"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        {story.conversation.map((m) => (
          <div key={m.id} className="animate-fade-up">
            {m.role === "user" ? (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-emerald/15 border border-emerald/30 px-4 py-2.5 text-sm text-ink leading-relaxed">
                  {m.content}
                </div>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <LumiAvatar size={22} state="idle" className="shrink-0 mt-1" />
                <div className="max-w-[90%] text-sm text-ink leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="flex items-center gap-2 text-sm">
            <LumiAvatar size={20} state="thinking" />
            <span className="shimmer-text italic">{specialist.name} está pensando…</span>
          </div>
        )}

        {story.drafts.length > 0 && (
          <div className="pt-2 mt-2 border-t border-hairline/60 space-y-3">
            <div className="text-[10px] uppercase tracking-widest text-mint px-1">Lienzo de Lumi</div>
            {story.drafts.map((d) => (
              <div key={d.id} className="rounded-xl border border-emerald/30 bg-paper-elevated/80 p-3.5 glow-border">
                <div className="text-[10px] uppercase tracking-widest text-mint mb-2">Borrador</div>
                <p className="font-serif text-[15px] leading-relaxed text-ink whitespace-pre-wrap">{d.text}</p>
                <p className="mt-3 text-[11px] italic text-ink-muted">
                  Esto es un borrador. Tú decides si entra en tu historia.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <DraftBtn icon={<ArrowDownToLine className="h-3 w-3" />} onClick={() => onInsertDraft(d.text)} primary>
                    Insertar
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
      <div className="border-t border-hairline/70 p-3 bg-paper/40 backdrop-blur">
        <div className="rounded-xl border border-hairline bg-paper-elevated/80 focus-within:border-emerald focus-within:shadow-glow-sm transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendUserMessage(input); }
            }}
            rows={2}
            placeholder={characterMode ? `Habla con ${characterMode}…` : `Habla con ${specialist.name}…`}
            className="w-full resize-none bg-transparent px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 outline-none"
          />
          <div className="flex justify-end px-2 pb-2">
            <button
              onClick={() => sendUserMessage(input)}
              disabled={!input.trim()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md gradient-emerald text-primary-foreground disabled:opacity-40 hover:shadow-glow transition"
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

function DraftBtn({ children, onClick, icon, primary }: { children: React.ReactNode; onClick: () => void; icon: React.ReactNode; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-all ${
        primary
          ? "gradient-emerald text-primary-foreground hover:shadow-glow"
          : "border border-hairline bg-paper text-ink hover:border-emerald hover:text-mint"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
