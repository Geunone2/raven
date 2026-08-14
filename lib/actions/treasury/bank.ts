"use server";

import { asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { GuildMember, bankTransactions, guildMembers } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/adminSession";
import { manualBankTransactionTypes } from "@/lib/constants/treasury/bank";

export async function getBankBalance(memberId: number): Promise<number> {
  const rows = await db
    .select()
    .from(bankTransactions)
    .where(eq(bankTransactions.memberId, memberId));
  return rows.reduce((sum, row) => sum + row.amount, 0);
}

export async function getBankBalances(): Promise<
  { member: GuildMember; balance: number }[]
> {
  const [members, transactions] = await Promise.all([
    db.select().from(guildMembers).orderBy(asc(guildMembers.nickname)),
    db.select().from(bankTransactions),
  ]);

  const balanceByMember = new Map<number, number>();
  for (const tx of transactions) {
    balanceByMember.set(tx.memberId, (balanceByMember.get(tx.memberId) ?? 0) + tx.amount);
  }

  return members.map((member) => ({
    member,
    balance: balanceByMember.get(member.id) ?? 0,
  }));
}

export async function getBankBalancesWithBreakdown(): Promise<
  { member: GuildMember; deposit: number; withdrawal: number; balance: number }[]
> {
  const [members, transactions] = await Promise.all([
    db.select().from(guildMembers).orderBy(asc(guildMembers.nickname)),
    db.select().from(bankTransactions),
  ]);

  const depositByMember = new Map<number, number>();
  const withdrawalByMember = new Map<number, number>();
  for (const tx of transactions) {
    if (tx.amount > 0) {
      depositByMember.set(tx.memberId, (depositByMember.get(tx.memberId) ?? 0) + tx.amount);
    } else if (tx.amount < 0) {
      withdrawalByMember.set(
        tx.memberId,
        (withdrawalByMember.get(tx.memberId) ?? 0) + Math.abs(tx.amount)
      );
    }
  }

  return members.map((member) => {
    const deposit = depositByMember.get(member.id) ?? 0;
    const withdrawal = withdrawalByMember.get(member.id) ?? 0;
    return { member, deposit, withdrawal, balance: deposit - withdrawal };
  });
}

export async function getBankTransactions(memberId: number) {
  return db
    .select()
    .from(bankTransactions)
    .where(eq(bankTransactions.memberId, memberId))
    .orderBy(desc(bankTransactions.createdAt));
}

export async function createBankTransaction(memberId: number, formData: FormData) {
  await requireAdmin();

  const typeRaw = String(formData.get("type") ?? "");
  const type = (manualBankTransactionTypes as readonly string[]).includes(typeRaw)
    ? (typeRaw as (typeof manualBankTransactionTypes)[number])
    : "adjustment";
  const rawAmount = Number(formData.get("amount") ?? 0);
  const amount =
    type === "withdrawal"
      ? -Math.abs(rawAmount)
      : type === "deposit"
        ? Math.abs(rawAmount)
        : rawAmount;
  const memo = String(formData.get("memo") ?? "").trim() || null;

  await db.insert(bankTransactions).values({ memberId, type, amount, memo });

  revalidatePath("/admin/bank");
  revalidatePath(`/admin/bank/${memberId}`);
  revalidatePath("/bank");
}
