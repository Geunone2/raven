import type { Tone } from "@/components/atoms/Badge";

export const characterClasses = [
  { full: "디바인캐스터", short: "디바인", icon: "/jobs/divinecaster.png" },
  { full: "나이트레인저", short: "나레", icon: "/jobs/nightranger.png" },
  { full: "버서커", short: "버서커", icon: "/jobs/berserker.png" },
  { full: "데스브링어", short: "데브", icon: "/jobs/deathbringer.png" },
  { full: "엘리멘탈리스트", short: "엘리", icon: "/jobs/elementalist.png" },
  { full: "건슬링어", short: "건슬", icon: "/jobs/gunslinger.png" },
  { full: "어쌔신", short: "어쌔신", icon: "/jobs/assassin.png" },
  { full: "디스트로이어", short: "디트", icon: "/jobs/destroyer.png" },
  { full: "뱅가드", short: "뱅가드", icon: "/jobs/vanguard.png" },
  { full: "워로드", short: "워로드", icon: "/jobs/warlord.png" },
] as const;

export function getClassShortName(fullName: string): string {
  return characterClasses.find((c) => c.full === fullName)?.short ?? fullName;
}

export function getClassIcon(fullName: string): string | null {
  return characterClasses.find((c) => c.full === fullName)?.icon ?? null;
}

// 같은 계열 직업끼리 같은 색으로 묶어서 보여주기 위한 그룹핑.
const CLASS_TONE_GROUPS: { classes: string[]; tone: Tone }[] = [
  { classes: ["뱅가드", "버서커", "어쌔신", "워로드"], tone: "swatch1" },
  { classes: ["건슬링어", "나이트레인저", "디스트로이어"], tone: "swatch2" },
  { classes: ["디바인캐스터", "데스브링어", "엘리멘탈리스트"], tone: "swatch3" },
];

export function getClassTone(fullName: string): Tone {
  return CLASS_TONE_GROUPS.find((group) => group.classes.includes(fullName))?.tone ?? "neutral";
}
