import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  X, FlaskConical, Wand2, GitBranch, Brain, Film, Scissors, Trophy, Users,
  Blocks, Globe, BookOpen, Feather, Bookmark, Lightbulb, Palette, PenLine, Sparkles,
} from "lucide-react";
import type { Story } from "@/lib/store";

interface Props {
  story: Story;
  open: boolean;
  onClose: () => void;
  onInsertText?: (text: string) => void;
}

type FeatureId =
  | "chapter" | "decisions" | "memory" | "scene" | "dual"
  | "rpg" | "reader" | "blocks" | "universe" | "publish"
  | "anti" | "canon" | "daily" | "style" | "coauthor";

const AVAILABLE: FeatureId[] = ["blocks", "publish", "anti", "canon"];
const isAvailable = (id: FeatureId) => AVAILABLE.includes(id);

const FEATURES: { id: FeatureId; label: string; icon: typeof Wand2; tagline: string }[] = [
  { id: "blocks",   label: "Bloques narrativos",      icon: Blocks,       tagline: "Escenas, diálogos, flashbacks" },
  { id: "publish",  label: "Publicación profesional", icon: BookOpen,     tagline: "Portada, sinopsis, maquetado" },
  { id: "anti",     label: "Anti-perfeccionismo",     icon: Feather,      tagline: "Modo borrador libre" },
  { id: "canon",    label: "Eventos canon",           icon: Bookmark,     tagline: "Línea de tiempo de momentos clave" },
  { id: "chapter",  label: "Capítulos vivos",         icon: Wand2,        tagline: "Atmósfera adaptativa por tono" },
  { id: "decisions",label: "Decisiones narrativas",   icon: GitBranch,    tagline: "Bifurcaciones estilo RPG" },
  { id: "memory",   label: "Memoria emocional",       icon: Brain,        tagline: "Perfil creativo del escritor" },
  { id: "scene",    label: "Generador cinematográfico", icon: Film,       tagline: "Mismo texto, 5 formatos" },
  { id: "dual",     label: "Editor dual",             icon: Scissors,     tagline: "Duro o creativo, tú eliges" },
  { id: "rpg",      label: "Progresión RPG",          icon: Trophy,       tagline: "XP, niveles, logros" },
  { id: "reader",   label: "Simulador de lector",     icon: Users,        tagline: "Casual, fan, crítico, editor" },
  { id: "universe", label: "Universo colaborativo",   icon: Globe,        tagline: "Comparte mundos y lore" },
  { id: "daily",    label: "Inspiración diaria",      icon: Lightbulb,    tagline: "Un prompt al día" },
  { id: "style",    label: "Transformación de estilo", icon: Palette,     tagline: "Épico, poético, oscuro…" },
  { id: "coauthor", label: "Co-autor en vivo",        icon: PenLine,      tagline: "Sugerencias línea a línea" },
];

export function StoryLab({ story, open, onClose, onInsertText }: Props) {
  const [active, setActive] = useState<FeatureId>("chapter");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md sm:p-4 animate-fade-up" onClick={onClose}>
      <div
        className="w-full sm:max-w-5xl h-[92vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl glass-strong shadow-paper glow-border overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-hairline">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-mint mb-1">
              <FlaskConical className="h-3 w-3" /> Laboratorio narrativo
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-ink">Sistemas creativos de Everlore</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-muted hover:bg-accent hover:text-ink" aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Feature list */}
          <aside className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-hairline overflow-x-auto md:overflow-y-auto p-2 md:p-3">
            <div className="flex md:flex-col gap-1 md:gap-0.5 min-w-max md:min-w-0">
              {FEATURES.map((f) => {
                const sel = f.id === active;
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActive(f.id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm transition whitespace-nowrap md:whitespace-normal text-left ${
                      sel ? "bg-accent text-mint border border-emerald" : "text-ink-muted hover:text-ink hover:bg-accent/40 border border-transparent"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Detail */}
          <section className="flex-1 overflow-y-auto p-5 sm:p-7">
            <FeatureDetail id={active} story={story} onInsertText={onInsertText} onClose={onClose} />
          </section>
        </div>
      </div>
    </div>
  );
}

function FeatureDetail({ id, story, onInsertText, onClose }: { id: FeatureId; story: Story; onInsertText?: (t: string) => void; onClose: () => void }) {
  const f = FEATURES.find((x) => x.id === id)!;
  const Icon = f.icon;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-start gap-3">
        <div className="rounded-xl gradient-emerald p-2.5 text-primary-foreground glow-ring">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif text-2xl text-ink">{f.label}</h3>
          <p className="text-sm text-mint italic">{f.tagline}</p>
        </div>
      </div>

      {id === "chapter" && <ChapterFeature story={story} />}
      {id === "decisions" && <DecisionsFeature story={story} />}
      {id === "memory" && <MemoryFeature story={story} />}
      {id === "scene" && <SceneFeature onInsertText={onInsertText} onClose={onClose} />}
      {id === "dual" && <DualEditorFeature onInsertText={onInsertText} onClose={onClose} />}
      {id === "rpg" && <RpgFeature />}
      {id === "reader" && <ReaderFeature />}
      {id === "blocks" && <BlocksFeature onInsertText={onInsertText} onClose={onClose} />}
      {id === "universe" && <UniverseFeature />}
      {id === "publish" && <PublishFeature />}
      {id === "anti" && <AntiFeature />}
      {id === "canon" && <CanonFeature story={story} />}
      {id === "daily" && <DailyFeature />}
      {id === "style" && <StyleFeature onInsertText={onInsertText} onClose={onClose} />}
      {id === "coauthor" && <CoauthorFeature onInsertText={onInsertText} onClose={onClose} />}
    </div>
  );
}

// ====== Individual feature panels (all mock) ======

function Card({ children, glow }: { children: React.ReactNode; glow?: boolean }) {
  return <div className={`rounded-xl border border-hairline bg-paper-elevated/60 p-4 ${glow ? "glow-border" : ""}`}>{children}</div>;
}
function Btn({ children, onClick, primary }: { children: React.ReactNode; onClick?: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-xs font-medium transition ${
        primary ? "gradient-emerald text-primary-foreground hover:shadow-glow" : "border border-hairline text-ink hover:border-emerald hover:text-mint"
      }`}
    >{children}</button>
  );
}

function ChapterFeature({ story }: { story: Story }) {
  const tones = ["Melancólico", "Tenso", "Romántico", "Misterioso", "Épico", "Oscuro"];
  const [tone, setTone] = useState("Misterioso");
  return (
    <>
      <p className="text-sm text-ink-muted">Cada capítulo se transforma visualmente según el tono dominante de la escena.</p>
      <Card>
        <div className="text-[10px] uppercase tracking-widest text-mint mb-2">Tono detectado</div>
        <div className="flex flex-wrap gap-1.5">
          {tones.map((t) => (
            <button key={t} onClick={() => setTone(t)}
              className={`rounded-full px-3 py-1 text-xs transition ${tone === t ? "bg-accent text-mint border border-emerald" : "border border-hairline text-ink-muted hover:text-ink"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="mt-4 h-24 rounded-lg relative overflow-hidden" style={{
          background: `linear-gradient(135deg, ${toneColor(tone)}55, transparent 70%), ${story.coverColor}22`,
          boxShadow: `inset 0 0 60px ${toneColor(tone)}33`,
        }}>
          <div className="absolute inset-0 flex items-center justify-center text-xs italic text-ink/80">
            La atmósfera del capítulo "{story.chapters[0]?.title}" responde al tono {tone.toLowerCase()}.
          </div>
        </div>
      </Card>
    </>
  );
}
function toneColor(t: string) {
  return { Melancólico: "#4C1D95", Tenso: "#B91C1C", Romántico: "#EC4899", Misterioso: "#1E3A8A", Épico: "#D4A017", Oscuro: "#0A0A0A" }[t] ?? "#10B981";
}

function DecisionsFeature({ story }: { story: Story }) {
  const decisions = useMemo(() => {
    const chr = story.bible.characters[0]?.name ?? "este personaje";
    return [
      { q: `${chr} puede traicionar o proteger al grupo. ¿Qué decides?`, a: ["Que traicione", "Que proteja", "Dejar la duda abierta"] },
      { q: "¿Revelar el secreto del prólogo ahora o más adelante?", a: ["Revelarlo ahora", "Posponerlo", "Insinuarlo sutilmente"] },
      { q: "¿La ciudad cae o resiste el asedio?", a: ["Cae", "Resiste", "Cae pero hay un superviviente"] },
    ];
  }, [story.id]);
  return (
    <>
      <p className="text-sm text-ink-muted">Lumi detecta momentos clave y propone bifurcaciones. Cada decisión queda guardada en la memoria de tu historia.</p>
      <div className="space-y-3">
        {decisions.map((d, i) => (
          <Card key={i} glow>
            <div className="text-sm text-ink font-serif italic mb-3">"{d.q}"</div>
            <div className="flex flex-wrap gap-2">
              {d.a.map((a) => (
                <button key={a} onClick={() => toast(`Camino registrado: ${a}`, { description: "Lumi adaptará la continuidad." })}
                  className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink hover:border-emerald hover:text-mint transition">
                  {a}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function MemoryFeature({ story }: { story: Story }) {
  const traits = [
    { k: "Tono preferido", v: "Melancólico / contemplativo" },
    { k: "Ritmo", v: "Pausado, escenas largas" },
    { k: "Punto fuerte", v: "Diálogos cargados de subtexto" },
    { k: "Punto a vigilar", v: "Tendencia a evitar el conflicto directo" },
    { k: "Géneros frecuentes", v: "Fantasía oscura, drama íntimo" },
  ];
  return (
    <>
      <p className="text-sm text-ink-muted">Lumi observa cómo escribes y aprende contigo. Esto le permite sugerir mejor.</p>
      <Card>
        <div className="text-[10px] uppercase tracking-widest text-mint mb-3">Perfil creativo de {story.title ? "tu autor" : "ti"}</div>
        <dl className="space-y-2">
          {traits.map((t) => (
            <div key={t.k} className="flex justify-between text-sm border-b border-hairline/40 pb-1.5">
              <dt className="text-ink-muted">{t.k}</dt>
              <dd className="text-ink text-right">{t.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs italic text-mint">"Noté que disfrutas escenas melancólicas. ¿Quieres profundizar este tono?"</p>
      </Card>
    </>
  );
}

function SceneFeature({ onInsertText, onClose }: { onInsertText?: (t: string) => void; onClose: () => void }) {
  const formats = [
    { id: "lit", label: "Literaria", text: "La lluvia caía sobre Aelar como un velo antiguo, y cada gota parecía recordar un nombre que él había olvidado." },
    { id: "cin", label: "Cinematográfica", text: "EXT. CALLE — NOCHE. La lluvia golpea el adoquín. Aelar avanza, su sombra alargada bajo las farolas amarillas." },
    { id: "dia", label: "Diálogo puro", text: "—¿Estás seguro?—\n—Nunca lo estuve.\n—Entonces sigue caminando." },
    { id: "int", label: "Narrativa intensa", text: "Avanzó. Otro paso. Otro. La lluvia. El nombre. El silencio. Todo a la vez." },
    { id: "exp", label: "Expandida", text: "Aelar caminó durante horas bajo la lluvia, recordando el día en que la ciudad ardió, las voces que lo llamaron, y la promesa que rompió en silencio frente a su hermana." },
  ];
  return (
    <>
      <p className="text-sm text-ink-muted">Toma una escena y mírala en distintos formatos. Inserta la que más te emocione.</p>
      <div className="space-y-2.5">
        {formats.map((f) => (
          <Card key={f.id}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-widest text-mint">{f.label}</div>
              <Btn onClick={() => { onInsertText?.(f.text); onClose(); toast("Insertado en tu escena"); }}>Insertar</Btn>
            </div>
            <p className="text-sm text-ink leading-relaxed font-serif whitespace-pre-wrap">{f.text}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

function DualEditorFeature({ onInsertText, onClose }: { onInsertText?: (t: string) => void; onClose: () => void }) {
  const [mode, setMode] = useState<"duro" | "creativo">("creativo");
  return (
    <>
      <p className="text-sm text-ink-muted">Alterna entre dos editores con personalidades opuestas.</p>
      <div className="flex gap-2">
        <button onClick={() => setMode("duro")}
          className={`flex-1 rounded-xl p-4 text-left border transition ${mode === "duro" ? "border-emerald bg-accent" : "border-hairline hover:border-emerald/60"}`}>
          <div className="font-serif text-lg text-ink">Editor duro</div>
          <div className="text-xs text-ink-muted mt-1">Crítica estructural, consistencia, recortes precisos.</div>
        </button>
        <button onClick={() => setMode("creativo")}
          className={`flex-1 rounded-xl p-4 text-left border transition ${mode === "creativo" ? "border-emerald bg-accent" : "border-hairline hover:border-emerald/60"}`}>
          <div className="font-serif text-lg text-ink">Editor creativo</div>
          <div className="text-xs text-ink-muted mt-1">Expande ideas, añade giros, profundiza emoción.</div>
        </button>
      </div>
      <Card glow>
        <div className="text-[10px] uppercase tracking-widest text-mint mb-2">
          Feedback {mode === "duro" ? "del editor duro" : "del editor creativo"}
        </div>
        {mode === "duro" ? (
          <ul className="text-sm text-ink space-y-1.5 list-disc pl-5">
            <li>El primer párrafo repite "lluvia" tres veces. Conserva solo la primera.</li>
            <li>El motivo del personaje no aparece hasta el capítulo 3. Adelántalo.</li>
            <li>Considera eliminar el diálogo explicativo de la página 12.</li>
          </ul>
        ) : (
          <ul className="text-sm text-ink space-y-1.5 list-disc pl-5">
            <li>¿Y si Aelar reconoce una voz familiar entre la multitud?</li>
            <li>Podrías introducir un objeto recurrente (la moneda partida) como símbolo.</li>
            <li>Un capítulo desde la perspectiva del antagonista podría dar resonancia.</li>
          </ul>
        )}
        <div className="mt-3">
          <Btn primary onClick={() => { onInsertText?.(mode === "duro" ? "[Nota del editor duro]" : "[Sugerencia creativa]"); onClose(); }}>
            Aplicar como nota
          </Btn>
        </div>
      </Card>
    </>
  );
}

function RpgFeature() {
  const badges = [
    { name: "Arquitecto de Mundos", got: true },
    { name: "Forjador de Leyendas", got: false },
    { name: "Maestro del Diálogo", got: true },
    { name: "Cronista incansable", got: false },
    { name: "Tejedor de tramas", got: true },
  ];
  return (
    <>
      <p className="text-sm text-ink-muted">Tu escritura como aventura. Sube de nivel a medida que tu mundo crece.</p>
      <Card>
        <div className="flex justify-between text-xs text-ink-muted mb-1.5">
          <span>Nivel 4 · Tejedor de Tramas</span><span>2.380 / 5.000 XP</span>
        </div>
        <div className="h-2 rounded-full bg-hairline overflow-hidden">
          <div className="h-full gradient-emerald" style={{ width: "47%" }} />
        </div>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {badges.map((b) => (
          <div key={b.name} className={`rounded-xl border p-3 text-center ${b.got ? "border-emerald bg-accent glow-border" : "border-hairline opacity-50"}`}>
            <Trophy className={`h-6 w-6 mx-auto mb-1.5 ${b.got ? "text-mint" : "text-ink-muted"}`} />
            <div className="text-xs text-ink">{b.name}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">{b.got ? "Desbloqueado" : "Por desbloquear"}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function ReaderFeature() {
  const readers = [
    { who: "Lector casual", say: "Me enganchó desde el inicio, aunque me perdí con los nombres del segundo capítulo." },
    { who: "Fan del género", say: "El sistema mágico tiene reglas claras, eso me encanta. Quiero más lore." },
    { who: "Crítico literario", say: "La prosa es lírica y eficaz; quizás demasiado contenida en las escenas de conflicto." },
    { who: "Editor profesional", say: "Estructura sólida. Recomendaría comprimir los capítulos 4 y 5 en uno." },
  ];
  return (
    <>
      <p className="text-sm text-ink-muted">Cómo percibirían tu historia distintos lectores.</p>
      <div className="space-y-2.5">
        {readers.map((r) => (
          <Card key={r.who}>
            <div className="text-[10px] uppercase tracking-widest text-mint mb-1">{r.who}</div>
            <p className="text-sm text-ink italic font-serif">"{r.say}"</p>
          </Card>
        ))}
      </div>
    </>
  );
}

function BlocksFeature({ onInsertText, onClose }: { onInsertText?: (t: string) => void; onClose: () => void }) {
  const blocks = [
    { kind: "Escena", text: "Aelar entra al claro. La luz de la luna ilumina el altar." },
    { kind: "Diálogo", text: "—No deberías estar aquí.\n—Y sin embargo, estoy." },
    { kind: "Descripción", text: "El bosque respira. Cada hoja parece recordarlo todo." },
    { kind: "Flashback", text: "Diez años atrás, en la misma piedra, juró que jamás volvería." },
    { kind: "Worldbuilding", text: "Los Guardianes del Velo solo aparecen cuando un pacto se rompe." },
  ];
  return (
    <>
      <p className="text-sm text-ink-muted">Construye con bloques inteligentes que Lumi puede analizar por separado.</p>
      <div className="space-y-2">
        {blocks.map((b) => (
          <Card key={b.kind}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] uppercase tracking-widest text-mint">{b.kind}</div>
              <Btn onClick={() => { onInsertText?.(b.text); onClose(); }}>Insertar bloque</Btn>
            </div>
            <p className="text-sm text-ink font-serif whitespace-pre-wrap">{b.text}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

function UniverseFeature() {
  return (
    <>
      <p className="text-sm text-ink-muted">Comparte tu mundo con otros autores. Lumi mantiene la continuidad.</p>
      <Card glow>
        <div className="text-sm text-ink mb-2">Universo "Crónicas de Aelar"</div>
        <div className="flex -space-x-2 mb-3">
          {["G", "M", "S", "T"].map((c, i) => (
            <div key={i} className="h-8 w-8 rounded-full gradient-emerald text-primary-foreground flex items-center justify-center text-xs border-2 border-paper-elevated">
              {c}
            </div>
          ))}
        </div>
        <div className="text-xs text-ink-muted">4 autores · 18 personajes compartidos · 3 hilos abiertos</div>
        <div className="mt-3 flex gap-2">
          <Btn primary onClick={() => toast("Invitación copiada al portapapeles")}>Invitar colaborador</Btn>
          <Btn onClick={() => toast("Próximamente: control de versiones colaborativo")}>Reglas de continuidad</Btn>
        </div>
      </Card>
    </>
  );
}

function PublishFeature() {
  return (
    <>
      <p className="text-sm text-ink-muted">Prepara tu manuscrito para el mundo.</p>
      <div className="grid grid-cols-2 gap-3">
        {["Portada IA", "Sinopsis", "EPUB/PDF", "Maquetado"].map((x) => (
          <Card key={x}>
            <div className="font-serif text-base text-ink">{x}</div>
            <div className="text-xs text-ink-muted mt-1">Listo para previsualizar.</div>
            <div className="mt-2"><Btn onClick={() => toast(`${x}: vista previa generada`)}>Abrir</Btn></div>
          </Card>
        ))}
      </div>
    </>
  );
}

function AntiFeature() {
  const [draft, setDraft] = useState(false);
  return (
    <>
      <p className="text-sm text-ink-muted">Modo borrador libre: escribe sin que Lumi te corrija. Solo flujo.</p>
      <Card>
        <label className="flex items-center justify-between">
          <span className="text-sm text-ink">Activar modo borrador libre</span>
          <button onClick={() => { setDraft(!draft); toast(draft ? "Modo borrador desactivado" : "Modo borrador activado: deja fluir."); }}
            className={`h-6 w-11 rounded-full relative transition ${draft ? "bg-emerald" : "bg-hairline"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper-elevated transition ${draft ? "left-5" : "left-0.5"}`} />
          </button>
        </label>
        <p className="mt-3 text-xs italic text-ink-muted">Lumi marcará tus secciones como "rugosas" o "pulidas" sin interrumpir.</p>
      </Card>
    </>
  );
}

function CanonFeature({ story }: { story: Story }) {
  const events = [
    { ch: "Cap. 1", ev: "Aelar descubre la moneda partida" },
    { ch: "Cap. 3", ev: "Mira revela su verdadero nombre" },
    { ch: "Cap. 5", ev: "Cae la ciudad de Veyra" },
    { ch: "Cap. 7", ev: "El pacto se rompe" },
  ];
  return (
    <>
      <p className="text-sm text-ink-muted">Tus momentos canon, en una línea de tiempo visual.</p>
      <Card>
        <div className="relative pl-5 space-y-3 border-l border-emerald/40">
          {events.map((e, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[26px] top-1 h-3 w-3 rounded-full gradient-emerald shadow-glow-sm" />
              <div className="text-[10px] uppercase tracking-widest text-mint">{e.ch}</div>
              <div className="text-sm text-ink font-serif">{e.ev}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-ink-muted">{story.chapters.length} capítulos · {events.length} eventos canon</div>
      </Card>
    </>
  );
}

function DailyFeature() {
  const today = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
  const prompts = [
    "Un personaje encuentra una carta dirigida a sí mismo, escrita con su propia letra, fechada el año que aún no llega.",
    "Dos enemigos comparten refugio durante una tormenta. Solo uno saldrá vivo, pero ninguno lo sabe todavía.",
    "Una ciudad donde todos olvidan a una persona específica cada amanecer.",
  ];
  return (
    <>
      <p className="text-sm text-ink-muted capitalize">Inspiración para {today}</p>
      <div className="space-y-2.5">
        {prompts.map((p, i) => (
          <Card key={i} glow>
            <p className="text-sm text-ink font-serif italic">"{p}"</p>
            <div className="mt-2"><Btn onClick={() => toast("Prompt guardado en tu lienzo")}>Usar como semilla</Btn></div>
          </Card>
        ))}
      </div>
    </>
  );
}

function StyleFeature({ onInsertText, onClose }: { onInsertText?: (t: string) => void; onClose: () => void }) {
  const styles = [
    { id: "epic", label: "Épico", text: "Y entonces Aelar alzó la mirada, y el cielo entero se inclinó ante su nombre olvidado." },
    { id: "min", label: "Minimalista", text: "Aelar miró. El cielo también." },
    { id: "dark", label: "Oscuro", text: "Aelar abrió los ojos. La oscuridad ya lo conocía por su nombre." },
    { id: "poet", label: "Poético", text: "Aelar, sombra de sí mismo, oyó al viento pronunciar la palabra que él nunca se atrevió a decir." },
    { id: "cine", label: "Cinematográfico", text: "PRIMER PLANO de Aelar. Sus pupilas se dilatan. CORTE A: el cielo se quiebra en silencio." },
  ];
  return (
    <>
      <p className="text-sm text-ink-muted">Reescribe el mismo fragmento en estilos distintos.</p>
      <div className="space-y-2.5">
        {styles.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] uppercase tracking-widest text-mint">{s.label}</div>
              <Btn onClick={() => { onInsertText?.(s.text); onClose(); }}>Aplicar</Btn>
            </div>
            <p className="text-sm text-ink font-serif">{s.text}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

function CoauthorFeature({ onInsertText, onClose }: { onInsertText?: (t: string) => void; onClose: () => void }) {
  const lines = [
    "...y entonces ella dijo el nombre que él había jurado no escuchar nunca más.",
    "...la llama vaciló, como si dudara entre arder o morir.",
    "...el silencio que siguió no era ausencia, sino respuesta.",
  ];
  return (
    <>
      <p className="text-sm text-ink-muted">Lumi propone continuaciones línea a línea. Acepta, refina o ignora.</p>
      <div className="space-y-2.5">
        {lines.map((l, i) => (
          <Card key={i}>
            <p className="text-sm text-ink font-serif italic">{l}</p>
            <div className="mt-2 flex gap-2">
              <Btn primary onClick={() => { onInsertText?.(l); onClose(); }}>Aceptar línea</Btn>
              <Btn onClick={() => toast("Lumi pensará otra alternativa")}>Refinar</Btn>
              <Btn onClick={() => toast("Línea descartada")}>Ignorar</Btn>
            </div>
          </Card>
        ))}
      </div>
      <p className="text-xs italic text-ink-muted flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-mint" />
        Tu voz siempre dirige. Lumi solo acompaña.
      </p>
    </>
  );
}
