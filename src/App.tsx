import React from 'react';
import { useAccount, useDisconnect, useSwitchChain, useWalletClient, useChainId } from 'wagmi';
import { useEffect, useState } from 'react';
import { monadTestnet } from './config';

function App() {
    const { address, isConnected, isConnecting } = useAccount();
    const { disconnect } = useDisconnect();
    const { switchChainAsync } = useSwitchChain();
    const { data: walletClient } = useWalletClient();
    const chainId = useChainId(); // Hook para checar a rede atual
    const [networkError, setNetworkError] = useState<string | null>(null);
    const [isChainAdded, setIsChainAdded] = useState(true); // Estado para rastrear se a rede está adicionada

    // Checa a rede após conexão
    useEffect(() => {
        if (isConnected && chainId !== monadTestnet.id) {
            setNetworkError('Rede errada. Por favor, troque para Monad Testnet.');
            setIsChainAdded(false); // Assume que não está adicionada se chainId errado
        } else if (isConnected) {
            setNetworkError(null);
            setIsChainAdded(true);
        }
    }, [isConnected, chainId]);

    const addNetwork = async () => {
        if (walletClient) {
            try {
                await walletClient.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${monadTestnet.id.toString(16)}`,
                        chainName: monadTestnet.name,
                        nativeCurrency: monadTestnet.nativeCurrency,
                        rpcUrls: [monadTestnet.rpcUrls.default.http[0]],
                        blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
                    }],
                });
                setNetworkError(null);
                setIsChainAdded(true);
                // Tenta trocar após adicionar
                if (switchChainAsync) {
                    switchChainAsync({ chainId: monadTestnet.id }).catch((err: unknown) => {
                        if (err instanceof Error) {
                            setNetworkError(err.message);
                        } else {
                            setNetworkError('Erro desconhecido ao trocar de rede');
                        }
                    });
                }
            } catch (err: unknown) {
                if (err instanceof Error) {
                    console.error('Erro ao adicionar rede:', err);
                    setNetworkError(err.message || 'Falha ao adicionar rede');
                } else {
                    setNetworkError('Erro desconhecido ao adicionar rede');
                }
            }
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
            <h1>Sovermist - Login Web3</h1>

            {isConnecting && <p>Conectando...</p>}
            {!isConnected && !isConnecting && (
                <div>
                    <p>Conecte uma carteira à Monad Testnet:</p>
                    <appkit-button />
                    {networkError && <p style={{ color: 'red' }}>Erro: {networkError}</p>}
                </div>
            )}
            {isConnected && (
                <div>
                    <p>Conectado como: {address}</p>
                    <button onClick={() => disconnect()} style={{ padding: '10px' }}>Desconectar</button>
                    {networkError && (
                        <div>
                            <p style={{ color: 'red' }}>Erro na rede: {networkError}</p>
                            {!isChainAdded && (
                                <button onClick={addNetwork} style={{ padding: '10px', marginTop: '10px' }}>
                                    Adicionar Monad Testnet no MetaMask
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {isConnected && !networkError && (
                <iframe
                    frameBorder="0"
                    src="https://itch.io/embed-upload/14358869?color=333333"
                    allowFullScreen
                    width="1280"
                    height="740"
                    style={{ border: '1px solid #000', backgroundColor: '#fff' }}
                    onError={(e) => console.error('Erro no iframe:', e)}
                >
                    <a href="https://deuseftp.itch.io/sovermist">Play Sovermist on itch.io</a>
                </iframe>
            )}
        </div>
    );
}

export default App;