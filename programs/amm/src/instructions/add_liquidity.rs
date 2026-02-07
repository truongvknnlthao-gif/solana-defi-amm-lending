use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::*;

pub fn add_liquidity(ctx: Context<AddLiquidity>, amount_a: u64, amount_b: u64) -> Result<()> {
    let pool = &ctx.accounts.amm_pool;
    
    // Transfer token A to vault
    let accounts_a = Transfer {
        from: ctx.accounts.provider_token_a.to_account_info(),
        to: ctx.accounts.token_a_vault.to_account_info(),
        authority: ctx.accounts.provider.to_account_info(),
    };
    let cpi_context_a = CpiContext::new(ctx.accounts.token_program.to_account_info(), accounts_a);
    token::transfer(cpi_context_a, amount_a)?;
    
    // Transfer token B to vault
    let accounts_b = Transfer {
        from: ctx.accounts.provider_token_b.to_account_info(),
        to: ctx.accounts.token_b_vault.to_account_info(),
        authority: ctx.accounts.provider.to_account_info(),
    };
    let cpi_context_b = CpiContext::new(ctx.accounts.token_program.to_account_info(), accounts_b);
    token::transfer(cpi_context_b, amount_b)?;
    
    // Update reserves
    pool.reserve_a = pool.reserve_a.checked_add(amount_a).unwrap();
    pool.reserve_b = pool.reserve_b.checked_add(amount_b).unwrap();
    
    Ok(())
}
