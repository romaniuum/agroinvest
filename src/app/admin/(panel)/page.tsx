import Link from "next/link";
import { serviceLabel } from "@/lib/content";
import { formatLeadTime } from "@/lib/format";
import {
  leadFilters,
  parseLeadFilter,
  statusLabel,
  type LeadFilter,
} from "@/lib/leadStatus";
import { formatPhone } from "@/lib/phone";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db";
import { setLeadStatusAction } from "../actions";
import { SubmitButton } from "../_components/SubmitButton";
import s from "../admin.module.css";

export default async function LeadsPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const filter = parseLeadFilter((await searchParams).status);
  const statuses = leadFilters[filter].statuses;

  const [leads, counts] = await Promise.all([
    prisma.lead.findMany({
      where: statuses ? { status: { in: [...statuses] } } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (status: string) =>
    counts.find((c) => c.status === status)?._count ?? 0;
  const filterCount: Partial<Record<LeadFilter, number>> = {
    new: count("NEW"),
    work: count("IN_PROGRESS"),
  };

  return (
    <>
      <h1 className={s.title}>Заявки</h1>

      <nav className={s.filters} aria-label="Фильтр заявок">
        {(Object.keys(leadFilters) as LeadFilter[]).map((key) => (
          <Link
            key={key}
            href={key === "new" ? "/admin" : `/admin?status=${key}`}
            className={key === filter ? s.filterActive : s.filter}
            aria-current={key === filter ? "page" : undefined}
          >
            {leadFilters[key].label}
            {filterCount[key] !== undefined && ` · ${filterCount[key]}`}
          </Link>
        ))}
      </nav>

      {leads.length === 0 ? (
        <p className={s.empty}>Здесь пока пусто.</p>
      ) : (
        <ul className={s.leadList}>
          {leads.map((lead) => (
            <li key={lead.id} className={s.leadCard}>
              <Link href={`/admin/leads/${lead.id}`} className={s.leadMain}>
                <span className={s.leadMeta}>
                  № {lead.id} · {formatLeadTime(lead.createdAt)} ·{" "}
                  <span className={s[`status_${lead.status}`]}>
                    {statusLabel[lead.status]}
                  </span>
                </span>
                <br />
                <span className={s.leadName}>{lead.name}</span>
                <br />
                {formatPhone(lead.phone)} · {serviceLabel(lead.service)}
              </Link>
              <div className={s.leadActions}>
                <a href={`tel:${lead.phone}`} className={s.primary}>
                  Позвонить
                </a>
                {lead.status === "NEW" && (
                  <form action={setLeadStatusAction}>
                    <input type="hidden" name="id" value={lead.id} />
                    <input type="hidden" name="status" value="IN_PROGRESS" />
                    <SubmitButton className={s.secondary}>
                      В работу
                    </SubmitButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
