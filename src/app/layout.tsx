import type { Metadata, Viewport } from "next";
import { Golos_Text } from "next/font/google";
import { site } from "@/lib/site";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const title = "Агроинвест — ремонт газовых котлов и отопление";
const description = `Ремонт и обслуживание газовых котлов, монтаж отопления под ключ, обслуживание котельных. Выезд в день обращения, цена до начала работ. Телефон ${site.phone}.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: site.name,
    title,
    description,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0F2A47",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={golos.variable}>
      <body>{children}</body>
    </html>
  );
}
