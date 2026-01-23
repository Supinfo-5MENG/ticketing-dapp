import { http, createConfig } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

// Adresse de ton contract déployé (à modifier après déploiement)
export const TICKETING_CONTRACT_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

// ABI de ton contract Ticketing
export const TICKETING_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "string", name: "name", type: "string" }],
    name: "createEvent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "eventId", type: "uint256" }],
    name: "createTicket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "ticketId", type: "uint256" }],
    name: "useTicket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "eventCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "events",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "hasTicketForEvent",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ticketCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "tickets",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "bool", name: "used", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

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
    appDescription: "Système de ticketing décentralisé",
  })
);
