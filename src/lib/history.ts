// Per-scene undo/redo + version snapshots, persisted in localStorage.
import { useSyncExternalStore } from "react";

const KEY = "everlore:history";
const SNAPSHOT_KEY = "everlore:snapshots";
const MAX_UNDO = 80;
const MAX_SNAPSHOTS_PER_SCENE = 40;

type Stack = { past: string[]; future: string[]; last?: string };
type HistoryMap = Record<string, Stack>;

export interface Snapshot {
  id: string;
  sceneId: string;
  storyId: string;
  ts: number;
  label: string;
  content: string;
  words: number;
}

const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }

function read<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fb; } catch { return fb; }
}
function write(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
  notify();
}

function getHistory(): HistoryMap { return read<HistoryMap>(KEY, {}); }
function setHistory(m: HistoryMap) { write(KEY, m); }

export function getSnapshots(): Snapshot[] { return read<Snapshot[]>(SNAPSHOT_KEY, []); }
function setSnapshots(s: Snapshot[]) { write(SNAPSHOT_KEY, s); }

const uid = () => Math.random().toString(36).slice(2, 11);

function wordsOf(html: string) {
  const t = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return t ? t.split(" ").length : 0;
}

// --- Undo/Redo ---
export function recordChange(sceneId: string, content: string) {
  const m = getHistory();
  const s = m[sceneId] ?? { past: [], future: [] };
  if (s.last === content) return;
  if (s.last !== undefined) {
    s.past.push(s.last);
    if (s.past.length > MAX_UNDO) s.past.shift();
  }
  s.last = content;
  s.future = [];
  m[sceneId] = s;
  setHistory(m);
}

export function seedScene(sceneId: string, content: string) {
  const m = getHistory();
  if (!m[sceneId]) {
    m[sceneId] = { past: [], future: [], last: content };
    setHistory(m);
  }
}

export function undo(sceneId: string, current: string): string | null {
  const m = getHistory();
  const s = m[sceneId];
  if (!s || s.past.length === 0) return null;
  const prev = s.past.pop()!;
  s.future.unshift(current);
  s.last = prev;
  m[sceneId] = s;
  setHistory(m);
  return prev;
}

export function redo(sceneId: string, current: string): string | null {
  const m = getHistory();
  const s = m[sceneId];
  if (!s || s.future.length === 0) return null;
  const next = s.future.shift()!;
  s.past.push(current);
  s.last = next;
  m[sceneId] = s;
  setHistory(m);
  return next;
}

export function canUndo(sceneId: string): boolean {
  return (getHistory()[sceneId]?.past.length ?? 0) > 0;
}
export function canRedo(sceneId: string): boolean {
  return (getHistory()[sceneId]?.future.length ?? 0) > 0;
}

export function useHistoryState(sceneId: string) {
  const snap = useSyncExternalStore(
    subscribe,
    () => {
      const s = getHistory()[sceneId];
      return `${s?.past.length ?? 0}:${s?.future.length ?? 0}`;
    },
    () => "0:0",
  );
  const [p, f] = snap.split(":").map(Number);
  return { canUndo: p > 0, canRedo: f > 0 };
}

// --- Snapshots ---
export function snapshot(storyId: string, sceneId: string, content: string, label: string) {
  const all = getSnapshots();
  const sceneSnaps = all.filter((s) => s.sceneId === sceneId);
  // Skip if identical to last
  if (sceneSnaps[0]?.content === content) return;
  const entry: Snapshot = {
    id: uid(), sceneId, storyId, ts: Date.now(),
    label, content, words: wordsOf(content),
  };
  const others = all.filter((s) => s.sceneId !== sceneId);
  const kept = [entry, ...sceneSnaps].slice(0, MAX_SNAPSHOTS_PER_SCENE);
  setSnapshots([...kept, ...others].sort((a, b) => b.ts - a.ts));
}

export function useSceneSnapshots(sceneId: string): Snapshot[] {
  const snap = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(SNAPSHOT_KEY) ?? "[]",
    () => "[]",
  );
  try {
    return (JSON.parse(snap) as Snapshot[])
      .filter((s) => s.sceneId === sceneId)
      .sort((a, b) => b.ts - a.ts);
  } catch { return []; }
}

export function deleteSnapshot(id: string) {
  setSnapshots(getSnapshots().filter((s) => s.id !== id));
}
