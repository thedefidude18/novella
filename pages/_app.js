import { initDb } from '../lib/db';
import '@/styles/globals.css';
import { Orbis, OrbisProvider } from '@orbisclub/components';
import '@orbisclub/components/dist/index.modern.css';
import '@rainbow-me/rainbowkit/styles.css';
import React, { useEffect } from 'react';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { createConfig, WagmiProvider, http } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  bsc,
  celo,
  scroll,
  linea,
  zkSync,
  mode,
  mantle,
  gnosis,
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { ThemeProvider } from '../contexts/ThemeContext';

// Initialize TimeAgo
if (!TimeAgo.getDefaultLocale()) {
  TimeAgo.addDefaultLocale(en);
}

export const ORBIS_CONTEXT =
  'kjzl6cwe1jw14b9pin02aak0ot08wvnrhzf8buujkop28swyxnvtsjdye742jo6';

const projectId = '37b5e2fccd46c838885f41186745251e';

const config = getDefaultConfig({
  appName: 'YouBuidl',
  projectId,
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    bsc,
    celo,
    scroll,
    linea,
    zkSync,
    mode,
    mantle,
    gnosis,
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [celo.id]: http(),
    [scroll.id]: http(),
    [linea.id]: http(),
    [zkSync.id]: http(),
    [mode.id]: http(),
    [mantle.id]: http(),
    [gnosis.id]: http(),
  },
});

let orbis = new Orbis({
  useLit: false,
  node: 'https://node2.orbis.club',
  PINATA_GATEWAY: 'https://orbis.mypinata.cloud/ipfs/',
  PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  PINATA_SECRET_API_KEY: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
  defaultChain: mainnet.id,
});

// Customize QueryClient for better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
      cacheTime: 1000 * 60 * 10, // Keep unused data in cache for 10 minutes
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Disable refetching on window focus
    },
  },
});

export default function App({ Component, pageProps }) {
  // Initialize IndexedDB when the app starts
  useEffect(() => {
    const setupDb = async () => {
      try {
        await initDb();
        console.log('IndexedDB initialized successfully');
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
      }
    };

    setupDb();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider>
            <OrbisProvider
              defaultOrbis={orbis}
              authMethods={['metamask', 'wallet-connect', 'email']}
              context={ORBIS_CONTEXT}
              defaultChain={mainnet.id}
            >
              <Component {...pageProps} />
              <ReactQueryDevtools initialIsOpen={false} />
            </OrbisProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}