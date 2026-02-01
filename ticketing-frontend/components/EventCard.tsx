"use client";

import { useState } from "react";
import {
  useEvent,
  useCreateTicket,
  useTicketIdByEventAndOwner,
  useCancelEvent,
  useCreateTicketFor,
} from "@/hooks/useTicketing";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { TicketType, TICKET_TYPE_LABELS } from "@/config/web3";
import type { TicketTypeValue } from "@/config/web3";

interface EventCardProps {
  eventId: bigint;
  index: number;
}

export function EventCard({ eventId, index }: EventCardProps) {
  const { data: eventData, isLoading } = useEvent(eventId);
  const { data: userTicketId } = useTicketIdByEventAndOwner(eventId);
  const { createTicket, isPending: isCreatingTicket } = useCreateTicket();
  const { cancelEvent, isPending: isCancelling } = useCancelEvent();
  const { createTicketFor, isPending: isCreatingFor } = useCreateTicketFor();
  const { address, isConnected } = useAccount();

  const [showOrgPanel, setShowOrgPanel] = useState(false);
  const [ticketForAddress, setTicketForAddress] = useState("");
  const [ticketForType, setTicketForType] = useState<TicketTypeValue>(TicketType.VIP);

  if (isLoading) {
    return (
      <div className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl p-6 animate-pulse">
        <div className="h-6 bg-zinc-800/50 rounded-xl w-3/4 mb-4" />
        <div className="h-4 bg-zinc-800/50 rounded-xl w-1/2 mb-4" />
        <div className="h-10 bg-zinc-800/50 rounded-xl" />
      </div>
    );
  }

  if (!eventData) return null;

  const [id, endDate, organizer, exists, cancelled, name, metadataURI] = eventData;

  if (!exists) return null;

  const isOrganizer =
    address?.toLowerCase() === organizer.toLowerCase();
  const hasTicket = userTicketId !== undefined && userTicketId > BigInt(0);
  const endDateObj = new Date(Number(endDate) * 1000);
  const isEnded = endDateObj.getTime() < Date.now();
  const isActive = !cancelled && !isEnded;

  const handleGetTicket = () => {
    const uri = `ticket-${eventId}-standard.json`;
    createTicket(eventId, TicketType.STANDARD, uri);
  };

  const handleCreateTicketFor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForAddress.trim()) return;
    const uri = `ticket-${eventId}-${TICKET_TYPE_LABELS[ticketForType].toLowerCase()}.json`;
    createTicketFor(
      eventId,
      ticketForAddress as `0x${string}`,
      ticketForType,
      uri
    );
    setTicketForAddress("");
  };

  return (
    <motion.div
      className={`group relative border rounded-3xl p-6 transition-all duration-500 overflow-hidden ${
        cancelled
          ? "bg-red-950/10 border-red-500/10"
          : isEnded
          ? "bg-zinc-900/20 border-white/[0.03]"
          : "bg-zinc-900/40 border-white/[0.06] hover:border-violet-500/20"
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={isActive ? { y: -4, transition: { duration: 0.3 } } : {}}
    >
      {/* Hover glow */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-fuchsia-500/0 group-hover:from-violet-500/5 group-hover:to-fuchsia-500/5 transition-all duration-500 rounded-3xl" />
      )}

      {/* Top gradient line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-mono text-zinc-600 mb-1.5 block tracking-wider">
              EVENT #{id.toString().padStart(3, "0")}
            </span>
            <h3 className="text-xl font-bold text-white group-hover:text-violet-100 transition-colors truncate">
              {name}
            </h3>
          </div>
          <div className="ml-3 flex flex-col items-end gap-1.5">
            {cancelled ? (
              <span className="px-2.5 py-1 bg-red-500/10 text-red-400 text-[11px] font-medium rounded-full border border-red-500/15">
                Annule
              </span>
            ) : isEnded ? (
              <span className="px-2.5 py-1 bg-zinc-800/50 text-zinc-500 text-[11px] font-medium rounded-full border border-white/5">
                Termine
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-medium rounded-full border border-emerald-500/15">
                Actif
              </span>
            )}
            {isOrganizer && (
              <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 text-[11px] font-medium rounded-full border border-violet-500/15">
                Organisateur
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>
              Fin : {endDateObj.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="font-mono text-xs">
              {organizer.slice(0, 6)}...{organizer.slice(-4)}
            </span>
          </div>
          {metadataURI && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span className="truncate text-xs">{metadataURI}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {isActive && (
          <>
            {hasTicket ? (
              <div className="flex items-center gap-2.5 py-3 px-4 bg-emerald-500/8 border border-emerald-500/15 rounded-2xl">
                <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-emerald-400 font-medium text-sm">
                  Tu as deja un ticket !
                </span>
              </div>
            ) : (
              <button
                onClick={handleGetTicket}
                disabled={isCreatingTicket || !isConnected}
                className="relative w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 overflow-hidden group/btn"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                {isCreatingTicket ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
          </>
        )}

        {/* Organizer panel */}
        {isOrganizer && isActive && (
          <div className="mt-4">
            <button
              onClick={() => setShowOrgPanel(!showOrgPanel)}
              className="w-full text-left text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform duration-200 ${showOrgPanel ? "rotate-90" : ""}`}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              Gestion organisateur
            </button>

            {showOrgPanel && (
              <motion.div
                className="mt-3 space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.2 }}
              >
                {/* Create ticket for someone */}
                <form onSubmit={handleCreateTicketFor} className="space-y-2.5">
                  <p className="text-xs text-zinc-500">Creer un ticket pour un utilisateur</p>
                  <input
                    type="text"
                    value={ticketForAddress}
                    onChange={(e) => setTicketForAddress(e.target.value)}
                    placeholder="Adresse 0x..."
                    className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                  <div className="flex gap-2">
                    <select
                      value={ticketForType}
                      onChange={(e) => setTicketForType(Number(e.target.value) as TicketTypeValue)}
                      className="flex-1 px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                    >
                      <option value={TicketType.VIP}>{TICKET_TYPE_LABELS[TicketType.VIP]}</option>
                      <option value={TicketType.STAFF}>{TICKET_TYPE_LABELS[TicketType.STAFF]}</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isCreatingFor || !ticketForAddress.trim()}
                      className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      {isCreatingFor ? "..." : "Creer"}
                    </button>
                  </div>
                </form>

                {/* Cancel event */}
                <button
                  onClick={() => cancelEvent(eventId)}
                  disabled={isCancelling}
                  className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 text-red-400 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {isCancelling ? "Annulation..." : "Annuler l'evenement"}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
