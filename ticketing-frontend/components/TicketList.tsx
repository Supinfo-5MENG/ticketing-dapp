"use client";

import { useTicketCount } from "@/hooks/useTicketing";
import { TicketCard } from "./TicketCard";
import { motion } from "framer-motion";

export function TicketList() {
  const { data: ticketCount, isLoading } = useTicketCount();

  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 animate-pulse"
          >
            <div className="h-6 bg-zinc-800/50 rounded-xl w-1/2 mb-4" />
            <div className="h-4 bg-zinc-800/50 rounded-xl w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const count = ticketCount ? Number(ticketCount) : 0;

  if (count === 0) {
    return (
      <motion.div
        className="text-center py-16 bg-zinc-900/20 border border-dashed border-white/[0.06] rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-fuchsia-400"
          >
            <path d="M20 12H4M20 12l-4-4m4 4l-4 4" />
          </svg>
        </div>
        <p className="text-zinc-400 font-medium">Aucun ticket cree</p>
        <p className="text-zinc-600 text-sm mt-1">
          Obtiens un ticket depuis un evenement
        </p>
      </motion.div>
    );
  }

  const ticketIds = Array.from({ length: count }, (_, i) => BigInt(i + 1));

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {ticketIds.map((ticketId, i) => (
        <TicketCard
          key={ticketId.toString()}
          ticketId={ticketId}
          index={i}
        />
      ))}
    </div>
  );
}
