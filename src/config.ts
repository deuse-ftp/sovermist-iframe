import { createPublicClient, http } from 'viem';

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

// Cliente público para viem (usado para reads e watches)
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(monadTestnet.rpcUrls.default.http[0]),
});

// Endereço do contrato (placeholder - substitua pelo real)
export const contractAddress = '0xYourContractAddressHere';

// ABI do contrato (placeholder - substitua pelo ABI real do seu contrato)
export const contractABI = [
  // Exemplo de ABI - adicione o real aqui
  {
    "type": "function",
    "name": "getLeaderboard",
    "inputs": [],
    "outputs": [{"name": "", "type": "tuple[]", "components": [{"name": "player", "type": "address"}, {"name": "score", "type": "uint256"}, {"name": "username", "type": "string"}]}],
  },
  {
    "type": "function",
    "name": "getPlayerRank",
    "inputs": [{"name": "player", "type": "address"}],
    "outputs": [{"name": "rank", "type": "uint256"}, {"name": "score", "type": "uint256"}],
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{"name": "", "type": "address"}],
  },
  // Eventos
  {
    "type": "event",
    "name": "LeaderboardUpdated",
    "inputs": [{"name": "player", "type": "address", "indexed": true}, {"name": "score", "type": "uint256", "indexed": false}],
  },
  {
    "type": "event",
    "name": "LeaderboardReset",
    "inputs": [],
  },
  // Adicione mais funções/eventos conforme necessário
];

// Endereço dev (placeholder - substitua pelo real)
export const DEV_ADDRESS = '0xYourDevAddressHere';

// URL do backend (placeholder - substitua pelo real)
export const BACKEND_URL = 'https://backend-leaderboard.vercel.app';