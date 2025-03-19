import React from "react";

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800 w-full">
      <div className="flex h-14 items-center justify-start px-4 w-full">
        <div className="flex items-center gap-6">
          <a
            className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#FF4FBF] via-[#9D4EDD] to-[#5B5FFF] text-transparent bg-clip-text"
            href="/"
          >
            Solcialize
          </a>
          <nav className="flex items-center gap-6">
            <a className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="#features">
              Features
            </a>
            <a className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="#community">
              Community
            </a>
            <a className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="#roadmap">
              Roadmap
            </a>
            <a className="text-sm font-medium text-gray-300 hover:text-primary transition-colors" href="#blog">
              Blog
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;