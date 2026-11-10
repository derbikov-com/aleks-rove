// Генерирует демонстрационные обложки, OG-картинку и иконки.
// Запуск: node scripts/generate-images.mjs
// Реальные фото/иллюстрации потом загружаются через админку; next/image сам отдаёт их в WebP/AVIF.

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const C = {
  ink: "#0B1220",
  ink2: "#172034",
  ink3: "#24304A",
  paper: "#F4F6F9",
  line: "#E2E6EE",
  brand: "#2348FF",
  brandSoft: "#E8EDFF",
  accent: "#C8F04A",
  white: "#FFFFFF",
};

const grid = (w, h, step, color, opacity) =>
  `<g stroke="${color}" stroke-opacity="${opacity}" stroke-width="1">${Array.from({ length: Math.ceil(w / step) }, (_, i) => `<line x1="${i * step}" y1="0" x2="${i * step}" y2="${h}"/>`).join("")}${Array.from({ length: Math.ceil(h / step) }, (_, i) => `<line x1="0" y1="${i * step}" x2="${w}" y2="${i * step}"/>`).join("")}</g>`;

const glow = (cx, cy, r, color, op = 0.55, id = "g") =>
  `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const bars = (x, y, w, h, values, color, gap = 18) => {
  const bw = (w - gap * (values.length - 1)) / values.length;
  return values
    .map((v, i) => `<rect x="${x + i * (bw + gap)}" y="${y + h - h * v}" width="${bw}" height="${h * v}" rx="8" fill="${typeof color === "function" ? color(i) : color}"/>`)
    .join("");
};

const lines = (x, y, widths, color, gap = 34, hgt = 14) =>
  widths.map((w, i) => `<rect x="${x}" y="${y + i * gap}" width="${w}" height="${hgt}" rx="7" fill="${color}"/>`).join("");

// ---------- Кейсы 1600x1000 ----------
const W = 1600;
const H = 1000;

const cases = {
  "b2b-portal": svg(
    W,
    H,
    `<rect width="${W}" height="${H}" fill="${C.ink}"/>${grid(W, H, 64, "#fff", 0.05)}${glow(1300, 120, 620, C.brand, 0.6, "a")}
    <g transform="translate(200 170)">
      <rect width="1200" height="760" rx="28" fill="${C.white}"/>
      <rect width="1200" height="64" rx="28" fill="${C.paper}"/><rect y="36" width="1200" height="28" fill="${C.paper}"/>
      <circle cx="40" cy="32" r="9" fill="#FF6B5B"/><circle cx="70" cy="32" r="9" fill="#FFC93C"/><circle cx="100" cy="32" r="9" fill="#3DD68C"/>
      <rect x="0" y="64" width="260" height="696" fill="${C.ink2}"/>
      ${lines(36, 110, [150, 120, 170, 110, 140], "#ffffff22", 56, 16)}
      <rect x="28" y="160" width="204" height="44" rx="12" fill="${C.brand}"/>
      <g transform="translate(310 110)">
        <rect width="250" height="130" rx="20" fill="${C.brandSoft}"/><rect x="24" y="28" width="110" height="14" rx="7" fill="${C.brand}" opacity=".5"/><rect x="24" y="64" width="150" height="34" rx="10" fill="${C.brand}"/>
        <rect x="280" width="250" height="130" rx="20" fill="${C.paper}"/><rect x="304" y="28" width="110" height="14" rx="7" fill="${C.ink}" opacity=".25"/><rect x="304" y="64" width="120" height="34" rx="10" fill="${C.ink}"/>
        <rect x="560" width="290" height="130" rx="20" fill="${C.accent}"/><rect x="584" y="28" width="110" height="14" rx="7" fill="${C.ink}" opacity=".35"/><rect x="584" y="64" width="170" height="34" rx="10" fill="${C.ink}"/>
      </g>
      <g transform="translate(310 280)">
        ${Array.from({ length: 7 }, (_, i) => `<rect y="${i * 62}" width="850" height="50" rx="12" fill="${i === 0 ? C.ink : i % 2 ? C.paper : C.white}" stroke="${C.line}"/>
          <rect x="24" y="${i * 62 + 18}" width="${[180, 220, 160, 240, 200, 170, 210][i]}" height="14" rx="7" fill="${i === 0 ? "#ffffff66" : "#0B122033"}"/>
          <rect x="420" y="${i * 62 + 18}" width="120" height="14" rx="7" fill="${i === 0 ? "#ffffff44" : "#0B122022"}"/>
          <rect x="700" y="${i * 62 + 12}" width="120" height="26" rx="13" fill="${i === 0 ? "#ffffff22" : [C.brandSoft, "#E6F9D0", C.brandSoft][i % 3]}"/>`).join("")}
      </g>
    </g>`,
  ),
  warehouse: svg(
    W,
    H,
    `<rect width="${W}" height="${H}" fill="${C.brand}"/>${grid(W, H, 80, "#fff", 0.08)}${glow(250, 900, 600, C.accent, 0.35, "b")}
    <g transform="translate(260 180)">
      ${Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 6 }, (_, c) => {
          const x = c * 180;
          const y = r * 160;
          const hl = (r === 1 && c === 3) || (r === 2 && c === 1);
          return `<rect x="${x}" y="${y}" width="140" height="120" rx="18" fill="${hl ? C.accent : "#ffffff"}" fill-opacity="${hl ? 1 : 0.14}" stroke="#fff" stroke-opacity=".35"/>
            <rect x="${x + 22}" y="${y + 24}" width="60" height="12" rx="6" fill="${hl ? C.ink : "#fff"}" opacity="${hl ? 0.6 : 0.5}"/>
            <rect x="${x + 22}" y="${y + 80}" width="96" height="16" rx="8" fill="${hl ? C.ink : "#fff"}" opacity="${hl ? 0.9 : 0.35}"/>`;
        }).join(""),
      ).join("")}
      <path d="M70 690 L70 590 Q70 560 100 560 L590 560 Q620 560 620 530 L620 300 Q620 270 650 270 L800 270" fill="none" stroke="${C.accent}" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 26"/>
      <circle cx="70" cy="690" r="22" fill="${C.ink}"/><circle cx="70" cy="690" r="10" fill="${C.accent}"/>
    </g>
    <g transform="translate(1180 620)">
      <rect width="300" height="190" rx="26" fill="${C.ink}"/>
      <rect x="28" y="30" width="120" height="14" rx="7" fill="#ffffff55"/>
      <rect x="28" y="70" width="200" height="36" rx="10" fill="${C.accent}"/>
      <rect x="28" y="128" width="244" height="30" rx="8" fill="#ffffff14"/>
    </g>`,
  ),
  "bi-clinics": svg(
    W,
    H,
    `<rect width="${W}" height="${H}" fill="${C.ink2}"/>${grid(W, H, 64, "#fff", 0.04)}${glow(1400, 900, 600, C.brand, 0.5, "c")}
    <g transform="translate(160 150)">
      ${[0, 1, 2, 3].map((i) => `<rect x="${i * 330}" width="300" height="150" rx="24" fill="${i === 0 ? C.brand : C.ink3}"/>
        <rect x="${i * 330 + 28}" y="32" width="120" height="14" rx="7" fill="#ffffff55"/>
        <rect x="${i * 330 + 28}" y="72" width="${[170, 140, 190, 120][i]}" height="40" rx="10" fill="${i === 2 ? C.accent : "#ffffff"}"/>`).join("")}
      <rect y="190" width="790" height="510" rx="28" fill="${C.ink3}"/>
      <rect x="36" y="226" width="200" height="16" rx="8" fill="#ffffff55"/>
      ${bars(56, 300, 720, 360, [0.42, 0.58, 0.5, 0.72, 0.64, 0.86, 0.78, 0.94], (i) => (i === 7 ? C.accent : i % 2 ? "#3A5BFF" : "#2A3B66"), 26)}
      <rect x="820" y="190" width="460" height="510" rx="28" fill="${C.ink3}"/>
      <circle cx="1050" cy="420" r="150" fill="none" stroke="#2A3B66" stroke-width="48"/>
      <circle cx="1050" cy="420" r="150" fill="none" stroke="${C.brand}" stroke-width="48" stroke-dasharray="560 400" transform="rotate(-90 1050 420)"/>
      <circle cx="1050" cy="420" r="150" fill="none" stroke="${C.accent}" stroke-width="48" stroke-dasharray="180 780" stroke-dashoffset="-560" transform="rotate(-90 1050 420)"/>
      ${lines(870, 620, [220, 160], "#ffffff33", 36, 14)}
    </g>`,
  ),
  "auto-service": svg(
    W,
    H,
    `<rect width="${W}" height="${H}" fill="${C.brandSoft}"/>${grid(W, H, 64, C.brand, 0.08)}${glow(1450, 100, 520, C.brand, 0.25, "d")}
    <g transform="translate(240 150)">
      <rect width="1120" height="700" rx="32" fill="${C.white}" stroke="${C.line}"/>
      <rect x="40" y="40" width="260" height="22" rx="11" fill="${C.ink}"/>
      <rect x="880" y="32" width="200" height="44" rx="22" fill="${C.brand}"/>
      ${Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 7 }, (_, c) => {
          const x = 40 + c * 150;
          const y = 120 + r * 110;
          const busy = (r * 7 + c) % 5 === 1 || (r * 7 + c) % 7 === 3;
          const pick = r === 2 && c === 4;
          return `<rect x="${x}" y="${y}" width="130" height="92" rx="16" fill="${pick ? C.accent : busy ? C.brand : C.paper}" ${pick ? `stroke="${C.ink}" stroke-width="3"` : ""}/>
            <rect x="${x + 18}" y="${y + 20}" width="40" height="12" rx="6" fill="${busy ? "#ffffff88" : "#0B122033"}"/>
            ${busy || pick ? `<rect x="${x + 18}" y="${y + 52}" width="80" height="14" rx="7" fill="${pick ? C.ink : "#ffffffcc"}"/>` : ""}`;
        }).join(""),
      ).join("")}
    </g>`,
  ),
};

// ---------- Блог 1600x900 ----------
const BH = 900;
const blog = {
  tz: svg(
    W,
    BH,
    `<rect width="${W}" height="${BH}" fill="${C.paper}"/>${grid(W, BH, 56, C.ink, 0.05)}
    <g transform="translate(420 110) rotate(-4)">
      <rect width="560" height="700" rx="28" fill="${C.white}" stroke="${C.line}" stroke-width="2"/>
      <rect x="48" y="56" width="300" height="26" rx="13" fill="${C.ink}"/>
      ${lines(48, 130, [460, 420, 440, 300], "#0B12201f", 34, 14)}
      ${[0, 1, 2, 3].map((i) => `<rect x="48" y="${300 + i * 80}" width="40" height="40" rx="10" fill="${i < 3 ? C.brand : C.white}" stroke="${C.brand}" stroke-width="3"/>
        ${i < 3 ? `<path d="M${58} ${320 + i * 80} l8 8 l14 -16" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
        <rect x="112" y="${313 + i * 80}" width="${[340, 280, 360, 300][i]}" height="14" rx="7" fill="#0B122033"/>`).join("")}
    </g>
    <g transform="translate(980 260) rotate(6)">
      <rect width="300" height="380" rx="26" fill="${C.ink}"/>
      <rect x="32" y="40" width="140" height="16" rx="8" fill="#ffffff55"/>
      <rect x="32" y="90" width="236" height="120" rx="16" fill="${C.brand}"/>
      <rect x="32" y="232" width="236" height="44" rx="12" fill="#ffffff14"/>
      <rect x="32" y="292" width="140" height="44" rx="22" fill="${C.accent}"/>
    </g>`,
  ),
  "crm-1c": svg(
    W,
    BH,
    `<rect width="${W}" height="${BH}" fill="${C.ink}"/>${grid(W, BH, 64, "#fff", 0.05)}${glow(800, 450, 520, C.brand, 0.45, "e")}
    <g>
      <rect x="220" y="270" width="380" height="360" rx="36" fill="${C.ink3}" stroke="#ffffff22"/>
      <rect x="260" y="310" width="120" height="120" rx="28" fill="${C.brand}"/>
      ${lines(260, 470, [280, 220, 250], "#ffffff33", 40, 16)}
      <rect x="1000" y="270" width="380" height="360" rx="36" fill="${C.ink3}" stroke="#ffffff22"/>
      <rect x="1040" y="310" width="120" height="120" rx="28" fill="${C.accent}"/>
      ${lines(1040, 470, [260, 300, 200], "#ffffff33", 40, 16)}
      <path d="M620 400 C760 400 840 400 980 400" fill="none" stroke="${C.accent}" stroke-width="6" stroke-dasharray="4 20" stroke-linecap="round"/>
      <path d="M980 500 C840 500 760 500 620 500" fill="none" stroke="#5B78FF" stroke-width="6" stroke-dasharray="4 20" stroke-linecap="round"/>
      <path d="M960 384 l22 16 l-22 16" fill="none" stroke="${C.accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M640 484 l-22 16 l22 16" fill="none" stroke="#5B78FF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="800" cy="450" r="54" fill="${C.white}"/><circle cx="800" cy="450" r="20" fill="${C.brand}"/>
    </g>`,
  ),
  mvp: svg(
    W,
    BH,
    `<rect width="${W}" height="${BH}" fill="${C.brand}"/>${grid(W, BH, 64, "#fff", 0.07)}
    <g transform="translate(180 130)">
      ${[0, 1, 2, 3].map((col) => {
        const x = col * 320;
        const cards = [3, 2, 3, 1][col];
        return `<rect x="${x}" width="290" height="640" rx="28" fill="#ffffff" fill-opacity=".12"/>
          <rect x="${x + 28}" y="32" width="${[120, 150, 100, 130][col]}" height="16" rx="8" fill="#fff" opacity=".7"/>
          ${Array.from({ length: cards }, (_, i) => `<rect x="${x + 20}" y="${80 + i * 170}" width="250" height="150" rx="20" fill="${col === 3 ? C.accent : C.white}"/>
            <rect x="${x + 44}" y="${108 + i * 170}" width="${[150, 180, 120][i % 3]}" height="14" rx="7" fill="${C.ink}" opacity=".7"/>
            <rect x="${x + 44}" y="${138 + i * 170}" width="${[180, 120, 160][i % 3]}" height="12" rx="6" fill="${C.ink}" opacity=".2"/>
            <circle cx="${x + 238}" cy="${196 + i * 170}" r="14" fill="${col === 3 ? C.ink : C.brandSoft}"/>`).join("")}`;
      }).join("")}
    </g>`,
  ),
  dashboards: svg(
    W,
    BH,
    `<rect width="${W}" height="${BH}" fill="${C.white}"/>${grid(W, BH, 56, C.ink, 0.04)}${glow(1500, 0, 600, C.brand, 0.18, "f")}
    <g transform="translate(180 120)">
      <rect width="760" height="660" rx="32" fill="${C.paper}"/>
      <rect x="40" y="40" width="220" height="18" rx="9" fill="${C.ink}" opacity=".7"/>
      <path d="M60 520 L160 470 L260 490 L360 380 L460 410 L560 280 L680 220" fill="none" stroke="${C.brand}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M60 520 L160 470 L260 490 L360 380 L460 410 L560 280 L680 220 L680 600 L60 600 Z" fill="${C.brand}" opacity=".12"/>
      <circle cx="680" cy="220" r="16" fill="${C.accent}" stroke="${C.ink}" stroke-width="5"/>
      <rect x="820" width="420" height="310" rx="32" fill="${C.ink}"/>
      <circle cx="1030" cy="155" r="96" fill="none" stroke="#2A3B66" stroke-width="36"/>
      <circle cx="1030" cy="155" r="96" fill="none" stroke="${C.accent}" stroke-width="36" stroke-dasharray="420 200" transform="rotate(-90 1030 155)"/>
      <rect x="820" y="350" width="420" height="310" rx="32" fill="${C.brandSoft}"/>
      ${bars(860, 400, 340, 220, [0.4, 0.7, 0.55, 0.9, 0.65], (i) => (i === 3 ? C.brand : "#B7C4FF"), 22)}
    </g>`,
  ),
  security: svg(
    W,
    BH,
    `<rect width="${W}" height="${BH}" fill="${C.ink}"/>${grid(W, BH, 64, "#fff", 0.05)}${glow(800, 430, 480, C.brand, 0.55, "h")}
    <g transform="translate(800 450)">
      <circle r="300" fill="none" stroke="#ffffff14" stroke-width="2"/>
      <circle r="220" fill="none" stroke="#ffffff1f" stroke-width="2" stroke-dasharray="6 14"/>
      <path d="M0 -190 L150 -130 L150 10 C150 110 70 170 0 200 C-70 170 -150 110 -150 10 L-150 -130 Z" fill="${C.brand}"/>
      <path d="M0 -150 L115 -104 L115 8 C115 86 54 134 0 158 Z" fill="#ffffff" opacity=".12"/>
      <rect x="-56" y="-20" width="112" height="96" rx="18" fill="${C.accent}"/>
      <path d="M-34 -20 v-26 a34 34 0 0 1 68 0 v26" fill="none" stroke="${C.accent}" stroke-width="16"/>
      <circle cy="22" r="12" fill="${C.ink}"/><rect x="-5" y="22" width="10" height="28" rx="5" fill="${C.ink}"/>
    </g>
    ${[[260, 220], [1320, 260], [300, 680], [1280, 660]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><rect x="-90" y="-34" width="180" height="68" rx="34" fill="${C.ink3}" stroke="#ffffff22"/><circle cx="-52" r="12" fill="${i % 2 ? C.accent : "#3DD68C"}"/><rect x="-28" y="-8" width="${[100, 90, 110, 80][i]}" height="16" rx="8" fill="#ffffff55"/></g>`).join("")}`,
  ),
};

// ---------- OG 1200x630 ----------
const logoMark = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 32})">
  <rect width="32" height="32" rx="9" fill="${C.brand}"/>
  <path d="M8.5 23 15.5 9l7 14" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M11.5 18h8" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  <circle cx="24" cy="9" r="3" fill="${C.accent}"/></g>`;

const font = `font-family="Helvetica Neue, Arial, sans-serif"`;
const og = svg(
  1200,
  630,
  `<rect width="1200" height="630" fill="${C.ink}"/>${grid(1200, 630, 56, "#fff", 0.06)}${glow(1050, 60, 520, C.brand, 0.7, "o")}
  ${logoMark(80, 80, 72)}
  <text x="176" y="130" ${font} font-size="40" font-weight="800" fill="#fff">Aleks Rove</text>
  <text x="80" y="330" ${font} font-size="68" font-weight="800" fill="#fff">Цифровые решения</text>
  <text x="80" y="410" ${font} font-size="68" font-weight="800" fill="${C.accent}">для бизнеса</text>
  <text x="80" y="520" ${font} font-size="30" font-weight="500" fill="#ffffffaa">Аудит · Разработка · Автоматизация · Аналитика</text>`,
);

const logo = svg(512, 512, logoMark(0, 0, 512));

async function write(file, svgString, opts = {}) {
  const out = path.join(root, file);
  await mkdir(path.dirname(out), { recursive: true });
  let img = sharp(Buffer.from(svgString));
  if (opts.resize) img = img.resize(opts.resize, opts.resize);
  img = file.endsWith(".png") ? img.png({ compressionLevel: 9 }) : img.jpeg({ quality: 84, mozjpeg: true });
  await img.toFile(out);
  console.log("✓", file);
}

for (const [name, s] of Object.entries(cases)) await write(`public/images/cases/${name}.jpg`, s);
for (const [name, s] of Object.entries(blog)) await write(`public/images/blog/${name}.jpg`, s);
await write("public/og.png", og);
await write("public/logo.png", logo);
await write("src/app/apple-icon.png", svg(180, 180, `<rect width="180" height="180" fill="${C.brand}"/>${logoMark(0, 0, 180).replace('rx="9"', 'rx="0"')}`));
