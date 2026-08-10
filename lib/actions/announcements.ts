"use server";

import { and, asc, desc, eq, gt, like, lt, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { announcementCategories, announcements } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/adminSession";

export async function getAnnouncements(filters: { category?: string } = {}) {
  const conditions = [];
  if (
    filters.category &&
    (announcementCategories as readonly string[]).includes(filters.category)
  ) {
    conditions.push(
      eq(announcements.category, filters.category as (typeof announcementCategories)[number])
    );
  }

  const rows = await db
    .select()
    .from(announcements)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(announcements.createdAt));

  return rows.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
}

export async function getAnnouncementsPage({
  query,
  offset,
  limit,
}: {
  query: string;
  offset: number;
  limit: number;
}) {
  const condition = query
    ? or(like(announcements.title, `%${query}%`), like(announcements.content, `%${query}%`))
    : undefined;

  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(announcements)
      .where(condition)
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)` })
      .from(announcements)
      .where(condition),
  ]);

  return { items, total };
}

export async function getAnnouncement(id: number) {
  const [announcement] = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, id));
  return announcement;
}

export async function getAdjacentAnnouncements(current: {
  id: number;
  createdAt: string;
}) {
  const [older] = await db
    .select()
    .from(announcements)
    .where(
      or(
        lt(announcements.createdAt, current.createdAt),
        and(eq(announcements.createdAt, current.createdAt), lt(announcements.id, current.id))
      )
    )
    .orderBy(desc(announcements.createdAt), desc(announcements.id))
    .limit(1);

  const [newer] = await db
    .select()
    .from(announcements)
    .where(
      or(
        gt(announcements.createdAt, current.createdAt),
        and(eq(announcements.createdAt, current.createdAt), gt(announcements.id, current.id))
      )
    )
    .orderBy(asc(announcements.createdAt), asc(announcements.id))
    .limit(1);

  return { older: older ?? null, newer: newer ?? null };
}

function parseAnnouncementForm(formData: FormData) {
  return {
    category: String(
      formData.get("category") ?? "general"
    ) as (typeof announcementCategories)[number],
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    isPinned: formData.get("isPinned") === "on",
  };
}

export async function createAnnouncement(formData: FormData) {
  await requireAdmin();
  const values = parseAnnouncementForm(formData);
  await db.insert(announcements).values(values);
  revalidatePath("/admin/announcements");
  revalidatePath("/notices");
  redirect("/admin/announcements");
}

export async function updateAnnouncement(id: number, formData: FormData) {
  await requireAdmin();
  const values = parseAnnouncementForm(formData);
  await db.update(announcements).set(values).where(eq(announcements.id, id));
  revalidatePath("/admin/announcements");
  revalidatePath("/notices");
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(id: number) {
  await requireAdmin();
  await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath("/admin/announcements");
  revalidatePath("/notices");
  redirect("/admin/announcements");
}
