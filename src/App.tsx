import { useAccount, useDisconnect, useSwitchChain, useWalletClient, useChainId } from 'wagmi';
import { useEffect, useState } from 'react';
import { monadTestnet } from './config';

function App() {
    const { address, isConnected, isConnecting } = useAccount();
    const { disconnect } = useDisconnect();
    const { switchChainAsync } = useSwitchChain();
    const { data: walletClient } = useWalletClient();
    const chainId = useChainId(); // Mantido com uso explícito
    const [networkError, setNetworkError] = useState<string | null>(null);
    const [isChainAdded, setIsChainAdded] = useState(true);

    // Força fundo preto na tela toda
    useEffect(() => {
        document.body.style.backgroundColor = '#000 !important';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.width = '100%';
        document.body.style.height = '100vh';
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        console.log('Chain ID atual:', chainId); // Usa chainId para resolver TS6133
    }, [chainId]);

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
        <div style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#000',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minWidth: '1280px',
            overflow: 'hidden'
        }}>
            {isConnecting && <p style={{ color: '#fff' }}>Conectando...</p>}
            {!isConnected && !isConnecting && (
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#fff' }}>Conecte uma carteira à Monad Testnet:</p>
                    <appkit-button />
                    {networkError && <p style={{ color: 'red' }}>Erro: {networkError}</p>}
                </div>
            )}
            {isConnected && (
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#fff' }}>Conectado como: {address}</p>
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
                    src="https://itch.io/embed-upload/14479070?color=333333"
                    allowFullScreen
                    width="1280"
                    height="740"
                    style={{ border: '1px solid #000', backgroundColor: '#000' }}
                    onError={(e) => console.error('Erro no iframe:', e)}
                >
                    <a href="https://deuseftp.itch.io/sovermist">Play Sovermist on itch.io</a>
                </iframe>
            )}
        </div>
    );
}

export default App;