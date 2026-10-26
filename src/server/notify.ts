import nodemailer, { type Transporter } from "nodemailer";
import { serviceLabel, type ServiceValue } from "@/lib/content";
import { workHours } from "@/lib/site";

export type LeadForNotify = {
  id: number;
  name: string;
  phone: string;
  service: ServiceValue;
  createdAt: Date;
};

function adminLink(id: number): string {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return `${base}/admin/leads/${id}`;
}

// В Telegram уходят только номер и услуга, без имени и телефона клиента (152-ФЗ).
export function telegramText(lead: LeadForNotify): string {
  return `Новая заявка № ${lead.id} — ${serviceLabel(lead.service)}\n${adminLink(lead.id)}`;
}

async function sendTelegram(lead: LeadForNotify): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("Telegram не настроен, уведомление не отправлено");
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: telegramText(lead),
      link_preview_options: { is_disabled: true },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Telegram ответил ${res.status}: ${await res.text()}`);
  }
}

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  const port = Number(process.env.SMTP_PORT || 465);
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 10_000,
  });
  return transporter;
}

async function sendEmail(lead: LeadForNotify): Promise<void> {
  const { SMTP_HOST, MAIL_FROM, MAIL_TO } = process.env;
  if (!SMTP_HOST || !MAIL_FROM || !MAIL_TO) {
    console.warn("Почта не настроена, письмо не отправлено");
    return;
  }
  const time = lead.createdAt.toLocaleString("ru-RU", {
    timeZone: workHours.timeZone,
  });
  await getTransporter().sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    subject: `Заявка № ${lead.id} — ${serviceLabel(lead.service)}`,
    text: [
      `Заявка № ${lead.id}`,
      `Время: ${time}`,
      `Имя: ${lead.name}`,
      `Телефон: ${lead.phone}`,
      `Услуга: ${serviceLabel(lead.service)}`,
      "",
      `Открыть в админке: ${adminLink(lead.id)}`,
    ].join("\n"),
  });
}

// Ошибки уведомлений только пишем в лог: заявка уже сохранена в базе.
export async function notifyNewLead(lead: LeadForNotify): Promise<void> {
  const results = await Promise.allSettled([
    sendTelegram(lead),
    sendEmail(lead),
  ]);
  const channels = ["Telegram", "почта"];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(
        `Заявка № ${lead.id}: не удалось отправить (${channels[i]}):`,
        result.reason,
      );
    }
  });
}
