import Head from 'next/head';
import Link from 'next/link';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import WalletButton from '../components/WalletButton';
import LendingForm from '../components/LendingForm';
import { RPC_URL } from '../utils/constants';

export default function LendingPage() {
  return (
    <>
      <Head>
        <title>Lending - Solana DeFi</title>
        <meta name="description" content="Lend and borrow on Solana DeFi" />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <Link href="/" style={{ color: 'inherit' }}>Solana DeFi</Link>
          </div>
          <nav className="nav">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/swap" className="nav-link">Swap</Link>
            <Link href="/lending" className="nav-link" style={{ color: 'var(--primary)' }}>Lending</Link>
          </nav>
          <WalletButton />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>Lending Protocol</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Supply USDC to earn interest or borrow against your collateral
            </p>
          </div>

          <ConnectionProvider endpoint={RPC_URL}>
            <LendingForm connection={new Connection(RPC_URL, 'confirmed')} />
          </ConnectionProvider>

          {/* Market Overview */}
          <div className="card" style={{ maxWidth: '600px', margin: '32px auto 0' }}>
            <h3 style={{ marginBottom: '16px' }}>Market Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--surface-light)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Total Deposits</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)' }}>$890K</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--surface-light)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Total Borrows</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--warning)' }}>$234K</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--surface-light)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Supply APY</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)' }}>5.2%</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--surface-light)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Borrow APY</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--warning)' }}>8.7%</div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="card" style={{ maxWidth: '600px', margin: '32px auto' }}>
            <h3 style={{ marginBottom: '16px' }}>How It Works</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <strong>Deposit Collateral</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Supply USDC to the lending pool and start earning interest immediately.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <strong>Borrow Against Collateral</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Use your deposited assets as collateral to borrow USDC up to 75% of value.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <strong>Repay Anytime</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Repay your loans at any time to reduce your debt and increase your borrowing power.
                  </p>
                </div>
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
