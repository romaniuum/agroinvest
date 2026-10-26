"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "../admin.module.css";

export function NavLinks({ newCount }: { newCount: number }) {
  const pathname = usePathname();
  const links = [
    {
      href: "/admin",
      label: "Заявки",
      active: pathname === "/admin" || pathname.startsWith("/admin/leads"),
      badge: newCount,
    },
    {
      href: "/admin/prices",
      label: "Цены",
      active: pathname === "/admin/prices",
    },
    {
      href: "/admin/photos",
      label: "Фото работ",
      active: pathname === "/admin/photos",
    },
  ];

  return (
    <nav className={s.nav} aria-label="Разделы">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={link.active ? s.navLinkActive : s.navLink}
          aria-current={link.active ? "page" : undefined}
        >
          {link.label}
          {link.badge ? (
            <span className={s.badge} aria-label={`новых: ${link.badge}`}>
              {link.badge}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
