import { useEffect, useState, useSyncExternalStore } from "react";

// ============ Types ============
export type Plan = "free" | "cronista" | "leyenda";
export type ImmersionTheme = "ninguno" | "biblioteca" | "lluvia" | "bosque" | "arcano" | "cyberpunk" | "espacio";
export type AiSpecialist = "lumi" | "editor" | "fantasia" | "romance" | "mundos" | "terror" | "dialogos" | "coach";

export type ThemeMode = "noche" | "alba" | "dia";
export interface AgentOverride { name?: string; tagline?: string; }
export interface User {
  name: string;
  email: string;
  plan: Plan;
  proactiveNudges: boolean;
  fontSize: number;
  theme: ThemeMode;
  xp: number;
  immersionTheme: ImmersionTheme;
  specialist: AiSpecialist;
  agentOverrides?: Partial<Record<AiSpecialist, AgentOverride>>;
}

export interface Scene {
  id: string;
  title: string;
  content: string;
}
export interface Chapter {
  id: string;
  title: string;
  scenes: Scene[];
}
export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  traits: string;
  goals: string;
  notes: string;
}
export interface Place { id: string; name: string; description: string; }
export interface PlotThread {
  id: string;
  title: string;
  status: "abierto" | "en_desarrollo" | "resuelto";
  notes: string;
  lastChapterTouched?: number;
}
export interface TimelineEvent { id: string; title: string; notes: string; }
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
  specialist?: AiSpecialist;
}
export interface Draft { id: string; prompt: string; text: string; ts: number; }
export interface Nudge { id: string; text: string; dismissed?: boolean; }
export interface Story {
  id: string;
  title: string;
  logline: string;
  coverColor: string;
  createdAt: number;
  updatedAt: number;
  lastOpenedSceneId?: string;
  chapters: Chapter[];
  bible: {
    characters: Character[];
    places: Place[];
    plotThreads: PlotThread[];
    timeline: TimelineEvent[];
    voice: string;
  };
  conversation: ChatMessage[];
  drafts: Draft[];
  nudges: Nudge[];
}

const KEYS = { user: "everlore:user", stories: "everlore:stories" };
const uid = () => Math.random().toString(36).slice(2, 11);

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; }
  catch { return fallback; }
}
function writeJSON(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val)); notify();
}
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }

// ============ User ============
function migrateUser(raw: unknown): User | null {
  if (!raw || typeof raw !== "object") return null;
  const u = raw as Record<string, unknown>;
  const plan = u.plan === "author" || u.plan === "leyenda" ? "leyenda"
    : u.plan === "cronista" ? "cronista" : "free";
  return {
    name: (u.name as string) ?? "Gabriel Calderón",
    email: (u.email as string) ?? "",
    plan,
    proactiveNudges: (u.proactiveNudges as boolean) ?? true,
    fontSize: (u.fontSize as number) ?? 19,
    theme: (u.theme === "alba" || u.theme === "dia" ? u.theme : u.theme === "light" ? "dia" : "noche") as ThemeMode,
    xp: (u.xp as number) ?? 0,
    immersionTheme: (u.immersionTheme as ImmersionTheme) ?? "ninguno",
    specialist: (u.specialist as AiSpecialist) ?? "lumi",
    agentOverrides: (u.agentOverrides as User["agentOverrides"]) ?? {},
  };
}

export function getUser(): User | null {
  const raw = readJSON<unknown>(KEYS.user, null);
  return migrateUser(raw);
}
export function setUser(u: User | null) {
  if (u) writeJSON(KEYS.user, u);
  else { localStorage.removeItem(KEYS.user); notify(); }
}
export function updateUser(patch: Partial<User>) {
  const u = getUser(); if (!u) return; setUser({ ...u, ...patch });
  // Fire-and-forget DB sync (no-op when not signed in).
  void import("@/lib/auth").then((m) => m.pushPatchAsync(patch));
}

export function useUser() {
  const snap = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEYS.user) ?? "",
    () => ""
  );
  if (!snap) return null;
  try { return migrateUser(JSON.parse(snap)); } catch { return null; }
}

// ============ Stories ============
export function getStories(): Story[] { return readJSON<Story[]>(KEYS.stories, []); }
export function setStoriesLocal(s: Story[]) { writeJSON(KEYS.stories, s); }

export function upsertStoryLocal(story: Story) {
  const stories = getStories();
  const idx = stories.findIndex((s) => s.id === story.id);
  if (idx >= 0) stories[idx] = story;
  else stories.unshift(story);
  setStoriesLocal(stories);
}

export function useStories(): Story[] {
  const snap = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEYS.stories) ?? "[]",
    () => "[]"
  );
  return JSON.parse(snap) as Story[];
}

export function useStory(id: string | undefined): Story | undefined {
  return useStories().find((s) => s.id === id);
}

const COVER_COLORS = ["#10B981", "#34D399", "#059669", "#22D3EE", "#7C3AED", "#0EA5E9"];

function buildStory(input: { title?: string; logline?: string; coverColor?: string }): Story {
  const now = Date.now();
  const firstSceneId = uid();
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : uid(),
    title: input.title?.trim() || "Sin título",
    logline: input.logline?.trim() || "",
    coverColor: input.coverColor || COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)],
    createdAt: now,
    updatedAt: now,
    lastOpenedSceneId: firstSceneId,
    chapters: [{ id: uid(), title: "Capítulo 1", scenes: [{ id: firstSceneId, title: "Escena inicial", content: "" }] }],
    bible: { characters: [], places: [], plotThreads: [], timeline: [], voice: "" },
    conversation: [], drafts: [], nudges: [],
  };
}

/**
 * Creates a story, persisting to Supabase first so the plan limit is enforced server-side.
 */
export async function createStory(input: { title?: string; logline?: string; coverColor?: string }): Promise<{ ok: true; story: Story } | { ok: false; error: string }> {
  const story = buildStory(input);
  const sync = await import("@/lib/stories-sync");
  const res = await sync.pushCreateStory(story);
  if (!res.ok) {
    if (sync.isPlanLimitError(res.error)) {
      return { ok: false, error: "Has alcanzado el límite de historias de tu plan." };
    }
    return { ok: false, error: res.error };
  }
  setStoriesLocal([res.story, ...getStories()]);
  return { ok: true, story: res.story };
}

export function updateStory(id: string, updater: (s: Story) => Story) {
  const all = getStories();
  const idx = all.findIndex((s) => s.id === id); if (idx < 0) return;
  const next = updater(all[idx]); next.updatedAt = Date.now();
  all[idx] = next; setStoriesLocal(all);
  void import("@/lib/stories-sync").then((m) => m.scheduleStoryPush(next));
}

export function deleteStory(id: string) {
  setStoriesLocal(getStories().filter((s) => s.id !== id));
  void import("@/lib/stories-sync").then((m) => m.pushDeleteStory(id));
}

export const planLimits: Record<Plan, number> = {
  free: 1,
  cronista: 3,
  leyenda: 5,
};

export const planLabels: Record<Plan, string> = {
  free: "Aprendiz",
  cronista: "Cronista",
  leyenda: "Leyenda",
};

export function canCreateStory(user: User | null): boolean {
  if (!user) return false;
  return getStories().length < planLimits[user.plan];
}

export const coverColors = COVER_COLORS;
export const newId = uid;

// ============ Time helpers ============
export function timeOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function relativeEs(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "hace un momento";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ayer";
  if (d < 30) return `hace ${d} días`;
  const mo = Math.floor(d / 30);
  return `hace ${mo} mes${mo > 1 ? "es" : ""}`;
}

export function wordCount(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(" ").length;
}

export function storyWordCount(s: Story): number {
  return s.chapters.reduce((a, c) => a + c.scenes.reduce((b, sc) => b + wordCount(sc.content), 0), 0);
}

// ============ Gamificación ============
export interface Rank { level: number; title: string; nextXp: number; progress: number; }

const RANKS: { min: number; title: string }[] = [
  { min: 0, title: "Aprendiz de Tinta" },
  { min: 500, title: "Cronista Emergente" },
  { min: 2000, title: "Tejedor de Tramas" },
  { min: 5000, title: "Arquitecto de Mundos" },
  { min: 12000, title: "Maestro del Diálogo" },
  { min: 25000, title: "Forjador de Leyendas" },
  { min: 50000, title: "Cronista Arcano" },
];

export function computeRank(xp: number): Rank {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].min) idx = i;
  const current = RANKS[idx];
  const next = RANKS[idx + 1];
  const nextXp = next ? next.min : current.min;
  const progress = next ? (xp - current.min) / (next.min - current.min) : 1;
  return { level: idx + 1, title: current.title, nextXp, progress: Math.min(1, Math.max(0, progress)) };
}

export interface Achievement { id: string; title: string; description: string; unlocked: boolean; }
export function computeAchievements(stories: Story[]): Achievement[] {
  const totalWords = stories.reduce((a, s) => a + storyWordCount(s), 0);
  const chars = stories.reduce((a, s) => a + s.bible.characters.length, 0);
  const chapters = stories.reduce((a, s) => a + s.chapters.length, 0);
  return [
    { id: "first-spark", title: "Primera chispa", description: "Crea tu primera historia.", unlocked: stories.length >= 1 },
    { id: "world-builder", title: "Constructor de mundos", description: "Define 3 personajes en una biblia.", unlocked: chars >= 3 },
    { id: "first-thousand", title: "El primer millar", description: "Escribe 1.000 palabras.", unlocked: totalWords >= 1000 },
    { id: "chronicler", title: "Cronista incansable", description: "Escribe 5.000 palabras.", unlocked: totalWords >= 5000 },
    { id: "structure-master", title: "Maestro de la estructura", description: "Crea 5 capítulos.", unlocked: chapters >= 5 },
    { id: "legend", title: "Forjador de leyendas", description: "Alcanza 10.000 palabras.", unlocked: totalWords >= 10000 },
  ];
}

// ============ Story Health (mock metrics) ============
export interface HealthMetric { key: string; label: string; value: number; }
export function computeStoryHealth(s: Story): HealthMetric[] {
  const words = storyWordCount(s);
  const chars = s.bible.characters.length;
  const places = s.bible.places.length;
  const threads = s.bible.plotThreads.length;
  const timeline = s.bible.timeline.length;
  const voice = s.bible.voice.length;
  const clamp = (n: number, max = 100) => Math.max(8, Math.min(max, Math.round(n)));
  return [
    { key: "pacing", label: "Ritmo narrativo", value: clamp(40 + Math.min(50, words / 60)) },
    { key: "characters", label: "Desarrollo de personajes", value: clamp(20 + chars * 12) },
    { key: "world", label: "Consistencia del mundo", value: clamp(15 + places * 10 + voice / 8) },
    { key: "tension", label: "Tensión emocional", value: clamp(30 + threads * 9) },
    { key: "mystery", label: "Misterio", value: clamp(25 + threads * 7 + timeline * 4) },
    { key: "lore", label: "Profundidad del lore", value: clamp(10 + voice / 4 + places * 6) },
    { key: "dialogue", label: "Calidad de diálogos", value: clamp(35 + Math.min(40, words / 80)) },
    { key: "evolution", label: "Evolución de personajes", value: clamp(20 + chars * 9 + timeline * 3) },
  ];
}

// Apply theme
export function useApplyTheme() {
  const user = useUser();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light", "theme-noche", "theme-alba", "theme-dia");
    const t = user?.theme ?? "noche";
    root.classList.add(`theme-${t}`);
    // "noche" = dark default (no extra var override); alba & dia override tokens.
  }, [user?.theme]);
}

export function useStorageSync() {
  const [, set] = useState(0);
  useEffect(() => {
    const fn = () => set((n) => n + 1);
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  }, []);
}

// ============ AI Specialists ============
export const SPECIALISTS: { id: AiSpecialist; name: string; tagline: string; tone: string }[] = [
  { id: "lumi",     name: "Lumi",            tagline: "Espíritu narrativo", tone: "cálida, mística, intuitiva" },
  { id: "editor",   name: "El Editor",       tagline: "Crítico riguroso",   tone: "directa, exigente, precisa" },
  { id: "fantasia", name: "Aelar",           tagline: "Maestro de fantasía", tone: "épica, evocadora, antigua" },
  { id: "romance",  name: "Mira",            tagline: "Voz del romance",     tone: "íntima, sensorial, cálida" },
  { id: "mundos",   name: "Vael",            tagline: "Constructor de mundos", tone: "estructurada, vasta, lógica" },
  { id: "terror",   name: "Nox",             tagline: "Susurro del terror",  tone: "fría, inquietante, pausada" },
  { id: "dialogos", name: "Eco",             tagline: "Especialista en diálogos", tone: "rítmica, viva, teatral" },
  { id: "coach",    name: "Lyra",            tagline: "Coach creativa",      tone: "empática, motivadora, suave" },
];

export function resolveSpecialist(id: AiSpecialist, user: User | null) {
  const base = SPECIALISTS.find((s) => s.id === id) ?? SPECIALISTS[0];
  const o = user?.agentOverrides?.[id];
  return { ...base, name: o?.name?.trim() || base.name, tagline: o?.tagline?.trim() || base.tagline };
}
