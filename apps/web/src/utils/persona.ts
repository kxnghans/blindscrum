/**
 * @file persona.ts
 * @description Generates deterministic agile aliases and self-contained SVG avatars.
 * Operates without external image CDN dependencies to preserve offline capability and privacy.
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

const PALETTES = [
  { bg1: "#6366f1", bg2: "#a855f7", accent: "#38bdf8" },
  { bg1: "#ec4899", bg2: "#f43f5e", accent: "#fbbf24" },
  { bg1: "#10b981", bg2: "#06b6d4", accent: "#a7f3d0" },
  { bg1: "#f59e0b", bg2: "#ef4444", accent: "#fde68a" },
  { bg1: "#8b5cf6", bg2: "#3b82f6", accent: "#c4b5fd" },
  { bg1: "#14b8a6", bg2: "#0ea5e9", accent: "#5eead4" },
  { bg1: "#f97316", bg2: "#e11d48", accent: "#fed7aa" },
  { bg1: "#64748b", bg2: "#334155", accent: "#94a3b8" },
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
 * Generates an SVG avatar data URI deterministically derived from a name or seed.
 */
export function generateScrumAvatar(seed: string): string {
  const hash = hashString(seed || "anonymous");
  const palette = PALETTES[hash % PALETTES.length] ?? PALETTES[0]!;

  const initial = (seed.trim()[0] || "A").toUpperCase();
  const eyeStyle = hash % 3; // 0: dots, 1: sunglasses, 2: visor
  const mouthStyle = hash % 2; // 0: smile, 1: straight

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="grad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bg1}" />
      <stop offset="100%" stop-color="${palette.bg2}" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="30" fill="url(#grad-${hash})" />
  
  <!-- Face plate -->
  <circle cx="50" cy="50" r="32" fill="#ffffff" fill-opacity="0.18" />
  
  ${
    eyeStyle === 1
      ? `<rect x="30" y="40" width="40" height="10" rx="5" fill="#0f172a" />
         <line x1="28" y1="45" x2="72" y2="45" stroke="${palette.accent}" stroke-width="2" />`
      : eyeStyle === 2
        ? `<polygon points="32,46 68,46 62,38 38,38" fill="${palette.accent}" />`
        : `<circle cx="40" cy="44" r="4" fill="#ffffff" />
         <circle cx="60" cy="44" r="4" fill="#ffffff" />`
  }

  ${
    mouthStyle === 0
      ? `<path d="M42 58 Q50 66 58 58" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" />`
      : `<line x1="44" y1="60" x2="56" y2="60" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />`
  }

  <!-- Identifier badge -->
  <circle cx="78" cy="78" r="14" fill="#0f172a" stroke="${palette.accent}" stroke-width="2" />
  <text x="78" y="83" font-size="11" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">${initial}</text>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
