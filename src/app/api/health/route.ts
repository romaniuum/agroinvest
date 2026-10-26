import { connection, NextResponse } from "next/server";
import { prisma } from "@/server/db";

// Проверка для мониторинга: приложение и база отвечают.
export async function GET() {
  await connection();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Проверка базы не прошла:", error);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
