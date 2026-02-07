/**
 * Anchor 客户端配置
 */
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { AMM_PROGRAM_ID, LENDING_PROGRAM_ID, RPC_URL } from './constants';

// AMM IDL (简化版)
const AMM_IDL = {
  version: '0.1.0',
  name: 'amm',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        { name: 'pool', isMut: true, isSigner: false },
        { name: 'authority', isMut: false, isSigner: true },
        { name: 'tokenA', isMut: false, isSigner: false },
        { name: 'tokenB', isMut: false, isSigner: false },
        { name: 'lpTokenMint', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'seed', type: 'u64' },
        { name: 'fee', type: 'u16' },
        { name: 'bump', type: 'u8' },
      ],
    },
    {
      name: 'swap',
      accounts: [
        { name: 'pool', isMut: true, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'userTokenAccountIn', isMut: true, isSigner: false },
        { name: 'userTokenAccountOut', isMut: true, isSigner: false },
        { name: 'poolTokenAccountIn', isMut: true, isSigner: false },
        { name: 'poolTokenAccountOut', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'amountIn', type: 'u64' },
        { name: 'minimumAmountOut', type: 'u64' },
      ],
    },
  ],
};

// Lending IDL (简化版)
const LENDING_IDL = {
  version: '0.1.0',
  name: 'lending',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        { name: 'lendingPool', isMut: true, isSigner: false },
        { name: 'authority', isMut: false, isSigner: true },
        { name: 'tokenMint', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'bump', type: 'u8' }],
    },
    {
      name: 'deposit',
      accounts: [
        { name: 'lendingPool', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'poolTokenAccount', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'amount', type: 'u64' }],
    },
    {
      name: 'borrow',
      accounts: [
        { name: 'lendingPool', isMut: true, isSigner: false },
        { name: 'obligation', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'poolTokenAccount', isMut: true, isSigner: false },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'amount', type: 'u64' }],
    },
    {
      name: 'repay',
      accounts: [
        { name: 'lendingPool', isMut: true, isSigner: false },
        { name: 'obligation', isMut: true, isSigner: false },
        { name: 'user', isMut: true, isSigner: true },
        { name: 'userTokenAccount', isMut: true, isSigner: false },
        { name: 'poolTokenAccount', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'amount', type: 'u64' }],
    },
  ],
};

let connection: Connection | null = null;
let ammProgram: Program | null = null;
let lendingProgram: Program | null = null;

/**
 * 获取 Solana 连接
 */
export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_URL, 'confirmed');
  }
  return connection;
}

/**
 * 获取 AMM Program
 */
export function getAmmProgram(provider?: AnchorProvider): Program {
  if (!ammProgram) {
    const conn = getConnection();
    const prov = provider || new AnchorProvider(conn, {} as Wallet, {});
    ammProgram = new Program(AMM_IDL as any, new PublicKey(AMM_PROGRAM_ID), prov);
  }
  return ammProgram;
}

/**
 * 获取 Lending Program
 */
export function getLendingProgram(provider?: AnchorProvider): Program {
  if (!lendingProgram) {
    const conn = getConnection();
    const prov = provider || new AnchorProvider(conn, {} as Wallet, {});
    lendingProgram = new Program(LENDING_IDL as any, new PublicKey(LENDING_PROGRAM_ID), prov);
  }
  return lendingProgram;
}

/**
 * 获取 Program Accounts 辅助函数
 */
export async function getProgramAccounts(programId: PublicKey, filters?: any[]) {
  const conn = getConnection();
  return conn.getParsedProgramAccounts(programId, { filters });
}

/**
 * 获取账户余额
 */
export async function getTokenBalance(tokenAccount: PublicKey): Promise<number> {
  try {
    const conn = getConnection();
    const accountInfo = await conn.getParsedAccountInfo(tokenAccount);
    if (accountInfo.value && 'parsed' in accountInfo.value.data) {
      const data = accountInfo.value.data.parsed;
      return data.info.tokenAmount.uiAmount || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
}
