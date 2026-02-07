//! AMM Math Module
//! Implements Constant Product Formula: x * y = k

use anchor_lang::prelude::*;

/// Constant Product AMM formula implementation
pub struct AMM;

impl AMM {
    /// Fee denominator for 0.3% fee (1000 = 0.3%)
    const FEE_DENOMINATOR: u64 = 1000;
    /// Fee numerator (3 = 0.3%)
    const FEE_NUMERATOR: u64 = 3;

    /// Calculate swap output amount given input amount
    /// Uses constant product formula: x * y = k
    /// dy = (y * dx) / (x + dx)
    /// After fee: dy = (y * dx * (1 - fee)) / (x + dx * (1 - fee))
    pub fn calculate_swap_output(
        amount_in: u64,
        reserve_in: u64,
        reserve_out: u64,
    ) -> Result<u64> {
        require!(amount_in > 0, AMMErrorCode::InvalidAmount);
        require!(reserve_in > 0 && reserve_out > 0, AMMErrorCode::InsufficientLiquidity);

        // Calculate 0.3% fee
        let fee = amount_in
            .checked_mul(Self::FEE_NUMERATOR)
            .ok_or(AMMErrorCode::MathOverflow)?
            .checked_div(Self::FEE_DENOMINATOR)
            .ok_or(AMMErrorCode::MathOverflow)?;

        // Amount after fee
        let amount_in_after_fee = amount_in
            .checked_sub(fee)
            .ok_or(AMMErrorCode::MathOverflow)?;

        // Calculate output using constant product formula
        // dy = (reserve_out * amount_in_after_fee) / (reserve_in + amount_in_after_fee)
        let numerator = reserve_out
            .checked_mul(amount_in_after_fee)
            .ok_or(AMMErrorCode::MathOverflow)?;

        let denominator = reserve_in
            .checked_add(amount_in_after_fee)
            .ok_or(AMMErrorCode::MathOverflow)?;

        let amount_out = numerator
            .checked_div(denominator)
            .ok_or(AMMErrorCode::MathOverflow)?;

        require!(amount_out > 0, AMMErrorCode::InsufficientOutputAmount);

        Ok(amount_out)
    }

    /// Calculate swap input amount given desired output amount
    /// Used when you want to know how much input is needed for a target output
    /// dx = (x * dy) / (y - dy)
    pub fn calculate_swap_input(
        amount_out: u64,
        reserve_in: u64,
        reserve_out: u64,
    ) -> Result<u64> {
        require!(amount_out > 0, AMMErrorCode::InvalidAmount);
        require!(amount_out < reserve_out, AMMErrorCode::InsufficientLiquidity);

        // dx = (x * dy) / (y - dy)
        let numerator = reserve_in
            .checked_mul(amount_out)
            .ok_or(AMMErrorCode::MathOverflow)?;

        let denominator = reserve_out
            .checked_sub(amount_out)
            .ok_or(AMMErrorCode::MathOverflow)?;

        let dx = numerator
            .checked_div(denominator)
            .ok_or(AMMErrorCode::MathOverflow)?;

        // Add 0.3% fee to input
        // The fee is on the input, so we need to calculate the required input
        // amount including fee: dx_with_fee = dx / (1 - fee)
        let fee_numerator = Self::FEE_DENOMINATOR
            .checked_sub(Self::FEE_NUMERATOR)
            .ok_or(AMMErrorCode::MathOverflow)?;

        let amount_in = dx
            .checked_mul(Self::FEE_DENOMINATOR)
            .ok_or(AMMErrorCode::MathOverflow)?
            .checked_div(fee_numerator)
            .ok_or(AMMErrorCode::MathOverflow)?;

        Ok(amount_in)
    }

    /// Calculate LP tokens to mint when adding liquidity
    /// Uses geometric mean for fair LP token distribution
    /// LP = (amount_a * amount_b)^0.5 / (1 - fee)^n
    /// Simplified: LP = min(amount_a / reserve_a, amount_b / reserve_b) * total_lp
    pub fn calculate_lp_tokens_mint(
        amount_a: u64,
        amount_b: u64,
        reserve_a: u64,
        reserve_b: u64,
        total_lp_supply: u64,
    ) -> Result<u64> {
        require!(amount_a > 0 && amount_b > 0, AMMErrorCode::InvalidAmount);

        if total_lp_supply == 0 {
            // First liquidity provider: LP = sqrt(amount_a * amount_b)
            let lp_tokens = Self::sqrt(
                amount_a
                    .checked_mul(amount_b)
                    .ok_or(AMMErrorCode::MathOverflow)?,
            );
            return Ok(lp_tokens);
        }

        // Calculate tokens based on smaller ratio to ensure price stability
        let lp_a = amount_a
            .checked_mul(total_lp_supply)
            .ok_or(AMMErrorCode::MathOverflow)?
            .checked_div(reserve_a)
            .ok_or(AMMErrorCode::MathOverflow)?;

        let lp_b = amount_b
            .checked_mul(total_lp_supply)
            .ok_or(AMMErrorCode::MathOverflow)?
            .checked_div(reserve_b)
            .ok_or(AMMErrorCode::MathOverflow)?;

        Ok(std::cmp::min(lp_a, lp_b))
    }

    /// Calculate tokens to receive when removing liquidity
    pub fn calculate_lp_tokens_burn(
        lp_tokens: u64,
        total_lp_supply: u64,
        reserve_a: u64,
        reserve_b: u64,
    ) -> Result<(u64, u64)> {
        require!(lp_tokens > 0, AMMErrorCode::InvalidAmount);
        require!(lp_tokens <= total_lp_supply, AMMErrorCode::InsufficientLPTokens);

        let amount_a = lp_tokens
            .checked_mul(reserve_a)
            .ok_or(AMMErrorCode::MathOverflow)?
            .checked_div(total_lp_supply)
            .ok_or(AMMErrorCode::MathOverflow)?;

        let amount_b = lp_tokens
            .checked_mul(reserve_b)
            .ok_or(AMMErrorCode::MathOverflow)?
            .checked_div(total_lp_supply)
            .ok_or(AMMErrorCode::MathOverflow)?;

        Ok((amount_a, amount_b))
    }

    /// Calculate price impact of a swap
    /// Returns the percentage of price impact (in basis points)
    pub fn calculate_price_impact(
        amount_in: u64,
        reserve_in: u64,
        reserve_out: u64,
    ) -> Result<u64> {
        let amount_out = Self::calculate_swap_output(amount_in, reserve_in, reserve_out)?;

        // Original price: reserve_out / reserve_in
        // New price after swap: (reserve_out - amount_out) / (reserve_in + amount_in)
        let original_price = reserve_out
            .checked_mul(10000)
            .ok_or(AMMErrorCode::MathOverflow)?
            .checked_div(reserve_in)
            .ok_or(AMMErrorCode::MathOverflow)?;

        let new_price = reserve_out
            .checked_sub(amount_out)
            .ok_or(AMMErrorCode::MathOverflow)?
            .checked_mul(10000)
            .ok_or(AMMErrorCode::MathOverflow)?
            .checked_div(
                reserve_in
                    .checked_add(amount_in)
                    .ok_or(AMMErrorCode::MathOverflow)?,
            )
            .ok_or(AMMErrorCode::MathOverflow)?;

        // Price impact = (original - new) / original * 100%
        // In basis points (1% = 100 bps)
        if original_price > new_price {
            let impact = original_price
                .checked_sub(new_price)
                .ok_or(AMMErrorCode::MathOverflow)?
                .checked_mul(10000)
                .ok_or(AMMErrorCode::MathOverflow)?
                .checked_div(original_price)
                .ok_or(AMMErrorCode::MathOverflow)?;
            Ok(impact)
        } else {
            Ok(0)
        }
    }

    /// Calculate the constant product k (x * y)
    pub fn calculate_k(reserve_a: u64, reserve_b: u64) -> u128 {
        reserve_a as u128 * reserve_b as u128
    }

    /// Square root using integer arithmetic (Newton's method)
    pub fn sqrt(n: u64) -> u64 {
        if n == 0 {
            return 0;
        }

        let mut x = n;
        let mut y = (x + 1) / 2;

        while y < x {
            x = y;
            y = (n / x + x) / 2;
        }

        x
    }

    /// Get the trading fee rate
    pub fn get_fee_rate() -> u64 {
        Self::FEE_NUMERATOR
    }

    /// Get the fee denominator
    pub fn get_fee_denominator() -> u64 {
        Self::FEE_DENOMINATOR
    }
}

/// AMM-specific error codes
#[error_code]
pub enum AMMErrorCode {
    #[msg("Invalid amount provided")]
    InvalidAmount,
    #[msg("Insufficient liquidity in the pool")]
    InsufficientLiquidity,
    #[msg("Insufficient output amount")]
    InsufficientOutputAmount,
    #[msg("Math operation overflow")]
    MathOverflow,
    #[msg("Slippage limit exceeded")]
    SlippageExceeded,
    #[msg("Insufficient LP tokens")]
    InsufficientLPTokens,
    #[msg("Price impact too high")]
    PriceImpactTooHigh,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_swap_output_basic() {
        // Test basic swap: 1000 USDC -> SOL with 100000 USDC and 1000 SOL
        let amount_in = 1000;
        let reserve_in = 100000;
        let reserve_out = 1000;

        let result = AMM::calculate_swap_output(amount_in, reserve_in, reserve_out);
        assert!(result.is_ok());
        let amount_out = result.unwrap();
        
        // Should receive less than input due to constant product
        assert!(amount_out > 0);
        assert!(amount_out < amount_in);
    }

    #[test]
    fn test_calculate_swap_output_fee() {
        // Test that 0.3% fee is applied correctly
        let amount_in = 1000;
        let reserve_in = 100000;
        let reserve_out = 100000;

        let result = AMM::calculate_swap_output(amount_in, reserve_in, reserve_out);
        assert!(result.is_ok());
        let amount_out = result.unwrap();

        // With 0.3% fee, effective input is 997
        // Output should be approximately 997 * 100000 / 100997 ≈ 987
        assert_eq!(amount_out, 987);
    }

    #[test]
    fn test_calculate_swap_input() {
        // Test reverse calculation
        let reserve_in = 100000;
        let reserve_out = 1000;
        let desired_output = 100;

        let result = AMM::calculate_swap_input(desired_output, reserve_in, reserve_out);
        assert!(result.is_ok());
        let amount_in = result.unwrap();

        // Verify by calculating output
        let output = AMM::calculate_swap_output(amount_in, reserve_in, reserve_out);
        assert!(output.is_ok());
        
        // Output should be at least the desired amount (within rounding)
        assert!(output.unwrap() >= desired_output);
    }

    #[test]
    fn test_calculate_lp_tokens_first_provider() {
        // First LP provider
        let amount_a = 10000;
        let amount_b = 1000;
        let reserve_a = 0;
        let reserve_b = 0;
        let total_lp = 0;

        let result = AMM::calculate_lp_tokens_mint(amount_a, amount_b, reserve_a, reserve_b, total_lp);
        assert!(result.is_ok());
        let lp_tokens = result.unwrap();

        // sqrt(10000 * 1000) = sqrt(10000000) = 3162
        assert_eq!(lp_tokens, 3162);
    }

    #[test]
    fn test_calculate_lp_tokens_subsequent_provider() {
        // Subsequent LP provider
        let amount_a = 1000;
        let amount_b = 100;
        let reserve_a = 10000;
        let reserve_b = 1000;
        let total_lp = 3162;

        let result = AMM::calculate_lp_tokens_mint(amount_a, amount_b, reserve_a, reserve_b, total_lp);
        assert!(result.is_ok());
        let lp_tokens = result.unwrap();

        // Should provide liquidity proportionally
        assert!(lp_tokens > 0);
        assert!(lp_tokens < total_lp);
    }

    #[test]
    fn test_calculate_lp_tokens_burn() {
        let lp_tokens = 100;
        let total_lp_supply = 3162;
        let reserve_a = 10000;
        let reserve_b = 1000;

        let result = AMM::calculate_lp_tokens_burn(lp_tokens, total_lp_supply, reserve_a, reserve_b);
        assert!(result.is_ok());
        let (amount_a, amount_b) = result.unwrap();

        // Verify: (100 / 3162) * 10000 ≈ 316
        assert_eq!(amount_a, 316);
        assert_eq!(amount_b, 31);
    }

    #[test]
    fn test_constant_product() {
        let reserve_a = 100000;
        let reserve_b = 1000;

        let k = AMM::calculate_k(reserve_a, reserve_b);
        assert_eq!(k, 100000000);
    }

    #[test]
    fn test_sqrt() {
        assert_eq!(AMM::sqrt(0), 0);
        assert_eq!(AMM::sqrt(1), 1);
        assert_eq!(AMM::sqrt(4), 2);
        assert_eq!(AMM::sqrt(9), 3);
        assert_eq!(AMM::sqrt(16), 4);
        assert_eq!(AMM::sqrt(10000000000), 100000);
    }

    #[test]
    fn test_price_impact() {
        let amount_in = 10000;
        let reserve_in = 100000;
        let reserve_out = 1000;

        let impact = AMM::calculate_price_impact(amount_in, reserve_in, reserve_out);
        assert!(impact.is_ok());
        let impact_bps = impact.unwrap();

        // Large swap should have significant price impact
        assert!(impact_bps > 0);
        // 10000 is 10% of reserve, so impact should be noticeable
    }

    #[test]
    #[should_panic(expected = "InvalidAmount")]
    fn test_swap_zero_amount() {
        AMM::calculate_swap_output(0, 100000, 1000).unwrap();
    }

    #[test]
    #[should_panic(expected = "InsufficientLiquidity")]
    fn test_swap_zero_reserves() {
        AMM::calculate_swap_output(1000, 0, 0).unwrap();
    }

    #[test]
    fn test_swap_large_amount() {
        // Large swap that might cause significant price impact
        let amount_in = 50000;
        let reserve_in = 100000;
        let reserve_out = 1000;

        let result = AMM::calculate_swap_output(amount_in, reserve_in, reserve_out);
        assert!(result.is_ok());
        let amount_out = result.unwrap();

        // Should receive a portion of the reserve
        assert!(amount_out > 0);
        assert!(amount_out < reserve_out);
    }

    #[test]
    fn test_fee_calculation() {
        assert_eq!(AMM::get_fee_rate(), 3);
        assert_eq!(AMM::get_fee_denominator(), 1000);
        
        // Verify 0.3% calculation
        let amount = 1000;
        let fee = amount * 3 / 1000;
        assert_eq!(fee, 3);
    }

    #[test]
    fn test_symmetric_swap() {
        // Equal reserves should give symmetric results
        let reserve_a = 100000;
        let reserve_b = 100000;

        let a_to_b = AMM::calculate_swap_output(1000, reserve_a, reserve_b).unwrap();
        let b_to_a = AMM::calculate_swap_output(1000, reserve_b, reserve_a).unwrap();

        // Should be equal for symmetric reserves
        assert_eq!(a_to_b, b_to_a);
    }

    #[test]
    fn test_imbalanced_pool() {
        // Highly imbalanced pool
        let reserve_a = 1000000;
        let reserve_b = 10000;

        // Small swap from large reserve to small reserve
        let amount_in = 1000;
        let result = AMM::calculate_swap_output(amount_in, reserve_a, reserve_b);
        assert!(result.is_ok());
        
        // Output should be significant relative to small reserve
        let amount_out = result.unwrap();
        assert!(amount_out > 0);
        
        // Price impact should be higher for small reserve
        let impact = AMM::calculate_price_impact(amount_in, reserve_a, reserve_b).unwrap();
        assert!(impact > 0);
    }
}
