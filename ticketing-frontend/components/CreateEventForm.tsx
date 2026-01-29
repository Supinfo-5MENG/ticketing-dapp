"use client";

import { useState } from "react";
import { useCreateEvent } from "@/hooks/useTicketing";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";

export function CreateEventForm() {
  const [eventName, setEventName] = useState("");
  const { createEvent, isPending } = useCreateEvent();
  const { isConnected } = useAccount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventName.trim()) {
      createEvent(eventName);
      setEventName("");
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 mx-auto mb-4 bg-violet-500/10 rounded-2xl flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-violet-400"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="text-zinc-400">
          Connecte ton wallet pour creer un evenement
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="eventName"
          className="block text-sm font-medium text-zinc-300 mb-2.5"
        >
          Nom de l&apos;evenement
        </label>
        <input
          type="text"
          id="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Concert, Conference, Festival..."
          className="w-full px-5 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/30 transition-all duration-300 backdrop-blur-sm"
        />
      </div>

      <motion.button
        type="submit"
        disabled={isPending || !eventName.trim()}
        className="relative w-full py-3.5 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 overflow-hidden group"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Transaction en cours...
          </span>
        ) : (
          "Creer l'evenement"
        )}
      </motion.button>
    </form>
  );
}
