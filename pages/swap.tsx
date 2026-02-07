import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Swap() {
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');

  return (
    <>
      <Head>
        <title>Swap - Solana DeFi</title>
      </Head>

      <section className="container" style={{ paddingTop: '3rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Swap</h1>

        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          {/* Swap Card */}
          <div className="card">
            {/* From */}
            <div className="form-group">
              <label>From</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ flex: 1 }}
                />
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  style={{ width: '100px' }}
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Balance: 0.00 {fromToken}
              </div>
            </div>

            {/* Swap Button */}
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <button
                className="btn btn-secondary"
                style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
              >
                ⇅
              </button>
            </div>

            {/* To */}
            <div className="form-group">
              <label>To</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="0.00"
                  disabled
                  style={{ flex: 1, background: 'var(--bg-gray)' }}
                />
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  style={{ width: '100px' }}
                >
                  <option value="USDC">USDC</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Balance: 0.00 {toToken}
              </div>
            </div>

            {/* Info */}
            <div className="info-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Rate</span>
                <span>1 SOL ≈ 100 USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Price Impact</span>
                <span style={{ color: 'var(--success)' }}>&lt; 0.01%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Network Fee</span>
                <span>≈ $0.001</span>
              </div>
            </div>

            {/* Swap Button */}
            <button className="btn btn-primary btn-full" disabled={!amount}>
              Connect Wallet to Swap
            </button>
          </div>

          {/* Pool Info */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>📊 Pool Information</h3>
            <div className="info-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>SOL-USDC Pool TVL</span>
                <span>$500,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>24h Volume</span>
                <span>$125,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>APY</span>
                <span style={{ color: 'var(--primary)' }}>12.5%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
