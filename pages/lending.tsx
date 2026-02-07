import { useState } from 'react';
import Head from 'next/head';

export default function Lending() {
  const [action, setAction] = useState<'deposit' | 'borrow'>('deposit');
  const [amount, setAmount] = useState('');

  return (
    <>
      <Head>
        <title>Lending - Solana DeFi</title>
      </Head>

      <section className="container" style={{ paddingTop: '3rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Lending Protocol</h1>

        {/* Action Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <button
            className={`btn ${action === 'deposit' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAction('deposit')}
          >
            💰 Deposit
          </button>
          <button
            className={`btn ${action === 'borrow' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAction('borrow')}
          >
            📈 Borrow
          </button>
        </div>

        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          {/* Deposit/Borrow Card */}
          <div className="card">
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {action === 'deposit' ? 'Deposit USDC' : 'Borrow Against Collateral'}
            </h3>

            <div className="form-group">
              <label>Amount (USDC)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Balance: 0.00 USDC
              </div>
            </div>

            {/* Info Box */}
            <div className="info-box">
              {action === 'deposit' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Supply APY</span>
                    <span style={{ color: 'var(--primary)' }}>5.2%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Your Supply</span>
                    <span>0.00 USDC</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Collateral Factor</span>
                    <span>75%</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Borrow APY</span>
                    <span style={{ color: 'var(--cta)' }}>7.8%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Your Borrows</span>
                    <span>0.00 USDC</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Borrow Limit</span>
                    <span>$0.00</span>
                  </div>
                </>
              )}
            </div>

            {/* Action Button */}
            <button className="btn btn-primary btn-full" disabled={!amount}>
              {action === 'deposit' ? 'Deposit USDC' : 'Borrow USDC'}
            </button>
          </div>

          {/* Market Overview */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>📊 Market Overview</h3>
            <div className="info-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Total Supply</span>
                <span>$1,000,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Total Borrows</span>
                <span>$250,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Utilization Rate</span>
                <span style={{ color: 'var(--cta)' }}>25%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Reserve Factor</span>
                <span>10%</span>
              </div>
            </div>
          </div>

          {/* Your Position */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>👤 Your Position</h3>
            <div className="info-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Supplied</span>
                <span>0.00 USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Borrowed</span>
                <span>0.00 USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Net APY</span>
                <span style={{ color: 'var(--success)' }}>0%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
