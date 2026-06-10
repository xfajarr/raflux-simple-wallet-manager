"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { shortenAddress, formatBalance } from "./_libs/utils";
import { SendTransaction } from "./_components/SendTransaction";
import { DeploySmartAccount } from "./_components/DeploySmartAccount";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-12">
        <WalletSection />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-base-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-2xl flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-black">R</span>
          </div>
          <h1 className="text-sm font-semibold uppercase tracking-wider">
            Raflux Wallet
          </h1>
        </div>
        <appkit-button />
      </div>
    </header>
  );
}

function WalletSection() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  const { data: ethBalance } = useBalance({
    address: address,
  });

  if (!isConnected) {
    return <DisconnectedState />;
  }

  return (
    <div className="space-y-6">
      {/* Wallet Card */}
      <div className="border border-base-border bg-background-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-2 uppercase tracking-wider mb-1">Connected Wallet</p>
            <p className="text-sm font-medium">{shortenAddress(address || "", 6)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-light rounded-full animate-pulse" />
            <span className="text-xs text-muted-2">{chain?.name || "Unknown"}</span>
          </div>
        </div>

        {/* Balance Display */}
        <div className="border border-base-border bg-background-2 p-6 mb-6">
          <p className="text-xs text-muted-2 uppercase tracking-wider mb-2">Balance</p>
          <p className="text-3xl font-bold text-primary">
            {ethBalance ? formatBalance(ethBalance.formatted, 6) : "0.00"}{" "}
            <span className="text-lg text-muted-2">{ethBalance?.symbol || "ETH"}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <ActionButton
            label="Send"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            }
            onClick={() => open({ view: "WalletSend" })}
          />
          <ActionButton
            label="Account"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            }
            onClick={() => open({ view: "Account" })}
          />
          <ActionButton
            label="Swap"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            }
            onClick={() => open({ view: "Swap" })}
          />
        </div>
      </div>

      {/* Deploy Smart Account if needed */}
      <DeploySmartAccount />

      {/* Send Transaction via Smart Account (EIP-5792) */}
      <SendTransaction />

      {/* Quick Actions */}
      <div className="border border-base-border bg-background-4 p-6">
        <h2 className="text-xs text-muted-2 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <QuickAction
            label="Buy Crypto"
            description="Purchase crypto with card or bank transfer"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            }
            onClick={() => open({ view: "OnRampProviders" })}
          />
          <QuickAction
            label="All Wallets"
            description="Browse and connect with 300+ wallets"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            }
            onClick={() => open({ view: "AllWallets" })}
          />
          <button
            onClick={() => disconnect()}
            className="w-full flex items-center gap-4 p-4 border border-red-light/20 bg-red-light/5 hover:bg-red-light/10 transition-colors text-left"
          >
            <div className="text-red-light">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-light">Disconnect</p>
              <p className="text-xs text-muted-3">Disconnect your wallet</p>
            </div>
          </button>
        </div>
      </div>

      {/* Network Info */}
      <div className="border border-base-border bg-background-4 p-6">
        <h2 className="text-xs text-muted-2 uppercase tracking-wider mb-4">Network</h2>
        <div className="flex items-center gap-3 p-3 border border-base-border bg-background-2">
          <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-400">B</span>
          </div>
          <div>
            <p className="text-sm font-medium">{chain?.name || "Unknown"}</p>
            <p className="text-xs text-muted-3">Chain ID: {chain?.id || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DisconnectedState() {
  const { open } = useAppKit();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 bg-background-4 border border-base-border flex items-center justify-center mb-8">
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
      </div>
      <h2 className="text-xl font-bold uppercase tracking-wider mb-3">
        Connect Your Wallet
      </h2>
      <p className="text-sm text-muted-2 mb-8 max-w-sm">
        Connect with Google to get a smart account, or use any wallet.
        Smart accounts support gas-abstracted transactions via EIP-5792.
      </p>
      <button
        onClick={() => open()}
        className="bg-primary text-black px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-primary/80 transition-colors"
      >
        Connect Wallet
      </button>
      <p className="text-xs text-muted-3 mt-6">
        Google login creates a smart account with EIP-5792 support
      </p>
    </div>
  );
}

function ActionButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 border border-base-border bg-background-2 hover:bg-background-3/30 transition-colors"
    >
      <div className="text-primary">{icon}</div>
      <span className="text-xs font-medium uppercase">{label}</span>
    </button>
  );
}

function QuickAction({
  label,
  description,
  icon,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 border border-base-border bg-background-2 hover:bg-background-3/30 transition-colors text-left"
    >
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-3">{description}</p>
      </div>
    </button>
  );
}
