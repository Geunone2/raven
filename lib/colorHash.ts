import type { Tone } from "@/components/atoms/Badge";

const SWATCH_TONES: Tone[] = ["swatch1", "swatch2", "swatch3", "swatch4", "swatch5"];

// Deterministic color for free-text labels that aren't a closed enum (e.g.
// custody guild name) — same string always maps to the same tone.
export function hashTone(value: string): Tone {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return SWATCH_TONES[Math.abs(hash) % SWATCH_TONES.length];
}
