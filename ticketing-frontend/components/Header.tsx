"use client";

import { ConnectKitButton } from "connectkit";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12h5l3-9 4 18 3-9h5" />
              </svg>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl opacity-20 blur-md -z-10" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Ticketing
            </h1>
            <span className="text-[10px] font-medium text-violet-400 tracking-widest uppercase">
              DApp
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a
            href="#create"
            className="text-zinc-400 hover:text-white transition-colors duration-200"
          >
            Creer
          </a>
          <a
            href="#events"
            className="text-zinc-400 hover:text-white transition-colors duration-200"
          >
            Evenements
          </a>
          <a
            href="#tickets"
            className="text-zinc-400 hover:text-white transition-colors duration-200"
          >
            Tickets
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ConnectKitButton />
        </div>
      </div>
    </motion.header>
  );
}
