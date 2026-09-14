/**
 * @file roomCode.ts
 * @description Utilities for generating, sanitizing, and validating ephemeral room codes.
 */

const ADJECTIVE_PREFIXES = ["BLND", "SCRUM", "FAST", "APEX", "SPRINT", "AGILE", "POKER", "TEAM"] as const;

/**
 * Generates an accessible, memorable room code like "SCRUM-492" or "BLND-78".
 */
export function generateRoomCode(): string {
  const prefix = ADJECTIVE_PREFIXES[Math.floor(Math.random() * ADJECTIVE_PREFIXES.length)];
  const num = Math.floor(100 + Math.random() * 900); // 3-digit number 100-999
  return `${prefix}-${num}`;
}

/**
 * Sanitizes and normalizes room codes entered by users.
 */
export function normalizeRoomCode(raw: string): string {
  return raw
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9-]/g, "");
}

/**
 * Validates whether a room code has an acceptable length and format.
 */
export function isValidRoomCode(code: string): boolean {
  const clean = normalizeRoomCode(code);
  return clean.length >= 3 && clean.length <= 16;
}
