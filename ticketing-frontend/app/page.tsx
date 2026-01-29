"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSection } from "@/components/HeroSection";
import { CreateEventForm } from "@/components/CreateEventForm";
import { EventList } from "@/components/EventList";
import { TicketList } from "@/components/TicketList";

type Tab = "events" | "tickets";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("events");

  return (
    <div className="relative noise-bg">
      {/* Hero */}
      <HeroSection />

      {/* Create Event Section */}
      <section id="create" className="relative py-24 px-6">
        {/* Section background orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-lg mx-auto relative">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 text-[11px] font-semibold tracking-widest uppercase text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-500/15 rounded-full mb-4">
              Nouveau
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Creer un evenement
            </h2>
            <p className="text-zinc-500">
              Lance ton evenement sur la blockchain en quelques secondes
            </p>
          </motion.div>

          <motion.div
            className="bg-zinc-900/30 border border-white/[0.06] rounded-3xl p-8 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <CreateEventForm />
          </motion.div>
        </div>
      </section>

      {/* Events & Tickets Section */}
      <section id="events" className="relative py-24 px-6">
        {/* Section background orbs */}
        <div className="absolute top-1/3 -left-64 w-[500px] h-[500px] bg-violet-600/6 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 -right-64 w-[500px] h-[500px] bg-fuchsia-600/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          {/* Section header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Explorer
            </h2>
            <p className="text-zinc-500">
              Decouvre les evenements et gere tes tickets NFT
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            className="flex gap-2 mb-10 justify-center"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              onClick={() => setActiveTab("events")}
              className={`relative px-7 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${
                activeTab === "events"
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300 bg-transparent"
              }`}
            >
              {activeTab === "events" && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl shadow-lg shadow-violet-500/20"
                  layoutId="activeTab"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Evenements
              </span>
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`relative px-7 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${
                activeTab === "tickets"
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300 bg-transparent"
              }`}
            >
              {activeTab === "tickets" && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl shadow-lg shadow-violet-500/20"
                  layoutId="activeTab"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Tickets
              </span>
            </button>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "events" ? <EventList /> : <TicketList />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M2 12h5l3-9 4 18 3-9h5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">
              Ticketing DApp
            </span>
          </div>
          <p className="text-zinc-600 text-sm">
            Powered by Ethereum &middot; Built with Next.js
          </p>
        </div>
      </footer>
    </div>
  );
}
