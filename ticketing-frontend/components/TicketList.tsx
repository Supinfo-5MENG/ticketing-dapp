"use client";

import { useTicketCount } from "@/hooks/useTicketing";
import { TicketCard } from "./TicketCard";

export function TicketList() {
    const { data: ticketCount, isLoading } = useTicketCount();

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 animate-pulse"
                    >
                        <div className="h-6 bg-zinc-800 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    const count = ticketCount ? Number(ticketCount) : 0;

    if (count === 0) {
        return (
            <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-2xl">
                <div className="text-4xl mb-4">🎫</div>
                <p className="text-zinc-400">Aucun ticket créé</p>
                <p className="text-zinc-500 text-sm mt-1">
                    Obtiens un ticket depuis un événement
                </p>
            </div>
        );
    }

    // Générer les IDs des tickets (de 1 à ticketCount)
    const ticketIds = Array.from({ length: count }, (_, i) => BigInt(i + 1));

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ticketIds.map((ticketId) => (
                <TicketCard key={ticketId.toString()} ticketId={ticketId} />
            ))}
        </div>
    );
}