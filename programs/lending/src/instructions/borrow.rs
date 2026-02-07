use anchor_lang::prelude::*;
use crate::state::*;

pub fn borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> {
    let position = &mut ctx.accounts.lending_position;
    let pool = &ctx.accounts.lending_pool;
    
    // Check health factor (simplified)
    let max_borrow = position.deposited_amount * pool.collateral_factor as u64 / 10000;
    require!(
        position.borrowed_amount + amount <= max_borrow,
        ErrorCode::InsufficientCollateral
    );
    
    position.borrowed_amount = position.borrowed_amount.checked_add(amount).unwrap();
    position.last_update = Clock::get()?.unix_timestamp;
    
    Ok(())
}
