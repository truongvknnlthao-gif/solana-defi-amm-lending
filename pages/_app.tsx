import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import '../styles/globals.css';
import { RPC_URL } from '../utils/constants';

export default function App({ Component, pageProps }: AppProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Set up Wallet Adapter
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <header className="header">
            <div className="container header-content" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <Link href="/" className="logo">
                ⚡ Solana DeFi
              </Link>
              <nav className="nav">
                <Link href="/">Home</Link>
                <Link href="/swap">Swap</Link>
                <Link href="/lending">Lending</Link>
              </nav>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <WalletMultiButton className="btn btn-primary" />
              </div>
            </div>
          </header>
          <main>
            <Component {...pageProps} />
          </main>
          <footer className="footer">
            <p>Solana DeFi Protocol - Built with Anchor Framework</p>
            <p style={{ marginTop: '0.5rem' }}>
              <a href="https://github.com/truongvknnlthao-gif/solana-defi-amm-lending" target="_blank" rel="noopener noreferrer">
                GitHub: solana-defi-amm-lending
              </a>
            </p>
          </footer>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
