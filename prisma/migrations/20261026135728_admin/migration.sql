-- CreateTable
CREATE TABLE "ServicePrice" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "priceFrom" INTEGER,
    "unit" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePrice_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "WorkPhoto" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkPhoto_sortOrder_id_idx" ON "WorkPhoto"("sortOrder", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_login_key" ON "AdminUser"("login");

-- CreateIndex
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Три услуги на сайте. Цены пустые, пока менеджер их не заполнит.
INSERT INTO "ServicePrice" ("slug", "title", "priceFrom", "unit", "updatedAt") VALUES
  ('repair', 'Ремонт котла', NULL, '', CURRENT_TIMESTAMP),
  ('install', 'Монтаж системы отопления', NULL, '', CURRENT_TIMESTAMP),
  ('maintenance', 'Обслуживание котельной', NULL, '/ мес', CURRENT_TIMESTAMP);
