import TextBar from "./Textbar";
import HeroSection from "./allen";
import TrendingCourses from "./Trendcourse";
import Testimonials from "./Testimonials";
import { AdminTeaser , Footer } from "./Footer";

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
      {/* 🔹 Static Dual Gradient Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      {/* 🔹 Foreground Content */}
      <div className="relative z-10 flex flex-col">
        <HeroSection />
        <TrendingCourses />
        <Testimonials />
        <AdminTeaser />
        <Footer />
      </div>
    </div>
  );
}