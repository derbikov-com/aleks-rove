"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { GA_ID, YM_ID, rememberUtm, track } from "@/lib/analytics";

/**
 * Яндекс.Метрика и GA4. Счётчики подключаются, только если заданы
 * NEXT_PUBLIC_YM_ID / NEXT_PUBLIC_GA_ID.
 *
 * Отслеживаемые события (цели Метрики / события GA4):
 *  generate_lead   — успешная отправка любой формы
 *  lead_modal_open — открытие окна заявки
 *  cta_click       — клик по кнопке призыва к действию
 *  phone_click     — клик по номеру телефона
 *  email_click     — клик по email
 * Любой элемент с data-track="имя_события" тоже отправляет событие.
 */
export function Analytics() {
  const pathname = usePathname();
  const firstHit = useRef(true);

  useEffect(() => {
    rememberUtm();
  }, []);

  // Метрика сама считает первый просмотр, дальше — вручную при навигации в SPA.
  // GA4 учитывает такие переходы через «расширенную статистику» (история браузера).
  useEffect(() => {
    if (firstHit.current) {
      firstHit.current = false;
      return;
    }
    if (YM_ID) window.ym?.(YM_ID, "hit", window.location.href, { title: document.title });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a, [data-track]") as HTMLElement | null;
      if (!el) return;
      const href = el.getAttribute("href") ?? "";
      const location = el.dataset.trackLocation ?? pathname;
      if (href.startsWith("tel:")) track("phone_click", { location });
      else if (href.startsWith("mailto:")) track("email_click", { location });
      else if (el.dataset.track) track(el.dataset.track, { label: el.dataset.trackLabel ?? el.textContent?.trim().slice(0, 80), location });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname]);

  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {YM_ID && (
        <>
          <Script id="ym-init" strategy="afterInteractive">
            {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${YM_ID},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
          </Script>
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: "absolute", left: "-9999px" }} alt="" />
            </div>
          </noscript>
        </>
      )}
    </>
  );
}
