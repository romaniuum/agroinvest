import { after, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rateLimit";
import { site } from "@/lib/site";
import { verifyCaptcha } from "@/server/captcha";
import { prisma } from "@/server/db";
import { submitLead, type LeadDeps } from "@/server/leads";
import { notifyNewLead } from "@/server/notify";
import { clientIp } from "@/server/request";

// Не больше 5 заявок с одного IP в час.
const rateLimiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

const leadFields = {
  id: true,
  name: true,
  phone: true,
  service: true,
  createdAt: true,
} as const;

const deps: LeadDeps = {
  rateLimiter,
  verifyCaptcha,
  findRecent: (phone, service, since) =>
    prisma.lead.findFirst({
      where: { phone, service, createdAt: { gte: since } },
      select: leadFields,
    }),
  create: (data) => prisma.lead.create({ data, select: leadFields }),
};

const callUs = `Позвоните нам: ${site.phone}`;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Неверный запрос" }, { status: 400 });
  }

  try {
    const result = await submitLead(
      body,
      { ip: clientIp(request.headers), now: new Date() },
      deps,
    );

    switch (result.kind) {
      case "ok": {
        const lead = result.created;
        if (lead) after(() => notifyNewLead(lead));
        return NextResponse.json({ message: result.message });
      }
      case "invalid":
        return NextResponse.json(
          { error: "Проверьте поля формы", errors: result.errors },
          { status: 400 },
        );
      case "rate_limited":
        return NextResponse.json(
          { error: `Слишком много заявок с вашего устройства. ${callUs}` },
          { status: 429 },
        );
      case "captcha_failed":
        return NextResponse.json(
          {
            error: `Не удалось пройти проверку. Попробуйте ещё раз или ${callUs.toLowerCase()}`,
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Не удалось сохранить заявку:", error);
    return NextResponse.json(
      { error: `Не удалось отправить заявку. ${callUs}` },
      { status: 500 },
    );
  }
}
