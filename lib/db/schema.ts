import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";

export const guildMemberRoles = [
  "guild_leader",
  "vice_leader",
  "elder",
  "member",
  "trial",
] as const;

export const characterTypes = ["main", "alt"] as const;

export const guildMembers = sqliteTable("guild_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nickname: text("nickname").notNull().unique(),
  guildName: text("guild_name"),
  // 소속 서버. 예전엔 guildName으로부터 GUILD_SERVER_MAP을 거쳐 유추했으나(길드=서버
  // 고정 가정), 실제로는 독립적인 값이라 별도 컬럼으로 분리했다(2026-08-13).
  server: text("server"),
  passwordHash: text("password_hash").notNull(),
  className: text("class_name").notNull().default(""),
  characterType: text("character_type", { enum: characterTypes })
    .notNull()
    .default("main"),
  level: integer("level").notNull().default(1),
  attack: integer("attack").notNull().default(0),
  defense: integer("defense").notNull().default(0),
  accuracy: integer("accuracy").notNull().default(0),
  role: text("role", { enum: guildMemberRoles }).notNull().default("member"),
  memo: text("memo"),
  statsUpdatedAt: text("stats_updated_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type GuildMember = typeof guildMembers.$inferSelect;
export type NewGuildMember = typeof guildMembers.$inferInsert;

// 스탯이 수정될 때마다(본인 입력 또는 관리자 수정) 그 시점의 값을 스냅샷으로
// 남겨 추이 그래프에 쓴다. guildMembers의 현재값과 별개로 계속 쌓이기만 한다.
export const memberStatHistory = sqliteTable("member_stat_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id")
    .notNull()
    .references(() => guildMembers.id, { onDelete: "cascade" }),
  level: integer("level").notNull(),
  attack: integer("attack").notNull(),
  defense: integer("defense").notNull(),
  accuracy: integer("accuracy").notNull(),
  recordedAt: text("recorded_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type MemberStatHistory = typeof memberStatHistory.$inferSelect;
export type NewMemberStatHistory = typeof memberStatHistory.$inferInsert;

export const announcementCategories = [
  "general",
  "abyss",
  "guild_dungeon",
  "distribution",
  "suggestion",
] as const;

export const announcements = sqliteTable("announcements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category", { enum: announcementCategories })
    .notNull()
    .default("general"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

export const contentTypes = [
  "guild_dungeon",
  "abyss",
  "field_boss",
  "rift",
  "ancient_fortress",
  "other",
] as const;

export const scheduleStatuses = [
  "scheduled",
  "completed",
  "failed",
  "postponed",
] as const;

export const targetAudiences = ["all", "top_power", "specific_party"] as const;

// 출석 점수 계산용 보스 등급. "none"은 보스 처치가 없는 일정(예: 균열, 기타 이벤트).
export const bossTiers = ["none", "star2", "star3", "star4", "abyss_boss"] as const;

export const contentSchedules = sqliteTable("content_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: contentTypes }).notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  gatherTime: text("gather_time"),
  startTime: text("start_time").notNull(),
  expectedEndTime: text("expected_end_time"),
  targetAudience: text("target_audience", { enum: targetAudiences })
    .notNull()
    .default("all"),
  serverName: text("server_name"),
  location: text("location"),
  requiredItem: text("required_item"),
  noticeText: text("notice_text"),
  status: text("status", { enum: scheduleStatuses }).notNull().default("scheduled"),
  bossTier: text("boss_tier", { enum: bossTiers }).notNull().default("none"),
  hasCombat: integer("has_combat", { mode: "boolean" }).notNull().default(false),
  combatHours: real("combat_hours"),
  // 고대성채/쟁탈전 전용 보상 정산(settleContentReward) 완료 여부 — 장비 내판
  // 정산(loots.settledAt)과는 별개 흐름이라 이 일정 자체에 기록한다.
  rewardSettledAt: text("reward_settled_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type ContentSchedule = typeof contentSchedules.$inferSelect;
export type NewContentSchedule = typeof contentSchedules.$inferInsert;

// 참여 신청(plannedStatus) 없이 row 자체가 없는 경우는 "미응답"으로 취급한다.
export const plannedStatuses = ["attend", "absent", "undecided"] as const;
export const actualStatuses = ["present", "late", "absent", "no_show"] as const;
// 어비스 일정에서만 의미 있는 값이라 다른 콘텐츠 타입에서는 null로 둔다.
export const ticketStatuses = ["owned", "insufficient", "needs_check"] as const;

export const participations = sqliteTable(
  "participations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    scheduleId: integer("schedule_id")
      .notNull()
      .references(() => contentSchedules.id, { onDelete: "cascade" }),
    memberId: integer("member_id")
      .notNull()
      .references(() => guildMembers.id, { onDelete: "cascade" }),
    plannedStatus: text("planned_status", { enum: plannedStatuses })
      .notNull()
      .default("undecided"),
    actualStatus: text("actual_status", { enum: actualStatuses }),
    partyName: text("party_name"),
    role: text("role"),
    ticketStatus: text("ticket_status", { enum: ticketStatuses }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("participations_schedule_member_idx").on(
      table.scheduleId,
      table.memberId
    ),
  ]
);

export type Participation = typeof participations.$inferSelect;
export type NewParticipation = typeof participations.$inferInsert;

export const dungeonDifficulties = ["easy", "normal", "hard"] as const;
export const dungeonClearResults = ["success", "failure", "aborted"] as const;
export const lootDistributionStatuses = [
  "undistributed",
  "distributing",
  "completed",
] as const;

export const guildDungeonRuns = sqliteTable("guild_dungeon_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scheduleId: integer("schedule_id")
    .notNull()
    .unique()
    .references(() => contentSchedules.id, { onDelete: "cascade" }),
  difficulty: text("difficulty", { enum: dungeonDifficulties })
    .notNull()
    .default("normal"),
  clearResult: text("clear_result", { enum: dungeonClearResults }),
  loot: text("loot"),
  distributionStatus: text("distribution_status", { enum: lootDistributionStatuses })
    .notNull()
    .default("undistributed"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type GuildDungeonRun = typeof guildDungeonRuns.$inferSelect;
export type NewGuildDungeonRun = typeof guildDungeonRuns.$inferInsert;

export const lootGrades = ["rare", "hero", "legendary"] as const;
export const distributionMethods = [
  "point",
  "auction",
  "officer_assigned",
  "random",
] as const;
export const lootCategories = [
  "weapon",
  "armor",
  "accessory",
  "heavenstone",
  "skillbook",
  "other",
] as const;

export const loots = sqliteTable("loots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scheduleId: integer("schedule_id").references(() => contentSchedules.id, {
    onDelete: "set null",
  }),
  itemName: text("item_name").notNull(),
  grade: text("grade", { enum: lootGrades }).notNull().default("rare"),
  category: text("category", { enum: lootCategories }).notNull().default("other"),
  obtainedAt: text("obtained_at").notNull(),
  obtainedBy: text("obtained_by"),
  distributionMethod: text("distribution_method", { enum: distributionMethods })
    .notNull()
    .default("point"),
  askingPrice: integer("asking_price"),
  custodyGuild: text("custody_guild"),
  bidDeadline: text("bid_deadline"),
  receiver: text("receiver"),
  status: text("status", { enum: lootDistributionStatuses })
    .notNull()
    .default("undistributed"),
  note: text("note"),
  // 내판 정산(길드 통장 분배)이 이미 처리된 건인지 표시 — 중복 정산 방지.
  settledAt: text("settled_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type Loot = typeof loots.$inferSelect;
export type NewLoot = typeof loots.$inferInsert;

export const lootBids = sqliteTable(
  "loot_bids",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lootId: integer("loot_id")
      .notNull()
      .references(() => loots.id, { onDelete: "cascade" }),
    memberId: integer("member_id")
      .notNull()
      .references(() => guildMembers.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("loot_bids_loot_member_idx").on(table.lootId, table.memberId),
  ]
);

export type LootBid = typeof lootBids.$inferSelect;
export type NewLootBid = typeof lootBids.$inferInsert;

export const bankTransactionTypes = [
  "deposit",
  "withdrawal",
  "adjustment",
  "loot_distribution",
  "auction_payment",
  "content_reward",
] as const;

export const bankTransactions = sqliteTable("bank_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id")
    .notNull()
    .references(() => guildMembers.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  type: text("type", { enum: bankTransactionTypes }).notNull(),
  memo: text("memo"),
  lootId: integer("loot_id").references(() => loots.id, { onDelete: "set null" }),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type BankTransaction = typeof bankTransactions.$inferSelect;
export type NewBankTransaction = typeof bankTransactions.$inferInsert;

// 길드 공용 통장(개인 통장과 별개) — 내판 정산 시 적립되는 혈비/총무비, 분배 후
// 남는 소수점 잔여분, 운영진이 직접 기록하는 지출 내역을 함께 관리한다.
export const guildTreasuryTransactionTypes = [
  "initial_balance",
  "sale_reserve",
  "distribution_remainder",
  "expense",
] as const;

export const guildTreasuryTransactions = sqliteTable("guild_treasury_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: guildTreasuryTransactionTypes }).notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason"),
  note: text("note"),
  // 지출 항목에서만 운영진이 직접 지정하는 날짜(YYYY-MM-DD). 그 외 타입은 null이며
  // 화면에는 createdAt을 대신 보여준다.
  date: text("date"),
  lootId: integer("loot_id").references(() => loots.id, { onDelete: "set null" }),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type GuildTreasuryTransaction = typeof guildTreasuryTransactions.$inferSelect;
export type NewGuildTreasuryTransaction = typeof guildTreasuryTransactions.$inferInsert;

export const bossTimerTypes = [
  "fixed",
  "respawn",
  "weekly_wed_sun",
  "weekly_sunday",
] as const;

export const bossTimers = sqliteTable("boss_timers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: bossTimerTypes }).notNull(),
  fixedTime: text("fixed_time"),
  respawnMinutes: integer("respawn_minutes"),
  lastKilledAt: text("last_killed_at"),
  memo: text("memo"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type BossTimer = typeof bossTimers.$inferSelect;
export type NewBossTimer = typeof bossTimers.$inferInsert;

// 더 이상 어떤 코드에서도 읽거나 쓰지 않는 구 출석 시스템 — content_schedules +
// scheduleCheckins로 대체되었다. 마이그레이션은 additive-only 관례라 테이블
// 자체는 드롭하지 않고, 기존 데이터를 보존한 채 스키마 선언만 남겨둔다.
export const attendanceEvents = sqliteTable("attendance_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contentType: text("content_type", { enum: contentTypes }).notNull(),
  subtitle: text("subtitle"),
  serverName: text("server_name"),
  deadline: text("deadline").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type AttendanceEvent = typeof attendanceEvents.$inferSelect;
export type NewAttendanceEvent = typeof attendanceEvents.$inferInsert;

export const attendanceStatuses = ["checked_in", "mid_join", "cancelled"] as const;

export const attendanceRecords = sqliteTable(
  "attendance_records",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id")
      .notNull()
      .references(() => attendanceEvents.id, { onDelete: "cascade" }),
    memberId: integer("member_id")
      .notNull()
      .references(() => guildMembers.id, { onDelete: "cascade" }),
    status: text("status", { enum: attendanceStatuses }).notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("attendance_records_event_member_idx").on(table.eventId, table.memberId),
  ]
);

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;

// 콘텐츠 일정표(content_schedules) 항목에 대한 회원 셀프 체크인. attendance_records와
// 구조는 같지만 완전히 무관한 attendance_events가 아니라 content_schedules를 참조한다.
export const scheduleCheckins = sqliteTable(
  "schedule_checkins",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    scheduleId: integer("schedule_id")
      .notNull()
      .references(() => contentSchedules.id, { onDelete: "cascade" }),
    memberId: integer("member_id")
      .notNull()
      .references(() => guildMembers.id, { onDelete: "cascade" }),
    status: text("status", { enum: attendanceStatuses }).notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("schedule_checkins_schedule_member_idx").on(table.scheduleId, table.memberId),
  ]
);

export type ScheduleCheckin = typeof scheduleCheckins.$inferSelect;
export type NewScheduleCheckin = typeof scheduleCheckins.$inferInsert;
