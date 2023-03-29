import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig, goerli } from 'wagmi';
import { localhost, polygonMumbai, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import { AlertContextProvider } from '@/context/alert';

const { chains, provider } = configureChains([localhost, goerli, sepolia, polygonMumbai], [publicProvider()]);

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
    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>
                <AlertContextProvider>
                    <Component {...pageProps} />
                </AlertContextProvider>
            </RainbowKitProvider>
        </WagmiConfig>
    );
}
