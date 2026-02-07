import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction, createInitializeAccountInstruction } from '@solana/spl-token';
import { AMM_PROGRAM_ID, WSOL_ADDRESS, USDC_ADDRESS, DEFAULT_SLIPPAGE } from '../utils/constants';

interface SwapFormProps {
  connection: Connection;
}

interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
}

const TOKENS: TokenInfo[] = [
  { symbol: 'SOL', address: WSOL_ADDRESS, decimals: 9 },
  { symbol: 'USDC', address: USDC_ADDRESS, decimals: 6 },
];

export default function SwapForm({ connection }: SwapFormProps) {
  const { publicKey, sendTransaction } = useWallet();
  const [fromToken, setFromToken] = useState<TokenInfo>(TOKENS[0]);
  const [toToken, setToToken] = useState<TokenInfo>(TOKENS[1]);
  const [amountIn, setAmountIn] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(DEFAULT_SLIPPAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const swapTokens = useCallback(async () => {
    if (!publicKey || !amountIn) {
      setError('Please connect wallet and enter amount');
      return;
    }

    setLoading(true);
    setError(null);
    setTxId(null);

    try {
      const amount = parseFloat(amountIn);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }

      const amountInLamports = Math.floor(amount * Math.pow(10, fromToken.decimals));
      const minimumAmountOut = amount * (1 - slippage / 100) * Math.pow(10, toToken.decimals);

      // Find PDA for the pool
      const [poolPda] = await PublicKey.findProgramAddress(
        [Buffer.from('amm_pool')],
        new PublicKey(AMM_PROGRAM_ID)
      );

      // Get pool info
      const poolInfo = await connection.getParsedAccountInfo(poolPda);
      if (!poolInfo.value) {
        throw new Error('AMM Pool not initialized');
      }

      // Create transaction
      const transaction = new Transaction();

      // For SOL, wrap it first
      if (fromToken.address === WSOL_ADDRESS) {
        const wsolAccount = await getAssociatedTokenAddress(
          new PublicKey(WSOL_ADDRESS),
          publicKey
        );

        // Create WSOL account if needed
        const wsolAccountInfo = await connection.getParsedAccountInfo(wsolAccount);
        if (!wsolAccountInfo.value) {
          transaction.add(
            createInitializeAccountInstruction(
              wsolAccount,
              new PublicKey(WSOL_ADDRESS),
              publicKey,
              TOKEN_PROGRAM_ID
            )
          );
        }

        // Transfer SOL to WSOL account
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: wsolAccount,
            lamports: amountInLamports,
          })
        );
      }

      // Get token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(fromToken.address),
        publicKey
      );

      const toTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(toToken.address),
        publicKey
      );

      // Add swap instruction
      const data = Buffer.alloc(17);
      data.writeUInt8(2, 0); // swap instruction index
      data.writeBigUInt64LE(BigInt(Math.floor(amountInLamports)), 1);
      data.writeBigUInt64LE(BigInt(Math.floor(minimumAmountOut)), 9);

      transaction.add({
        keys: [
          { pubkey: poolPda, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: fromTokenAccount, isSigner: false, isWritable: true },
          { pubkey: toTokenAccount, isSigner: false, isWritable: true },
          { pubkey: poolPda, isSigner: false, isWritable: true },
          { pubkey: poolPda, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: new PublicKey(AMM_PROGRAM_ID),
        data,
      });

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      setTxId(signature);

    } catch (err: any) {
      console.error('Swap error:', err);
      setError(err.message || 'Swap failed');
    } finally {
      setLoading(false);
    }
  }, [publicKey, amountIn, fromToken, toToken, slippage, connection, sendTransaction]);

  const handleSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const estimatedOutput = amountIn
    ? (parseFloat(amountIn) * 0.99).toFixed(4)
    : '0';

  return (
    <div className="card swap-container">
      <div className="swap-header">
        <span className="swap-title">Swap</span>
        <div className="settings-row">
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Slippage:</span>
          <input
            type="number"
            className="slippage-input"
            value={slippage}
            onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
            step="0.1"
            min="0.1"
            max="50"
          />
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>%</span>
        </div>
      </div>

      {/* From Token */}
      <div className="card" style={{ marginBottom: '8px' }}>
        <div className="token-row">
          <select
            className="token-select"
            value={fromToken.symbol}
            onChange={(e) => {
              const token = TOKENS.find(t => t.symbol === e.target.value);
              if (token) setFromToken(token);
            }}
          >
            {TOKENS.map(t => (
              <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
          <input
            type="number"
            className="form-input"
            placeholder="0.00"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            style={{ flex: 1, textAlign: 'right', fontSize: '20px' }}
          />
        </div>
      </div>

      {/* Switch Button */}
      <div style={{ textAlign: 'center', margin: '8px 0' }}>
        <button
          className="btn btn-secondary"
          onClick={handleSwitchTokens}
          style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
        >
          ⬇️
        </button>
      </div>

      {/* To Token */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="token-row">
          <select
            className="token-select"
            value={toToken.symbol}
            onChange={(e) => {
              const token = TOKENS.find(t => t.symbol === e.target.value);
              if (token) setToToken(token);
            }}
          >
            {TOKENS.map(t => (
              <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
          <span style={{ flex: 1, textAlign: 'right', fontSize: '20px', fontWeight: '600' }}>
            {estimatedOutput} {toToken.symbol}
          </span>
        </div>
      </div>

      {/* Price Display */}
      <div className="price-display">
        1 {fromToken.symbol} ≈ {fromToken.symbol === 'SOL' ? '95.5' : '0.0105'} {toToken.symbol}
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Success Message */}
      {txId && (
        <div className="success-message">
          Swap successful!{' '}
          <a
            href={`https://explorer.solana.com/tx/${txId}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
          </a>
        </div>
      )}

      {/* Swap Button */}
      <button
        className="btn btn-primary action-btn"
        onClick={swapTokens}
        disabled={!publicKey || !amountIn || loading}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Swapping...
          </>
        ) : !publicKey ? (
          'Connect Wallet to Swap'
        ) : (
          'Swap'
        )}
      </button>
    </div>
  );
}
