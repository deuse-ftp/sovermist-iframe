import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Definição da rede Monad Testnet
export const monadTestnet = {
    id: 10143,
    name: 'Monad Testnet',
    nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://monad-testnet.g.alchemy.com/v2/dkEUofCC_DkGE0hb1qfcLosQeneQWmLc'] },
        public: { http: ['https://testnet-rpc.monad.xyz'] },
    },
    blockExplorers: {
        default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
    },
    testnet: true,
};

// Crie o adaptador Wagmi sem Coinbase
const wagmiAdapter = new WagmiAdapter({
    networks: [monadTestnet],
    projectId: '81bbd6d3324b1f34b5e1d6002aececc0',
});

// Crie o AppKit com analytics desativado
createAppKit({
    adapters: [wagmiAdapter],
    networks: [monadTestnet],
    projectId: '81bbd6d3324b1f34b5e1d6002aececc0',
    metadata: {
        name: 'Sovermist',
        description: 'Jogo Web3 com Monad Testnet',
        url: 'https://deuseftp.itch.io/sovermist',
        icons: ['https://avatars.githubusercontent.com/u/179229932'],
    },
    features: {
        analytics: false, // Desativa métricas para evitar chamadas 401 da Coinbase
    },
    themeMode: 'dark',
});

// Exporte o wagmiConfig
export const wagmiConfig = wagmiAdapter.wagmiConfig;