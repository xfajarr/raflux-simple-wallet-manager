"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { type Hex, type WalletCapabilities, toHex } from "viem";
import { useAccount } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  isCapabilitySupported,
  WALLET_CAPABILITIES,
} from "@/app/_libs/eip5792";

/**
 * Hook to check EIP-5792 capabilities for the connected wallet.
 * Uses wagmi's useCapabilities under the hood, with fallback for
 * wallets that report capabilities via provider session.
 */
export function useAtomicBatchCapability() {
  const { chain, connector } = useAccount();
  const { address } = useAppKitAccount({ namespace: "eip155" });
  const [capabilities, setCapabilities] = useState<
    Record<string, WalletCapabilities> | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);

  const fetchCapabilities = useCallback(async () => {
    if (!address || !chain?.id || !connector) return;

    setIsLoading(true);
    try {
      const provider = await connector.getProvider?.({ chainId: chain.id });
      if (!provider) {
        setIsLoading(false);
        return;
      }

      // Try to get capabilities via wallet_getCapabilities
      const chainIdHex = toHex(chain.id) as Hex;
      try {
        const caps = await (provider as any).request({
          method: "wallet_getCapabilities",
          params: [address, [chainIdHex]],
        });
        if (caps) {
          setCapabilities(caps);
        }
      } catch {
        // Provider doesn't support wallet_getCapabilities
        setCapabilities(undefined);
      }
    } catch {
      setCapabilities(undefined);
    }
    setIsLoading(false);
  }, [address, chain?.id, connector]);

  useEffect(() => {
    fetchCapabilities();
  }, [fetchCapabilities]);

  const isAtomicBatchSupported = useMemo(() => {
    if (!chain?.id || !capabilities) return false;
    const chainIdHex = toHex(chain.id) as Hex;
    return isCapabilitySupported(
      capabilities,
      WALLET_CAPABILITIES.ATOMIC_BATCH,
      chainIdHex
    );
  }, [capabilities, chain?.id]);

  // Reown embedded wallets (Google login) always support EIP-5792
  const isEmbeddedWallet = useMemo(() => {
    return connector?.id === "walletConnect" || connector?.id === "appKit";
  }, [connector?.id]);

  return {
    capabilities,
    isAtomicBatchSupported: isAtomicBatchSupported || isEmbeddedWallet,
    isEmbeddedWallet,
    isLoading,
    refetch: fetchCapabilities,
  };
}
