import Link from "next/link";
import { notFound } from "next/navigation";
import { serviceLabel } from "@/lib/content";
import { formatLeadTime } from "@/lib/format";
import { statusLabel } from "@/lib/leadStatus";
import { formatPhone } from "@/lib/phone";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/db";
import { setLeadStatusAction } from "../../../actions";
import { NoteForm } from "../../../_components/NoteForm";
import { SubmitButton } from "../../../_components/SubmitButton";
import s from "../../../admin.module.css";

export default async function LeadPage({
  params,
}: PageProps<"/admin/leads/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const lead = Number.isInteger(id)
    ? await prisma.lead.findUnique({ where: { id } })
    : null;
  if (!lead) notFound();

  const statusButton = (status: string, label: string, className: string) => (
    <form action={setLeadStatusAction}>
      <input type="hidden" name="id" value={lead.id} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton className={className}>{label}</SubmitButton>
    </form>
  );

  return (
    <>
      <Link href="/admin" className={s.back}>
        ← Все заявки
      </Link>
      <h1 className={s.title}>Заявка № {lead.id}</h1>

      <div className={s.leadDetail}>
        <p className={s.leadMeta}>
          {formatLeadTime(lead.createdAt)} ·{" "}
          <span className={s[`status_${lead.status}`]}>
            {statusLabel[lead.status]}
          </span>
        </p>

        <div className={s.detailRow}>
          <span className={s.label}>Имя</span>
          <span className={s.leadName}>{lead.name}</span>
        </div>
        <div className={s.detailRow}>
          <span className={s.label}>Что нужно сделать</span>
          {serviceLabel(lead.service)}
        </div>

        <a href={`tel:${lead.phone}`} className={s.callBig}>
          Позвонить: {formatPhone(lead.phone)}
        </a>

        <div className={s.row}>
          {lead.status === "NEW" &&
            statusButton("IN_PROGRESS", "Взять в работу", s.primary)}
          {lead.status !== "DONE" && statusButton("DONE", "Готово", s.success)}
          {lead.status !== "NEW" &&
            statusButton("NEW", "Вернуть в новые", s.secondary)}
        </div>

        <NoteForm id={lead.id} note={lead.note} />

        {lead.status !== "REJECTED" && (
          <form action={setLeadStatusAction}>
            <input type="hidden" name="id" value={lead.id} />
            <input type="hidden" name="status" value="REJECTED" />
            <SubmitButton className={s.linkButton}>
              Отметить как отказ
            </SubmitButton>
          </form>
        )}
      </div>
    </>
  );
}
