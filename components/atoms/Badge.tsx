import { ReactNode } from "react";

export type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "legendary"
  | "hero"
  | "rare"
  | "weapon"
  | "armor"
  | "accessory"
  | "heavenstone"
  | "skillbook"
  | "other"
  | "swatch1"
  | "swatch2"
  | "swatch3"
  | "swatch4"
  | "swatch5"
  | "contentGuildDungeon"
  | "contentAbyss"
  | "contentFieldBoss"
  | "contentAncientFortress"
  | "contentSiege"
  | "contentAbyssBattle"
  | "contentOther";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-hover text-ink-muted",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
  legendary: "bg-grade-legendary/15 text-grade-legendary",
  hero: "bg-grade-hero/15 text-grade-hero",
  rare: "bg-grade-rare/15 text-grade-rare",
  weapon: "bg-category-weapon/15 text-category-weapon",
  armor: "bg-category-armor/15 text-category-armor",
  accessory: "bg-category-accessory/15 text-category-accessory",
  heavenstone: "bg-category-heavenstone/15 text-category-heavenstone",
  skillbook: "bg-category-skillbook/15 text-category-skillbook",
  other: "bg-category-other/15 text-category-other",
  swatch1: "bg-swatch-1/15 text-swatch-1",
  swatch2: "bg-swatch-2/15 text-swatch-2",
  swatch3: "bg-swatch-3/15 text-swatch-3",
  swatch4: "bg-swatch-4/15 text-swatch-4",
  swatch5: "bg-swatch-5/15 text-swatch-5",
  contentGuildDungeon: "bg-content-guild-dungeon/15 text-content-guild-dungeon",
  contentAbyss: "bg-content-abyss/15 text-content-abyss",
  contentFieldBoss: "bg-content-field-boss/15 text-content-field-boss",
  contentAncientFortress: "bg-content-ancient-fortress/15 text-content-ancient-fortress",
  contentSiege: "bg-content-siege/15 text-content-siege",
  contentAbyssBattle: "bg-content-abyss-battle/15 text-content-abyss-battle",
  contentOther: "bg-content-other/15 text-content-other",
};

const sizeClasses = {
  sm: "px-2.5 py-0.5 text-xs",
  lg: "px-4 py-1.5 text-sm",
};

export function Badge({
  tone = "neutral",
  size = "sm",
  children,
}: {
  tone?: Tone;
  size?: keyof typeof sizeClasses;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
