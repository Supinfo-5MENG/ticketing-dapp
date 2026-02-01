"use client";

import { useEventCount } from "@/hooks/useTicketing";
import { EventCard } from "./EventCard";
import { motion } from "framer-motion";

export function EventList() {
  const { data: eventCount, isLoading } = useEventCount();

  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 animate-pulse"
          >
            <div className="h-6 bg-zinc-800/50 rounded-xl w-3/4 mb-4" />
            <div className="h-10 bg-zinc-800/50 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  const count = eventCount ? Number(eventCount) : 0;

  if (count === 0) {
    return (
      <motion.div
        className="text-center py-16 bg-zinc-900/20 border border-dashed border-white/[0.06] rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-violet-500/10 rounded-2xl flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-violet-400"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <p className="text-zinc-400 font-medium">
          Aucun evenement pour le moment
        </p>
        <p className="text-zinc-600 text-sm mt-1">
          Cree le premier evenement !
        </p>
      </motion.div>
    );
  }

  const eventIds = Array.from({ length: count }, (_, i) => BigInt(i + 1));

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {eventIds.map((eventId, i) => (
        <EventCard
          key={eventId.toString()}
          eventId={eventId}
          index={i}
        />
      ))}
    </div>
  );
}
