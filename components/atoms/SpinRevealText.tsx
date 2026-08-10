"use client";

import { useEffect, useState } from "react";
import { RouletteText } from "@/components/atoms/RouletteText";

const SPIN_TICKS = 8;
const SPIN_INTERVAL_MS = 80;

function randomizeDigits(template: string): string {
  return template.replace(/\d/g, () => String(Math.floor(Math.random() * 10)));
}

// text가 처음 나타날 때는 RouletteText 혼자서는 자리별 애니메이션을 타지 못한다
// (그 자리의 AnimatePresence가 이번에 처음 마운트되는 것이라 initial={false}에
// 의해 진입 애니메이션이 생략됨). 그래서 실제 값을 곧장 보여주는 대신, 무작위
// 숫자를 여러 번 빠르게 갈아끼워 이미 마운트된 자리끼리의 숫자 교체 애니메이션
// (=룰렛처럼 도는 효과)을 몇 차례 겪게 한 뒤 마지막에 진짜 값으로 착지시킨다.
// spinKey가 바뀔 때마다(=재계산할 때마다) 새로 스핀한다.
export function SpinRevealText({ text, spinKey }: { text: string; spinKey: number }) {
  const [display, setDisplay] = useState(() => randomizeDigits(text));

  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      if (tick >= SPIN_TICKS) {
        clearInterval(interval);
        setDisplay(text);
      } else {
        setDisplay(randomizeDigits(text));
      }
    }, SPIN_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey]);

  return <RouletteText text={display} />;
}
