import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeaturedTours from "@/components/landing/FeaturedTours";
import Promotions from "@/components/landing/Promotions";
import Benefits from "@/components/landing/Benefits";
import Testimonials from "@/components/landing/Testimonials";
import CallToAction from "@/components/landing/CallToAction";
import Footer from "@/components/landing/Footer";
import { fetchPublicTours } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tours = await fetchPublicTours(6);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <FeaturedTours tours={tours} />
      <Promotions />
      <Benefits />
      <Testimonials />
      <CallToAction />
      <Footer />
    </main>
  );
}
