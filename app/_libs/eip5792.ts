import { type Hex, type WalletCapabilities, toHex } from "viem";

export const EIP_5792_RPC_METHODS = {
  WALLET_GET_CAPABILITIES: "wallet_getCapabilities",
  WALLET_GET_CALLS_STATUS: "wallet_getCallsStatus",
  WALLET_SEND_CALLS: "wallet_sendCalls",
} as const;

export const WALLET_CAPABILITIES = {
  ATOMIC_BATCH: "atomic",
  PAYMASTER_SERVICE: "paymasterService",
} as const;

/**
 * Check if a specific capability is supported for a given chain
 */
export function isCapabilitySupported(
  capabilities: Record<string, WalletCapabilities> | undefined,
  capability: string,
  chainId: Hex
): boolean {
  if (!capabilities) return false;
  const chainCapabilities = capabilities[chainId];
  if (!chainCapabilities) return false;

  switch (capability) {
    case WALLET_CAPABILITIES.ATOMIC_BATCH:
      return (
        (chainCapabilities as any)?.atomic?.status === "supported" ||
        (chainCapabilities as any)?.atomic?.status === "ready" ||
        // Backward compatibility
        (chainCapabilities as any)?.atomicBatch?.supported === true
      );
    case WALLET_CAPABILITIES.PAYMASTER_SERVICE:
      return (chainCapabilities as any)?.paymasterService?.supported === true;
    default:
      return false;
  }
}

/**
 * Get capabilities from a provider via wallet_getCapabilities
 */
export async function getWalletCapabilities(
  address: string,
  chainIds: number[]
): Promise<Record<number, WalletCapabilities>> {
  if (typeof window === "undefined" || !window.ethereum) return {};

  const chainIdsInHex = chainIds.map((cId) => toHex(cId));

  try {
    const capabilities = await (window.ethereum as any).request({
      method: "wallet_getCapabilities",
      params: [address, chainIdsInHex],
    });

    if (!capabilities) return {};

    // Convert hex keys to number keys
    const result: Record<number, WalletCapabilities> = {};
    for (const [key, value] of Object.entries(capabilities)) {
      result[parseInt(key, 16)] = value as WalletCapabilities;
    }
    return result;
  } catch {
    return {};
  }
}
