import Head from 'next/head';
import Link from 'next/link';
import WalletButton from '../components/WalletButton';

export default function Home() {
  return (
    <>
      <Head>
        <title>Solana DeFi AMM + Lending</title>
        <meta name="description" content="Solana DeFi Protocol - AMM + Lending" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">Solana DeFi</div>
          <nav className="nav">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/swap" className="nav-link">Swap</Link>
            <Link href="/lending" className="nav-link">Lending</Link>
          </nav>
          <WalletButton />
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">
              Next-Gen DeFi on Solana
            </h1>
            <p className="hero-subtitle">
              Swap tokens with low fees and earn interest by lending.
              Built with Anchor Framework for maximum security and performance.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link href="/swap" className="btn btn-primary">
                Start Swapping
              </Link>
              <Link href="/lending" className="btn btn-secondary">
                Start Lending
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">$1.2M</div>
              <div className="stat-label">Total Value Locked</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0.3%</div>
              <div className="stat-label">Swap Fee</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">5.2%</div>
              <div className="stat-label">Avg Lending APY</div>
            </div>
          </div>

          {/* Modules */}
          <div className="module-grid">
            <div className="module-card">
              <div className="module-icon">🔄</div>
              <h2 className="module-title">AMM Swap</h2>
              <p className="module-description">
                Swap SOL and USDC instantly with automated market making.
                Low fees, instant settlement, and constant product formula.
              </p>
              <Link href="/swap" className="btn btn-primary">
                Open Swap
              </Link>
            </div>

            <div className="module-card">
              <div className="module-icon">💰</div>
              <h2 className="module-title">Lending Protocol</h2>
              <p className="module-description">
                Supply USDC to earn interest or borrow against your collateral.
                Secure, transparent, and permissionless lending.
              </p>
              <Link href="/lending" className="btn btn-primary">
                Start Lending
              </Link>
            </div>

            <div className="module-card">
              <div className="module-icon">📊</div>
              <h2 className="module-title">Liquidity Pools</h2>
              <p className="module-description">
                Provide liquidity to AMM pools and earn swap fees.
                LP tokens represent your share of the pool.
              </p>
              <Link href="/swap" className="btn btn-secondary">
                View Pools
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ marginTop: '80px' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '48px', fontSize: '32px' }}>
              Why Choose Solana DeFi?
            </h2>
            <div className="module-grid">
              <div className="card">
                <h3 style={{ marginBottom: '12px' }}>⚡ Lightning Fast</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Sub-second block times and instant finality. No waiting for confirmations.
                </p>
              </div>
              <div className="card">
                <h3 style={{ marginBottom: '12px' }}>💸 Low Fees</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Transaction fees of less than $0.01. Fractions of a cent, not dollars.
                </p>
              </div>
              <div className="card">
                <h3 style={{ marginBottom: '12px' }}>🔒 Secure</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Built on Anchor Framework with rigorous testing and audit-ready code.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Protocol Status */}
        <section style={{ marginTop: '80px', marginBottom: '80px' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '32px' }}>
              Protocol Status
            </h2>
            <div className="stats-grid">
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="module-icon">✅</div>
                <h3>AMM Module</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Program ID: <br />
                  <code style={{ fontSize: '12px' }}>CZaKkKoLPHzcRXtm5q5X8YQNpr15ocASwgvW6krjFZex</code>
                </p>
                <span className="status-badge status-active" style={{ marginTop: '12px' }}>
                  Deployed
                </span>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="module-icon">✅</div>
                <h3>Lending Module</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Program ID: <br />
                  <code style={{ fontSize: '12px' }}>8oCbnRgZnWRd1ctY3otZvwGqJpr8fG7b2atYFxqUAjxC</code>
                </p>
                <span className="status-badge status-active" style={{ marginTop: '12px' }}>
                  Deployed
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>Solana DeFi Protocol - Built with Anchor Framework</p>
          <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
            GitHub: <a href="https://github.com/truongvknnlthao-gif/solana-defi-amm-lending" target="_blank" rel="noopener noreferrer">
              solana-defi-amm-lending
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
