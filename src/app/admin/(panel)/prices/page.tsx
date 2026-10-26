import { services } from "@/lib/content";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db";
import { PricesForm } from "../../_components/PricesForm";
import s from "../../admin.module.css";

export default async function PricesPage() {
  await requireAdmin();
  const rows = await prisma.servicePrice.findMany();
  // Порядок как на сайте.
  const order = services.map((service) => service.slug as string);
  rows.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));

  return (
    <>
      <h1 className={s.title}>Цены</h1>
      <p className={s.hint}>
        Цена «от» на карточках услуг на сайте. Пишите только число рублей.
      </p>
      <PricesForm rows={rows} />
    </>
  );
}
