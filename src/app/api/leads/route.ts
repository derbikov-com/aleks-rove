import { NextResponse } from "next/server";
import { validateLead } from "@/lib/lead";
import { rateLimit } from "@/lib/rate-limit";

const API = process.env.BACKEND_API_URL?.replace(/\/$/, "");
const MIN_FILL_MS = 2500;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function sanitizeUtm(v: unknown): Record<string, string> {
  if (!v || typeof v !== "object") return {};
  return Object.fromEntries(
    Object.entries(v as Record<string, unknown>)
      .filter(([k]) => k.startsWith("utm_"))
      .slice(0, 5)
      .map(([k, val]) => [k.slice(0, 20), str(val, 200)]),
  );
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

  if (!rateLimit(`lead:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      { message: "Слишком много заявок подряд. Попробуйте позже или позвоните нам." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
    if (!body || typeof body !== "object") throw new Error("invalid body");
  } catch {
    return NextResponse.json({ message: "Некорректный запрос" }, { status: 400 });
  }

  // Антиспам: заполненное скрытое поле или слишком быстрая отправка.
  // Отвечаем «успехом», чтобы бот не подбирал обход.
  const startedAt = Number(body.startedAt);
  const tooFast = !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS;
  if (str(body.website, 200) || tooFast) {
    console.warn("[lead] rejected as spam", { ip, honeypot: !!str(body.website, 200), tooFast });
    return NextResponse.json({ ok: true });
  }

  const { data, errors } = validateLead(body);
  if (Object.keys(errors).length) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const lead = {
    ...data,
    source: str(body.source, 80),
    page: str(body.page, 200),
    utm: sanitizeUtm(body.utm),
    ip,
    userAgent: str(req.headers.get("user-agent"), 300),
    createdAt: new Date().toISOString(),
  };

  if (!API) {
    // Бэкенд ещё не подключён: заявка сохраняется только в логах сервиса.
    console.info("[lead] received (no BACKEND_API_URL configured)", JSON.stringify(lead));
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(`${API}/api/public/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.BACKEND_API_KEY ? { "X-Api-Key": process.env.BACKEND_API_KEY } : {}),
      },
      body: JSON.stringify(lead),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`backend responded ${res.status}`);
  } catch (err) {
    console.error("[lead] forwarding failed, lead kept in log", err, JSON.stringify(lead));
    return NextResponse.json(
      { message: "Не удалось отправить заявку. Позвоните нам или напишите на почту." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
