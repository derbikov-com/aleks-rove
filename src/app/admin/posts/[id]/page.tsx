"use client";

import { useParams } from "next/navigation";
import { api } from "@/admin/api";
import { useLoad } from "@/admin/hooks";
import { PostForm } from "@/admin/PostForm";
import type { AdminPost } from "@/admin/types";
import { ErrorBlock, LoadingBlock } from "@/admin/ui";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, reload } = useLoad(() => api.get<AdminPost>(`/api/admin/posts/${id}`), [id]);
  if (loading && !data) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error ?? "Статья не найдена"} onRetry={reload} />;
  return <PostForm key={data.id} post={data} />;
}
