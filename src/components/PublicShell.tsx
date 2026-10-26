import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileBar } from "./MobileBar";
import s from "./PublicShell.module.css";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className={s.shell}>
      <Header />
      <main className={s.main}>{children}</main>
      <Footer />
      <MobileBar />
    </div>
  );
}
