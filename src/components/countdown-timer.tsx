import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

function diff(target: Date) {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms / 3600000) % 24),
    m: Math.floor((ms / 60000) % 60),
    s: Math.floor((ms / 1000) % 60),
    done: false,
  };
}

export function CountdownTimer({ endsAt, compact = false }: { endsAt: string | Date; compact?: boolean }) {
  const target = typeof endsAt === "string" ? new Date(endsAt) : endsAt;
  const [t, setT] = useState(() => diff(target));
  useEffect(() => {
    const i = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(i);
  }, [target]);

  if (t.done) return <span className="text-sm font-semibold text-destructive">অফার শেষ</span>;

  const cells = [
    { v: t.d, l: "দিন" },
    { v: t.h, l: "ঘণ্টা" },
    { v: t.m, l: "মিনিট" },
    { v: t.s, l: "সেকেন্ড" },
  ];
  return (
    <div className={`flex items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      <Timer className="h-4 w-4 text-primary" />
      <div className="flex items-center gap-1.5">
        {cells.map((c) => (
          <div key={c.l} className="flex flex-col items-center rounded-md bg-secondary px-2 py-1 text-secondary-foreground">
            <span className="font-mono text-base font-bold leading-none tabular-nums">{c.v.toString().padStart(2, "0")}</span>
            <span className="text-[9px] uppercase opacity-80">{c.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
