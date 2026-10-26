import { site, workHours } from "./site";
import { SITE_URL } from "./siteUrl";

const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;

// Микроразметка для поиска: компания, телефон, часы работы.
// Адрес и город добавить, когда заказчик их пришлёт (сейчас это заглушки).
export function localBusinessJsonLd(): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    name: site.name,
    description:
      "Ремонт газовых котлов, монтаж систем отопления, обслуживание котельных",
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/og.png`,
    telephone: site.phoneHref.replace("tel:", ""),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: workHours.days.map(
          (d) =>
            `https://schema.org/${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d]}`,
        ),
        opens: pad(workHours.start),
        closes: pad(workHours.end),
      },
    ],
  };
  // «<» экранируем, чтобы строка не могла закрыть тег script
  return JSON.stringify(data).replace(/</g, "\u003c");
}
