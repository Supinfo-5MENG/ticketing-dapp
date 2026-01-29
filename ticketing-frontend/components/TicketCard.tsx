"use client";

import { useTicket, useUseTicket } from "@/hooks/useTicketing";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";

interface TicketCardProps {
  ticketId: bigint;
  index: number;
}

export function TicketCard({ ticketId, index }: TicketCardProps) {
  const { data: ticketData, isLoading } = useTicket(ticketId);
  const { useTicket: consumeTicket, isPending } = useUseTicket();
  const { address } = useAccount();

  if (isLoading) {
    return (
      <div className="relative bg-zinc-900/40 border border-white/5 rounded-3xl p-6 animate-pulse">
        <div className="h-6 bg-zinc-800/50 rounded-xl w-1/2 mb-4" />
        <div className="h-4 bg-zinc-800/50 rounded-xl w-3/4" />
      </div>
    );
  }

  if (!ticketData) return null;

  const [id, owner, used] = ticketData;
  const isOwner = address?.toLowerCase() === owner.toLowerCase();

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 ${
        used
          ? "bg-zinc-900/20 border border-white/[0.03]"
          : "bg-gradient-to-br from-violet-950/40 to-fuchsia-950/30 border border-violet-500/10 hover:border-violet-500/25"
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={used ? {} : { y: -4, transition: { duration: 0.3 } }}
    >
      {/* Shimmer effect for valid tickets */}
      {!used && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}

      {/* Ticket perforations - modern style */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-zinc-950 rounded-full border border-white/5" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-7 h-7 bg-zinc-950 rounded-full border border-white/5" />

      {/* Dashed separator */}
      <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 border-t border-dashed border-white/[0.06]" />

      <div className="relative">
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-[11px] font-mono text-zinc-600 mb-1.5 block tracking-wider">
              TICKET #{id.toString().padStart(3, "0")}
            </span>
            <p className="text-sm text-zinc-400 font-mono">
              {owner.slice(0, 6)}...{owner.slice(-4)}
            </p>
          </div>

          {used ? (
            <span className="px-3 py-1.5 bg-zinc-800/50 text-zinc-500 text-xs font-medium rounded-full border border-white/5">
              Utilise
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/15 shadow-sm shadow-emerald-500/10">
              Valide
            </span>
          )}
        </div>

        {/* Visual barcode */}
        <div className="flex gap-[2px] mb-5 opacity-30">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`h-6 rounded-sm ${
                used ? "bg-zinc-700" : "bg-violet-400"
              }`}
              style={{
                width: `${2 + Math.random() * 4}px`,
                opacity: 0.3 + Math.random() * 0.7,
              }}
            />
          ))}
        </div>

        {isOwner && !used && (
          <button
            onClick={() => consumeTicket(ticketId)}
            disabled={isPending}
            className="relative w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-violet-500/20 text-sm overflow-hidden group/btn"
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
                Validation...
              </span>
            ) : (
              "Utiliser ce ticket"
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
