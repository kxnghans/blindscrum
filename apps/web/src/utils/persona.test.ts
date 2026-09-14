import { describe, it, expect } from "vitest";
import { generateRandomScrumAlias, generateScrumAvatar } from "./persona";

describe("persona utilities", () => {
  it("should generate two-word agile moniker", () => {
    const alias = generateRandomScrumAlias();
    const parts = alias.split(" ");
    expect(parts.length).toBe(2);
    expect(parts[0]?.length).toBeGreaterThan(2);
    expect(parts[1]?.length).toBeGreaterThan(2);
  });

  it("should generate valid self-contained SVG avatar data URI", () => {
    const avatar = generateScrumAvatar("Velocity Falcon");
    expect(avatar.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    const decoded = decodeURIComponent(avatar);
    expect(decoded).toContain("<svg");
    expect(decoded).toContain("</svg>");
  });

  it("should generate deterministic avatars for the same seed", () => {
    const avatarA = generateScrumAvatar("Test User 1");
    const avatarB = generateScrumAvatar("Test User 1");
    expect(avatarA).toBe(avatarB);
  });

  it("should render all archetypes and color palettes including white correctly", async () => {
    const { ARCHETYPES, COLOR_PALETTES, renderAvatarSvg } = await import(
      "./persona"
    );
    expect(ARCHETYPES.length).toBe(10);
    expect(COLOR_PALETTES.length).toBe(9);

    const whitePalette = COLOR_PALETTES.find((p) => p.id === "white");
    expect(whitePalette).toBeDefined();
    expect(whitePalette?.name).toBe("White");

    for (const arch of ARCHETYPES) {
      const svg = renderAvatarSvg(arch.id, "white");
      expect(svg.startsWith("data:image/svg+xml;utf8,")).toBe(true);
      const decoded = decodeURIComponent(svg);
      expect(decoded).toContain("bg-white");
    }
  });
});
