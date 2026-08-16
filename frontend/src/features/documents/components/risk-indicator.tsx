import { cn } from "@/lib/utils";
import { RISK_LEVEL_STYLES, type RiskLevel } from "@/lib/constants";

const SIZES = {
  sm: { dot: "h-1.5 w-1.5", text: "text-xs", padding: "px-2 py-0.5" },
  md: { dot: "h-2 w-2", text: "text-xs font-medium", padding: "px-2.5 py-1" },
  lg: { dot: "h-2.5 w-2.5", text: "text-sm font-semibold", padding: "px-3 py-1.5" },
};

export function RiskIndicator({
  level,
  size = "md",
  showLabel = true,
}: {
  level?: RiskLevel | string;
  size?: keyof typeof SIZES;
  showLabel?: boolean;
}) {
  const normalized = (RISK_LEVEL_STYLES[level as RiskLevel] && level) || "Unknown";
  const config = RISK_LEVEL_STYLES[normalized as RiskLevel];
  const sz = SIZES[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border",
        config.badgeClass,
        sz.padding,
      )}
    >
      <span className={cn("flex-shrink-0 rounded-full", sz.dot, config.dotClass)} />
      {showLabel && <span className={sz.text}>{config.label}</span>}
    </span>
  );
}
