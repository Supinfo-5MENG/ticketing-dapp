"use client";

import { useEvent, useCreateTicket, useHasTicketForEvent } from "@/hooks/useTicketing";
import { useAccount } from "wagmi";

interface EventCardProps {
    eventId: bigint;
}

export function EventCard({ eventId }: EventCardProps) {
    const { data: eventData, isLoading } = useEvent(eventId);
    const { data: hasTicket } = useHasTicketForEvent(eventId);
    const { createTicket, isPending } = useCreateTicket();
    const { isConnected } = useAccount();

    if (isLoading) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-zinc-800 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-zinc-800 rounded"></div>
            </div>
        );
    }

    if (!eventData) return null;

    const [id, name, exists] = eventData;

    if (!exists) return null;

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div>
          <span className="text-xs font-mono text-zinc-500 mb-1 block">
            Event #{id.toString()}
          </span>
                    <h3 className="text-lg font-semibold text-white">{name}</h3>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎉</span>
                </div>
            </div>

            {hasTicket ? (
                <div className="flex items-center gap-2 py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <svg
                        className="w-5 h-5 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <span className="text-emerald-400 font-medium">
            Tu as déjà un ticket !
          </span>
                </div>
            ) : (
                <button
                    onClick={() => createTicket(eventId)}
                    disabled={isPending || !isConnected}
                    className="w-full py-3 px-6 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 border border-zinc-700"
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
    );
}