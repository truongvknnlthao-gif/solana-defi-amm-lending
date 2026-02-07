import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Solana DeFi - AMM + Lending Protocol</title>
        <meta name="description" content="Swap tokens and lend on Solana with low fees" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Next-Gen DeFi on Solana</h1>
          <p className="hero-subtitle">
            Swap tokens with low fees and earn interest by lending. 
            Built with Anchor Framework for maximum security and performance.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/swap" className="btn btn-primary" style={{ background: 'white', color: '#2563EB' }}>
              Start Swapping →
            </Link>
            <Link href="/lending" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', color: 'white' }}>
              Start Lending →
            </Link>
          </div>
        </div>
      </section>

      <section className="container">
        {/* Stats */}
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
            <h3 className="module-title">AMM Swap</h3>
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
            <h3 className="module-title">Lending Protocol</h3>
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
            <h3 className="module-title">Liquidity Pools</h3>
            <p className="module-description">
              Provide liquidity to AMM pools and earn swap fees. 
              LP tokens represent your share of the pool.
            </p>
            <Link href="/swap" className="btn btn-secondary">
              View Pools
            </Link>
          </div>
        </div>

        {/* Why Choose */}
        <section className="section">
          <h2 className="section-title">Why Choose Solana DeFi?</h2>
          <div className="module-grid">
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>⚡ Lightning Fast</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Sub-second block times and instant finality. No waiting for confirmations.
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>💸 Low Fees</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Transaction fees of less than $0.01. Fractions of a cent, not dollars.
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '0.75rem' }}>🔒 Secure</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Built on Anchor Framework with rigorous testing and audit-ready code.
              </p>
            </div>
          </div>
        </section>

        {/* Protocol Status */}
        <section className="section" style={{ marginTop: '3rem' }}>
          <h2 className="section-title">Protocol Status</h2>
          <div className="stats-grid">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
              <h3>AMM Module</h3>
              <div className="info-box" style={{ marginTop: '1rem' }}>
                <code style={{ fontSize: '0.75rem' }}>
                  CZaKkKoLPHzcRXtm5q5X8YQNpr15ocASwgvW6krjFZex
                </code>
              </div>
              <span className="status-badge status-active">Deployed</span>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
              <h3>Lending Module</h3>
              <div className="info-box" style={{ marginTop: '1rem' }}>
                <code style={{ fontSize: '0.75rem' }}>
                  8oCbnRgZnWRd1ctY3otZvwGqJpr8fG7b2atYFxqUAjxC
                </code>
              </div>
              <span className="status-badge status-active">Deployed</span>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}
