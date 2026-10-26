import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import "./globals.css";

const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Агроинвест — ремонт газовых котлов и отопление",
  description:
    "Ремонт и обслуживание газовых котлов, монтаж систем отопления, обслуживание котельных.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={golos.variable}>
      <body>{children}</body>
    </html>
  );
}
