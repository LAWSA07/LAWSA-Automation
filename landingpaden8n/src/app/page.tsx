import { Header } from "./_components/Header";
import { HeroSection } from "./_components/HeroSection";
import { FeaturesShowcase } from "./_components/FeaturesShowcase";
import { HowItWorks } from "./_components/HowItWorks";
import { FaqSection } from "./_components/FaqSection";
import { Footer } from "./_components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesShowcase />
      <HowItWorks />
      <FaqSection />
      <Footer />
    </main>
  );
}
