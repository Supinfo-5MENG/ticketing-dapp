"use client";

import { useEventCount } from "@/hooks/useTicketing";
import { EventCard } from "./EventCard";

export function EventList() {
    const { data: eventCount, isLoading } = useEventCount();

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 animate-pulse"
                    >
                        <div className="h-6 bg-zinc-800 rounded w-3/4 mb-4"></div>
                        <div className="h-10 bg-zinc-800 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    const count = eventCount ? Number(eventCount) : 0;

    if (count === 0) {
        return (
            <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-2xl">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-zinc-400">Aucun événement pour le moment</p>
                <p className="text-zinc-500 text-sm mt-1">
                    Crée le premier événement !
                </p>
            </div>
        );
    }

    // Générer les IDs des events (de 1 à eventCount)
    const eventIds = Array.from({ length: count }, (_, i) => BigInt(i + 1));

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventIds.map((eventId) => (
                <EventCard key={eventId.toString()} eventId={eventId} />
            ))}
        </div>
    );
}