"use client";

import { useActionState, useEffect, useRef } from "react";
import { attendanceStatuses } from "@/lib/db/schema";
import { attendanceStatusLabels } from "@/lib/constants/attendance";
import { setMyScheduleCheckin } from "@/lib/actions/scheduleCheckins";
import { useToast } from "@/components/atoms/ToastProvider";
import { useClickDebounce } from "@/lib/hooks/useClickDebounce";

const STATUS_TONE_CLASSES: Record<(typeof attendanceStatuses)[number], string> = {
  checked_in: "border-success text-success bg-success/10 hover:bg-success/20",
  mid_join: "border-info text-info bg-info/10 hover:bg-info/20",
  cancelled: "border-danger text-danger bg-danger/10 hover:bg-danger/20",
};

const STATUS_ACTIVE_CLASSES: Record<(typeof attendanceStatuses)[number], string> = {
  checked_in: "border-success bg-success text-ink-inverse",
  mid_join: "border-info bg-info text-ink-inverse",
  cancelled: "border-danger bg-danger text-ink-inverse",
};

// 토스트 색상은 눌린 버튼 자체의 색상(출석=success/초록, 중간합류=info/파랑,
// 출석취소=danger/빨강)을 그대로 따른다. 실패 시에는 원인과 무관하게 danger로 통일.
const STATUS_TOAST_TONE: Record<(typeof attendanceStatuses)[number], "success" | "info" | "danger"> = {
  checked_in: "success",
  mid_join: "info",
  cancelled: "danger",
};

export function ScheduleCheckinButtons({
  scheduleId,
  myStatus,
  disabled,
}: {
  scheduleId: number;
  myStatus: (typeof attendanceStatuses)[number] | null;
  disabled: boolean;
}) {
  const { showToast } = useToast();
  // ref로 두는 이유: state(서버 응답)가 실제로 바뀔 때만 토스트를 띄우고 싶은데,
  // 이걸 useState로 두면 클릭 즉시(서버 응답 전) 값이 바뀌면서 그 자체로 effect
  // 의존성이 갱신되어 아직 처리되지 않은 이전 state로 effect가 한 번 더 실행되는
  // 문제가 있었다(연타 시 토스트가 이상하게 겹쳐 뜨는 원인).
  const lastStatusRef = useRef<(typeof attendanceStatuses)[number] | null>(null);
  const [state, formAction, isPending] = useActionState(
    setMyScheduleCheckin.bind(null, scheduleId),
    null
  );
  const guardClick = useClickDebounce();

  useEffect(() => {
    if (!state) return;
    const tone = state.ok && lastStatusRef.current ? STATUS_TOAST_TONE[lastStatusRef.current] : "danger";
    showToast(state.message, tone);
  }, [state, showToast]);

  return (
    <form action={formAction} className="mt-3 flex gap-2">
      {attendanceStatuses.map((status) => (
        <button
          key={status}
          type="submit"
          name="status"
          value={status}
          onClick={(event) => {
            // 이미 저장된 상태와 같은 버튼을 다시 누르면 서버에 요청을 보낼
            // 필요가 없다 — 여기서 바로 막고 안내만 띄운다(디바운스 잠금도
            // 안 걸어서, 이 클릭 직후 다른 상태를 눌러도 정상 처리된다).
            if (status === myStatus) {
              event.preventDefault();
              showToast(`이미 ${attendanceStatusLabels[status]}(으)로 응답했습니다.`, STATUS_TOAST_TONE[status]);
              return;
            }
            if (!guardClick(event)) return;
            lastStatusRef.current = status;
          }}
          disabled={disabled || isPending}
          className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            myStatus === status ? STATUS_ACTIVE_CLASSES[status] : STATUS_TONE_CLASSES[status]
          }`}
        >
          {attendanceStatusLabels[status]}
        </button>
      ))}
    </form>
  );
}
