/**
 * @file persona.ts
 * @description Generates deterministic agile aliases and modular SVG character avatars.
 * Provides distinct character archetypes and independent color palettes for rich personalization.
 */

const ADJECTIVES = [
  "Velocity",
  "Agile",
  "Stealth",
  "Quantum",
  "Sprint",
  "Rapid",
  "Cosmic",
  "Zen",
  "Hyper",
  "Turbo",
  "Pixel",
  "Apex",
  "Sonic",
  "Neon",
  "Cyber",
  "Dynamo",
  "Solar",
  "Vortex",
] as const;

const NOUNS = [
  "Falcon",
  "Otter",
  "Cheetah",
  "Badger",
  "Fox",
  "Lynx",
  "Panda",
  "Griffin",
  "Phoenix",
  "Nomad",
  "Pilot",
  "Master",
  "Wizard",
  "Coder",
  "Voyager",
  "Scout",
  "Ninja",
  "Architect",
] as const;

export type AvatarArchetypeId =
  | "fox"
  | "bot"
  | "ninja"
  | "astronaut"
  | "cat"
  | "wizard"
  | "panda"
  | "falcon"
  | "cyber"
  | "bear";

export interface AvatarArchetype {
  id: AvatarArchetypeId;
  name: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  bg1: string;
  bg2: string;
  accent: string;
  highlight: string;
  pill: string;
}

export const ARCHETYPES: AvatarArchetype[] = [
  { id: "fox", name: "Fox" },
  { id: "bot", name: "Bot" },
  { id: "ninja", name: "Ninja" },
  { id: "astronaut", name: "Astronaut" },
  { id: "cat", name: "Cat" },
  { id: "wizard", name: "Wizard" },
  { id: "panda", name: "Panda" },
  { id: "falcon", name: "Falcon" },
  { id: "cyber", name: "Cyber" },
  { id: "bear", name: "Bear" },
];

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "indigo",
    name: "Indigo",
    bg1: "#6366f1",
    bg2: "#4338ca",
    accent: "#38bdf8",
    highlight: "#c7d2fe",
    pill: "#6366f1",
  },
  {
    id: "emerald",
    name: "Emerald",
    bg1: "#10b981",
    bg2: "#047857",
    accent: "#6ee7b7",
    highlight: "#a7f3d0",
    pill: "#10b981",
  },
  {
    id: "amber",
    name: "Amber",
    bg1: "#f59e0b",
    bg2: "#b45309",
    accent: "#fde68a",
    highlight: "#fef3c7",
    pill: "#f59e0b",
  },
  {
    id: "ruby",
    name: "Ruby",
    bg1: "#ef4444",
    bg2: "#b91c1c",
    accent: "#fca5a5",
    highlight: "#fee2e2",
    pill: "#ef4444",
  },
  {
    id: "violet",
    name: "Violet",
    bg1: "#8b5cf6",
    bg2: "#6d28d9",
    accent: "#c4b5fd",
    highlight: "#ede9fe",
    pill: "#8b5cf6",
  },
  {
    id: "teal",
    name: "Teal",
    bg1: "#06b6d4",
    bg2: "#0e7490",
    accent: "#67e8f9",
    highlight: "#cffafe",
    pill: "#06b6d4",
  },
  {
    id: "rose",
    name: "Rose",
    bg1: "#f43f5e",
    bg2: "#be123c",
    accent: "#fecdd3",
    highlight: "#ffe4e6",
    pill: "#f43f5e",
  },
  {
    id: "slate",
    name: "Slate",
    bg1: "#475569",
    bg2: "#1e293b",
    accent: "#cbd5e1",
    highlight: "#f1f5f9",
    pill: "#334155",
  },
];

/**
 * Computes a 32-bit integer hash from an arbitrary string seed.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates a random agile-themed name (e.g., "Velocity Falcon").
 */
export function generateRandomScrumAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}

/**
 * Renders a distinct character archetype with an assigned color palette into an SVG data URI.
 */
export function renderAvatarSvg(
  archetypeId: AvatarArchetypeId,
  paletteId: string,
): string {
  const palette =
    COLOR_PALETTES.find((p) => p.id === paletteId) ?? COLOR_PALETTES[0]!;

  let characterSvg = "";

  switch (archetypeId) {
    case "fox":
      characterSvg = `
        <!-- Fox Ears -->
        <polygon points="20,46 32,16 45,40" fill="${palette.bg2}" />
        <polygon points="25,42 33,23 41,38" fill="${palette.accent}" />
        <polygon points="80,46 68,16 55,40" fill="${palette.bg2}" />
        <polygon points="75,42 67,23 59,38" fill="${palette.accent}" />
        <!-- Fox Face Plate -->
        <path d="M22,48 C22,74 34,88 50,88 C66,88 78,74 78,48 C78,36 68,34 50,34 C32,34 22,36 22,48 Z" fill="#ffffff" />
        <!-- Cheek Fur & Muzzle -->
        <path d="M35,60 C42,56 58,56 65,60 C68,68 62,80 50,82 C38,80 32,68 35,60 Z" fill="${palette.highlight}" />
        <!-- Nose -->
        <polygon points="46,67 54,67 50,72" fill="#0f172a" />
        <!-- Eyes -->
        <ellipse cx="38" cy="50" rx="4" ry="5" fill="#0f172a" />
        <circle cx="37" cy="48" r="1.5" fill="#ffffff" />
        <ellipse cx="62" cy="50" rx="4" ry="5" fill="#0f172a" />
        <circle cx="61" cy="48" r="1.5" fill="#ffffff" />
      `;
      break;

    case "bot":
      characterSvg = `
        <!-- Robot Antenna -->
        <line x1="50" y1="26" x2="50" y2="15" stroke="${palette.accent}" stroke-width="3" stroke-linecap="round" />
        <circle cx="50" cy="13" r="5" fill="${palette.accent}" />
        <circle cx="50" cy="13" r="2" fill="#ffffff" />
        <!-- Ear Bolts -->
        <rect x="18" y="46" width="6" height="12" rx="3" fill="${palette.accent}" />
        <rect x="76" y="46" width="6" height="12" rx="3" fill="${palette.accent}" />
        <!-- Head Chassis -->
        <rect x="23" y="26" width="54" height="52" rx="14" fill="#0f172a" fill-opacity="0.9" stroke="${palette.accent}" stroke-width="2.5" />
        <!-- Screen Plate -->
        <rect x="28" y="33" width="44" height="28" rx="8" fill="#1e293b" />
        <!-- Digital Eyes -->
        <circle cx="40" cy="47" r="4.5" fill="${palette.accent}" />
        <circle cx="40" cy="47" r="2" fill="#ffffff" />
        <circle cx="60" cy="47" r="4.5" fill="${palette.accent}" />
        <circle cx="60" cy="47" r="2" fill="#ffffff" />
        <!-- Digital Smile -->
        <path d="M43,68 Q50,73 57,68" stroke="${palette.accent}" stroke-width="2.5" stroke-linecap="round" fill="none" />
      `;
      break;

    case "ninja":
      characterSvg = `
        <!-- Ninja Cowl / Head -->
        <circle cx="50" cy="52" r="32" fill="#0f172a" />
        <!-- Headband Wrap -->
        <path d="M19,36 Q50,30 81,36 L81,47 Q50,42 19,47 Z" fill="${palette.bg1}" />
        <!-- Metal Forehead Plate -->
        <rect x="36" y="35" width="28" height="10" rx="3" fill="#cbd5e1" />
        <circle cx="50" cy="40" r="2.5" fill="#0f172a" />
        <!-- Headband Tails -->
        <path d="M78,40 Q88,38 92,46 Q86,44 80,45 Z" fill="${palette.bg1}" />
        <path d="M79,43 Q87,46 90,56 Q84,49 78,47 Z" fill="${palette.bg1}" />
        <!-- Eye Opening -->
        <rect x="28" y="49" width="44" height="14" rx="4" fill="#fed7aa" />
        <!-- Focused Eyes -->
        <ellipse cx="40" cy="56" rx="4" ry="2.5" fill="#0f172a" />
        <circle cx="41" cy="55" r="1" fill="#ffffff" />
        <ellipse cx="60" cy="56" rx="4" ry="2.5" fill="#0f172a" />
        <circle cx="61" cy="55" r="1" fill="#ffffff" />
        <path d="M36,52 L44,54" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" />
        <path d="M64,52 L56,54" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" />
      `;
      break;

    case "astronaut":
      characterSvg = `
        <!-- Helmet Collar -->
        <rect x="34" y="80" width="32" height="7" rx="3" fill="#94a3b8" />
        <!-- Space Helmet Dome -->
        <circle cx="50" cy="50" r="34" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
        <!-- Reflective Dark Visor -->
        <path d="M26,48 C26,34 37,27 50,27 C63,27 74,34 74,48 C74,62 63,69 50,69 C37,69 26,62 26,48 Z" fill="#0f172a" />
        <!-- Visor Horizon Glint -->
        <path d="M32,44 C34,36 42,32 50,32 C58,32 64,35 67,40" stroke="${palette.accent}" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.9" />
        <path d="M34,50 C36,44 42,40 48,40" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.6" />
        <!-- Comms Mic -->
        <circle cx="66" cy="62" r="3" fill="${palette.accent}" />
        <path d="M66,62 Q60,65 56,64" stroke="${palette.accent}" stroke-width="1.5" fill="none" stroke-linecap="round" />
      `;
      break;

    case "cat":
      characterSvg = `
        <!-- Cat Ears -->
        <polygon points="22,42 28,14 44,32" fill="#ffffff" />
        <polygon points="26,38 30,20 40,32" fill="${palette.bg1}" />
        <polygon points="78,42 72,14 56,32" fill="#ffffff" />
        <polygon points="74,38 70,20 60,32" fill="${palette.bg1}" />
        <!-- Head -->
        <circle cx="50" cy="54" r="30" fill="#ffffff" />
        <!-- Playful Cat Eyes -->
        <ellipse cx="38" cy="48" rx="4.5" ry="5.5" fill="${palette.bg2}" />
        <ellipse cx="38" cy="48" rx="1.5" ry="4" fill="#0f172a" />
        <circle cx="36.5" cy="46" r="1.5" fill="#ffffff" />
        <ellipse cx="62" cy="48" rx="4.5" ry="5.5" fill="${palette.bg2}" />
        <ellipse cx="62" cy="48" rx="1.5" ry="4" fill="#0f172a" />
        <circle cx="60.5" cy="46" r="1.5" fill="#ffffff" />
        <!-- Nose & Mouth -->
        <polygon points="48,58 52,58 50,61" fill="${palette.bg1}" />
        <path d="M46,63 Q50,67 54,63" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" fill="none" />
        <!-- Whiskers -->
        <line x1="22" y1="56" x2="33" y2="58" stroke="${palette.bg2}" stroke-width="1.8" stroke-linecap="round" />
        <line x1="22" y1="62" x2="33" y2="61" stroke="${palette.bg2}" stroke-width="1.8" stroke-linecap="round" />
        <line x1="78" y1="56" x2="67" y2="58" stroke="${palette.bg2}" stroke-width="1.8" stroke-linecap="round" />
        <line x1="78" y1="62" x2="67" y2="61" stroke="${palette.bg2}" stroke-width="1.8" stroke-linecap="round" />
      `;
      break;

    case "wizard":
      characterSvg = `
        <!-- Wizard Face -->
        <circle cx="50" cy="54" r="26" fill="#fed7aa" />
        <!-- Beard -->
        <path d="M30,56 C30,76 40,88 50,90 C60,88 70,76 70,56 C64,60 56,62 50,62 C44,62 36,60 30,56 Z" fill="#ffffff" />
        <!-- Friendly Eyes & Brows -->
        <circle cx="41" cy="50" r="3" fill="#0f172a" />
        <circle cx="59" cy="50" r="3" fill="#0f172a" />
        <path d="M37,45 Q41,43 45,46" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <path d="M55,46 Q59,43 63,45" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <!-- Wizard Hat Cone -->
        <polygon points="50,14 68,40 32,40" fill="${palette.bg1}" />
        <!-- Hat Brim -->
        <ellipse cx="50" cy="42" rx="34" ry="6" fill="${palette.bg2}" />
        <!-- Hat Gold Star -->
        <polygon points="50,22 52,27 57,27 53,30 55,35 50,32 45,35 47,30 43,27 48,27" fill="${palette.accent}" />
      `;
      break;

    case "panda":
      characterSvg = `
        <!-- Panda Round Ears -->
        <circle cx="27" cy="28" r="12" fill="#0f172a" />
        <circle cx="73" cy="28" r="12" fill="#0f172a" />
        <!-- Face -->
        <circle cx="50" cy="54" r="32" fill="#ffffff" />
        <!-- Eye Patches -->
        <ellipse cx="37" cy="50" rx="9" ry="11" fill="#0f172a" transform="rotate(-15 37 50)" />
        <circle cx="38" cy="49" r="3.5" fill="#ffffff" />
        <circle cx="39" cy="49" r="2" fill="#0f172a" />
        <ellipse cx="63" cy="50" rx="9" ry="11" fill="#0f172a" transform="rotate(15 63 50)" />
        <circle cx="62" cy="49" r="3.5" fill="#ffffff" />
        <circle cx="61" cy="49" r="2" fill="#0f172a" />
        <!-- Nose & Smile -->
        <ellipse cx="50" cy="63" rx="5" ry="3.5" fill="#0f172a" />
        <path d="M45,69 Q50,74 55,69" stroke="#0f172a" stroke-width="2" stroke-linecap="round" fill="none" />
      `;
      break;

    case "falcon":
      characterSvg = `
        <!-- Feather Crest -->
        <path d="M50,12 Q58,24 54,34 Q46,24 50,12 Z" fill="${palette.accent}" />
        <path d="M42,16 Q48,26 46,34 Q38,24 42,16 Z" fill="${palette.bg1}" />
        <path d="M58,16 Q52,26 54,34 Q62,24 58,16 Z" fill="${palette.bg1}" />
        <!-- Head -->
        <path d="M28,42 C28,68 36,82 50,82 C64,82 72,68 72,42 C72,30 62,28 50,28 C38,28 28,30 28,42 Z" fill="#ffffff" />
        <!-- Falcon Plumage Mask -->
        <path d="M28,44 L44,48 L36,66 Z" fill="${palette.bg2}" />
        <path d="M72,44 L56,48 L64,66 Z" fill="${palette.bg2}" />
        <!-- Keen Eyes -->
        <ellipse cx="40" cy="46" rx="4.5" ry="3" fill="#0f172a" />
        <circle cx="41" cy="45" r="1.2" fill="${palette.accent}" />
        <ellipse cx="60" cy="46" rx="4.5" ry="3" fill="#0f172a" />
        <circle cx="59" cy="45" r="1.2" fill="${palette.accent}" />
        <!-- Golden Beak -->
        <path d="M45,54 Q50,52 55,54 L50,74 Z" fill="#f59e0b" />
      `;
      break;

    case "cyber":
      characterSvg = `
        <!-- Cyber Head -->
        <circle cx="50" cy="52" r="30" fill="#0f172a" />
        <!-- Neon Mohawk -->
        <path d="M44,14 L56,14 L54,30 L46,30 Z" fill="${palette.accent}" />
        <polygon points="46,14 54,14 52,22 48,22" fill="#ffffff" />
        <!-- Angular Cyber Shades -->
        <polygon points="24,44 76,44 72,60 28,60" fill="${palette.bg1}" stroke="${palette.accent}" stroke-width="2" />
        <line x1="28" y1="52" x2="72" y2="52" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
        <line x1="32" y1="48" x2="68" y2="48" stroke="${palette.accent}" stroke-width="1" stroke-dasharray="3,3" />
        <!-- Ear Communicator -->
        <rect x="18" y="46" width="6" height="12" rx="3" fill="${palette.accent}" />
        <circle cx="21" cy="52" r="1.5" fill="#ffffff" />
        <!-- Tech Smile -->
        <line x1="44" y1="68" x2="56" y2="68" stroke="${palette.accent}" stroke-width="2" stroke-linecap="round" />
      `;
      break;

    case "bear":
      characterSvg = `
        <!-- Bear Ears -->
        <circle cx="28" cy="30" r="11" fill="#78350f" />
        <circle cx="28" cy="30" r="6" fill="${palette.accent}" />
        <circle cx="72" cy="30" r="11" fill="#78350f" />
        <circle cx="72" cy="30" r="6" fill="${palette.accent}" />
        <!-- Head -->
        <circle cx="50" cy="54" r="31" fill="#92400e" />
        <!-- Muzzle -->
        <ellipse cx="50" cy="62" rx="16" ry="12" fill="#fef3c7" />
        <!-- Nose & Mouth -->
        <ellipse cx="50" cy="57" rx="5" ry="3.5" fill="#1e293b" />
        <path d="M50,60 L50,66" stroke="#1e293b" stroke-width="2" stroke-linecap="round" />
        <path d="M44,66 Q50,71 56,66" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none" />
        <!-- Friendly Eyes -->
        <circle cx="39" cy="48" r="3.5" fill="#1e293b" />
        <circle cx="38" cy="47" r="1.2" fill="#ffffff" />
        <circle cx="61" cy="48" r="3.5" fill="#1e293b" />
        <circle cx="60" cy="47" r="1.2" fill="#ffffff" />
      `;
      break;
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg-${palette.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bg1}" />
      <stop offset="100%" stop-color="${palette.bg2}" />
    </linearGradient>
  </defs>
  <!-- Background Card -->
  <rect width="100" height="100" rx="28" fill="url(#bg-${palette.id})" />
  <rect width="96" height="96" x="2" y="2" rx="26" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1.5" />
  ${characterSvg}
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates an SVG avatar data URI deterministically derived from a seed.
 */
export function generateScrumAvatar(seed: string): string {
  const hash = hashString(seed || "anonymous");
  const archetype = ARCHETYPES[hash % ARCHETYPES.length]!;
  const palette = COLOR_PALETTES[(hash >> 3) % COLOR_PALETTES.length]!;
  return renderAvatarSvg(archetype.id, palette.id);
}

export interface AvatarPreset {
  id: string;
  name: string;
  avatar: string;
}

/**
 * Curated preset avatars spanning distinct character archetypes.
 */
export const AVATAR_PRESETS: AvatarPreset[] = ARCHETYPES.map((arch, idx) => {
  const palette = COLOR_PALETTES[idx % COLOR_PALETTES.length]!;
  return {
    id: arch.id,
    name: arch.name,
    avatar: renderAvatarSvg(arch.id, palette.id),
  };
});

