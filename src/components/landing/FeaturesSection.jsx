import React from "react";
import FeatureCard from "./FeatureCard";

function FeaturesSection() {
  return (
    <div className="relative z-10">
      <section
        id="features"
        className="relative py-16 md:py-24 z-0 bg-black"
        style={{ marginTop: "-70px", paddingTop: "100px" }}
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(157, 78, 221, 0.1) 0%, rgba(0, 0, 0, 0) 70%)",
          }}
        ></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Key Features
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to make the most of the Solana ecosystem
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon="users"
              title="Connect with Builders"
              description="Network with developers, creators, and entrepreneurs building on Solana."
            />
            <FeatureCard
              icon="rocket"
              title="Discover Projects"
              description="Explore new and trending projects in the Solana ecosystem."
            />
            <FeatureCard
              icon="zap"
              title="Accelerate Growth"
              description="Leverage our platform to accelerate your project's growth and visibility."
            />
            <FeatureCard
              icon="shield"
              title="Secure & Private"
              description="Built with security and privacy at the core, your data stays yours."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default FeaturesSection;