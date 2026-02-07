/**
 * 常量定义
 */

// Program IDs (Devnet)
export const AMM_PROGRAM_ID = 'CZaKkKoLPHzcRXtm5q5X8YQNpr15ocASwgvW6krjFZex';
export const LENDING_PROGRAM_ID = '8oCbnRgZnWRd1ctY3otZvwGqJpr8fG7b2atYFxqUAjxC';

// Token Addresses (Devnet - WSOL/USDC)
export const WSOL_ADDRESS = 'So11111111111111111111111111111111111111112';
export const USDC_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// RPC URL
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';

// 网络配置
export const NETWORK = {
  name: 'devnet',
  url: RPC_URL,
  explorer: 'https://explorer.solana.com',
};

// 默认滑点
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%

// 小数精度
export const DECIMALS = {
  SOL: 9,
  USDC: 6,
  LP: 9,
};
