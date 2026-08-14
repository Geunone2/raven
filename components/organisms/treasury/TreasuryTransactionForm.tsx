import { recordGuildTransaction } from "@/lib/actions/treasury/treasury";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";

const TYPE_OPTIONS = [
  { value: "income", label: "수입" },
  { value: "expense", label: "지출" },
];

// 길드 통장에 손으로 기록하는 기타 수입/지출 — 내판 정산·정산 분배처럼 자동으로
// 쌓이는 거래와 달리 운영진이 직접 입력한다. "종류"에서 수입/지출을 고르면
// recordGuildTransaction이 부호를 알아서 맞춰 저장한다.
export function TreasuryTransactionForm() {
  return (
    <form action={recordGuildTransaction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="종류" htmlFor="type">
          <CustomSelect id="type" name="type" defaultValue="expense" options={TYPE_OPTIONS} />
        </FormField>
        <FormField label="금액" htmlFor="amount">
          <Input id="amount" name="amount" type="number" min="1" required />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="날짜" htmlFor="date">
          <Input id="date" name="date" type="date" required />
        </FormField>
        <FormField label="사유" htmlFor="reason">
          <Input id="reason" name="reason" required />
        </FormField>
      </div>
      <FormField label="비고" htmlFor="note">
        <Textarea id="note" name="note" rows={2} />
      </FormField>
      <div className="flex justify-end pt-2">
        <Button type="submit">기록</Button>
      </div>
    </form>
  );
}
