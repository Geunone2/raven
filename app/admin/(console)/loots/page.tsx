import { getLoots } from "@/lib/actions/loots";
import { LootFilterBar } from "@/components/organisms/LootFilterBar";
import { LootTable } from "@/components/organisms/LootTable";

export default async function LootsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const rows = await getLoots({ status });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        보상 분배
      </h1>
      <LootFilterBar defaultStatus={status} />
      <LootTable rows={rows} />
    </div>
  );
}
