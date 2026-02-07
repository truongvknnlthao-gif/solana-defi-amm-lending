use anchor_lang::error_code;

#[error_code]
pub enum LendingError {
    #[msg("Insufficient collateral for borrowing")]
    InsufficientCollateral,
    
    #[msg("Repay amount exceeds outstanding debt")]
    RepayExceedsDebt,
    
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    
    #[msg("Health factor below minimum threshold")]
    HealthFactorBelowMinimum,
}
