import React from "react";
import Header from "./landing/Header";
import HeroSection from "./landing/HeroSection";
import FeaturesSection from "./landing/FeaturesSection";
import JoinSection from "./landing/JoinSection";
import Footer from "./landing/Footer";

function LandingPage({ onJoinWaitlist }) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">
        <HeroSection onJoinWaitlist={onJoinWaitlist} />
        <FeaturesSection />
        <JoinSection />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;