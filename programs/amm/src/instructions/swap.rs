use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::*;

pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
    let pool = &ctx.accounts.amm_pool;
    
    // Calculate swap output using constant product formula
    let (input_reserve, output_reserve) = if ctx.accounts.token_a_mint.key() == ctx.accounts.user_token_a.key() {
        (pool.reserve_a, pool.reserve_b)
    } else {
        (pool.reserve_b, pool.reserve_a)
    };
    
    // dy = (y * dx) / (x + dx) with fee
    let fee_amount = amount_in * pool.fee as u64 / 10000;
    let amount_after_fee = amount_in.saturating_sub(fee_amount);
    let amount_out = (output_reserve * amount_after_fee) / (input_reserve + amount_after_fee);
    
    require!(amount_out >= minimum_amount_out, ErrorCode::SlippageExceeded);
    
    // Perform the swap
    let accounts = Transfer {
        from: if ctx.accounts.token_a_mint.key() == ctx.accounts.user_token_a.key() {
            ctx.accounts.user_token_a.to_account_info()
        } else {
            ctx.accounts.user_token_b.to_account_info()
        },
        to: if ctx.accounts.token_a_mint.key() == ctx.accounts.user_token_a.key() {
            ctx.accounts.token_a_vault.to_account_info()
        } else {
            ctx.accounts.token_b_vault.to_account_info()
        },
        authority: ctx.accounts.user.to_account_info(),
    };
    
    let cpi_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), accounts);
    token::transfer(cpi_context, amount_in)?;
    
    Ok(())
}
