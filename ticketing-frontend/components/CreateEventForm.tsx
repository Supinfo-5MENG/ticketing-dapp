"use client";

import { useState } from "react";
import { useCreateEvent } from "@/hooks/useTicketing";
import { useAccount } from "wagmi";

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
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center">
                <p className="text-zinc-400">
                    Connecte ton wallet pour créer un événement
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label
                    htmlFor="eventName"
                    className="block text-sm font-medium text-zinc-300 mb-2"
                >
                    Nom de l&apos;événement
                </label>
                <input
                    type="text"
                    id="eventName"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Concert, Conférence, Festival..."
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
            </div>

            <button
                type="submit"
                disabled={isPending || !eventName.trim()}
                className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20"
            >
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
                    "Créer l'événement"
                )}
            </button>
        </form>
    );
}