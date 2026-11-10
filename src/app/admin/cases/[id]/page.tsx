"use client";

import { useParams } from "next/navigation";
import { api } from "@/admin/api";
import { useLoad } from "@/admin/hooks";
import { CaseForm } from "@/admin/CaseForm";
import type { AdminCase } from "@/admin/types";
import { ErrorBlock, LoadingBlock } from "@/admin/ui";

export default function EditCaseFormPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, reload } = useLoad(() => api.get<AdminCase>(`/api/admin/cases/${id}`), [id]);
  if (loading && !data) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error ?? "Кейс не найден"} onRetry={reload} />;
  return <CaseForm key={data.id} item={data} />;
}
