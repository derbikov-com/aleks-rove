"use client";

import { useParams } from "next/navigation";
import { api } from "@/admin/api";
import { useLoad } from "@/admin/hooks";
import { PageForm } from "@/admin/PageForm";
import type { AdminPage } from "@/admin/types";
import { ErrorBlock, LoadingBlock } from "@/admin/ui";

export default function EditPageFormPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, reload } = useLoad(() => api.get<AdminPage>(`/api/admin/pages/${id}`), [id]);
  if (loading && !data) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error ?? "Страница не найдена"} onRetry={reload} />;
  return <PageForm key={data.id} page={data} />;
}
