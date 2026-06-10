"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useSendCalls, useCallsStatus } from "wagmi/experimental";
import { useSmartAccountDeployed } from "@/app/_hooks/useSmartAccountDeployed";
import { useAtomicBatchCapability } from "@/app/_hooks/useCapabilities";
import { cn } from "@/app/_libs/utils";

interface DeploySmartAccountProps {
  className?: string;
  onDeployed?: () => void;
}

type DeployStatus = "idle" | "deploying" | "deployed" | "not-needed";

export function DeploySmartAccount({ className, onDeployed }: DeploySmartAccountProps) {
  const { address } = useAccount();
  const { isDeployed, isChecking, refetch } = useSmartAccountDeployed();
  const { isEmbeddedWallet } = useAtomicBatchCapability();
  const [deployStatus, setDeployStatus] = useState<DeployStatus>("idle");
  const [batchId, setBatchId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState("");

  const {
    sendCalls,
    isPending: isSendCallsPending,
  } = useSendCalls({
    mutation: {
      onSuccess: (data) => {
        setBatchId(data.id);
        setDeployStatus("deploying");
        setError("");
      },
      onError: (err) => {
        setError(err.message || "Deployment failed");
        setDeployStatus("idle");
      },
    },
  });

  // Track the deployment transaction
  const { data: callsStatus } = useCallsStatus({
    id: batchId || "",
    query: {
      enabled: !!batchId && deployStatus === "deploying",
      refetchInterval: 2000,
    },
  });

  // Check if deployment is confirmed
  useEffect(() => {
    if (callsStatus?.receipts && callsStatus.receipts.length > 0) {
      const hash = callsStatus.receipts[0].transactionHash;
      if (hash) {
        setTxHash(hash);
        setDeployStatus("deployed");
        // Re-check deployment status after a short delay
        setTimeout(() => {
          refetch();
          onDeployed?.();
        }, 2000);
      }
    }
  }, [callsStatus, refetch, onDeployed]);

  // If already deployed, don't show anything
  useEffect(() => {
    if (isDeployed === true && deployStatus === "idle") {
      setDeployStatus("not-needed");
    }
  }, [isDeployed, deployStatus]);

  const handleDeploy = useCallback(() => {
    if (!address) return;

    setError("");
    setDeployStatus("deploying");

    // Send a 0 ETH self-transfer to trigger smart account deployment
    // The bundler will see the initCode and deploy the account first
    sendCalls({
      calls: [
        {
          to: address,
          value: BigInt(0),
        },
      ],
    });
  }, [address, sendCalls]);

  // Don't show for non-embedded wallets or already deployed
  if (!isEmbeddedWallet || deployStatus === "not-needed") {
    return null;
  }

  // Don't show while still checking
  if (isChecking || isDeployed === null) {
    return null;
  }

  // Already deployed
  if (isDeployed) {
    return null;
  }

  return (
    <div className={cn("border border-primary/30 bg-background-4 p-6", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/20 flex items-center justify-center shrink-0">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Smart Account Not Deployed</h3>
          <p className="text-xs text-muted-3">
            Your smart account needs to be deployed on-chain before you can send transactions.
          </p>
        </div>
      </div>

      {deployStatus === "deployed" && txHash ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 border border-green-light/20 bg-green-light/5">
            <svg
              className="w-4 h-4 text-green-light shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            <span className="text-xs text-green-light">Smart account deployed successfully!</span>
          </div>
          <p className="text-xs text-muted-3 break-all">Tx: {txHash}</p>
        </div>
      ) : deployStatus === "deploying" ? (
        <div className="flex items-center gap-3 p-3 border border-primary/20 bg-primary/5">
          <svg
            className="w-4 h-4 text-primary animate-spin shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-xs text-primary">Deploying smart account...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {error && <p className="text-xs text-red-light">{error}</p>}
          <button
            onClick={handleDeploy}
            disabled={isSendCallsPending}
            className="w-full bg-primary text-black py-3 text-sm font-semibold uppercase tracking-wider hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendCallsPending ? "Confirming..." : "Deploy Smart Account"}
          </button>
          <p className="text-xs text-muted-3 text-center">
            This sends a gasless transaction to deploy your smart account contract on-chain.
          </p>
        </div>
      )}
    </div>
  );
}
