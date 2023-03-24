import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig, goerli } from 'wagmi';
import { watchNetwork } from '@wagmi/core';
import { hardhat, polygonMumbai, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider } = configureChains([hardhat, goerli, sepolia, polygonMumbai], [publicProvider()]);

const { connectors } = getDefaultWallets({
    appName: 'SmartStay',
    chains
});

const wagmiClient = createClient({
    autoConnect: false,
    connectors,
    provider
});

watchNetwork((network) => console.log(network));

export default function App({ Component, pageProps }: any) {
    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>
                <Component {...pageProps} />
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
