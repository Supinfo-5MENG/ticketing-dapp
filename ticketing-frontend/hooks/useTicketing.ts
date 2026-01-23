import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { TICKETING_CONTRACT_ADDRESS, TICKETING_ABI } from "@/config/web3";

// Hook pour lire le nombre d'events
export function useEventCount() {
  return useReadContract({
    address: TICKETING_CONTRACT_ADDRESS,
    abi: TICKETING_ABI,
    functionName: "eventCount",
  });
}

// Hook pour lire un event par ID
export function useEvent(eventId: bigint) {
  return useReadContract({
    address: TICKETING_CONTRACT_ADDRESS,
    abi: TICKETING_ABI,
    functionName: "events",
    args: [eventId],
  });
}

// Hook pour lire le nombre de tickets
export function useTicketCount() {
  return useReadContract({
    address: TICKETING_CONTRACT_ADDRESS,
    abi: TICKETING_ABI,
    functionName: "ticketCount",
  });
}

// Hook pour lire un ticket par ID
export function useTicket(ticketId: bigint) {
  return useReadContract({
    address: TICKETING_CONTRACT_ADDRESS,
    abi: TICKETING_ABI,
    functionName: "tickets",
    args: [ticketId],
  });
}

// Hook pour vérifier si l'utilisateur a un ticket pour un event
export function useHasTicketForEvent(eventId: bigint) {
  const { address } = useAccount();

  return useReadContract({
    address: TICKETING_CONTRACT_ADDRESS,
    abi: TICKETING_ABI,
    functionName: "hasTicketForEvent",
    args: address ? [eventId, address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

// Hook pour créer un event
export function useCreateEvent() {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract();

  const createEvent = (name: string) => {
    writeContract({
      address: TICKETING_CONTRACT_ADDRESS,
      abi: TICKETING_ABI,
      functionName: "createEvent",
      args: [name],
    });
  };

  return { createEvent, isPending, isSuccess, isError, error };
}

// Hook pour créer un ticket
export function useCreateTicket() {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract();

  const createTicket = (eventId: bigint) => {
    writeContract({
      address: TICKETING_CONTRACT_ADDRESS,
      abi: TICKETING_ABI,
      functionName: "createTicket",
      args: [eventId],
    });
  };

  return { createTicket, isPending, isSuccess, isError, error };
}

// Hook pour utiliser un ticket
export function useUseTicket() {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract();

  const useTicket = (ticketId: bigint) => {
    writeContract({
      address: TICKETING_CONTRACT_ADDRESS,
      abi: TICKETING_ABI,
      functionName: "useTicket",
      args: [ticketId],
    });
  };

  return { useTicket, isPending, isSuccess, isError, error };
}
