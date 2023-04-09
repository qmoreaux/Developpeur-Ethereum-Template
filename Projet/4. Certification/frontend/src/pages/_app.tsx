import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig, useAccount } from 'wagmi';
import { localhost, polygonMumbai, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import { AlertContextProvider } from '@/context/alert';
import { ContractContextProvider } from '@/context/contract';

const { chains, provider } = configureChains([localhost, sepolia, polygonMumbai], [publicProvider()]);

const { connectors } = getDefaultWallets({
    appName: 'SmartStay',
    chains
});

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider
});

export default function App({ Component, pageProps }: any) {
    const router = useRouter();
    const { isConnected } = useAccount();

    useEffect(() => {
        if (!isConnected) {
            router.push('/');
        }
    }, [isConnected, router]);

    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>
                <AlertContextProvider>
                    <ContractContextProvider>
                        <Component {...pageProps} />
                    </ContractContextProvider>
                </AlertContextProvider>
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
