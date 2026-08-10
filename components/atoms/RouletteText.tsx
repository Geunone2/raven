"use client";

import { AnimatePresence, motion } from "motion/react";

// Renders text with each digit as its own vertical reel, like a slot
// machine / odometer — used everywhere a live-ticking timer is shown.
// Non-digit characters (labels, separators) render as plain static text.
export function RouletteText({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center leading-none tabular-nums">
      {text.split("").map((char, index) =>
        /\d/.test(char) ? (
          <span
            key={index}
            className="relative inline-block h-[1em] w-[1ch] overflow-hidden"
          >
            <AnimatePresence initial={false}>
              <motion.span
                key={char}
                initial={{ y: "-100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </span>
        ) : (
          <span key={index}>{char}</span>
        )
      )}
    </span>
  );
}
