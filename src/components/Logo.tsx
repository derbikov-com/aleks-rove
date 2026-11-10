import { site } from "@/lib/site";
import { cn } from "./ui";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8 shrink-0", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#2348FF" />
      <path d="M8.5 23 15.5 9l7 14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 18h8" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="9" r="3" fill="#C8F04A" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className={cn("text-lg font-extrabold tracking-tight", light ? "text-white" : "text-ink")}>{site.name}</span>
    </span>
  );
}
