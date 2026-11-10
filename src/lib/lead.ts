// Валидация заявки — общая для формы (клиент) и API-роута (сервер).

export type LeadInput = {
  name: string;
  phone: string;
  email: string;
  company: string;
  message: string;
  consent: boolean;
};

export type LeadErrors = Partial<Record<keyof LeadInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string) {
  let d = phoneDigits(value);
  if (d.length === 10) d = `7${d}`;
  if (d.length !== 11 || !/^[78]/.test(d)) return value.trim();
  d = `7${d.slice(1)}`;
  return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}

export function validateLead(input: Partial<Record<keyof LeadInput, unknown>>): {
  data: LeadInput;
  errors: LeadErrors;
} {
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const data: LeadInput = {
    name: str(input.name, 80),
    phone: str(input.phone, 32),
    email: str(input.email, 120),
    company: str(input.company, 120),
    message: str(input.message, 2000),
    consent: input.consent === true || input.consent === "on" || input.consent === "true",
  };

  const errors: LeadErrors = {};
  if (data.name.length < 2) errors.name = "Укажите имя";
  const digits = phoneDigits(data.phone).length;
  if (!data.phone) errors.phone = "Укажите телефон";
  else if (digits < 10 || digits > 15) errors.phone = "Проверьте номер телефона";
  if (data.email && !EMAIL_RE.test(data.email)) errors.email = "Проверьте адрес почты";
  if (!data.consent) errors.consent = "Нужно согласие на обработку данных";

  return { data, errors };
}
