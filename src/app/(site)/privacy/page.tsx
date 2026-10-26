import type { Metadata } from "next";
import ui from "@/components/ui.module.css";
import s from "@/components/TextPage.module.css";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Агроинвест",
};

export default function PrivacyPage() {
  return (
    <section className={s.page}>
      <div className={ui.container}>
        <h1 className={s.title}>Политика конфиденциальности</h1>
        {/* Заглушка: текст политики предоставит заказчик */}
        <p className={s.text}>
          Текст политики конфиденциальности скоро появится на этой странице.
        </p>
      </div>
    </section>
  );
}
