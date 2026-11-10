import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Variant = "primary" | "dark" | "outline" | "outlineLight" | "ghost";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark active:translate-y-px shadow-[0_8px_20px_-8px_rgb(35_72_255/0.6)]",
  dark: "bg-ink text-white hover:bg-ink-3 active:translate-y-px",
  outline: "border border-ink/15 bg-white text-ink hover:border-ink/40 active:translate-y-px",
  outlineLight: "border border-white/25 text-white hover:border-white/60 hover:bg-white/5 active:translate-y-px",
  ghost: "text-brand hover:bg-brand-soft",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[background-color,border-color,transform,color] duration-150 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    extra,
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Tag className="mt-3 text-3xl font-extrabold leading-[1.15] tracking-tight text-balance sm:text-4xl">{title}</Tag>
        {lead && <p className="mt-4 text-lg leading-relaxed text-muted">{lead}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}
