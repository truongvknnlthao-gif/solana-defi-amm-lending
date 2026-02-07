use anchor_lang::prelude::*;

#[account]
pub struct AmmPool {
    pub seed: u64,
    pub bump: u8,
    pub fee: u16,
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub token_a_vault: Pubkey,
    pub token_b_vault: Pubkey,
    pub lp_token_mint: Pubkey,  // ✅ New: LP Token Mint address
    pub lp_token_supply: u64,
    pub reserve_a: u64,
    pub reserve_b: u64,
}

impl AmmPool {
    pub fn space() -> usize {
        8 + 32 + 32 + 8 + 8 + 8 + 8 + 32 + 8 + 8 + 8 // ✅ Updated space calculation
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Slippage exceeded")]
    SlippageExceeded,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
}
