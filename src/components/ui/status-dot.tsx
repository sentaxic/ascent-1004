import { cn } from "@/lib/utils";

export function StatusDot({ status = "stable" }: { status?: "stable" | "warning" | "critical" }) {
  return (
    <span
      className={cn(
        "inline-flex size-2 rounded-full shadow-[0_0_16px_currentColor]",
        status === "stable" && "bg-[#80d68f] text-[#80d68f]",
        status === "warning" && "bg-[#f5a524] text-[#f5a524]",
        status === "critical" && "bg-[#ff3b30] text-[#ff3b30]",
      )}
    />
  );
}
