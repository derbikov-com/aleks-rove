"use client";

import { useState } from "react";
import { api } from "@/admin/api";
import { useMe } from "@/admin/auth";
import { confirmDelete, saveError } from "@/admin/editor";
import { fmtDateTime } from "@/admin/format";
import type { FieldErrors } from "@/admin/forms";
import { useLoad } from "@/admin/hooks";
import { ROLE_LABEL, type AdminUser, type Role } from "@/admin/types";
import { Badge, Button, ErrorBlock, Field, Input, LoadingBlock, Modal, PageHeader, Select, useToast } from "@/admin/ui";

const ROLE_HINT: Record<Role, string> = {
  ADMIN: "Всё, включая пользователей и настройки сайта",
  EDITOR: "Весь контент, публикация, медиа и заявки",
  AUTHOR: "Только свои черновики статей и загрузка картинок",
};

type Draft = { user?: AdminUser; email: string; name: string; role: Role };

export default function UsersPage() {
  const me = useMe();
  const toast = useToast();
  const { data, error, loading, reload } = useLoad(() => api.get<AdminUser[]>("/api/admin/users"), []);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!draft) return;
    setBusy(true);
    setErrors({});
    try {
      if (draft.user) await api.put(`/api/admin/users/${draft.user.id}`, { name: draft.name, role: draft.role });
      else await api.post("/api/admin/users", { email: draft.email, name: draft.name, role: draft.role });
      toast(draft.user ? "Пользователь изменён" : "Доступ выдан — человек входит по коду из письма");
      setDraft(null);
      reload();
    } catch (e) {
      const err = saveError(e);
      setErrors(err.fields);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(u: AdminUser) {
    if (!confirmDelete(`доступ для ${u.email}`)) return;
    try {
      await api.del(`/api/admin/users/${u.id}`);
      toast("Доступ отозван");
      setDraft(null);
      reload();
    } catch (e) {
      toast(saveError(e).message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Пользователи"
        description="Кто может входить в админку. Паролей нет — вход по одноразовому коду на почту"
        actions={
          <Button
            onClick={() => {
              setErrors({});
              setDraft({ email: "", name: "", role: "EDITOR" });
            }}
          >
            Выдать доступ
          </Button>
        }
      />
      {loading && !data ? (
        <LoadingBlock />
      ) : error || !data ? (
        <ErrorBlock message={error ?? "Ошибка"} onRetry={reload} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-[0.9375rem]">
            <thead className="border-b border-line text-sm text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Пользователь</th>
                <th className="px-5 py-3 font-semibold">Роль</th>
                <th className="px-5 py-3 font-semibold">Последний вход</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold">{u.name || "—"}</span>
                    {u.id === me.id && <span className="ml-2 text-sm text-muted">(это вы)</span>}
                    <span className="block text-sm text-muted">{u.email}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex flex-wrap gap-1.5">
                      <Badge tone={u.role === "ADMIN" ? "blue" : "neutral"}>{ROLE_LABEL[u.role]}</Badge>
                      {u.superAdmin && <Badge tone="amber">Супер-админ</Badge>}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted">{u.lastLoginAt ? fmtDateTime(u.lastLoginAt) : "ещё не входил"}</td>
                  <td className="px-5 py-3.5 text-right">
                    {!u.superAdmin && u.id !== me.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setErrors({});
                          setDraft({ user: u, email: u.email, name: u.name ?? "", role: u.role });
                        }}
                      >
                        Изменить
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.user ? "Изменить доступ" : "Выдать доступ"}
        footer={
          <>
            {draft?.user && (
              <Button variant="danger" className="mr-auto" onClick={() => remove(draft.user!)}>
                Отозвать доступ
              </Button>
            )}
            <Button variant="secondary" onClick={() => setDraft(null)}>
              Отмена
            </Button>
            <Button loading={busy} onClick={save}>
              Сохранить
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <Field label="Почта" required error={errors.email} hint={draft.user ? "Почту поменять нельзя — отзовите доступ и выдайте новый" : undefined}>
              {(id) => (
                <Input id={id} type="email" autoFocus={!draft.user} disabled={!!draft.user} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              )}
            </Field>
            <Field label="Имя" required error={errors.name}>
              {(id) => <Input id={id} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />}
            </Field>
            <Field label="Роль" required error={errors.role} hint={ROLE_HINT[draft.role]}>
              {(id) => (
                <Select id={id} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}>
                  {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        )}
      </Modal>
    </>
  );
}
