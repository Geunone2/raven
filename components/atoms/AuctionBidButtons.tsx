"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { useToast } from "@/components/atoms/ToastProvider";
import { useClickDebounce } from "@/lib/hooks/useClickDebounce";
import { placeBid, cancelBid } from "@/lib/actions/loots";

export function AuctionBidButtons({
  lootId,
  ended,
  hasMyBid,
  fullWidth = false,
}: {
  lootId: number;
  ended: boolean;
  hasMyBid: boolean;
  fullWidth?: boolean;
}) {
  const { showToast } = useToast();
  const [bidState, bidAction, isBidding] = useActionState(placeBid.bind(null, lootId), null);
  const [cancelState, cancelAction, isCancelling] = useActionState(
    cancelBid.bind(null, lootId),
    null
  );
  const guardBid = useClickDebounce();
  const guardCancel = useClickDebounce();

  // 입찰 성공은 금색(brand)으로, 실패는 원인과 무관하게 danger로 통일해 문제가
  // 생겼음을 분명히 한다. 입찰 취소는 버튼 자체 색상(danger)을 그대로 따른다.
  useEffect(() => {
    if (bidState) showToast(bidState.message, bidState.ok ? "brand" : "danger");
  }, [bidState, showToast]);

  useEffect(() => {
    if (cancelState) showToast(cancelState.message, "danger");
  }, [cancelState, showToast]);

  return (
    <>
      <form action={bidAction} className={fullWidth ? "flex-1" : undefined}>
        <Button
          type="submit"
          variant="secondary"
          onClick={guardBid}
          disabled={ended || hasMyBid || isBidding}
          className={fullWidth ? "w-full" : undefined}
        >
          입찰하기
        </Button>
      </form>
      <form action={cancelAction} className={fullWidth ? "flex-1" : undefined}>
        <Button
          type="submit"
          variant="danger"
          onClick={guardCancel}
          disabled={ended || !hasMyBid || isCancelling}
          className={fullWidth ? "w-full" : undefined}
        >
          입찰 취소
        </Button>
      </form>
    </>
  );
}
