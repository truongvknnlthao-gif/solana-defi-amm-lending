use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

pub mod instructions;
pub mod state;

use instructions::*;

#[program]
pub mod amm {
    use super::*;

    /// Initialize the AMM pool
    pub fn initialize(ctx: Context<Initialize>, seed: u64, fee: u16) -> Result<()> {
        instructions::initialize(ctx, seed, fee)
    }

    /// Swap tokens in the AMM pool
    pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
        instructions::swap(ctx, amount_in, minimum_amount_out)
    }

    /// Add liquidity to the AMM pool
    pub fn add_liquidity(ctx: Context<AddLiquidity>, amount_a: u64, amount_b: u64) -> Result<()> {
        instructions::add_liquidity(ctx, amount_a, amount_b)
    }
}
