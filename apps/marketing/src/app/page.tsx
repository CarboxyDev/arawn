import { ThemeToggle } from '@repo/packages-ui/theme-toggle';
import React from 'react';

import { GitHubStarButton } from '@/components/github-star-button';
import { FAQSection } from '@/components/landing/faq-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { Footer } from '@/components/landing/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { IncludedSection } from '@/components/landing/included-section';
import { QuickStartSection } from '@/components/landing/quick-start-section';
import { SectionContainer } from '@/components/landing/section-container';
import { TechStackSection } from '@/components/landing/tech-stack-section';
import { WhySection } from '@/components/landing/why-section';

export default function Home() {
  return (
    <main className="bg-background relative flex min-h-screen flex-col">
      <div className="absolute right-8 top-8 z-10 flex items-center gap-2 lg:fixed">
        <GitHubStarButton />
        <ThemeToggle />
      </div>

      <SectionContainer className="pt-28">
        <HeroSection />
      </SectionContainer>

      <SectionContainer>
        <WhySection />
      </SectionContainer>

      <SectionContainer>
        <FeaturesSection />
      </SectionContainer>

      <SectionContainer>
        <IncludedSection />
      </SectionContainer>

      <SectionContainer id="quick-start">
        <QuickStartSection />
      </SectionContainer>

      <SectionContainer>
        <TechStackSection />
      </SectionContainer>

      <SectionContainer>
        <FAQSection />
      </SectionContainer>

      <Footer />
    </main>
  );
}
