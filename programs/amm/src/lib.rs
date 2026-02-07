use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Transfer, MintTo, Burn};
use crate::state::AmmPool;
use crate::errors::ErrorCode;
use crate::math::AMM;

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
        pool.lp_token_mint = ctx.accounts.lp_token_mint.key();  // ✅ Set LP token mint
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
        
        // ✅ Update reserves after swap
        let pool = &mut ctx.accounts.amm_pool;
        if is_a_to_b {
            pool.reserve_a = pool.reserve_a.checked_add(amount_in).unwrap();
            pool.reserve_b = pool.reserve_b.checked_sub(amount_out).unwrap();
        } else {
            pool.reserve_b = pool.reserve_b.checked_add(amount_in).unwrap();
            pool.reserve_a = pool.reserve_a.checked_sub(amount_out).unwrap();
        }
        
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
        let cpi_context_b = CpiContext::new(cpi_program.clone(), accounts_b);
        token::transfer(cpi_context_b, amount_b)?;
        
        // Get pool data and prepare seeds
        let pool_info = ctx.accounts.amm_pool.to_account_info();
        let bump = ctx.accounts.amm_pool.bump;
        let seed = ctx.accounts.amm_pool.seed;
        
        // Update reserves first and get old values
        let pool = &mut ctx.accounts.amm_pool;
        let old_reserve_a = pool.reserve_a;
        let old_reserve_b = pool.reserve_b;
        let old_lp_supply = pool.lp_token_supply;
        
        pool.reserve_a = pool.reserve_a.checked_add(amount_a).unwrap();
        pool.reserve_b = pool.reserve_b.checked_add(amount_b).unwrap();
        
        // ✅ Calculate LP tokens using old reserves
        let lp_tokens = AMM::calculate_lp_tokens_mint(
            amount_a,
            amount_b,
            old_reserve_a,
            old_reserve_b,
            old_lp_supply,
        )?;
        
        // Mint LP tokens to provider (use pool authority)
        let seed_bytes = seed.to_le_bytes();
        let bump_array = [bump];
        let authority_seeds = &[b"amm", seed_bytes.as_ref(), bump_array.as_ref()];
        let signer_seeds = [&authority_seeds[..]];
        
        let mint_accounts = MintTo {
            mint: ctx.accounts.lp_token_mint.to_account_info(),
            to: ctx.accounts.provider_lp_token.to_account_info(),
            authority: pool_info,
        };
        let cpi_context_mint = CpiContext::new(cpi_program.clone(), mint_accounts)
            .with_signer(&signer_seeds);
        token::mint_to(cpi_context_mint, lp_tokens)?;
        
        // Update LP token supply
        pool.lp_token_supply = pool.lp_token_supply.checked_add(lp_tokens).unwrap();
        
        Ok(())
    }

    /// Remove liquidity from the AMM pool
    pub fn remove_liquidity(ctx: Context<RemoveLiquidity>, lp_amount: u64) -> Result<()> {
        let pool = &ctx.accounts.amm_pool;
        let total_supply = pool.lp_token_supply;
        
        // Calculate amounts to receive based on LP share
        let amount_a = lp_amount
            .checked_mul(pool.reserve_a)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(total_supply)
            .ok_or(ErrorCode::MathOverflow)?;
            
        let amount_b = lp_amount
            .checked_mul(pool.reserve_b)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(total_supply)
            .ok_or(ErrorCode::MathOverflow)?;
            
        require!(amount_a > 0 && amount_b > 0, ErrorCode::InsufficientLiquidity);
        
        // Prepare pool authority seeds for signing (need to get these before burning)
        let bump = ctx.accounts.amm_pool.bump;
        let seed = ctx.accounts.amm_pool.seed;
        
        // Burn LP tokens
        let burn_accounts = Burn {
            mint: ctx.accounts.lp_token_mint.to_account_info(),
            from: ctx.accounts.provider_lp_token.to_account_info(),
            authority: ctx.accounts.provider.to_account_info(),
        };
        token::burn(CpiContext::new(ctx.accounts.token_program.to_account_info(), burn_accounts), lp_amount)?;
        
        // Prepare pool authority seeds for signing
        let seed_bytes = seed.to_le_bytes();
        let bump_array = [bump];
        let authority_seeds = &[b"amm", seed_bytes.as_ref(), bump_array.as_ref()];
        let signer_seeds = [&authority_seeds[..]];
        
        // Transfer Token A to provider (signed by pool)
        let transfer_a = Transfer {
            from: ctx.accounts.token_a_vault.to_account_info(),
            to: ctx.accounts.provider_token_a.to_account_info(),
            authority: ctx.accounts.amm_pool.to_account_info(),
        };
        let cpi_context_a = CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_a)
            .with_signer(&signer_seeds);
        token::transfer(cpi_context_a, amount_a)?;
        
        // Transfer Token B to provider (signed by pool)
        let transfer_b = Transfer {
            from: ctx.accounts.token_b_vault.to_account_info(),
            to: ctx.accounts.provider_token_b.to_account_info(),
            authority: ctx.accounts.amm_pool.to_account_info(),
        };
        let cpi_context_b = CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_b)
            .with_signer(&signer_seeds);
        token::transfer(cpi_context_b, amount_b)?;
        
        // Update reserves and supply
        let pool = &mut ctx.accounts.amm_pool;
        pool.reserve_a = pool.reserve_a.checked_sub(amount_a).unwrap();
        pool.reserve_b = pool.reserve_b.checked_sub(amount_b).unwrap();
        pool.lp_token_supply = pool.lp_token_supply.checked_sub(lp_amount).unwrap();
        
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
        space = 8 + 32 * 4 + 8 + 8 + 8 + 1 + 32 + 8 + 8, // ✅ Updated space for lp_token_mint
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
    /// CHECK: LP Token Mint - must be initialized with 0 supply
    pub lp_token_mint: UncheckedAccount<'info>,
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
    #[account(mut)]
    pub lp_token_mint: Account<'info, anchor_spl::token::Mint>,  // ✅ LP Token Mint
    #[account(mut)]
    pub provider_lp_token: Account<'info, TokenAccount>,  // ✅ Provider's LP Token account
    pub token_program: Program<'info, anchor_spl::token::Token>,
    /// CHECK: Validated by program logic
    pub token_a_mint: UncheckedAccount<'info>,
    /// CHECK: Validated by program logic
    pub token_b_mint: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
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
    #[account(mut)]
    pub lp_token_mint: Account<'info, anchor_spl::token::Mint>,  // ✅ LP Token Mint
    #[account(mut)]
    pub provider_lp_token: Account<'info, TokenAccount>,  // ✅ Provider's LP Token account to burn from
    pub token_program: Program<'info, anchor_spl::token::Token>,
    /// CHECK: Validated by program logic
    pub token_a_mint: UncheckedAccount<'info>,
    /// CHECK: Validated by program logic
    pub token_b_mint: UncheckedAccount<'info>,
}
