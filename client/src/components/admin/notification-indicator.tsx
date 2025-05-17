import { cn } from "@/lib/utils";

interface NotificationIndicatorProps {
  count?: number;
  className?: string;
}

export function NotificationIndicator({ count, className }: NotificationIndicatorProps) {
  const displayCount = count === undefined ? "" : count > 9 ? "9+" : count.toString();
  
  return (
    <span className={cn(
      "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white",
      className
    )}>
      {displayCount}
    </span>
  );
}