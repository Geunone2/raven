import { bankTransactionTypeLabels, manualBankTransactionTypes } from "@/lib/constants/bank";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";

export function BankAdjustForm({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="종류" htmlFor="type">
          <Select id="type" name="type" defaultValue="deposit">
            {manualBankTransactionTypes.map((type) => (
              <option key={type} value={type}>
                {bankTransactionTypeLabels[type]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="금액" htmlFor="amount">
          <Input id="amount" name="amount" type="number" required />
        </FormField>
      </div>
      <FormField label="메모" htmlFor="memo">
        <Textarea id="memo" name="memo" rows={2} />
      </FormField>
      <div className="flex justify-end pt-2">
        <Button type="submit">기록</Button>
      </div>
    </form>
  );
}
