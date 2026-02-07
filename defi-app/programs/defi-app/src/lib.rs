use anchor_lang::prelude::*;

declare_id!("8F4E1LHCdZmVDnw7N5jDWGsy5qv8DUNENFB1DPVyMggE");

#[program]
pub mod defi_app {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
