import { supabase } from "@/integrations/supabase/client";
import { setUser, getUser, type User, type ThemeMode, type ImmersionTheme, type AiSpecialist, type Plan } from "@/lib/store";

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
export function initAuth() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  void hydrateUserFromSession();
  supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) { setUser(null); return; }
    setTimeout(() => { void hydrateUserFromSession(); }, 0);
  });
}

export async function persistUserPatch(patch: Partial<User>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.plan !== undefined) row.plan = patch.plan;
  if (patch.proactiveNudges !== undefined) row.proactive_nudges = patch.proactiveNudges;
  if (patch.fontSize !== undefined) row.font_size = patch.fontSize;
  if (patch.theme !== undefined) row.theme = patch.theme;
  if (patch.xp !== undefined) row.xp = patch.xp;
  if (patch.immersionTheme !== undefined) row.immersion_theme = patch.immersionTheme;
  if (patch.specialist !== undefined) row.specialist = patch.specialist;
  if (patch.agentOverrides !== undefined) row.agent_overrides = patch.agentOverrides;
  await supabase.from("profiles").update(row).eq("id", session.user.id);
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
