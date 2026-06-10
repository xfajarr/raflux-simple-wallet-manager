import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { AppKitNetwork, base } from "@reown/appkit/networks";
import appConfig from "@/app/_configs/app-config";

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [base];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: false,
  projectId: appConfig.REOWN_PROJECT_ID,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
