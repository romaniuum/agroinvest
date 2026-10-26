"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { login, logout, requireAdminAction } from "@/server/auth";
import { prisma } from "@/server/db";
import {
  deletePhotoFiles,
  MAX_UPLOAD_BYTES,
  PhotoError,
  savePhotoFiles,
} from "@/server/photoFiles";
import { PHOTOS_TAG, PRICES_TAG } from "@/server/siteData";

export type FormState = { ok?: boolean; message?: string; error?: string };
export type LoginState = FormState & { login?: string };

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

const id = (formData: FormData) => {
  const value = Number(formData.get("id"));
  return Number.isInteger(value) && value > 0 ? value : null;
};

// ——— Вход ———

// Логин возвращаем в форму: после отправки React очищает поля.
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const loginName = text(formData, "login");
  const password = String(formData.get("password") ?? "");
  if (!loginName || !password) {
    return { error: "Введите логин и пароль", login: loginName };
  }
  const result = await login(loginName, password);
  if (result === "blocked") {
    return {
      error: "Слишком много попыток. Подождите 15 минут.",
      login: loginName,
    };
  }
  if (result === "invalid") {
    return { error: "Неверный логин или пароль", login: loginName };
  }
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

// ——— Заявки ———

const STATUSES = ["NEW", "IN_PROGRESS", "DONE", "REJECTED"] as const;

export async function setLeadStatusAction(formData: FormData) {
  await requireAdminAction();
  const leadId = id(formData);
  const status = text(formData, "status");
  if (!leadId || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return;
  }
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: status as (typeof STATUSES)[number] },
  });
  refresh();
}

export async function saveNoteAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();
  const leadId = id(formData);
  if (!leadId) return { error: "Заявка не найдена" };
  const note = text(formData, "note").slice(0, 2000);
  await prisma.lead.update({ where: { id: leadId }, data: { note } });
  refresh();
  return { ok: true, message: "Заметка сохранена" };
}

// ——— Цены ———

export async function savePricesAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();
  const rows = await prisma.servicePrice.findMany({ select: { slug: true } });

  const updates: { slug: string; priceFrom: number | null }[] = [];
  for (const { slug } of rows) {
    const raw = text(formData, `price-${slug}`).replace(/\s/g, "");
    if (raw === "") {
      updates.push({ slug, priceFrom: null });
      continue;
    }
    if (!/^\d{1,7}$/.test(raw)) {
      return { error: "Цена — это целое число рублей, например 2500" };
    }
    updates.push({ slug, priceFrom: Number(raw) });
  }

  await prisma.$transaction(
    updates.map(({ slug, priceFrom }) =>
      prisma.servicePrice.update({ where: { slug }, data: { priceFrom } }),
    ),
  );
  updateTag(PRICES_TAG);
  refresh();
  return { ok: true, message: "Сохранено, цены на сайте обновлены" };
}

// ——— Фото работ ———

export async function uploadPhotoAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Выберите фото" };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Фото слишком большое: можно до 15 МБ" };
  }

  let fileName: string;
  try {
    fileName = await savePhotoFiles(Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    if (error instanceof PhotoError) return { error: error.message };
    throw error;
  }
  const caption = text(formData, "caption").slice(0, 200);
  await prisma.workPhoto.create({ data: { fileName, caption } });
  updateTag(PHOTOS_TAG);
  refresh();
  return { ok: true, message: "Фото добавлено" };
}

export async function saveCaptionAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminAction();
  const photoId = id(formData);
  if (!photoId) return { error: "Фото не найдено" };
  const caption = text(formData, "caption").slice(0, 200);
  await prisma.workPhoto.update({ where: { id: photoId }, data: { caption } });
  updateTag(PHOTOS_TAG);
  refresh();
  return { ok: true, message: "Подпись сохранена" };
}

export async function deletePhotoAction(formData: FormData) {
  await requireAdminAction();
  const photoId = id(formData);
  if (!photoId) return;
  const photo = await prisma.workPhoto.findUnique({ where: { id: photoId } });
  if (!photo) return;
  await prisma.workPhoto.deleteMany({ where: { id: photoId } });
  await deletePhotoFiles(photo.fileName);
  updateTag(PHOTOS_TAG);
  refresh();
}
