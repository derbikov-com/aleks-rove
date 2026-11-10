"use client";

import { useState, type FormEvent } from "react";
import { LogoMark } from "@/components/Logo";
import { api, errorMessage } from "./api";
import { useAuth } from "./auth";
import { Button, Field, Input } from "./ui";

/** Вход по коду из письма: почта → 6 цифр → токен. */
export function LoginScreen() {
  const { login } = useAuth();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function requestCode(e?: FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/api/auth/request-code", { email: email.trim() });
      setStep("code");
      setInfo(`Если у ${email.trim()} есть доступ, мы отправили на неё код из 6 цифр.`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { token } = await api.post<{ token: string }>("/api/auth/verify-code", { email: email.trim(), code });
      await login(token);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3">
          <LogoMark className="h-10 w-10" />
          <span className="text-xl font-extrabold tracking-tight">Админка сайта</span>
        </div>
        <div className="rounded-2xl border border-line bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          {step === "email" ? (
            <form onSubmit={requestCode} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold">Вход</h1>
                <p className="mt-1 text-sm text-muted">Паролей нет: пришлём одноразовый код на почту.</p>
              </div>
              <Field label="Рабочая почта">
                {(id) => (
                  <Input
                    id={id}
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.ru"
                  />
                )}
              </Field>
              {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}
              <Button type="submit" loading={busy} className="w-full">
                Получить код
              </Button>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-5">
              <div>
                <h1 className="text-xl font-bold">Код из письма</h1>
                <p className="mt-1 text-sm text-muted">{info} Код действует 10 минут.</p>
              </div>
              <Field label="Код">
                {(id) => (
                  <Input
                    id={id}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-2xl font-bold tracking-[0.4em]"
                    placeholder="••••••"
                  />
                )}
              </Field>
              {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}
              <Button type="submit" loading={busy} disabled={code.length !== 6} className="w-full">
                Войти
              </Button>
              <div className="flex justify-between text-sm">
                <button type="button" className="font-semibold text-muted hover:text-ink" onClick={() => { setStep("email"); setCode(""); setError(""); }}>
                  Другая почта
                </button>
                <button type="button" className="font-semibold text-brand hover:underline" disabled={busy} onClick={() => requestCode()}>
                  Отправить ещё раз
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
