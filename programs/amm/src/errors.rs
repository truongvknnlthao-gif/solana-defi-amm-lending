use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Slippage exceeded")]
    SlippageExceeded = 0,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity = 1,
    #[msg("Invalid token mint")]
    InvalidTokenMint = 2,
    #[msg("Zero amount input")]
    ZeroAmountInput = 3,
    #[msg("Insufficient balance")]
    InsufficientBalance = 4,
    #[msg("Math operation overflow")]
    MathOverflow = 5,
}
