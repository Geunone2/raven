import Image from "next/image";
import { getClassShortName, getClassIcon } from "@/lib/constants/classes";

export function ClassBadge({ job }: { job: string }) {
  const icon = job ? getClassIcon(job) : null;

  return (
    <span className="inline-flex w-20 shrink-0 items-center rounded-full bg-surface-hover px-2 py-0.5 text-xs font-medium text-ink-muted">
      {icon && <Image src={icon} alt="" width={14} height={14} className="size-6" />}
      {job ? getClassShortName(job) : "-"}
    </span>
  );
}
