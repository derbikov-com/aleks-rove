"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "./api";
import { useMe } from "./auth";
import { confirmDelete, EditorLayout, saveError, SeoDetails, useUnsavedWarning } from "./editor";
import { cleanSeo, ImageField, SeoFields, SlugField, type FieldErrors } from "./forms";
import { useLoad } from "./hooks";
import { RichText } from "./RichText";
import type { AdminPost, Category, PostStatus, Seo, Tag, Image } from "./types";
import { Badge, Button, Card, Field, Input, LinkButton, PageHeader, Select, Textarea, useToast } from "./ui";
import { fmtDateTime } from "./format";
import { cn } from "@/components/ui";

type State = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover?: Image;
  categorySlug: string;
  tagSlugs: string[];
  authorName: string;
  authorRole: string;
  status: PostStatus;
  publishedAt: string;
  seo: Seo;
};

const toLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function fromPost(p?: AdminPost): State {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    excerpt: p?.excerpt ?? "",
    body: p?.body ?? "",
    cover: p?.cover,
    categorySlug: p?.categorySlug ?? "",
    tagSlugs: p?.tagSlugs ?? [],
    authorName: p?.authorName ?? "",
    authorRole: p?.authorRole ?? "",
    status: p?.status ?? "DRAFT",
    publishedAt: toLocalInput(p?.publishedAt),
    seo: p?.seo ?? {},
  };
}

export function PostForm({ post }: { post?: AdminPost }) {
  const me = useMe();
  const router = useRouter();
  const toast = useToast();
  const canPublish = me.role !== "AUTHOR";
  const lockedForAuthor = !canPublish && post?.status === "PUBLISHED";
  const [s, setS] = useState<State>(() => fromPost(post));
  const [saved, setSaved] = useState<AdminPost | undefined>(post);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);

  const { data: taxonomy } = useLoad(
    () => Promise.all([api.get<Category[]>("/api/admin/categories"), api.get<Tag[]>("/api/admin/tags")]),
    [],
  );
  const [categories, tags] = taxonomy ?? [[], []];

  const set = <K extends keyof State>(k: K, v: State[K]) => {
    setS((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
  };

  async function save(status: PostStatus) {
    setBusy(true);
    setErrors({});
    const body = {
      title: s.title.trim(),
      slug: s.slug.trim() || null,
      excerpt: s.excerpt.trim(),
      body: s.body,
      cover: s.cover?.src ? s.cover : null,
      categorySlug: s.categorySlug || null,
      tagSlugs: s.tagSlugs,
      authorName: s.authorName.trim() || null,
      authorRole: s.authorRole.trim() || null,
      status,
      publishedAt: status === "PUBLISHED" && s.publishedAt ? new Date(s.publishedAt).toISOString() : null,
      seo: cleanSeo(s.seo) ?? null,
    };
    try {
      const result = saved
        ? await api.put<AdminPost>(`/api/admin/posts/${saved.id}`, body)
        : await api.post<AdminPost>("/api/admin/posts", body);
      setSaved(result);
      setS(fromPost(result));
      setDirty(false);
      toast(status === "PUBLISHED" ? "Статья опубликована" : "Черновик сохранён");
      if (!saved) router.replace(`/admin/posts/${result.id}`);
    } catch (e) {
      const err = saveError(e);
      setErrors(err.fields);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!saved || !confirmDelete(`статью «${saved.title}»`)) return;
    try {
      await api.del(`/api/admin/posts/${saved.id}`);
      setDirty(false);
      toast("Статья удалена");
      router.push("/admin/posts");
    } catch (e) {
      toast(saveError(e).message, "error");
    }
  }

  const isPublished = saved?.status === "PUBLISHED";

  return (
    <>
      <PageHeader
        back={{ href: "/admin/posts", label: "Все статьи" }}
        title={saved ? "Редактирование статьи" : "Новая статья"}
        description={
          saved && (
            <span className="inline-flex flex-wrap items-center gap-2">
              <Badge tone={isPublished ? "green" : "neutral"}>{isPublished ? "Опубликована" : "Черновик"}</Badge>
              Изменена {fmtDateTime(saved.updatedAt)}
              {dirty && <span className="font-semibold text-amber-700">· есть несохранённые изменения</span>}
            </span>
          )
        }
        actions={
          isPublished && (
            <LinkButton href={`/blog/${saved!.slug}`} variant="secondary">
              Открыть на сайте ↗
            </LinkButton>
          )
        }
      />
      {lockedForAuthor && (
        <p className="mb-6 rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-900">
          Статья уже опубликована — менять её может только редактор.
        </p>
      )}
      <fieldset disabled={lockedForAuthor} className="contents">
        <EditorLayout
          main={
            <>
              <Card>
                <div className="space-y-5">
                  <Field label="Заголовок" required error={errors.title}>
                    {(id) => (
                      <Input id={id} value={s.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title} className="text-lg font-semibold" />
                    )}
                  </Field>
                  <SlugField value={s.slug} onChange={(v) => set("slug", v)} title={s.title} prefix="/blog/" error={errors.slug} />
                  <Field label="Анонс" required error={errors.excerpt} hint="1–2 предложения: показываются в списке статей и в поиске">
                    {(id) => <Textarea id={id} rows={3} value={s.excerpt} onChange={(e) => set("excerpt", e.target.value)} aria-invalid={!!errors.excerpt} />}
                  </Field>
                </div>
              </Card>
              <div>
                <p className="mb-1.5 text-sm font-semibold">
                  Текст статьи <span className="text-danger">*</span>
                </p>
                <RichText value={s.body} onChange={(v) => set("body", v)} invalid={!!errors.body} />
                {errors.body && <p className="mt-1.5 text-sm font-medium text-danger">{errors.body}</p>}
              </div>
            </>
          }
          side={
            <>
              <Card title="Публикация">
                <div className="space-y-4">
                  {canPublish ? (
                    <Field label="Дата публикации" hint="Пусто — текущий момент">
                      {(id) => <Input id={id} type="datetime-local" value={s.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />}
                    </Field>
                  ) : (
                    <p className="text-sm text-muted">Сохраните черновик — редактор проверит и опубликует статью.</p>
                  )}
                  <div className="flex flex-col gap-2">
                    {canPublish && (
                      <Button loading={busy} onClick={() => save("PUBLISHED")}>
                        {isPublished ? "Сохранить и обновить" : "Опубликовать"}
                      </Button>
                    )}
                    <Button variant={canPublish ? "secondary" : "primary"} loading={busy} onClick={() => save("DRAFT")}>
                      {isPublished ? "Снять с публикации" : "Сохранить черновик"}
                    </Button>
                    {saved && (
                      <Button variant="danger" onClick={remove}>
                        Удалить
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
              <Card title="Рубрика и метки">
                <div className="space-y-4">
                  <Field label="Категория" error={errors.categorySlug}>
                    {(id) => (
                      <Select id={id} value={s.categorySlug} onChange={(e) => set("categorySlug", e.target.value)}>
                        <option value="">Без категории</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <div>
                    <p className="mb-1.5 text-sm font-semibold">Метки</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t) => {
                        const on = s.tagSlugs.includes(t.slug);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => set("tagSlugs", on ? s.tagSlugs.filter((x) => x !== t.slug) : [...s.tagSlugs, t.slug])}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                              on ? "border-brand bg-brand text-white" : "border-line hover:border-ink/40",
                            )}
                          >
                            #{t.name}
                          </button>
                        );
                      })}
                      {tags.length === 0 && <p className="text-sm text-muted">Меток пока нет</p>}
                    </div>
                  </div>
                </div>
              </Card>
              <Card>
                <ImageField label="Обложка" value={s.cover} onChange={(v) => set("cover", v)} hint="Лучше 1600×900 и больше" />
              </Card>
              <Card title="Автор">
                <div className="space-y-4">
                  <Field label="Подпись" hint={`Пусто — ${me.name || "имя пользователя"}`}>
                    {(id) => <Input id={id} value={s.authorName} onChange={(e) => set("authorName", e.target.value)} />}
                  </Field>
                  <Field label="Должность">
                    {(id) => <Input id={id} value={s.authorRole} onChange={(e) => set("authorRole", e.target.value)} />}
                  </Field>
                </div>
              </Card>
              <SeoDetails>
                <SeoFields value={s.seo} onChange={(v) => set("seo", v)} fallbackTitle={s.title} />
              </SeoDetails>
            </>
          }
        />
      </fieldset>
    </>
  );
}
