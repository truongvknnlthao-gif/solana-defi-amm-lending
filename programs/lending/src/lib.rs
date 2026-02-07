use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Mint, Transfer};
use crate::state::{LendingPool, Obligation};
use crate::errors::LendingError;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub mod state;
pub mod errors;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<LendingPool>(),
        seeds = [b"lending_pool", authority.key().as_ref()],
        bump
    )]
    pub lending_pool: Account<'info, LendingPool>,
    
    #[account(
        init,
        payer = authority,
        token::mint = collateral_mint,
        token::authority = lending_pool,
        seeds = [b"collateral_vault", authority.key().as_ref()],
        bump
    )]
    pub collateral_vault: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        token::mint = debt_mint,
        token::authority = lending_pool,
        seeds = [b"debt_vault", authority.key().as_ref()],
        bump
    )]
    pub debt_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub collateral_mint: Account<'info, Mint>,
    pub debt_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct InitObligation<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + std::mem::size_of::<Obligation>(),
        seeds = [b"obligation", owner.key().as_ref()],
        bump
    )]
    pub obligation: Account<'info, Obligation>,
    
    #[account(
        mut,
        seeds = [b"lending_pool", lending_pool.authority.as_ref()],
        bump = lending_pool.bump
    )]
    pub lending_pool: Account<'info, LendingPool>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"obligation", owner.key().as_ref()],
        bump = obligation.bump,
        constraint = obligation.owner == owner.key()
    )]
    pub obligation: Account<'info, Obligation>,
    
    #[account(
        mut,
        associated_token::mint = lending_pool.collateral_mint,
        associated_token::authority = owner
    )]
    pub user_collateral: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = collateral_vault.key() == lending_pool.collateral_vault
    )]
    pub collateral_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"lending_pool", lending_pool.authority.as_ref()],
        bump = lending_pool.bump
    )]
    pub lending_pool: Account<'info, LendingPool>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, anchor_spl::token::Token>,
}

#[derive(Accounts)]
pub struct Borrow<'info> {
    #[account(
        mut,
        seeds = [b"obligation", owner.key().as_ref()],
        bump = obligation.bump,
        constraint = obligation.owner == owner.key()
    )]
    pub obligation: Account<'info, Obligation>,
    
    #[account(
        mut,
        constraint = debt_vault.key() == lending_pool.debt_vault
    )]
    pub debt_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = lending_pool.debt_mint,
        associated_token::authority = owner
    )]
    pub user_debt: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"lending_pool", lending_pool.authority.as_ref()],
        bump = lending_pool.bump
    )]
    pub lending_pool: Account<'info, LendingPool>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, anchor_spl::token::Token>,
}

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(
        mut,
        seeds = [b"obligation", owner.key().as_ref()],
        bump = obligation.bump,
        constraint = obligation.owner == owner.key()
    )]
    pub obligation: Account<'info, Obligation>,
    
    #[account(
        mut,
        constraint = debt_vault.key() == lending_pool.debt_vault
    )]
    pub debt_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = lending_pool.debt_mint,
        associated_token::authority = owner
    )]
    pub user_debt: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"lending_pool", lending_pool.authority.as_ref()],
        bump = lending_pool.bump
    )]
    pub lending_pool: Account<'info, LendingPool>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub token_program: Program<'info, anchor_spl::token::Token>,
}

#[program]
pub mod lending {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, bump: u8) -> Result<()> {
        let pool = &mut ctx.accounts.lending_pool;
        pool.authority = ctx.accounts.authority.key();
        pool.bump = bump;
        pool.collateral_mint = ctx.accounts.collateral_mint.key();
        pool.debt_mint = ctx.accounts.debt_mint.key();
        pool.collateral_vault = ctx.accounts.collateral_vault.key();
        pool.debt_vault = ctx.accounts.debt_vault.key();
        pool.total_collateral = 0;
        pool.total_debt = 0;
        pool.collateral_ratio = 15000; // 150%
        pool.interest_rate = 500;      // 5%
        Ok(())
    }

    pub fn init_obligation(ctx: Context<InitObligation>, bump: u8) -> Result<()> {
        let obligation = &mut ctx.accounts.obligation;
        obligation.owner = ctx.accounts.owner.key();
        obligation.bump = bump;
        obligation.deposited = 0;
        obligation.borrowed = 0;
        obligation.last_update = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, LendingError::InvalidAmount);
        
        let pool = &mut ctx.accounts.lending_pool;
        let obligation = &mut ctx.accounts.obligation;
        
        // Transfer collateral from user to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_collateral.to_account_info(),
            to: ctx.accounts.collateral_vault.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        anchor_spl::token::transfer(CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        ), amount)?;
        
        // Update state
        obligation.deposited = obligation.deposited.checked_add(amount).unwrap();
        pool.total_collateral = pool.total_collateral.checked_add(amount).unwrap();
        obligation.last_update = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    pub fn borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> {
        require!(amount > 0, LendingError::InvalidAmount);
        
        let pool = &mut ctx.accounts.lending_pool;
        let obligation = &mut ctx.accounts.obligation;
        
        // Calculate max borrow amount
        // max_borrow = deposited * collateral_ratio / 10000 - borrowed
        let max_borrow = obligation.deposited
            .checked_mul(pool.collateral_ratio as u64)
            .unwrap()
            .checked_div(10000)
            .unwrap()
            .checked_sub(obligation.borrowed)
            .unwrap();
        
        require!(amount <= max_borrow, LendingError::InsufficientCollateral);
        
        // Transfer debt tokens from vault to user
        let cpi_accounts = Transfer {
            from: ctx.accounts.debt_vault.to_account_info(),
            to: ctx.accounts.user_debt.to_account_info(),
            authority: pool.to_account_info(),
        };
        
        // Create PDA signer
        let seeds = &[
            b"lending_pool",
            pool.authority.as_ref(),
            &[pool.bump]
        ];
        let signer = &[&seeds[..]];
        
        anchor_spl::token::transfer(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        ), amount)?;
        
        // Update state
        obligation.borrowed = obligation.borrowed.checked_add(amount).unwrap();
        pool.total_debt = pool.total_debt.checked_add(amount).unwrap();
        obligation.last_update = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
        require!(amount > 0, LendingError::InvalidAmount);
        
        let pool = &mut ctx.accounts.lending_pool;
        let obligation = &mut ctx.accounts.obligation;
        
        require!(amount <= obligation.borrowed, LendingError::RepayExceedsDebt);
        
        // Transfer debt tokens from user to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_debt.to_account_info(),
            to: ctx.accounts.debt_vault.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        anchor_spl::token::transfer(CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        ), amount)?;
        
        // Update state
        obligation.borrowed = obligation.borrowed.checked_sub(amount).unwrap();
        pool.total_debt = pool.total_debt.checked_sub(amount).unwrap();
        obligation.last_update = Clock::get()?.unix_timestamp;
        
        Ok(())
    }
}
