import { Suspense } from "react";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db";
import { logoutAction } from "../actions";
import { NavLinks } from "../_components/NavLinks";
import { SubmitButton } from "../_components/SubmitButton";
import s from "../admin.module.css";

// Админка всегда строится на сервере по запросу: данные меняются постоянно.
export const instant = false;

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className={s.shell} />}>
      <Panel>{children}</Panel>
    </Suspense>
  );
}

async function Panel({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const newCount = await prisma.lead.count({ where: { status: "NEW" } });

  return (
    <div className={s.shell}>
      <div className={s.mobileTop}>
        <a href="/" target="_blank" rel="noopener">
          Открыть сайт
        </a>
        <form action={logoutAction}>
          <SubmitButton className="" pendingText="Выходим…">
            Выйти
          </SubmitButton>
        </form>
      </div>

      <aside className={s.sidebar}>
        <p className={s.brand}>
          Агроинвест
          <span className={s.brandSub}>Админка</span>
        </p>
        <NavLinks newCount={newCount} />
        <div className={s.sidebarBottom}>
          <a href="/" target="_blank" rel="noopener" className={s.navLink}>
            Открыть сайт
          </a>
          <form action={logoutAction}>
            <SubmitButton className={s.logoutButton} pendingText="Выходим…">
              Выйти
            </SubmitButton>
          </form>
        </div>
      </aside>

      <main className={s.main}>
        <div className={s.content}>{children}</div>
      </main>
    </div>
  );
}
