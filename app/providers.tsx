"use client";

import React, { type ReactNode, useState } from "react";
import { WagmiProvider, type Config } from "wagmi";
import { wagmiAdapter, networks } from "@/app/_libs/_reown/config";
import { AppKitProvider } from "@reown/appkit/react";
import { base as baseMainnet } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import appConfig, { getAppOrigin } from "./_configs/app-config";

const appOrigin = getAppOrigin();
const metadata = {
  name: "Raflux Wallet",
  description: "Simple wallet manager powered by Raflux",
  url: appOrigin,
  icons: [`${appOrigin}/favicon.svg`],
};

function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
        <AppKitProvider
          adapters={[wagmiAdapter]}
          projectId={appConfig.REOWN_PROJECT_ID}
          networks={networks}
          defaultNetwork={baseMainnet}
          metadata={metadata}
          features={{
            analytics: true,
            email: true,
            socials: ["google"],
            allWallets: true,
            emailShowWallets: true,
            smartSessions: true
          }}
          allWallets="SHOW"
          themeMode="dark"
          themeVariables={{
            "--w3m-font-family": "Kode Mono, sans-serif",
            "--w3m-accent": "#ff7300",
            "--w3m-color-mix": "#171616",
            "--w3m-color-mix-strength": 40,
            "--w3m-qr-color": "#ff7300",
            "--w3m-border-radius-master": "0px",
            "--w3m-font-size-master": "8px",
          }}
        >
          {children}
        </AppKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default Providers;
