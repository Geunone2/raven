import { announcementCategories } from "@/lib/db/schema";

export const announcementCategoryLabels: Record<
  (typeof announcementCategories)[number],
  string
> = {
  general: "공지사항",
  abyss: "어비스 공지",
  guild_dungeon: "길드 던전 공지",
  distribution: "분배 기준",
  suggestion: "건의사항",
};
