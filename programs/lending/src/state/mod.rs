use anchor_lang::prelude::*;

#[account]
pub struct LendingPool {
    pub bump: u8,
    pub collateral_mint: Pubkey,
    pub borrowable_mint: Pubkey,
    pub collateral_factor: u16,      // e.g., 8000 = 80%
    pub borrow_rate: u16,            // annual rate in bps
    pub total_deposits: u64,
    pub total_borrows: u64,
}

impl LendingPool {
    pub fn space() -> usize {
        8 + 1 + 32 + 32 + 2 + 2 + 8 + 8
    }
}

#[account]
pub struct LendingPosition {
    pub bump: u8,
    pub lending_pool: Pubkey,
    pub depositor: Pubkey,
    pub deposited_amount: u64,
    pub borrowed_amount: u64,
    pub last_update: i64,
}

impl LendingPosition {
    pub fn space() -> usize {
        8 + 1 + 32 + 32 + 8 + 8 + 8
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient collateral for borrowing")]
    InsufficientCollateral,
    #[msg("Health factor below threshold")]
    HealthFactorBelowThreshold,
}
