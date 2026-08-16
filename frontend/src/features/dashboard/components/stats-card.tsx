import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatsCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="gap-3 p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon size={16} />
        </div>
      </div>
      <p className="font-serif text-3xl text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Card>
  );
}
