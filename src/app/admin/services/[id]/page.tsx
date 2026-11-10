"use client";

import { useParams } from "next/navigation";
import { api } from "@/admin/api";
import { useLoad } from "@/admin/hooks";
import { ServiceForm } from "@/admin/ServiceForm";
import type { AdminService } from "@/admin/types";
import { ErrorBlock, LoadingBlock } from "@/admin/ui";

export default function EditServiceFormPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, reload } = useLoad(() => api.get<AdminService>(`/api/admin/services/${id}`), [id]);
  if (loading && !data) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error ?? "Услуга не найдена"} onRetry={reload} />;
  return <ServiceForm key={data.id} service={data} />;
}
