import { supabase } from "@/integrations/supabase/client";
import type { Story } from "@/lib/store";
import type { Json } from "@/integrations/supabase/types";

type StoryRow = {
  id: string;
  user_id: string;
  title: string;
  logline: string;
  cover_color: string;
  data: Json;
  created_at: string;
  updated_at: string;
};

type StoryData = Omit<Story, "id" | "title" | "logline" | "coverColor" | "createdAt" | "updatedAt">;

function splitStory(story: Story): { columns: { title: string; logline: string; cover_color: string }; data: StoryData & { createdAt: number; updatedAt: number } } {
  const { id: _id, title, logline, coverColor, createdAt, updatedAt, ...rest } = story;
  void _id;
  return {
    columns: { title, logline, cover_color: coverColor },
    data: { ...rest, createdAt, updatedAt },
  };
}

export function rowToStory(row: StoryRow): Story {
  const d = (row.data ?? {}) as Partial<Story>;
  return {
    id: row.id,
    title: row.title,
    logline: row.logline,
    coverColor: row.cover_color,
    createdAt: d.createdAt ?? new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    lastOpenedSceneId: d.lastOpenedSceneId,
    chapters: d.chapters ?? [],
    bible: d.bible ?? { characters: [], places: [], plotThreads: [], timeline: [], voice: "" },
    conversation: d.conversation ?? [],
    drafts: d.drafts ?? [],
    nudges: d.nudges ?? [],
  };
}

export async function pullAllStories(): Promise<Story[] | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) { console.error("pullAllStories", error); return null; }
  return (data as StoryRow[]).map(rowToStory);
}

export async function pullStoryById(id: string): Promise<Story | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) { console.error("pullStoryById", error); return null; }
  return data ? rowToStory(data as StoryRow) : null;
}

export async function pushCreateStory(story: Story): Promise<{ ok: true; story: Story } | { ok: false; error: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: "Sin sesión" };
  const split = splitStory(story);
  const { data, error } = await supabase
    .from("stories")
    .insert({
      id: story.id,
      user_id: session.user.id,
      ...split.columns,
      data: split.data as unknown as Json,
    })
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, story: rowToStory(data as StoryRow) };
}

// Debounced per-story update push
const pending = new Map<string, ReturnType<typeof setTimeout>>();

export function scheduleStoryPush(story: Story, delay = 800) {
  const existing = pending.get(story.id);
  if (existing) clearTimeout(existing);
  pending.set(
    story.id,
    setTimeout(() => {
      pending.delete(story.id);
      void pushUpdateStoryNow(story);
    }, delay),
  );
}

async function pushUpdateStoryNow(story: Story) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const split = splitStory(story);
  const { error } = await supabase
    .from("stories")
    .update({
      ...split.columns,
      data: split.data as unknown as Json,
    })
    .eq("id", story.id);
  if (error) console.error("pushUpdateStory", error);
}

export async function pushDeleteStory(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const { error } = await supabase.from("stories").delete().eq("id", id);
  if (error) console.error("pushDeleteStory", error);
}

// Plan limit messages
export function isPlanLimitError(message: string): boolean {
  return /Plan limit reached/i.test(message);
}
