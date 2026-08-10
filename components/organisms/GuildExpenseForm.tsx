import { recordGuildExpense } from "@/lib/actions/treasury";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";

export function GuildExpenseForm() {
  return (
    <form action={recordGuildExpense} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="날짜" htmlFor="date">
          <Input id="date" name="date" type="date" required />
        </FormField>
        <FormField label="지출 금액" htmlFor="amount">
          <Input id="amount" name="amount" type="number" min="1" required />
        </FormField>
      </div>
      <FormField label="사유" htmlFor="reason">
        <Input id="reason" name="reason" required />
      </FormField>
      <FormField label="비고" htmlFor="note">
        <Textarea id="note" name="note" rows={2} />
      </FormField>
      <div className="flex justify-end pt-2">
        <Button type="submit" variant="danger">
          지출 기록
        </Button>
      </div>
    </form>
  );
}
