use anchor_lang::prelude::*;

#[account]
pub struct LendingPool {
    pub authority: Pubkey,         // 管理员
    pub bump: u8,                  // PDA bump
    pub collateral_mint: Pubkey,   // 抵押品 Mint
    pub debt_mint: Pubkey,         // 债务 Token Mint
    pub collateral_vault: Pubkey,  // 抵押品 Vault
    pub debt_vault: Pubkey,        // 债务 Vault
    pub total_collateral: u64,     // 总抵押
    pub total_debt: u64,           // 总债务
    pub collateral_ratio: u16,     // 抵押率 (如 150% = 15000)
    pub interest_rate: u16,        // 利率 (如 5% = 500)
}

#[account]
pub struct Obligation {
    pub owner: Pubkey,             // 所有者
    pub bump: u8,                  // PDA bump
    pub deposited: u64,            // 已存入抵押品
    pub borrowed: u64,             // 已借款
    pub last_update: i64,          // 最后更新时间
}
