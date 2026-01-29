"use client";

import {
  useEvent,
  useCreateTicket,
  useHasTicketForEvent,
} from "@/hooks/useTicketing";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";

interface EventCardProps {
  eventId: bigint;
  index: number;
}

export function EventCard({ eventId, index }: EventCardProps) {
  const { data: eventData, isLoading } = useEvent(eventId);
  const { data: hasTicket } = useHasTicketForEvent(eventId);
  const { createTicket, isPending } = useCreateTicket();
  const { isConnected } = useAccount();

  if (isLoading) {
    return (
      <div className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl p-6 animate-pulse">
        <div className="h-6 bg-zinc-800/50 rounded-xl w-3/4 mb-4" />
        <div className="h-10 bg-zinc-800/50 rounded-xl" />
      </div>
    );
  }

  if (!eventData) return null;

  const [id, name, exists] = eventData;

  if (!exists) return null;

  return (
    <motion.div
      className="group relative bg-zinc-900/40 border border-white/[0.06] rounded-3xl p-6 hover:border-violet-500/20 transition-all duration-500 overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-fuchsia-500/0 group-hover:from-violet-500/5 group-hover:to-fuchsia-500/5 transition-all duration-500 rounded-3xl" />

      {/* Top gradient line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-[11px] font-mono text-zinc-600 mb-1.5 block tracking-wider">
              EVENT #{id.toString().padStart(3, "0")}
            </span>
            <h3 className="text-xl font-bold text-white group-hover:text-violet-100 transition-colors">
              {name}
            </h3>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 border border-violet-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:border-violet-500/20 transition-all duration-300">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-violet-400"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>

        {hasTicket ? (
          <div className="flex items-center gap-2.5 py-3 px-4 bg-emerald-500/8 border border-emerald-500/15 rounded-2xl">
            <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-emerald-400 font-medium text-sm">
              Tu as deja un ticket !
            </span>
          </div>
        ) : (
          <button
            onClick={() => createTicket(eventId)}
            disabled={isPending || !isConnected}
            className="relative w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 overflow-hidden group/btn"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                En cours...
              </span>
            ) : !isConnected ? (
              "Connecte-toi d'abord"
            ) : (
              "Obtenir un ticket"
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
