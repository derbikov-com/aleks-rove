"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { readUtm, track } from "@/lib/analytics";
import { formatPhone, validateLead, type LeadErrors, type LeadInput } from "@/lib/lead";
import { Icon } from "./Icon";
import { buttonClass, cn } from "./ui";

type Status = "idle" | "sending" | "success" | "error";

const empty: LeadInput = { name: "", phone: "", email: "", company: "", message: "", consent: false };
const fieldOrder: (keyof LeadInput)[] = ["name", "phone", "email", "company", "message", "consent"];

export function ContactForm({
  source,
  variant = "page",
  onDone,
  compact = false,
}: {
  source: string;
  /** page — редирект на /spasibo, modal — сообщение об успехе внутри формы */
  variant?: "page" | "modal";
  onDone?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef<number>(0);
  const [values, setValues] = useState<LeadInput>(empty);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LeadInput, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const id = (f: string) => `${uid}-${f}`;

  // время показа формы — для антиспам-проверки «слишком быстрая отправка»
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  function update<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key]) setErrors((e) => ({ ...e, [key]: validateLead(next).errors[key] }));
  }

  function blur(key: keyof LeadInput) {
    const next = key === "phone" ? { ...values, phone: formatPhone(values.phone) } : values;
    if (key === "phone") setValues(next);
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((e) => ({ ...e, [key]: validateLead(next).errors[key] }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const { errors: errs } = validateLead(values);
    setErrors(errs);
    setTouched(Object.fromEntries(fieldOrder.map((f) => [f, true])));
    const firstInvalid = fieldOrder.find((f) => errs[f]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id(firstInvalid))}`)?.focus();
      return;
    }

    setStatus("sending");
    setServerError("");
    const honeypot = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: honeypot,
          startedAt: startedAt.current || Date.now(),
          source,
          page: window.location.pathname,
          utm: readUtm(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 422 && body.errors) {
        setErrors(body.errors);
        setStatus("idle");
        return;
      }
      if (!res.ok) throw new Error(body.message || "Не удалось отправить заявку");

      track("generate_lead", { form: source });
      if (variant === "page") {
        router.push("/spasibo");
        return;
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setServerError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "Нет соединения с сервером. Попробуйте ещё раз.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center py-6 text-center" role="status">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
          <Icon name="check" size={28} />
        </span>
        <p className="mt-5 text-2xl font-extrabold">Заявка отправлена</p>
        <p className="mt-2 max-w-sm text-muted">Спасибо! Мы свяжемся с вами в течение рабочего дня.</p>
        {onDone && (
          <button type="button" className={buttonClass("dark", "md", "mt-6")} onClick={onDone}>
            Закрыть
          </button>
        )}
      </div>
    );
  }

  const inputClass = (field: keyof LeadInput) =>
    cn(
      "block w-full rounded-xl border bg-white px-4 text-base text-ink placeholder:text-ink/35 transition-colors",
      "focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15",
      errors[field] ? "border-danger" : "border-line hover:border-ink/30",
    );

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="relative">
      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <Field id={id("name")} label="Имя" required error={errors.name}>
          <input
            id={id("name")}
            name="name"
            autoComplete="name"
            className={cn(inputClass("name"), "h-12")}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => blur("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? id("name-err") : undefined}
            aria-required="true"
          />
        </Field>
        <Field id={id("phone")} label="Телефон" required error={errors.phone}>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 (___) ___-__-__"
            className={cn(inputClass("phone"), "h-12")}
            value={values.phone}
            onChange={(e) => update("phone", e.target.value.replace(/[^\d+()\-\s]/g, ""))}
            onBlur={() => blur("phone")}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? id("phone-err") : undefined}
            aria-required="true"
          />
        </Field>
        <Field id={id("email")} label="Email" error={errors.email}>
          <input
            id={id("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={cn(inputClass("email"), "h-12")}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => blur("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? id("email-err") : undefined}
          />
        </Field>
        {!compact && (
          <Field id={id("company")} label="Компания" error={errors.company}>
            <input
              id={id("company")}
              name="company"
              autoComplete="organization"
              className={cn(inputClass("company"), "h-12")}
              value={values.company}
              onChange={(e) => update("company", e.target.value)}
            />
          </Field>
        )}
        <Field id={id("message")} label="Коротко о задаче" error={errors.message} className={cn(!compact && "sm:col-span-2")}>
          <textarea
            id={id("message")}
            name="message"
            rows={compact ? 3 : 4}
            maxLength={2000}
            className={cn(inputClass("message"), "resize-y py-3")}
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
          />
        </Field>
      </div>

      {/* Ловушка для ботов: поле невидимо для людей */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Сайт
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="mt-5">
        <label htmlFor={id("consent")} className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-muted">
          <input
            id={id("consent")}
            name="consent"
            type="checkbox"
            className={cn(
              "mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border accent-brand",
              errors.consent ? "outline-2 outline-danger" : "border-line",
            )}
            checked={values.consent}
            onChange={(e) => {
              update("consent", e.target.checked);
              setTouched((t) => ({ ...t, consent: true }));
              setErrors((er) => ({ ...er, consent: e.target.checked ? undefined : er.consent }));
            }}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? id("consent-err") : undefined}
          />
          <span>
            Соглашаюсь с{" "}
            <Link href="/politika-konfidencialnosti" className="text-brand underline underline-offset-2" target="_blank">
              политикой обработки персональных данных
            </Link>
          </span>
        </label>
        {errors.consent && (
          <p id={id("consent-err")} className="mt-1.5 text-sm font-medium text-danger">
            {errors.consent}
          </p>
        )}
      </div>

      {status === "error" && serverError && (
        <p role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className={buttonClass("primary", "lg", "mt-6 w-full sm:w-auto")}
      >
        {status === "sending" ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            Отправляем…
          </>
        ) : (
          <>
            Отправить заявку
            <Icon name="arrowRight" size={18} />
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
