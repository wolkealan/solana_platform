import React from "react";

function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-12 bg-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <a
              className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#FF4FBF] via-[#9D4EDD] to-[#5B5FFF] text-transparent bg-clip-text"
              href="/"
            >
              Solcialize
            </a>
            <p className="text-sm text-gray-500 mt-2">
              © {new Date().getFullYear()} Solcialize. All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-4 justify-center">
            <a
              className="text-sm text-gray-400 hover:text-[#9D4EDD] transition-colors"
              href="#"
            >
              Terms
            </a>
            <a
              className="text-sm text-gray-400 hover:text-[#9D4EDD] transition-colors"
              href="#"
            >
              Privacy
            </a>
            <a
              className="text-sm text-gray-400 hover:text-[#9D4EDD] transition-colors"
              href="#"
            >
              Community Guidelines
            </a>
            <a
              className="text-sm text-gray-400 hover:text-[#9D4EDD] transition-colors"
              href="#"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;