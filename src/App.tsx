import { useLogin, usePrivy, User, LinkedAccountWithMetadata } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
// Declare global pro window.privyUser (pra TS não reclamar)
declare global {
  interface Window {
    privyUser: User | undefined;
    username: string; // Novo: Expor username pro Unity iframe
  }
}
function App() {
  const { login } = useLogin({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onComplete: ({ user, loginMethod }: { user: User; isNewUser: boolean; wasAlreadyAuthenticated: boolean; loginMethod: string | null; loginAccount: LinkedAccountWithMetadata | null }) => {
      console.log('✅ User logged in:', user, 'Method:', loginMethod);
      window.dispatchEvent(new Event('walletConnected'));
      window.privyUser = user;
    },
    onError: (error: string) => {
      if (error !== 'exited_auth_flow') {
        console.error('❌ Login failed:', error);
        alert('Failed to log in. Check the Privy Dashboard or try again.');
      } else {
        console.log('ℹ️ User exited login flow, ignoring...');
      }
    },
  });
  const { authenticated, ready, logout, user } = usePrivy();
  const [username, setUsername] = useState('');
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [usernamesMap, setUsernamesMap] = useState(new Map<string, string>());
  const [leaderboard, setLeaderboard] = useState<{ username: string; score: number }[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
    document.body.style.color = '#fff';
    document.body.style.fontFamily = 'Arial, sans-serif';
  }, []);
  // Pega o endereço do embedded wallet diretamente
  useEffect(() => {
    if (authenticated && user && user.linkedAccounts.length > 0) {
      console.log('User object:', user);
      const crossAppAccount = user.linkedAccounts.find(
        (account: LinkedAccountWithMetadata) => account.type === 'cross_app' && account.providerApp.id === 'cmd8euall0037le0my79qpz42'
      ) as LinkedAccountWithMetadata & { embeddedWallets: { address: string }[] };
      if (crossAppAccount && crossAppAccount.embeddedWallets.length > 0) {
        const address = crossAppAccount.embeddedWallets[0].address;
        console.log('✅ Endereço embedded encontrado:', address);
        fetchUsername(address);
      } else {
        console.error('❌ Monad Games ID account não encontrado');
      }
    }
  }, [authenticated, user]);
  // Novo: Expor username no window após fetch
  useEffect(() => {
    if (username && username !== 'Unknown') {
      window.username = username;
      console.log('✅ Username exposto no window:', window.username);
    }
  }, [username]);
  // Novo: Listener para postMessage do iframe (Unity)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "request_username") {
        console.log('Received request for username from iframe');
        event.source?.postMessage({ type: "response_username", username: window.username || 'Unknown' }, { targetOrigin: event.origin });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  const fetchUsername = async (walletAddress: string) => {
    if (!walletAddress) {
      console.warn('❌ No wallet address provided for fetchUsername');
      setUsername('Unknown');
      return 'Unknown';
    }
    if (usernamesMap.has(walletAddress)) {
      const cachedUsername = usernamesMap.get(walletAddress) || 'Unknown';
      console.log('✅ Using cached username:', cachedUsername);
      setUsername(cachedUsername);
      return cachedUsername;
    }
    setLoadingUsername(true);
    try {
      const url = 'https://monad-games-id-site.vercel.app/api/check-wallet?wallet=' + walletAddress.toLowerCase();
      console.log('ℹ️ Fetching username for:', walletAddress);
      const response = await fetch(url);
      const data = await response.json();
      console.log('ℹ️ API response:', data);
      if (response.ok && data.hasUsername && data.user?.username) {
        const newUsername = data.user.username;
        setUsernamesMap(prev => new Map(prev).set(walletAddress, newUsername));
        setUsername(newUsername);
        console.log('✅ Username fetched successfully:', newUsername);
        return newUsername;
      } else {
        console.warn('❌ Username not found for:', walletAddress);
        setUsernamesMap(prev => new Map(prev).set(walletAddress, 'Unknown'));
        setUsername('Unknown');
        return 'Unknown';
      }
    } catch (error) {
      console.error('❌ Failed to fetch username:', error);
      setUsername('Unknown');
      return 'Unknown';
    } finally {
      setLoadingUsername(false);
    }
  };
  // Poll o backend a cada 5s pra atualizar leaderboard
  useEffect(() => {
    if (authenticated) {
      fetchLeaderboard();
      const interval = setInterval(fetchLeaderboard, 5000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('https://backend-leaderboard.vercel.app/leaderboard');
      const data: { username: string; score: number }[] = await response.json();
      setLeaderboard(data.sort((a: { username: string; score: number }, b: { username: string; score: number }) => b.score - a.score));
      console.log('✅ Leaderboard atualizado do backend');
    } catch (error) {
      console.error('❌ Erro ao fetch leaderboard:', error);
    }
  };
  const pageCount = Math.ceil(leaderboard.length / itemsPerPage);
  const currentData = leaderboard.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  return (
    <div style={{ textAlign: 'center', maxWidth: '1280px', margin: '0 auto' }}>
      {!ready ? (
        <p>Carregando...</p>
      ) : !authenticated ? (
        <>
          <p>Conecte uma carteira à Monad Testnet:</p>
          <button
            onClick={login}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(to bottom, #836EF9, #5B4FC0)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '20px',
            }}
          >
            Login with Monad Games ID
          </button>
        </>
      ) : (
        <>
          <p>Connected: {loadingUsername ? 'Loading...' : (username === 'Unknown' || !username ? (
            <a href="https://monad-games-id-site.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: '#646cff', textDecoration: 'underline' }}>
              Register Username
            </a>
          ) : username)}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '10px 0' }}>
            <button
              onClick={logout}
              style={{
                padding: '10px 20px',
                background: '#1a1a1a',
                border: '1px solid #646cff',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Desconectar
            </button>
            <button
              onClick={() => setShowLeaderboard(true)}
              style={{
                padding: '10px 20px',
                background: '#1a1a1a',
                border: '1px solid #646cff',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Ver Leaderboard
            </button>
          </div>
        </>
      )}
      {authenticated && (
        <>
          <p>If the message ''Loading game for the first time'' appears, press F5 and please wait</p>
          <iframe
            frameBorder="0"
            src="https://itch.io/embed-upload/14809571?color=333333"
            allowFullScreen
            width="1280"
            height="760"
            title="Game"
            onError={(e) => console.error('Erro no iframe:', e)}
          >
            <a href="https://deuseftp.itch.io/sovermist">Play Sovermist on itch.io</a>
          </iframe>
        </>
      )}
      {showLeaderboard && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#1e1a2a',
            border: '1px solid #836EF9',
            borderRadius: '12px',
            padding: '20px',
            width: '300px',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowLeaderboard(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              X
            </button>
            <h3>Leaderboard</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {currentData.map((player, index) => (
                <li key={index}>{player.username}: {player.score} kills</li>
              ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              {currentPage > 1 && (
                <button onClick={() => setCurrentPage(prev => prev - 1)} style={{ padding: '5px 10px', cursor: 'pointer' }}>
                  &lt;
                </button>
              )}
              <span>Página {currentPage} de {pageCount}</span>
              {currentPage < pageCount && (
                <button onClick={() => setCurrentPage(prev => prev + 1)} style={{ padding: '5px 10px', cursor: 'pointer' }}>
                  &gt;
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;