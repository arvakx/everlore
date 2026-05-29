import type { Story, Chapter, Scene } from "./store";
import { wordCount } from "./store";

// Mock assistant that references the user's actual story content.

function pickCharacterName(story: Story): string | null {
  if (story.bible.characters.length === 0) return null;
  return story.bible.characters[Math.floor(Math.random() * story.bible.characters.length)].name;
}

function currentScene(story: Story): { chapter: Chapter; scene: Scene } | null {
  for (const ch of story.chapters) {
    for (const sc of ch.scenes) {
      if (sc.id === story.lastOpenedSceneId) return { chapter: ch, scene: sc };
    }
  }
  if (story.chapters[0]?.scenes[0]) {
    return { chapter: story.chapters[0], scene: story.chapters[0].scenes[0] };
  }
  return null;
}

export function generateNudges(story: Story): string[] {
  const out: string[] = [];
  const cur = currentScene(story);
  const totalWords = story.chapters.reduce(
    (a, c) => a + c.scenes.reduce((b, sc) => b + wordCount(sc.content), 0),
    0
  );

  if (totalWords === 0) {
    out.push(
      `«${story.title}» está esperándote. ¿Quieres que te proponga un comienzo, o prefieres contarme tu idea?`
    );
  }

  const ch = pickCharacterName(story);
  if (ch && totalWords > 200) {
    out.push(
      `Llevas un rato sin mencionar a ${ch}. ¿Quieres retomar su hilo? Podría ser un buen momento.`
    );
  }

  if (cur && wordCount(cur.scene.content) > 0 && wordCount(cur.scene.content) < 120) {
    out.push(
      `«${cur.scene.title}» se siente más corta que el resto. ¿Quieres que exploremos qué más podría pasar aquí?`
    );
  }

  const openThread = story.bible.plotThreads.find((t) => t.status !== "resuelto");
  if (openThread && totalWords > 400) {
    out.push(
      `Hace varios capítulos que no tocas el hilo «${openThread.title}». ¿Lo retomamos en esta escena?`
    );
  }

  if (out.length === 0) {
    out.push(
      cur
        ? `Vas bien en «${cur.scene.title}». Si te trabas, dime «desbloquéame» y te tiro un par de hilos.`
        : `Estoy aquí cuando quieras. Puedes pedirme ideas, descripciones, o que profundice un personaje.`
    );
  }

  return out.slice(0, 2);
}

export function generateReentryLine(story: Story): { summary: string; thread: string } {
  const cur = currentScene(story);
  const lastEdited = new Date(story.updatedAt);
  const today = new Date();
  const sameDay = lastEdited.toDateString() === today.toDateString();
  const when = sameDay ? "hoy" : "la última vez";
  const wc = cur ? wordCount(cur.scene.content) : 0;
  const ch = pickCharacterName(story);

  const summary = cur
    ? wc > 0
      ? `${when === "hoy" ? "Hoy" : "Ayer"} escribiste ${wc} palabras en «${story.title}». La escena «${cur.scene.title}» quedó a la mitad.`
      : `«${story.title}» te espera. La escena «${cur.scene.title}» todavía está en blanco.`
    : `«${story.title}» está lista para empezar.`;

  const thread = ch
    ? `${ch} todavía tiene algo por resolver. ¿Lo retomamos?`
    : story.logline
      ? `«${story.logline}» — hay mucho por explorar todavía.`
      : `Hay un hilo abierto esperándote. ¿Lo retomamos?`;

  return { summary, thread };
}

const ENCOURAGEMENTS = [
  "Vamos por buen camino.",
  "Esto tiene fuerza.",
  "Me gusta por dónde va.",
];

export function generateChatResponse(story: Story, userMsg: string): string {
  const msg = userMsg.toLowerCase();
  const cur = currentScene(story);
  const ch = pickCharacterName(story);
  const place = story.bible.places[0]?.name;
  const enc = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

  if (msg.includes("desbloqué") || msg.includes("no sé cómo seguir") || msg.includes("trabad")) {
    return `Cuéntame: en «${cur?.scene.title ?? "esta escena"}», ¿qué quiere ${ch ?? "tu protagonista"} en este momento exacto? A veces basta con responder eso para encontrar la siguiente frase. Si quieres, te tiro tres caminos posibles.`;
  }
  if (msg.includes("resume")) {
    const wc = story.chapters.reduce((a, c) => a + c.scenes.reduce((b, s) => b + wordCount(s.content), 0), 0);
    return `Hasta ahora llevas ${wc} palabras en «${story.title}». ${story.logline ? `La idea base que apuntaste: «${story.logline}». ` : ""}Si quieres, puedo armarte un resumen escena por escena.`;
  }
  if (msg.includes("3 ideas") || msg.includes("tres ideas") || msg.includes("ideas")) {
    return `Tres caminos posibles para «${cur?.scene.title ?? "esta escena"}»:\n\n1. ${ch ?? "Tu protagonista"} se enfrenta a una decisión incómoda que revela algo que venía escondiendo.\n2. Aparece un detalle pequeño del entorno que cambia el tono de la escena.\n3. Otro personaje irrumpe y obliga a cambiar el rumbo.\n\n¿Te interesa que desarrolle alguno?`;
  }
  if (msg.includes("describe")) {
    return `Para describir ${place ? `«${place}»` : "este lugar"}, dime: ¿qué hora del día es y qué siente ${ch ?? "tu protagonista"} al estar ahí? Con eso te puedo armar un pasaje que respete el tono de tu historia.`;
  }
  if (msg.includes("profundiza") || msg.includes("personaje")) {
    return `${ch ? `Sobre ${ch}: ` : ""}cuéntame qué teme y qué desea por encima de todo. Con esos dos vectores, sus decisiones empiezan a sentirse inevitables. ¿Quieres que te proponga un par de contradicciones interesantes?`;
  }
  if (msg.includes("falta")) {
    return `«${cur?.scene.title ?? "Esta escena"}» tiene buena base. Lo que podría faltarle: una tensión sensorial concreta (algo que se oiga o se huela), y un instante en que ${ch ?? "tu protagonista"} casi diga algo y se detenga. Esos dos detalles suelen cambiarlo todo.`;
  }

  // default
  return `Te escucho. ${enc} Cuéntame un poco más: ¿quieres que te ayude a pensarlo, o prefieres que te escriba un borrador en mi lienzo para que decidas si entra en tu historia?`;
}

export function generateDraft(story: Story, prompt: string): string {
  const cur = currentScene(story);
  const ch = pickCharacterName(story) ?? "ella";
  const place = story.bible.places[0]?.name ?? "el lugar";
  const lower = prompt.toLowerCase();

  if (lower.includes("describe")) {
    return `${place.charAt(0).toUpperCase() + place.slice(1)} olía a sal y a madera vieja. La luz entraba sesgada, dorada en los bordes, y todo parecía suspendido a la espera de algo que aún no llegaba. ${ch} se detuvo en el umbral, sin saber por qué le costaba dar el siguiente paso.`;
  }
  if (lower.includes("dialog")) {
    return `—No hace falta que me lo expliques —dijo ${ch}, sin mirarlo.\n—Sí hace falta —contestó él—. Si no lo digo ahora, no lo voy a decir nunca.\nEl silencio que siguió fue de los que pesan.`;
  }
  return `${ch} respiró hondo antes de avanzar. Sabía que en «${cur?.scene.title ?? "ese momento"}» se jugaba algo más grande de lo que estaba dispuesta a admitir, y aun así dio el paso. A veces, pensó, escribir la propia vida consiste exactamente en eso: avanzar sin tener todas las respuestas.`;
}
