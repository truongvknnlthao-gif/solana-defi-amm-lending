import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import { LENDING_PROGRAM_ID, USDC_ADDRESS } from '../utils/constants';

interface LendingFormProps {
  connection: Connection;
}

type TabType = 'deposit' | 'borrow' | 'repay';

const LENDING_TOKEN: { symbol: string; address: string; decimals: number } = {
  symbol: 'USDC',
  address: USDC_ADDRESS,
  decimals: 6,
};

export default function LendingForm({ connection }: LendingFormProps) {
  const { publicKey, sendTransaction } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  // Mock user data (in production, fetch from blockchain)
  const [userData] = useState({
    deposited: 1000,
    borrowed: 200,
    collateral: 1500,
  });

  const handleAction = useCallback(async () => {
    if (!publicKey || !amount) {
      setError('Please connect wallet and enter amount');
      return;
    }

    setLoading(true);
    setError(null);
    setTxId(null);

    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('Invalid amount');
      }

      const amountLamports = Math.floor(amountValue * Math.pow(10, LENDING_TOKEN.decimals));
      const transaction = new Transaction();

      // Find PDAs
      const [lendingPoolPda] = await PublicKey.findProgramAddress(
        [Buffer.from('lending_pool')],
        new PublicKey(LENDING_PROGRAM_ID)
      );

      const [obligationPda] = await PublicKey.findProgramAddress(
        [Buffer.from('obligation'), publicKey.toBuffer()],
        new PublicKey(LENDING_PROGRAM_ID)
      );

      // Get token accounts
      const userTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(LENDING_TOKEN.address),
        publicKey
      );

      const poolTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(LENDING_TOKEN.address),
        lendingPoolPda,
        true
      );

      const instructionData = Buffer.alloc(9);
      instructionData.writeUInt8(
        activeTab === 'deposit' ? 1 : activeTab === 'borrow' ? 2 : 3,
        0
      );
      instructionData.writeBigUInt64LE(BigInt(amountLamports), 1);

      const keys = [
        { pubkey: lendingPoolPda, isSigner: false, isWritable: true },
        { pubkey: publicKey, isSigner: true, isWritable: true },
      ];

      if (activeTab === 'deposit') {
        keys.push(
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
        );
      } else if (activeTab === 'borrow') {
        keys.push(
          { pubkey: obligationPda, isSigner: false, isWritable: true },
          { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
        );
      } else {
        keys.push(
          { pubkey: obligationPda, isSigner: false, isWritable: true },
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
        );
      }

      transaction.add({
        keys,
        programId: new PublicKey(LENDING_PROGRAM_ID),
        data: instructionData,
      });

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      setTxId(signature);

    } catch (err: any) {
      console.error('Lending action error:', err);
      setError(err.message || `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} failed`);
    } finally {
      setLoading(false);
    }
  }, [publicKey, amount, activeTab, connection, sendTransaction]);

  const getButtonText = () => {
    switch (activeTab) {
      case 'deposit':
        return 'Deposit USDC';
      case 'borrow':
        return 'Borrow USDC';
      case 'repay':
        return 'Repay USDC';
    }
  };

  return (
    <div className="card lending-form">
      <div className="lending-tabs">
        <button
          className={`tab-btn ${activeTab === 'deposit' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposit')}
        >
          Deposit
        </button>
        <button
          className={`tab-btn ${activeTab === 'borrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrow')}
        >
          Borrow
        </button>
        <button
          className={`tab-btn ${activeTab === 'repay' ? 'active' : ''}`}
          onClick={() => setActiveTab('repay')}
        >
          Repay
        </button>
      </div>

      {/* User Info */}
      <div className="user-info">
        <div className="user-info-row">
          <span className="info-label">Deposited</span>
          <span className="info-value">{userData.deposited.toLocaleString()} USDC</span>
        </div>
        <div className="user-info-row">
          <span className="info-label">Borrowed</span>
          <span className="info-value">{userData.borrowed.toLocaleString()} USDC</span>
        </div>
        <div className="user-info-row">
          <span className="info-label">Collateral Value</span>
          <span className="info-value">${userData.collateral.toLocaleString()}</span>
        </div>
        <div className="user-info-row">
          <span className="info-label">Health Factor</span>
          <span className="info-value" style={{ color: 'var(--success)' }}>
            {(userData.collateral / (userData.borrowed * 1.2)).toFixed(2)}x
          </span>
        </div>
      </div>

      {/* Amount Input */}
      <div className="form-group">
        <label className="form-label">Amount ({LENDING_TOKEN.symbol})</label>
        <input
          type="number"
          className="form-input"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ fontSize: '20px' }}
        />
      </div>

      {/* Quick Amount Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <button
            key={ratio}
            className="btn btn-secondary"
            onClick={() => setAmount(String(userData.deposited * ratio))}
            style={{ flex: 1, fontSize: '12px' }}
          >
            {Math.round(ratio * 100)}%
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Success Message */}
      {txId && (
        <div className="success-message">
          Action successful!{' '}
          <a
            href={`https://explorer.solana.com/tx/${txId}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
          </a>
        </div>
      )}

      {/* Action Button */}
      <button
        className="btn btn-primary action-btn"
        onClick={handleAction}
        disabled={!publicKey || !amount || loading}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Processing...
          </>
        ) : !publicKey ? (
          'Connect Wallet'
        ) : (
          getButtonText()
        )}
      </button>

      {/* Protocol Info */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--surface-light)', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>Protocol Info</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Supply APY</span>
          <span style={{ fontWeight: '600', color: 'var(--success)' }}>5.2%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Borrow APY</span>
          <span style={{ fontWeight: '600', color: 'var(--warning)' }}>8.7%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Collateral Factor</span>
          <span style={{ fontWeight: '600' }}>75%</span>
        </div>
      </div>
    </div>
  );
}
