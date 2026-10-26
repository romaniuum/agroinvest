import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { LeadSection } from "@/components/LeadSection";
import { Services } from "@/components/Services";
import { Steps } from "@/components/Steps";
import { Works } from "@/components/Works";
import { localBusinessJsonLd } from "@/lib/jsonLd";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: localBusinessJsonLd() }}
      />
      <Hero />
      <Services />
      <Steps />
      <Works />
      <LeadSection />
    </>
  );
}
