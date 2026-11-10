"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/analytics";
import { buttonClass } from "./ui";

export const OPEN_LEAD_EVENT = "lead-modal:open";

export function openLeadModal(source: string) {
  track("lead_modal_open", { source });
  window.dispatchEvent(new CustomEvent(OPEN_LEAD_EVENT, { detail: { source } }));
}

export function OpenLeadButton({
  source,
  children = "Обсудить проект",
  variant = "primary",
  size = "md",
  className,
  onOpen,
}: {
  source: string;
  onOpen?: () => void;
  children?: ReactNode;
  variant?: Parameters<typeof buttonClass>[0];
  size?: Parameters<typeof buttonClass>[1];
  className?: string;
}) {
  return (
    <button
      type="button"
      className={buttonClass(variant, size, className)}
      onClick={() => {
        onOpen?.();
        track("cta_click", { source });
        openLeadModal(source);
      }}
      aria-haspopup="dialog"
    >
      {children}
    </button>
  );
}
