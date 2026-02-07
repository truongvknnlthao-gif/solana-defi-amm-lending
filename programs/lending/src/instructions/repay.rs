use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::*;

pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
    let position = &mut ctx.accounts.lending_position;
    let pool = &mut ctx.accounts.lending_pool;
    
    let repay_amount = amount.min(position.borrowed_amount);
    
    // Transfer tokens from payer to pool
    let accounts = Transfer {
        from: ctx.accounts.payer_borrowable.to_account_info(),
        to: ctx.accounts.pool_borrowable_vault.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    
    let cpi_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), accounts);
    token::transfer(cpi_context, repay_amount)?;
    
    position.borrowed_amount = position.borrowed_amount.checked_sub(repay_amount).unwrap();
    position.last_update = Clock::get()?.unix_timestamp;
    
    pool.total_borrows = pool.total_borrows.checked_sub(repay_amount).unwrap();
    
    Ok(())
}
