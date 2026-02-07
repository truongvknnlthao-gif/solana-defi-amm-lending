use anchor_lang::prelude::*;

pub mod deposit;
pub mod borrow;
pub mod repay;

use deposit::*;
use borrow::*;
use repay::*;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,
    #[account(
        init,
        payer = depositor,
        space = 8 + 32 + 32 + 8 + 8 + 8,
        seeds = [b"lending", depositor.key().as_ref()],
        bump
    )]
    pub lending_position: Account<'info, LendingPosition>,
    pub lending_pool: Account<'info, LendingPool>,
    #[account(
        mut,
        token::mint = lending_pool.collateral_mint,
        token::authority = depositor,
    )]
    pub depositor_collateral: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = lending_pool.collateral_mint,
        token::authority = lending_pool,
    )]
    pub pool_collateral_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(mut)]
    pub borrower: Signer<'info>,
    #[account(
        mut,
        seeds = [b"lending", borrower.key().as_ref()],
        bump = lending_position.bump,
        has_one = lending_pool,
    )]
    pub lending_position: Account<'info, LendingPosition>,
    #[account(
        mut,
        seeds = [b"pool"],
        bump = lending_pool.bump,
    )]
    pub lending_pool: Account<'info, LendingPool>,
    #[account(
        mut,
        token::mint = lending_pool.borrowable_mint,
        token::authority = borrower,
    )]
    pub borrower_borrowable: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = lending_pool.borrowable_mint,
        token::authority = lending_pool,
    )]
    pub pool_borrowable_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"lending", borrower.key().as_ref()],
        bump = lending_position.bump,
        has_one = lending_pool,
    )]
    pub lending_position: Account<'info, LendingPosition>,
    pub borrower: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"pool"],
        bump = lending_pool.bump,
    )]
    pub lending_pool: Account<'info, LendingPool>,
    #[account(
        mut,
        token::mint = lending_pool.borrowable_mint,
        token::authority = payer,
    )]
    pub payer_borrowable: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = lending_pool.borrowable_mint,
        token::authority = lending_pool,
    )]
    pub pool_borrowable_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}
