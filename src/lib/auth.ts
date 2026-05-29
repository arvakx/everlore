import { supabase } from "@/integrations/supabase/client";
import { setUser, setStoriesLocal, getUser, type User, type ThemeMode, type ImmersionTheme, type AiSpecialist, type Plan } from "@/lib/store";

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  plan: string;
  proactive_nudges: boolean;
  font_size: number;
  theme: string;
  xp: number;
  immersion_theme: string;
  specialist: string;
  agent_overrides: Record<string, { name?: string; tagline?: string }> | null;
};

function rowToUser(row: ProfileRow): User {
  return {
    name: row.name || "Escritor",
    email: row.email || "",
    plan: (["free", "cronista", "leyenda"].includes(row.plan) ? row.plan : "free") as Plan,
    proactiveNudges: row.proactive_nudges,
    fontSize: row.font_size,
    theme: (["noche", "alba", "dia"].includes(row.theme) ? row.theme : "noche") as ThemeMode,
    xp: row.xp,
    immersionTheme: (row.immersion_theme || "ninguno") as ImmersionTheme,
    specialist: (row.specialist || "lumi") as AiSpecialist,
    agentOverrides: row.agent_overrides ?? {},
  };
}

export async function hydrateUserFromSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { setUser(null); return; }
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();
  if (error) { console.error("profile fetch", error); return; }
  if (data) setUser(rowToUser(data as ProfileRow));
}

let initialized = false;
let authReady = false;
const readyListeners = new Set<() => void>();
export function isAuthReady() { return authReady; }
export function subscribeAuthReady(cb: () => void) {
  readyListeners.add(cb);
  return () => { readyListeners.delete(cb); };
}
function markReady() {
  authReady = true;
  readyListeners.forEach((l) => l());
}
export function initAuth() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  void hydrateUserFromSession().finally(markReady);
  supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) { setUser(null); markReady(); return; }
    setTimeout(() => { void hydrateUserFromSession().finally(markReady); }, 0);
  });
}

import { useSyncExternalStore } from "react";
export function useAuthReady() {
  return useSyncExternalStore(subscribeAuthReady, isAuthReady, () => false);
}


export async function persistUserPatch(patch: Partial<User>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const row = {
    updated_at: new Date().toISOString(),
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.email !== undefined ? { email: patch.email } : {}),
    ...(patch.plan !== undefined ? { plan: patch.plan } : {}),
    ...(patch.proactiveNudges !== undefined ? { proactive_nudges: patch.proactiveNudges } : {}),
    ...(patch.fontSize !== undefined ? { font_size: patch.fontSize } : {}),
    ...(patch.theme !== undefined ? { theme: patch.theme } : {}),
    ...(patch.xp !== undefined ? { xp: patch.xp } : {}),
    ...(patch.immersionTheme !== undefined ? { immersion_theme: patch.immersionTheme } : {}),
    ...(patch.specialist !== undefined ? { specialist: patch.specialist } : {}),
    ...(patch.agentOverrides !== undefined ? { agent_overrides: patch.agentOverrides } : {}),
  };
  await supabase.from("profiles").update(row as never).eq("id", session.user.id);
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: { name },
    },
  });
  if (error) throw error;
  if (data.session) {
    await supabase.from("profiles").update({ name, email }).eq("id", data.user!.id);
  }
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
  setUser(null);
}

export function pushPatchAsync(patch: Partial<User>) {
  void persistUserPatch(patch);
}

void getUser;
