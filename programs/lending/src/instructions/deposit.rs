use anchor_lang::prelude::*;

use crate::state::*;

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let position = &mut ctx.accounts.lending_position;
    let pool = &mut ctx.accounts.lending_pool;
    
    position.bump = ctx.bumps.lending_position;
    position.lending_pool = ctx.accounts.lending_pool.key();
    position.depositor = ctx.accounts.depositor.key();
    position.deposited_amount = position.deposited_amount.checked_add(amount).unwrap();
    position.borrowed_amount = 0;
    position.last_update = Clock::get()?.unix_timestamp;
    
    pool.total_deposits = pool.total_deposits.checked_add(amount).unwrap();
    
    Ok(())
}
