import { createLoot } from "@/lib/actions/loots";
import { LootForm } from "@/components/organisms/LootForm";

export default async function NewLootPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        전리품 등록
      </h1>
      <LootForm action={createLoot} />
    </div>
  );
}
