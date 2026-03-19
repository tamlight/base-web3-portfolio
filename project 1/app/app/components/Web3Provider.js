'use client';

import { WagmiProvider, createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [base, baseSepolia],
    transports: {
      // RPC URL for each chain
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },

    // Required API Keys
    walletConnectProjectId: "FREE", // Using public one for v1

    // Required App Info
    appName: "Base Predict",

    // Optional App Info
    appDescription: "Simple Binary Prediction Market on Base",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
