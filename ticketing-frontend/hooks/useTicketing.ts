import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { TICKETING_CONTRACT_ADDRESS, TICKETING_ABI, TicketTypeValue } from "@/config/web3";

// ===== READ HOOKS =====

export function useEventCount() {
  return useReadContract({
    address: TICKETING_CONTRACT_ADDRESS,
    abi: TICKETING_ABI,
    functionName: "eventCount",
  });
}

export function useEvent(eventId: bigint) {
  return useReadContract({
    address: TICKETING_CONTRACT_ADDRESS,
    abi: TICKETING_ABI,
    functionName: "events",
    args: [eventId],
  });
}

export function useTicketCount() {
  return useReadContract({
    address: TICKETING_CONTRACT_ADDRESS,
    abi: TICKETING_ABI,
    functionName: "ticketCount",
  });
}

export function useTicket(ticketId: bigint) {
  return useReadContract({
    address: TICKETING_CONTRACT_ADDRESS,
    abi: TICKETING_ABI,
    functionName: "tickets",
    args: [ticketId],
  });
}

export function useTicketIdByEventAndOwner(eventId: bigint) {
  const { address } = useAccount();

  return useReadContract({
    address: TICKETING_CONTRACT_ADDRESS,
    abi: TICKETING_ABI,
    functionName: "ticketIdByEventAndOwner",
    args: address ? [eventId, address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useOwnerOf(ticketId: bigint) {
  return useReadContract({
    address: TICKETING_CONTRACT_ADDRESS,
    abi: TICKETING_ABI,
    functionName: "ownerOf",
    args: [ticketId],
  });
}

export function useTokenURI(ticketId: bigint) {
  return useReadContract({
    address: TICKETING_CONTRACT_ADDRESS,
    abi: TICKETING_ABI,
    functionName: "tokenURI",
    args: [ticketId],
  });
}

// ===== WRITE HOOKS =====

export function useCreateEvent() {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract();

  const createEvent = (name: string, endDate: bigint, metadataURI: string) => {
    writeContract({
      address: TICKETING_CONTRACT_ADDRESS,
      abi: TICKETING_ABI,
      functionName: "createEvent",
      args: [name, endDate, metadataURI],
    });
  };

  return { createEvent, isPending, isSuccess, isError, error };
}

export function useUpdateEventMetadata() {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract();

  const updateEventMetadata = (eventId: bigint, newMetadataURI: string) => {
    writeContract({
      address: TICKETING_CONTRACT_ADDRESS,
      abi: TICKETING_ABI,
      functionName: "updateEventMetadata",
      args: [eventId, newMetadataURI],
    });
  };

  return { updateEventMetadata, isPending, isSuccess, isError, error };
}

export function useCancelEvent() {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract();

  const cancelEvent = (eventId: bigint) => {
    writeContract({
      address: TICKETING_CONTRACT_ADDRESS,
      abi: TICKETING_ABI,
      functionName: "cancelEvent",
      args: [eventId],
    });
  };

  return { cancelEvent, isPending, isSuccess, isError, error };
}

export function useCreateTicket() {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract();

  const createTicket = (eventId: bigint, ticketType: TicketTypeValue, ticketURI: string) => {
    writeContract({
      address: TICKETING_CONTRACT_ADDRESS,
      abi: TICKETING_ABI,
      functionName: "createTicket",
      args: [eventId, ticketType, ticketURI],
    });
  };

  return { createTicket, isPending, isSuccess, isError, error };
}

export function useCreateTicketFor() {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract();

  const createTicketFor = (
    eventId: bigint,
    to: `0x${string}`,
    ticketType: TicketTypeValue,
    ticketURI: string
  ) => {
    writeContract({
      address: TICKETING_CONTRACT_ADDRESS,
      abi: TICKETING_ABI,
      functionName: "createTicketFor",
      args: [eventId, to, ticketType, ticketURI],
    });
  };

  return { createTicketFor, isPending, isSuccess, isError, error };
}

export function useUpdateTicketType() {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract();

  const updateTicketType = (
    eventId: bigint,
    user: `0x${string}`,
    newType: TicketTypeValue
  ) => {
    writeContract({
      address: TICKETING_CONTRACT_ADDRESS,
      abi: TICKETING_ABI,
      functionName: "updateTicketType",
      args: [eventId, user, newType],
    });
  };

  return { updateTicketType, isPending, isSuccess, isError, error };
}

export function useResellTicket() {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract();

  const resellTicket = (eventId: bigint, to: `0x${string}`) => {
    writeContract({
      address: TICKETING_CONTRACT_ADDRESS,
      abi: TICKETING_ABI,
      functionName: "resellTicket",
      args: [eventId, to],
    });
  };

  return { resellTicket, isPending, isSuccess, isError, error };
}

export function useScanTicket() {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract();

  const scanTicket = (ticketId: bigint) => {
    writeContract({
      address: TICKETING_CONTRACT_ADDRESS,
      abi: TICKETING_ABI,
      functionName: "scanTicket",
      args: [ticketId],
    });
  };

  return { scanTicket, isPending, isSuccess, isError, error };
}

export function useRemoveTicket() {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract();

  const removeTicket = (eventId: bigint, user: `0x${string}`) => {
    writeContract({
      address: TICKETING_CONTRACT_ADDRESS,
      abi: TICKETING_ABI,
      functionName: "removeTicket",
      args: [eventId, user],
    });
  };

  return { removeTicket, isPending, isSuccess, isError, error };
}
