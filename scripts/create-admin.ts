// Создаёт администратора или меняет пароль существующему.
// Запуск: npm run create-admin
import "dotenv/config";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/server/password";

// Вывод, который можно приглушить, чтобы пароль не отображался при вводе.
let muted = false;
const output = new Writable({
  write(chunk, _encoding, callback) {
    if (!muted) process.stdout.write(chunk);
    callback();
  },
});
const rl = createInterface({
  input: process.stdin,
  output,
  terminal: Boolean(process.stdin.isTTY),
});
// Итератор буферизует строки, поэтому работает и с вводом из файла или канала.
const lines = rl[Symbol.asyncIterator]();

async function ask(question: string, hidden = false): Promise<string> {
  process.stdout.write(question);
  muted = hidden;
  const { value } = await lines.next();
  muted = false;
  if (hidden || !process.stdin.isTTY) process.stdout.write("\n");
  return value ?? "";
}

async function main() {
  const login = (await ask("Логин: ")).trim();
  if (!/^[a-zA-Z0-9._-]{3,50}$/.test(login)) {
    throw new Error("Логин: от 3 до 50 латинских букв, цифр, точек, - или _");
  }
  const password = await ask("Пароль (не меньше 10 символов): ", true);
  if (password.length < 10) throw new Error("Пароль слишком короткий");
  if ((await ask("Повторите пароль: ", true)) !== password) {
    throw new Error("Пароли не совпадают");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const passwordHash = await hashPassword(password);
    const existing = await prisma.adminUser.findUnique({ where: { login } });
    if (existing) {
      // Новый пароль — все старые входы сбрасываются.
      await prisma.$transaction([
        prisma.adminUser.update({ where: { login }, data: { passwordHash } }),
        prisma.adminSession.deleteMany({ where: { userId: existing.id } }),
      ]);
      console.log(`Пароль для «${login}» изменён.`);
    } else {
      await prisma.adminUser.create({ data: { login, passwordHash } });
      console.log(`Администратор «${login}» создан.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error: Error) => {
    console.error(`Ошибка: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => rl.close());
