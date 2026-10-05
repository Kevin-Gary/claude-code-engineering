import { FeatureDiagnose } from "@/components/site/FeatureDiagnose";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Pricing } from "@/components/site/Pricing";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { Waitlist } from "@/components/site/Waitlist";

/** The Verdant marketing site: a single landing page driving app installs.
 *  (No testimonials section on purpose. Adding one is the plan-mode exercise.) */
export default function HomePage() {
  return (
    <>
      <SiteNav />
      <Hero />
      <HowItWorks />
      <FeatureDiagnose />
      <Pricing />
      <Waitlist />
      <SiteFooter />
    </>
  );
}
