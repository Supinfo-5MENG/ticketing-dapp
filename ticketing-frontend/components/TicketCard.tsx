"use client";

import { useState } from "react";
import {
  useTicket,
  useOwnerOf,
  useEvent,
  useScanTicket,
  useResellTicket,
} from "@/hooks/useTicketing";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  TicketType,
  TICKET_TYPE_LABELS,
  TICKET_TYPE_COLORS,
  TICKET_TYPE_BG,
  TICKETING_CONTRACT_ADDRESS,
} from "@/config/web3";

interface TicketCardProps {
  ticketId: bigint;
  index: number;
}

export function TicketCard({ ticketId, index }: TicketCardProps) {
  const { data: ticketData, isLoading } = useTicket(ticketId);
  const { data: owner } = useOwnerOf(ticketId);
  const { scanTicket, isPending: isScanning } = useScanTicket();
  const { resellTicket, isPending: isReselling } = useResellTicket();
  const { address } = useAccount();

  const [showResell, setShowResell] = useState(false);
  const [resellAddress, setResellAddress] = useState("");
  const [showQR, setShowQR] = useState(false);

  if (isLoading) {
    return (
      <div className="relative bg-zinc-900/40 border border-white/5 rounded-3xl p-6 animate-pulse">
        <div className="h-6 bg-zinc-800/50 rounded-xl w-1/2 mb-4" />
        <div className="h-4 bg-zinc-800/50 rounded-xl w-3/4" />
      </div>
    );
  }

  if (!ticketData) return null;

  const [id, eventId, used, ticketType] = ticketData;
  const isOwner = owner && address?.toLowerCase() === owner.toLowerCase();
  const typeBg = TICKET_TYPE_BG[ticketType] || TICKET_TYPE_BG[0];
  const typeColor = TICKET_TYPE_COLORS[ticketType] || TICKET_TYPE_COLORS[0];
  const typeLabel = TICKET_TYPE_LABELS[ticketType] || "Inconnu";
  const isStandard = ticketType === TicketType.STANDARD;

  // QR code data: contract address + ticket id for on-chain verification
  const qrData = JSON.stringify({
    contract: TICKETING_CONTRACT_ADDRESS,
    ticketId: id.toString(),
    eventId: eventId.toString(),
    type: typeLabel,
  });

  const handleResell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resellAddress.trim()) return;
    resellTicket(eventId, resellAddress as `0x${string}`);
    setResellAddress("");
    setShowResell(false);
  };

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

      {/* Ticket perforations */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-zinc-950 rounded-full border border-white/5" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-7 h-7 bg-zinc-950 rounded-full border border-white/5" />

      {/* Dashed separator */}
      <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 border-t border-dashed border-white/[0.06]" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[11px] font-mono text-zinc-600 mb-1.5 block tracking-wider">
              TICKET #{id.toString().padStart(3, "0")}
            </span>
            <EventName eventId={eventId} />
            {owner && (
              <p className="text-xs text-zinc-500 font-mono mt-1">
                {owner.slice(0, 6)}...{owner.slice(-4)}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* Ticket type badge */}
            <span
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${typeBg} ${typeColor}`}
            >
              {typeLabel}
            </span>

            {/* Status badge */}
            {used ? (
              <span className="px-2.5 py-1 bg-zinc-800/50 text-zinc-500 text-[11px] font-medium rounded-full border border-white/5">
                Utilise
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-medium rounded-full border border-emerald-500/15">
                Valide
              </span>
            )}
          </div>
        </div>

        {/* QR Code toggle */}
        {!used && (
          <div className="mb-4">
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              {showQR ? "Masquer le QR" : "Afficher le QR Code"}
            </button>

            {showQR && (
              <motion.div
                className="mt-3 flex justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white p-3 rounded-2xl">
                  <QRCodeSVG
                    value={qrData}
                    size={160}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#09090b"
                  />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Visual barcode */}
        {!showQR && (
          <div className="flex gap-[2px] mb-4 opacity-30">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`h-6 rounded-sm ${
                  used ? "bg-zinc-700" : "bg-violet-400"
                }`}
                style={{
                  width: `${2 + (Number((id + BigInt(i)) % BigInt(5)) === 0 ? 4 : 2)}px`,
                  opacity: 0.3 + Number((id + BigInt(i)) % BigInt(3)) * 0.3,
                }}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        {!used && (
          <div className="space-y-2.5">
            {/* Scan button - for STAFF/ORGANIZER */}
            {isOwner && (ticketType === TicketType.STAFF || ticketType === TicketType.ORGANIZER) && (
              <button
                onClick={() => scanTicket(ticketId)}
                disabled={isScanning}
                className="relative w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-sky-500/20 text-sm overflow-hidden group/btn"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                {isScanning ? "Scan en cours..." : "Scanner un ticket"}
              </button>
            )}

            {/* Resell button - only STANDARD tickets */}
            {isOwner && isStandard && (
              <>
                <button
                  onClick={() => setShowResell(!showResell)}
                  className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/15 text-amber-400 text-sm font-medium rounded-xl transition-colors"
                >
                  Revendre ce ticket
                </button>

                {showResell && (
                  <motion.form
                    onSubmit={handleResell}
                    className="space-y-2.5"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="text"
                      value={resellAddress}
                      onChange={(e) => setResellAddress(e.target.value)}
                      placeholder="Adresse du destinataire 0x..."
                      className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isReselling || !resellAddress.trim()}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:cursor-not-allowed text-black font-medium text-sm rounded-xl transition-colors"
                    >
                      {isReselling ? "Transfert..." : "Confirmer la revente"}
                    </button>
                  </motion.form>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Sub-component to show event name from eventId
function EventName({ eventId }: { eventId: bigint }) {
  const { data: eventData } = useEvent(eventId);

  if (!eventData) {
    return (
      <p className="text-sm text-zinc-400">
        Evenement #{eventId.toString()}
      </p>
    );
  }

  const [, , , , , name] = eventData;

  return (
    <p className="text-sm font-semibold text-white">
      {name}
    </p>
  );
}
