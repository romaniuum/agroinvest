import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createRateLimiter } from "@/lib/rateLimit";
import { prisma } from "./db";
import { hashPassword, verifyPassword } from "./password";
import { clientIp } from "./request";

const COOKIE = "agro_admin";
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
// Продлеваем сессию не чаще раза в сутки, чтобы не писать в базу на каждый клик.
const RENEW_AFTER_MS = 24 * 60 * 60 * 1000;

// После 5 неудачных попыток вход с этого IP закрыт на 15 минут.
const loginLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

// Сверка с фиктивным хэшем, когда логина нет: ответ занимает столько же времени.
let dummyHash: Promise<string> | undefined;

export type Admin = { id: number; login: string };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: expiresAt,
  });
}

export type LoginResult = "ok" | "invalid" | "blocked";

export async function login(
  loginName: string,
  password: string,
): Promise<LoginResult> {
  const ip = clientIp(await headers());
  if (loginLimiter.blocked(ip)) return "blocked";

  const user = await prisma.adminUser.findUnique({
    where: { login: loginName },
  });
  let valid: boolean;
  if (user) {
    valid = await verifyPassword(user.passwordHash, password);
  } else {
    dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
    await verifyPassword(await dummyHash, password);
    valid = false;
  }

  if (!user || !valid) {
    loginLimiter.hit(ip);
    return loginLimiter.blocked(ip) ? "blocked" : "invalid";
  }

  loginLimiter.reset(ip);
  const now = new Date();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + SESSION_MS);
  await prisma.$transaction([
    prisma.adminSession.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.adminSession.create({
      data: { id: hashToken(token), userId: user.id, expiresAt },
    }),
    prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: now },
    }),
  ]);
  await setSessionCookie(token, expiresAt);
  return "ok";
}

const readSession = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.adminSession.findUnique({
    where: { id: hashToken(token) },
    include: { user: { select: { id: true, login: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return { token, session };
});

export async function getAdmin(): Promise<Admin | null> {
  return (await readSession())?.session.user ?? null;
}

// Для страниц: без входа — на страницу входа.
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

// Для действий: проверяет вход и продлевает сессию, пока менеджер работает.
export async function requireAdminAction(): Promise<Admin> {
  const current = await readSession();
  if (!current) redirect("/admin/login");
  const { token, session } = current;
  const now = Date.now();
  if (session.expiresAt.getTime() - now < SESSION_MS - RENEW_AFTER_MS) {
    const expiresAt = new Date(now + SESSION_MS);
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { expiresAt },
    });
    await setSessionCookie(token, expiresAt);
  }
  return session.user;
}

export async function logout() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({ where: { id: hashToken(token) } });
  }
  store.delete({ name: COOKIE, path: "/admin" });
}
