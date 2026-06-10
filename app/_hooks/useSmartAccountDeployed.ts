"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";

/**
 * Checks if the connected smart account has bytecode on-chain.
 * If no bytecode exists, the account is not deployed yet.
 */
export function useSmartAccountDeployed() {
  const { address, isConnected } = useAccount();
  const [isDeployed, setIsDeployed] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkDeployment = useCallback(async () => {
    if (!address || !isConnected) {
      setIsDeployed(null);
      return;
    }

    setIsChecking(true);
    try {
      // Use the public RPC to check bytecode
      const rpcUrl = "https://mainnet.base.org";
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getCode",
          params: [address, "latest"],
        }),
      });
      const data = await response.json();
      // If result is "0x" or null, no contract deployed
      const hasCode = data.result && data.result !== "0x" && data.result !== "0x0";
      setIsDeployed(hasCode);
    } catch {
      // Assume deployed on error (safer default)
      setIsDeployed(true);
    }
    setIsChecking(false);
  }, [address, isConnected]);

  useEffect(() => {
    checkDeployment();
  }, [checkDeployment]);

  return {
    isDeployed,
    isChecking,
    refetch: checkDeployment,
  };
}
