// Expanded "Aura de la Historia" palette — emotional, cinematic colors.
export interface Aura {
  id: string;
  name: string;
  color: string;       // primary hex
  accent?: string;     // optional secondary for gradient
  mood: string;        // emotional tagline
  particle?: "ember" | "frost" | "stars" | "leaves" | "runes" | "mist" | "sparks";
}

export interface AuraGroup { id: string; label: string; auras: Aura[]; }

export const AURA_GROUPS: AuraGroup[] = [
  {
    id: "verde", label: "Bosque y esmeralda",
    auras: [
      { id: "emerald",  name: "Esmeralda",   color: "#10B981", accent: "#34D399", mood: "Equilibrio, sabiduría arcana", particle: "leaves" },
      { id: "forest",   name: "Bosque profundo", color: "#064E3B", accent: "#10B981", mood: "Silencio, raíces antiguas", particle: "leaves" },
      { id: "neon",     name: "Verde neón",  color: "#22FF88", accent: "#34D399", mood: "Vitalidad, energía digital", particle: "sparks" },
      { id: "sage",     name: "Salvia",      color: "#87A878", accent: "#B7CFA0", mood: "Calma, sanación", particle: "mist" },
      { id: "mint",     name: "Menta",       color: "#7CF5C5", accent: "#22D3EE", mood: "Frescura, claridad", particle: "mist" },
      { id: "jade",     name: "Jade",        color: "#00A86B", accent: "#0E7C5A", mood: "Suerte, talismán", particle: "sparks" },
    ],
  },
  {
    id: "azul", label: "Océano y cielo",
    auras: [
      { id: "ocean",    name: "Océano profundo", color: "#0C2340", accent: "#1A4A6E", mood: "Misterio abisal", particle: "mist" },
      { id: "royal",    name: "Azul real",   color: "#1E40AF", accent: "#3B82F6", mood: "Nobleza, autoridad", particle: "sparks" },
      { id: "cyan",     name: "Cian",        color: "#06B6D4", accent: "#22D3EE", mood: "Tecnología, lucidez", particle: "sparks" },
      { id: "ice",      name: "Hielo",       color: "#BAE6FD", accent: "#7DD3FC", mood: "Pureza glacial", particle: "frost" },
      { id: "midnight", name: "Medianoche",  color: "#0B1437", accent: "#1E3A8A", mood: "Sueños, melancolía", particle: "stars" },
      { id: "electric", name: "Azul eléctrico", color: "#2563EB", accent: "#60A5FA", mood: "Adrenalina, futuro", particle: "sparks" },
    ],
  },
  {
    id: "morado", label: "Magia y arcano",
    auras: [
      { id: "violet",   name: "Violeta",     color: "#7C3AED", accent: "#A78BFA", mood: "Intuición, conjuro", particle: "runes" },
      { id: "darkpurple", name: "Púrpura oscuro", color: "#4C1D95", accent: "#6D28D9", mood: "Trono, poder oculto", particle: "runes" },
      { id: "lavender", name: "Lavanda",     color: "#C4B5FD", accent: "#A78BFA", mood: "Romance suave", particle: "mist" },
      { id: "cosmic",   name: "Púrpura cósmico", color: "#5B21B6", accent: "#22D3EE", mood: "Galaxias lejanas", particle: "stars" },
      { id: "arcane",   name: "Arcano",      color: "#6B21A8", accent: "#F0ABFC", mood: "Hechizos antiguos", particle: "runes" },
      { id: "magenta",  name: "Magenta",     color: "#D946EF", accent: "#F472B6", mood: "Rebeldía, arte", particle: "sparks" },
    ],
  },
  {
    id: "rojo", label: "Fuego y pasión",
    auras: [
      { id: "crimson",  name: "Carmesí",     color: "#B91C1C", accent: "#EF4444", mood: "Pasión, guerra", particle: "ember" },
      { id: "blood",    name: "Sangre",      color: "#7F1D1D", accent: "#991B1B", mood: "Tragedia, sacrificio", particle: "ember" },
      { id: "ember",    name: "Brasa",       color: "#EA580C", accent: "#F59E0B", mood: "Ira contenida", particle: "ember" },
      { id: "scarlet",  name: "Escarlata",   color: "#DC2626", accent: "#F87171", mood: "Deseo, drama", particle: "ember" },
      { id: "ruby",     name: "Rubí oscuro", color: "#881337", accent: "#BE123C", mood: "Realeza ardiente", particle: "sparks" },
      { id: "infernal", name: "Infernal",    color: "#450A0A", accent: "#DC2626", mood: "Abismo, condena", particle: "ember" },
    ],
  },
  {
    id: "dorado", label: "Sol y oro",
    auras: [
      { id: "amber",    name: "Ámbar",       color: "#F59E0B", accent: "#FCD34D", mood: "Memoria, calidez", particle: "sparks" },
      { id: "gold",     name: "Oro",         color: "#D4A017", accent: "#FBBF24", mood: "Destino, leyenda", particle: "sparks" },
      { id: "sunset",   name: "Atardecer",   color: "#F97316", accent: "#FB923C", mood: "Nostalgia, viaje", particle: "ember" },
      { id: "bronze",   name: "Bronce",      color: "#A16207", accent: "#CA8A04", mood: "Heroísmo antiguo", particle: "sparks" },
      { id: "copper",   name: "Cobre",       color: "#B45309", accent: "#D97706", mood: "Artesanía, forja", particle: "ember" },
      { id: "molten",   name: "Oro fundido", color: "#FFB000", accent: "#FFE066", mood: "Gloria épica", particle: "ember" },
    ],
  },
  {
    id: "blanco", label: "Luz y plata",
    auras: [
      { id: "pearl",    name: "Perla",       color: "#F5F3EE", accent: "#E5E4E2", mood: "Elegancia, pureza", particle: "mist" },
      { id: "moonlight", name: "Plata lunar", color: "#C0C0C0", accent: "#E5E7EB", mood: "Noche serena", particle: "stars" },
      { id: "frost",    name: "Escarcha",    color: "#E0F2FE", accent: "#BAE6FD", mood: "Frío sagrado", particle: "frost" },
      { id: "softgray", name: "Gris suave",  color: "#9CA3AF", accent: "#D1D5DB", mood: "Niebla, duda", particle: "mist" },
      { id: "celestial", name: "Blanco celestial", color: "#FFFFFF", accent: "#A5F3FC", mood: "Divinidad, esperanza", particle: "stars" },
    ],
  },
  {
    id: "oscuro", label: "Sombra y abismo",
    auras: [
      { id: "shadow",   name: "Sombra",      color: "#1F2937", accent: "#374151", mood: "Conspiración", particle: "mist" },
      { id: "void",     name: "Vacío",       color: "#0A0A0A", accent: "#1A1A1A", mood: "Nada absoluta", particle: "stars" },
      { id: "smoke",    name: "Humo",        color: "#4B5563", accent: "#6B7280", mood: "Recuerdo difuso", particle: "mist" },
      { id: "obsidian", name: "Obsidiana",   color: "#0F0F12", accent: "#3F3F46", mood: "Cuchillo afilado", particle: "sparks" },
      { id: "eclipse",  name: "Eclipse",     color: "#111827", accent: "#7C3AED", mood: "Ritual prohibido", particle: "runes" },
    ],
  },
  {
    id: "rosa", label: "Pétalos y sueño",
    auras: [
      { id: "rose",     name: "Rosa luminosa", color: "#EC4899", accent: "#F9A8D4", mood: "Amor floreciente", particle: "sparks" },
      { id: "sakura",   name: "Sakura",      color: "#FBCFE8", accent: "#F472B6", mood: "Primavera fugaz", particle: "leaves" },
      { id: "neonpink", name: "Rosa neón",   color: "#FF2D95", accent: "#FF6FB5", mood: "Synthwave, deseo", particle: "sparks" },
      { id: "blush",    name: "Rubor",       color: "#FECACA", accent: "#FCA5A5", mood: "Ternura íntima", particle: "mist" },
      { id: "dream",    name: "Sueño rosa",  color: "#F0ABFC", accent: "#C4B5FD", mood: "Onírico, irreal", particle: "stars" },
    ],
  },
  {
    id: "especial", label: "Auras especiales",
    auras: [
      { id: "galaxy",   name: "Galaxia",     color: "#5B21B6", accent: "#06B6D4", mood: "Universos infinitos", particle: "stars" },
      { id: "aurora",   name: "Aurora boreal", color: "#10B981", accent: "#7C3AED", mood: "Magia polar", particle: "mist" },
      { id: "fireice",  name: "Fuego y hielo", color: "#EF4444", accent: "#7DD3FC", mood: "Dualidad eterna", particle: "ember" },
      { id: "ethereal", name: "Bruma etérea", color: "#A5F3FC", accent: "#C4B5FD", mood: "Espíritus errantes", particle: "mist" },
      { id: "nebula",   name: "Nebulosa cósmica", color: "#7C3AED", accent: "#EC4899", mood: "Nacimiento estelar", particle: "stars" },
      { id: "ancient",  name: "Magia ancestral", color: "#B45309", accent: "#10B981", mood: "Runas olvidadas", particle: "runes" },
      { id: "celestialEnergy", name: "Energía celestial", color: "#FCD34D", accent: "#FFFFFF", mood: "Divinidad luminosa", particle: "stars" },
    ],
  },
];

export const ALL_AURAS: Aura[] = AURA_GROUPS.flatMap((g) => g.auras);

export function findAuraByColor(color: string): Aura | undefined {
  return ALL_AURAS.find((a) => a.color.toLowerCase() === color.toLowerCase());
}
