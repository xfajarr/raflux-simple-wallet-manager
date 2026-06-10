"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, isAddress } from "viem";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const { address } = useAccount();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const { data: hash, writeContract, isPending, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSend = () => {
    setError("");

    if (!toAddress || !isAddress(toAddress)) {
      setError("Invalid recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Invalid amount");
      return;
    }

    try {
      writeContract({
        address: toAddress as `0x${string}`,
        abi: [],
        functionName: "",
        value: parseEther(amount),
      });
    } catch {
      setError("Transaction failed");
    }
  };

  const handleClose = () => {
    setToAddress("");
    setAmount("");
    setError("");
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />
      <div className="relative border border-base-border bg-background-4 w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider">Send ETH</h2>
          <button onClick={handleClose} className="text-muted-2 hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-light/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-2">Transaction Sent!</p>
            <p className="text-xs text-muted-3 break-all">{hash}</p>
            <button
              onClick={handleClose}
              className="mt-6 bg-primary text-black px-6 py-2 text-xs font-semibold uppercase hover:bg-primary/80 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-2 uppercase tracking-wider mb-2 block">Recipient Address</label>
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-background-2 border border-base-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-2 uppercase tracking-wider mb-2 block">Amount (ETH)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.001"
                className="w-full bg-background-2 border border-base-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-light">{error}</p>
            )}

            <button
              onClick={handleSend}
              disabled={isPending || isConfirming}
              className="w-full bg-primary text-black py-3 text-sm font-semibold uppercase tracking-wider hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Confirm in Wallet..." : isConfirming ? "Sending..." : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
