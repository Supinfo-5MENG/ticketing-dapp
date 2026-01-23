"use client";

import { useState } from "react";
import { CreateEventForm } from "@/components/CreateEventForm";
import { EventList } from "@/components/EventList";
import { TicketList } from "@/components/TicketList";

type Tab = "events" | "tickets";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("events");

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
          Ticketing Décentralisé
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Crée des événements, distribue des tickets et valide les entrées
          directement sur la blockchain.
        </p>
      </section>

      {/* Create Event Section */}
      <section className="mb-12 max-w-md mx-auto">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">✨</span>
            Créer un événement
          </h2>
          <CreateEventForm />
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-8 justify-center">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            activeTab === "events"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
              : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          🎉 Événements
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            activeTab === "tickets"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
              : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          🎫 Tickets
        </button>
      </div>

      {/* Content */}
      <section>
        {activeTab === "events" ? <EventList /> : <TicketList />}
      </section>
    </div>
  );
}
