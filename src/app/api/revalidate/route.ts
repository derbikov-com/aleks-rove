import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

// Бэкенд дёргает этот роут после изменений в админке, чтобы сайт обновился сразу,
// а не через 5 минут кэша. Секрет общий с бэкендом: REVALIDATE_SECRET = FRONTEND_REVALIDATE_SECRET.
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = req.headers.get("x-revalidate-secret") ?? "";
  if (!secret || !safeEqual(secret, provided)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  // expire: 0 — следующий запрос получит свежие данные, а не устаревшую копию
  revalidateTag("cms", { expire: 0 });
  return Response.json({ ok: true, revalidatedAt: Date.now() });
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
