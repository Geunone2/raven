"use client";

import { useCallback, useRef } from "react";
import type { MouseEvent } from "react";

// isPending(useActionState)은 리액트가 상태를 반영할 때까지 한 틱 정도의 틈이 있어
// 그 사이의 연타(더블클릭 등)를 막지 못한다. 이 훅은 클릭 즉시 ref로 동기 잠금을 걸어
// 그 틈을 없앤다. 반환값이 false면 이번 클릭은 잠겨 있었다는 뜻(호출부에서 추가 처리
// 스킵에 사용 가능), submit 자체는 event.preventDefault()로 이미 막혀 있다.
export function useClickDebounce(delayMs = 800) {
  const lockedRef = useRef(false);

  return useCallback(
    (event: MouseEvent) => {
      if (lockedRef.current) {
        event.preventDefault();
        return false;
      }
      lockedRef.current = true;
      setTimeout(() => {
        lockedRef.current = false;
      }, delayMs);
      return true;
    },
    [delayMs]
  );
}
