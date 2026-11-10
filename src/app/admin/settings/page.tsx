"use client";

import { useState } from "react";
import { api } from "@/admin/api";
import { saveError } from "@/admin/editor";
import { fmtDateTime } from "@/admin/format";
import { ListEditor, type FieldErrors } from "@/admin/forms";
import { useLoad } from "@/admin/hooks";
import type { Settings } from "@/admin/types";
import { Button, Card, ErrorBlock, Field, Input, LoadingBlock, PageHeader, useToast } from "@/admin/ui";

export default function SettingsPage() {
  const { data, error, loading, reload } = useLoad(() => api.get<Settings>("/api/admin/settings"), []);
  if (loading && !data) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error ?? "Ошибка"} onRetry={reload} />;
  return <SettingsForm initial={data} />;
}

function SettingsForm({ initial }: { initial: Settings }) {
  const toast = useToast();
  const [s, setS] = useState<Settings>({ ...initial, leadNotifyEmails: initial.leadNotifyEmails.length ? initial.leadNotifyEmails : [""] });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  async function save() {
    setBusy(true);
    setErrors({});
    try {
      const body = { ...s, leadNotifyEmails: s.leadNotifyEmails.map((x) => x.trim()).filter(Boolean) };
      const r = await api.put<Settings>("/api/admin/settings", body);
      setS({ ...r, leadNotifyEmails: r.leadNotifyEmails.length ? r.leadNotifyEmails : [""] });
      toast("Настройки сохранены — сайт обновится через несколько секунд");
    } catch (e) {
      const err = saveError(e);
      setErrors(err.fields);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  const err = (prefix: string) => Object.entries(errors).find(([k]) => k.startsWith(prefix))?.[1];

  return (
    <>
      <PageHeader
        title="Настройки сайта"
        description={`Контакты в шапке, подвале и на странице «Контакты». Изменены ${fmtDateTime(s.updatedAt)}`}
        actions={
          <Button loading={busy} onClick={save}>
            Сохранить
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Компания и контакты">
          <div className="space-y-4">
            <Field label="Название компании" required error={errors.companyName} hint="В подвале и разметке для поисковиков">
              {(id) => <Input id={id} value={s.companyName} onChange={(e) => set("companyName", e.target.value)} />}
            </Field>
            <Field label="Слоган" error={errors.tagline}>
              {(id) => <Input id={id} value={s.tagline} onChange={(e) => set("tagline", e.target.value)} />}
            </Field>
            <Field label="Телефон" error={errors.phone}>
              {(id) => <Input id={id} type="tel" value={s.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+7 (900) 000-00-00" />}
            </Field>
            <Field label="Email" error={errors.email}>
              {(id) => <Input id={id} type="email" value={s.email} onChange={(e) => set("email", e.target.value)} />}
            </Field>
            <Field label="Адрес" error={errors.address}>
              {(id) => <Input id={id} value={s.address} onChange={(e) => set("address", e.target.value)} />}
            </Field>
            <Field label="Режим работы" error={errors.workingHours}>
              {(id) => <Input id={id} value={s.workingHours} onChange={(e) => set("workingHours", e.target.value)} />}
            </Field>
          </div>
        </Card>
        <Card title="Уведомления о заявках" description="На эти адреса придёт письмо о каждой новой заявке с сайта">
          <ListEditor label="Почты" items={s.leadNotifyEmails} onChange={(v) => set("leadNotifyEmails", v)} placeholder="sales@company.ru" />
          {err("leadNotifyEmails") && <p className="mt-2 text-sm font-medium text-danger">{err("leadNotifyEmails")}</p>}
        </Card>
      </div>
    </>
  );
}
