import { PublicShell } from "@/components/PublicShell";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <PublicShell>{children}</PublicShell>;
}
