import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import Marquee from "@/components/home/Marquee";
import NewArrivals from "@/components/home/NewArrivals";
import RotatingBadge from "@/components/ui/RotatingBadge";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="relative">
        <div className="absolute right-6 top-0 z-30 hidden -translate-y-1/2 md:block lg:right-14">
          <RotatingBadge />
        </div>
        <CategoryGrid />
      </div>
      <WelcomeBanner />
      <Marquee />
      <NewArrivals />
    </>
  );
}
