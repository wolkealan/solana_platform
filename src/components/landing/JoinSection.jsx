import React from "react";

function JoinSection() {
  return (
    <section className="py-16 md:py-24 relative bg-black">
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Join the Solana Social Revolution
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Be among the first to access Solcialize when we launch. Early adopters
            get exclusive perks and features!
          </p>
          <div className="pt-4">
            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#FF4FBF] via-[#9D4EDD] to-[#5B5FFF] text-white hover:shadow-lg transition-shadow duration-300 border-0 relative overflow-hidden h-11 rounded-md px-8 shadow-lg shadow-[#9D4EDD]/20">
              Sign Up for Early Access
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JoinSection;