import Head from 'next/head';
import Link from 'next/link';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import WalletButton from '../components/WalletButton';
import SwapForm from '../components/SwapForm';
import { RPC_URL } from '../utils/constants';

export default function SwapPage() {
  return (
    <>
      <Head>
        <title>Swap - Solana DeFi</title>
        <meta name="description" content="Swap tokens on Solana DeFi" />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <Link href="/" style={{ color: 'inherit' }}>Solana DeFi</Link>
          </div>
          <nav className="nav">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/swap" className="nav-link" style={{ color: 'var(--primary)' }}>Swap</Link>
            <Link href="/lending" className="nav-link">Lending</Link>
          </nav>
          <WalletButton />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>Swap Tokens</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Exchange SOL for USDC and vice versa with low fees
            </p>
          </div>

          <ConnectionProvider endpoint={RPC_URL}>
            <SwapForm connection={new Connection(RPC_URL, 'confirmed')} />
          </ConnectionProvider>

          {/* Recent Transactions */}
          <div className="card" style={{ maxWidth: '480px', margin: '32px auto 0' }}>
            <h3 style={{ marginBottom: '16px' }}>Recent Transactions</h3>
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '24px' }}>
              <p>No recent transactions</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Your swap history will appear here
              </p>
            </div>
          </div>

          {/* Pool Info */}
          <div style={{ maxWidth: '480px', margin: '32px auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="card" style={{ textAlign: 'center', margin: 0 }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>$245K</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Pool TVL</div>
              </div>
              <div className="card" style={{ textAlign: 'center', margin: 0 }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--secondary)' }}>1,234</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>24h Swaps</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>Solana DeFi Protocol - Built with Anchor Framework</p>
        </div>
      </footer>
    </>
  );
}
