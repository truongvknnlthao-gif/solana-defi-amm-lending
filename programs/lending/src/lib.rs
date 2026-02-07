use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

pub mod instructions;
pub mod state;

use instructions::*;

#[program]
pub mod lending {
    use super::*;

    /// Deposit tokens into the lending pool
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit(ctx, amount)
    }

    /// Borrow tokens from the lending pool
    pub fn borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> {
        instructions::borrow(ctx, amount)
    }

    /// Repay borrowed tokens
    pub fn repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
        instructions::repay(ctx, amount)
    }
}
