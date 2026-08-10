import { createLoot } from "@/lib/actions/loots";
import { getSchedules } from "@/lib/actions/schedules";
import { LootForm } from "@/components/organisms/LootForm";

export default async function NewLootPage() {
  const schedules = await getSchedules();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        전리품 등록
      </h1>
      <LootForm schedules={schedules} action={createLoot} />
    </div>
  );
}
