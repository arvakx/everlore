import { useEffect, useState, useSyncExternalStore } from "react";

// ============ Types ============
export interface User {
  name: string;
  email: string;
  plan: "free" | "author";
  proactiveNudges: boolean;
  fontSize: number;
  theme: "light" | "dark";
}

export interface Scene {
  id: string;
  title: string;
  content: string; // HTML
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
export interface Place {
  id: string;
  name: string;
  description: string;
}
export interface PlotThread {
  id: string;
  title: string;
  status: "abierto" | "en_desarrollo" | "resuelto";
  notes: string;
  lastChapterTouched?: number;
}
export interface TimelineEvent {
  id: string;
  title: string;
  notes: string;
}
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}
export interface Draft {
  id: string;
  prompt: string;
  text: string;
  ts: number;
}
export interface Nudge {
  id: string;
  text: string;
  dismissed?: boolean;
}
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

const KEYS = {
  user: "writedy:user",
  stories: "writedy:stories",
};

const uid = () => Math.random().toString(36).slice(2, 11);

// ============ Pub/sub store ============
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
  notify();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// ============ User ============
export function getUser(): User | null {
  return readJSON<User | null>(KEYS.user, null);
}
export function setUser(u: User | null) {
  if (u) writeJSON(KEYS.user, u);
  else {
    localStorage.removeItem(KEYS.user);
    notify();
  }
}
export function updateUser(patch: Partial<User>) {
  const u = getUser();
  if (!u) return;
  setUser({ ...u, ...patch });
}

export function useUser() {
  const snap = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEYS.user) ?? "",
    () => ""
  );
  return snap ? (JSON.parse(snap) as User) : null;
}

// ============ Stories ============
export function getStories(): Story[] {
  return readJSON<Story[]>(KEYS.stories, []);
}
function setStories(s: Story[]) {
  writeJSON(KEYS.stories, s);
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

const COVER_COLORS = ["#C9743C", "#3E6B66", "#7C5C8A", "#5C7A52", "#A85C2C", "#4A6680"];

export function createStory(input: { title?: string; logline?: string; coverColor?: string }): Story {
  const now = Date.now();
  const firstSceneId = uid();
  const story: Story = {
    id: uid(),
    title: input.title?.trim() || "Sin título",
    logline: input.logline?.trim() || "",
    coverColor: input.coverColor || COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)],
    createdAt: now,
    updatedAt: now,
    lastOpenedSceneId: firstSceneId,
    chapters: [
      {
        id: uid(),
        title: "Capítulo 1",
        scenes: [{ id: firstSceneId, title: "Escena inicial", content: "" }],
      },
    ],
    bible: { characters: [], places: [], plotThreads: [], timeline: [], voice: "" },
    conversation: [],
    drafts: [],
    nudges: [],
  };
  setStories([story, ...getStories()]);
  return story;
}

export function updateStory(id: string, updater: (s: Story) => Story) {
  const all = getStories();
  const idx = all.findIndex((s) => s.id === id);
  if (idx < 0) return;
  const next = updater(all[idx]);
  next.updatedAt = Date.now();
  all[idx] = next;
  setStories(all);
}

export function deleteStory(id: string) {
  setStories(getStories().filter((s) => s.id !== id));
}

export const planLimits = {
  free: 1,
  author: Infinity,
};

export function canCreateStory(user: User | null): boolean {
  if (!user) return false;
  const limit = planLimits[user.plan];
  return getStories().length < limit;
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
  return s.chapters.reduce(
    (a, c) => a + c.scenes.reduce((b, sc) => b + wordCount(sc.content), 0),
    0
  );
}

// Apply dark theme based on user
export function useApplyTheme() {
  const user = useUser();
  useEffect(() => {
    const root = document.documentElement;
    if (user?.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [user?.theme]);
}

// Force re-render on storage changes from other tabs
export function useStorageSync() {
  const [, set] = useState(0);
  useEffect(() => {
    const fn = () => set((n) => n + 1);
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  }, []);
}
