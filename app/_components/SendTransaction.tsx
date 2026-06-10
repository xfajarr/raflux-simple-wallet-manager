"use client";

import { useState, useCallback, useEffect } from "react";
import { parseEther, isAddress } from "viem";
import { useAccount } from "wagmi";
import { useSendCalls, useCallsStatus } from "wagmi/experimental";
import { useAtomicBatchCapability } from "@/app/_hooks/useCapabilities";
import { cn } from "@/app/_libs/utils";

interface SendTransactionProps {
  className?: string;
}

type TxStatus = "idle" | "pending" | "success" | "error";

export function SendTransaction({ className }: SendTransactionProps) {
  const { address, chain } = useAccount();
  const { isAtomicBatchSupported, isEmbeddedWallet } = useAtomicBatchCapability();

  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [batchId, setBatchId] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // EIP-5792 sendCalls for smart accounts
  const {
    sendCalls,
    isPending: isSendCallsPending,
    data: sendCallsData,
  } = useSendCalls({
    mutation: {
      onSuccess: (data) => {
        setBatchId(data.id);
        setTxStatus("success");
        setError("");
      },
      onError: (err) => {
        setError(err.message || "Transaction failed");
        setTxStatus("error");
      },
    },
  });

  // Track batch status for sendCalls
  const { data: callsStatus } = useCallsStatus({
    id: batchId || "",
    query: {
      enabled: !!batchId,
      refetchInterval: 2000,
    },
  });

  // Extract tx hash from calls status
  useEffect(() => {
    if (callsStatus?.receipts && callsStatus.receipts.length > 0) {
      const hash = callsStatus.receipts[0].transactionHash;
      if (hash) setTxHash(hash);
    }
  }, [callsStatus]);

  const handleSend = useCallback(() => {
    setError("");
    setTxStatus("idle");
    setBatchId(null);
    setTxHash(null);

    if (!toAddress || !isAddress(toAddress)) {
      setError("Invalid recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Invalid amount");
      return;
    }

    if (!address) {
      setError("Wallet not connected");
      return;
    }

    setTxStatus("pending");

    if (isAtomicBatchSupported || isEmbeddedWallet) {
      // Use EIP-5792 sendCalls for smart accounts
      sendCalls({
        calls: [
          {
            to: toAddress as `0x${string}`,
            value: parseEther(amount),
          },
        ],
      });
    } else {
      // Fallback: open Reown's built-in send for EOA
      setError("Use the Account panel to send from EOA wallets");
      setTxStatus("idle");
    }
  }, [toAddress, amount, address, isAtomicBatchSupported, isEmbeddedWallet, sendCalls]);

  const handleReset = () => {
    setToAddress("");
    setAmount("");
    setError("");
    setTxStatus("idle");
    setBatchId(null);
    setTxHash(null);
  };

  const isSmartAccount = isAtomicBatchSupported || isEmbeddedWallet;

  return (
    <div className={cn("border border-base-border bg-background-4 p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs text-muted-2 uppercase tracking-wider">Send Transaction</h2>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isSmartAccount ? "bg-green-light" : "bg-primary"
            )}
          />
          <span className="text-xs text-muted-2">
            {isSmartAccount ? "Smart Account" : "EOA"}
          </span>
        </div>
      </div>

      {txStatus === "success" && txHash ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-green-light/20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-green-light"
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
          </div>
          <p className="text-sm font-medium mb-2">Transaction Sent!</p>
          <p className="text-xs text-muted-3 break-all mb-1">
            Batch ID: {batchId}
          </p>
          <p className="text-xs text-muted-3 break-all mb-4">
            Tx Hash: {txHash}
          </p>
          <a
            href={`${chain?.blockExplorers?.default?.url || "https://basescan.org"}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline mb-4 block"
          >
            View on Explorer →
          </a>
          <button
            onClick={handleReset}
            className="bg-primary text-black px-6 py-2 text-xs font-semibold uppercase hover:bg-primary/80 transition-colors"
          >
            Send Another
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Smart Account Badge */}
          {isSmartAccount && (
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
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
              <span className="text-xs text-green-light">
                Using Smart Account — gas-abstracted via EIP-5792
              </span>
            </div>
          )}

          <div>
            <label className="text-xs text-muted-2 uppercase tracking-wider mb-2 block">
              Recipient Address
            </label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-background-2 border border-base-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted-2 uppercase tracking-wider mb-2 block">
              Amount (ETH)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.001"
              min="0"
              className="w-full bg-background-2 border border-base-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-light">{error}</p>}

          <button
            onClick={handleSend}
            disabled={isSendCallsPending || txStatus === "pending"}
            className="w-full bg-primary text-black py-3 text-sm font-semibold uppercase tracking-wider hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {txStatus === "pending" || isSendCallsPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
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
                Sending...
              </span>
            ) : isSmartAccount ? (
              "Send via Smart Account"
            ) : (
              "Send"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
