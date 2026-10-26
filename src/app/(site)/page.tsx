import { Hero } from "@/components/Hero";
import { LeadSection } from "@/components/LeadSection";
import { Services } from "@/components/Services";
import { Steps } from "@/components/Steps";
import { Works } from "@/components/Works";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Steps />
      <Works />
      <LeadSection />
    </>
  );
}
