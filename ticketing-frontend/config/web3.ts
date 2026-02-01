import { http, createConfig } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export const TICKETING_CONTRACT_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

export const TICKETING_ABI = [
  // Constructor
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },

  // ===== READ FUNCTIONS =====

  // eventCount
  {
    inputs: [],
    name: "eventCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // events(uint256)
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "events",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "uint256", name: "endDate", type: "uint256" },
      { internalType: "address", name: "organizer", type: "address" },
      { internalType: "bool", name: "exists", type: "bool" },
      { internalType: "bool", name: "cancelled", type: "bool" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "metadataURI", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // ticketCount
  {
    inputs: [],
    name: "ticketCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // tickets(uint256)
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "tickets",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "uint256", name: "eventId", type: "uint256" },
      { internalType: "bool", name: "used", type: "bool" },
      { internalType: "uint8", name: "ticketType", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // ticketIdByEventAndOwner(uint256, address)
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "ticketIdByEventAndOwner",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // ownerOf(uint256) - ERC721
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // tokenURI(uint256) - ERC721URIStorage
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },

  // ===== WRITE FUNCTIONS =====

  // createEvent(string name, uint256 endDate, string metadataURI)
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "endDate", type: "uint256" },
      { internalType: "string", name: "metadataURI", type: "string" },
    ],
    name: "createEvent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // updateEventMetadata(uint256 eventId, string newMetadataURI)
  {
    inputs: [
      { internalType: "uint256", name: "eventId", type: "uint256" },
      { internalType: "string", name: "newMetadataURI", type: "string" },
    ],
    name: "updateEventMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // cancelEvent(uint256 eventId)
  {
    inputs: [{ internalType: "uint256", name: "eventId", type: "uint256" }],
    name: "cancelEvent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // createTicket(uint256 eventId, TicketType ticketType, string ticketURI)
  {
    inputs: [
      { internalType: "uint256", name: "eventId", type: "uint256" },
      { internalType: "uint8", name: "ticketType", type: "uint8" },
      { internalType: "string", name: "ticketURI", type: "string" },
    ],
    name: "createTicket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // createTicketFor(uint256 eventId, address to, TicketType ticketType, string ticketURI)
  {
    inputs: [
      { internalType: "uint256", name: "eventId", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint8", name: "ticketType", type: "uint8" },
      { internalType: "string", name: "ticketURI", type: "string" },
    ],
    name: "createTicketFor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // updateTicketType(uint256 eventId, address user, TicketType newType)
  {
    inputs: [
      { internalType: "uint256", name: "eventId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint8", name: "newType", type: "uint8" },
    ],
    name: "updateTicketType",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // resellTicket(uint256 eventId, address to)
  {
    inputs: [
      { internalType: "uint256", name: "eventId", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
    ],
    name: "resellTicket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // scanTicket(uint256 ticketId)
  {
    inputs: [{ internalType: "uint256", name: "ticketId", type: "uint256" }],
    name: "scanTicket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // removeTicket(uint256 eventId, address user)
  {
    inputs: [
      { internalType: "uint256", name: "eventId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "removeTicket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ===== EVENTS =====

  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "eventId", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: true, internalType: "address", name: "organizer", type: "address" },
      { indexed: false, internalType: "uint256", name: "endDate", type: "uint256" },
      { indexed: false, internalType: "string", name: "metadataUri", type: "string" },
    ],
    name: "EventCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "eventId", type: "uint256" },
      { indexed: false, internalType: "string", name: "metadataURI", type: "string" },
    ],
    name: "EventMetadataUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "eventId", type: "uint256" },
      { indexed: true, internalType: "address", name: "organizer", type: "address" },
    ],
    name: "EventCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "ticketId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "eventId", type: "uint256" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "uint8", name: "ticketType", type: "uint8" },
    ],
    name: "TicketCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "ticketId", type: "uint256" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
    ],
    name: "TicketUsed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "ticketId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint8", name: "oldTypen", type: "uint8" },
      { indexed: false, internalType: "uint8", name: "newType", type: "uint8" },
    ],
    name: "TicketTypeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "ticketId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "eventId", type: "uint256" },
      { indexed: false, internalType: "address", name: "from", type: "address" },
      { indexed: false, internalType: "address", name: "to", type: "address" },
    ],
    name: "TicketResold",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "ticketId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "eventId", type: "uint256" },
      { indexed: false, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "uint8", name: "ticketType", type: "uint8" },
    ],
    name: "TicketRemoved",
    type: "event",
  },
] as const;

// Ticket types enum matching contract
export const TicketType = {
  STANDARD: 0,
  VIP: 1,
  STAFF: 2,
  ORGANIZER: 3,
} as const;

export type TicketTypeValue = (typeof TicketType)[keyof typeof TicketType];

export const TICKET_TYPE_LABELS: Record<number, string> = {
  [TicketType.STANDARD]: "Standard",
  [TicketType.VIP]: "VIP",
  [TicketType.STAFF]: "Staff",
  [TicketType.ORGANIZER]: "Organisateur",
};

export const TICKET_TYPE_COLORS: Record<number, string> = {
  [TicketType.STANDARD]: "text-zinc-300",
  [TicketType.VIP]: "text-amber-400",
  [TicketType.STAFF]: "text-sky-400",
  [TicketType.ORGANIZER]: "text-violet-400",
};

export const TICKET_TYPE_BG: Record<number, string> = {
  [TicketType.STANDARD]: "bg-zinc-500/10 border-zinc-500/15",
  [TicketType.VIP]: "bg-amber-500/10 border-amber-500/15",
  [TicketType.STAFF]: "bg-sky-500/10 border-sky-500/15",
  [TicketType.ORGANIZER]: "bg-violet-500/10 border-violet-500/15",
};

// Configuration wagmi
export const config = createConfig(
  getDefaultConfig({
    chains: [hardhat, sepolia],
    transports: {
      [hardhat.id]: http("http://127.0.0.1:8545"),
      [sepolia.id]: http(),
    },
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    appName: "Ticketing DApp",
    appDescription: "Systeme de ticketing decentralise",
  })
);
