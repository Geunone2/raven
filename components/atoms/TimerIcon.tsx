import { Timer } from "lucide-react";

export function TimerIcon({ className = "size-3.5" }: { className?: string }) {
  return <Timer className={`animate-pulse ${className}`} />;
}
