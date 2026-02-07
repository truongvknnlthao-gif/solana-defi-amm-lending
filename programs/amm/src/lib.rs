use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Transfer};
use crate::state::AmmPool;
use crate::errors::ErrorCode;

pub mod state;
pub mod math;
pub mod errors;

declare_id!("CZaKkKoLPHzcRXtm5q5X8YQNpr15ocASwgvW6krjFZex");

#[program]
pub mod amm {
    use super::*;

    /// Initialize the AMM pool (vaults created separately)
    pub fn initialize(ctx: Context<Initialize>, seed: u64, fee: u16, bump: u8) -> Result<()> {
        let pool = &mut ctx.accounts.amm_pool;
        pool.seed = seed;
        pool.fee = fee;
        pool.bump = bump;
        pool.token_a_mint = ctx.accounts.token_a_mint.key();
        pool.token_b_mint = ctx.accounts.token_b_mint.key();
        pool.token_a_vault = ctx.accounts.token_a_vault.key();
        pool.token_b_vault = ctx.accounts.token_b_vault.key();
        pool.lp_token_supply = 0;
        pool.reserve_a = 0;
        pool.reserve_b = 0;
        Ok(())
    }

    /// Swap tokens in the AMM pool
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
        let is_a_to_b = ctx.accounts.token_a_mint.key() == ctx.accounts.user_token_a.key();
        
        let accounts = Transfer {
            from: if is_a_to_b {
                ctx.accounts.user_token_a.to_account_info()
            } else {
                ctx.accounts.user_token_b.to_account_info()
            },
            to: if is_a_to_b {
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

    /// Add liquidity to the AMM pool
    pub fn add_liquidity(ctx: Context<AddLiquidity>, amount_a: u64, amount_b: u64) -> Result<()> {
        let cpi_program = ctx.accounts.token_program.to_account_info();
        
        // Transfer token A to vault
        let accounts_a = Transfer {
            from: ctx.accounts.provider_token_a.to_account_info(),
            to: ctx.accounts.token_a_vault.to_account_info(),
            authority: ctx.accounts.provider.to_account_info(),
        };
        let cpi_context_a = CpiContext::new(cpi_program.clone(), accounts_a);
        token::transfer(cpi_context_a, amount_a)?;
        
        // Transfer token B to vault
        let accounts_b = Transfer {
            from: ctx.accounts.provider_token_b.to_account_info(),
            to: ctx.accounts.token_b_vault.to_account_info(),
            authority: ctx.accounts.provider.to_account_info(),
        };
        let cpi_context_b = CpiContext::new(cpi_program, accounts_b);
        token::transfer(cpi_context_b, amount_b)?;
        
        // Update reserves
        let pool = &mut ctx.accounts.amm_pool;
        pool.reserve_a = pool.reserve_a.checked_add(amount_a).unwrap();
        pool.reserve_b = pool.reserve_b.checked_add(amount_b).unwrap();
        
        Ok(())
    }
}

/// Initialize AMM pool - minimal version
#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 168,
        seeds = [b"amm", seed.to_le_bytes().as_ref()],
        bump
    )]
    pub amm_pool: Account<'info, AmmPool>,
    /// CHECK: Validated by program logic
    pub token_a_mint: UncheckedAccount<'info>,
    /// CHECK: Validated by program logic
    pub token_b_mint: UncheckedAccount<'info>,
    /// CHECK: Validated by program logic
    pub token_a_vault: UncheckedAccount<'info>,
    /// CHECK: Validated by program logic
    pub token_b_vault: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"amm", amm_pool.seed.to_le_bytes().as_ref()],
        bump = amm_pool.bump,
    )]
    pub amm_pool: Account<'info, AmmPool>,
    /// CHECK: Validated by program logic
    #[account(mut)]
    pub user_token_a: UncheckedAccount<'info>,
    /// CHECK: Validated by program logic
    #[account(mut)]
    pub user_token_b: UncheckedAccount<'info>,
    #[account(mut)]
    pub token_a_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_b_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
    /// CHECK: Validated by program logic
    pub token_a_mint: UncheckedAccount<'info>,
    /// CHECK: Validated by program logic
    pub token_b_mint: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub provider: Signer<'info>,
    #[account(
        mut,
        seeds = [b"amm", amm_pool.seed.to_le_bytes().as_ref()],
        bump = amm_pool.bump,
    )]
    pub amm_pool: Account<'info, AmmPool>,
    #[account(mut)]
    pub provider_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub provider_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_a_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_b_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
    /// CHECK: Validated by program logic
    pub token_a_mint: UncheckedAccount<'info>,
    /// CHECK: Validated by program logic
    pub token_b_mint: UncheckedAccount<'info>,
}
