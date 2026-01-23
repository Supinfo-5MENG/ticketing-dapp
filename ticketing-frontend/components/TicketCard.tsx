"use client";

import { useTicket, useUseTicket } from "@/hooks/useTicketing";
import { useAccount } from "wagmi";

interface TicketCardProps {
    ticketId: bigint;
}

export function TicketCard({ ticketId }: TicketCardProps) {
    const { data: ticketData, isLoading } = useTicket(ticketId);
    const { useTicket: consumeTicket, isPending } = useUseTicket();
    const { address } = useAccount();

    if (isLoading) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-zinc-800 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
            </div>
        );
    }

    if (!ticketData) return null;

    const [id, owner, used] = ticketData;
    const isOwner = address?.toLowerCase() === owner.toLowerCase();

    return (
        <div
            className={`relative overflow-hidden border rounded-2xl p-6 transition-all duration-200 ${
                used
                    ? "bg-zinc-900/30 border-zinc-800"
                    : "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20 hover:border-violet-500/40"
            }`}
        >
            {/* Ticket perforations */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-zinc-950 rounded-full"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-zinc-950 rounded-full"></div>

            <div className="flex items-start justify-between mb-4">
                <div>
          <span className="text-xs font-mono text-zinc-500 mb-1 block">
            Ticket #{id.toString()}
          </span>
                    <p className="text-sm text-zinc-400 font-mono truncate max-w-[180px]">
                        {owner.slice(0, 6)}...{owner.slice(-4)}
                    </p>
                </div>

                {used ? (
                    <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-medium rounded-full">
            Utilisé
          </span>
                ) : (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
            Valide
          </span>
                )}
            </div>

            {isOwner && !used && (
                <button
                    onClick={() => consumeTicket(ticketId)}
                    disabled={isPending}
                    className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 text-sm"
                >
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
    );
}