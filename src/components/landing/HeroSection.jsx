import React from "react";

function HeroSection({ onJoinWaitlist }) {
  return (
    <section className="relative min-h-screen pt-16 pb-0 overflow-hidden flex flex-col">
      <div className="container z-10 mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-[#FF4FBF] via-[#9D4EDD] to-[#5B5FFF] bg-clip-text text-transparent">
            Connect, Build & Grow on Solana
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            The first social platform built exclusively for the Solana community. Connect with builders, discover projects, and participate in the ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 pb-2">
            <button
              onClick={onJoinWaitlist} // Add click handler to trigger wallet connection
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#FF4FBF] via-[#9D4EDD] to-[#5B5FFF] text-white hover:shadow-lg transition-shadow duration-300 border-0 relative overflow-hidden h-11 rounded-md px-8"
            >
              Join the Waitlist
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-11 rounded-md px-8 border-gray-700 text-gray-200 hover:text-white hover:bg-gray-800">
              Learn More
            </button>
          </div>
        </div>
      </div>
      <div className="w-full flex-1 mt-0 relative z-0 cursor-default pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            height: "calc(100vh - 300px)",
            minHeight: "350px",
            maxHeight: "600px",
            marginTop: "-20px",
            position: "relative",
            zIndex: 0,
          }}
        >
          {/* Adding a transparent overlay to prevent interaction with the Spline animation */}
          <div
            className="absolute inset-0 z-20"
            style={{ cursor: "none", pointerEvents: "auto", backgroundColor: "transparent" }}
          ></div>
          <spline-viewer url="https://prod.spline.design/oOzmEV1P9A5AUeEO/scene.splinecode"></spline-viewer>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;