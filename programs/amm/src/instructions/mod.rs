use anchor_lang::prelude::*;

pub mod initialize;
pub mod swap;
pub mod add_liquidity;

use initialize::*;
use swap::*;
use add_liquidity::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 8 + 8,
        seeds = [b"amm", seed.to_le_bytes().as_ref()],
        bump
    )]
    pub amm_pool: Account<'info, AmmPool>,
    pub token_a_mint: Account<'info, Mint>,
    pub token_b_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = authority,
        token::mint = token_a_mint,
        token::authority = amm_pool,
    )]
    pub token_a_vault: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = authority,
        token::mint = token_b_mint,
        token::authority = amm_pool,
    )]
    pub token_b_vault: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"amm", amm_pool.seed.to_le_bytes().as_ref()],
        bump = amm_pool.bump,
        has_one = token_a_mint,
        has_one = token_b_mint,
    )]
    pub amm_pool: Account<'info, AmmPool>,
    pub token_a_mint: Account<'info, Mint>,
    pub token_b_mint: Account<'info, Mint>,
    #[account(
        mut,
        token::mint = token_a_mint,
        token::authority = user,
    )]
    pub user_token_a: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = token_b_mint,
        token::authority = user,
    )]
    pub user_token_b: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = token_a_mint,
        token::authority = amm_pool,
    )]
    pub token_a_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = token_b_mint,
        token::authority = amm_pool,
    )]
    pub token_b_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
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
    #[account(
        mut,
        token::mint = token_a_mint,
        token::authority = provider,
    )]
    pub provider_token_a: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = token_b_mint,
        token::authority = provider,
    )]
    pub provider_token_b: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = token_a_mint,
        token::authority = amm_pool,
    )]
    pub token_a_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = token_b_mint,
        token::authority = amm_pool,
    )]
    pub token_b_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}
