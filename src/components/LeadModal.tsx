"use client";

import { useEffect, useRef, useState } from "react";
import { ContactForm } from "./ContactForm";
import { Icon } from "./Icon";
import { OPEN_LEAD_EVENT } from "./OpenLeadButton";

export function LeadModal() {
  const ref = useRef<HTMLDialogElement>(null);
  const [source, setSource] = useState("modal");
  // новый ключ при каждом открытии сбрасывает состояние формы
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const open = (e: Event) => {
      const detail = (e as CustomEvent<{ source?: string }>).detail;
      setSource(detail?.source ?? "modal");
      setFormKey((k) => k + 1);
      ref.current?.showModal();
      document.documentElement.style.overflow = "hidden";
    };
    window.addEventListener(OPEN_LEAD_EVENT, open);
    return () => window.removeEventListener(OPEN_LEAD_EVENT, open);
  }, []);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="lead-modal-title"
      onClose={() => {
        document.documentElement.style.overflow = "";
      }}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm open:animate-[modal-in_180ms_ease-out]"
    >
      <div className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
          aria-label="Закрыть"
        >
          <Icon name="close" />
        </button>
        <h2 id="lead-modal-title" className="pr-10 text-2xl font-extrabold tracking-tight">
          Обсудим ваш проект
        </h2>
        <p className="mt-2 text-muted">Оставьте контакты — перезвоним в течение рабочего дня и зададим пару уточняющих вопросов.</p>
        <div className="mt-6">
          <ContactForm key={formKey} source={source} variant="modal" compact onDone={close} />
        </div>
      </div>
    </dialog>
  );
}
