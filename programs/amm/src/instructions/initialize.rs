use anchor_lang::prelude::*;

use crate::state::*;

pub fn initialize(ctx: Context<Initialize>, seed: u64, fee: u16) -> Result<()> {
    let pool = &mut ctx.accounts.amm_pool;
    pool.seed = seed;
    pool.fee = fee;
    pool.bump = ctx.bumps.amm_pool;
    pool.token_a_mint = ctx.accounts.token_a_mint.key();
    pool.token_b_mint = ctx.accounts.token_b_mint.key();
    pool.token_a_vault = ctx.accounts.token_a_vault.key();
    pool.token_b_vault = ctx.accounts.token_b_vault.key();
    pool.lp_token_supply = 0;
    pool.reserve_a = 0;
    pool.reserve_b = 0;
    Ok(())
}
