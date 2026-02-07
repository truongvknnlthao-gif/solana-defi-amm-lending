import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Amm } from '../target/types/amm';
import { 
  PublicKey, 
  SystemProgram, 
  Keypair, 
  Transaction,
  Connection,
  Commitment
} from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  transfer,
  createAssociatedTokenAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError
} from '@solana/spl-token';
import { assert } from 'chai';

describe('AMM Tests', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Amm as Program<Amm>;
  
  // Test accounts
  let authority = Keypair.generate();
  let tokenA = Keypair.generate();
  let tokenB = Keypair.generate();
  let lpMint = Keypair.generate();
  
  let authorityTokenA = null;
  let authorityTokenB = null;
  
  // Pool PDA
  let poolPda = null;
  let poolTokenA = null;
  let poolTokenB = null;
  let poolLpToken = null;

  const FEE_RATE = 3; // 0.3%
  const SEED = 12345;

  before(async () => {
    // Airdrop SOL for testing
    const signature = await provider.connection.requestAirdrop(
      authority.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Create token A
    tokenA = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      authority.publicKey,
      9
    );

    // Create token B
    tokenB = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      authority.publicKey,
      9
    );

    // Get ATA for authority
    authorityTokenA = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority,
      tokenA,
      authority.publicKey
    );

    authorityTokenB = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority,
      tokenB,
      authority.publicKey
    );

    // Mint tokens to authority
    await mintTo(
      provider.connection,
      authority,
      tokenA,
      authorityTokenA.address,
      authority,
      1000000000 // 1 billion
    );

    await mintTo(
      provider.connection,
      authority,
      tokenB,
      authorityTokenB.address,
      authority,
      1000000000 // 1 billion
    );

    console.log('Token A:', tokenA.toString());
    console.log('Token B:', tokenB.toString());
    console.log('Authority Token A:', authorityTokenA.address.toString());
    console.log('Authority Token B:', authorityTokenB.address.toString());
  });

  describe('Initialize Pool', () => {
    it('Initialize AMM Pool', async () => {
      // Find PDA for pool
      const [poolPdaKey, bump] = await PublicKey.findProgramAddress(
        [
          Buffer.from('amm_pool'),
          new anchor.BN(SEED).toArrayLike(Buffer, 'le', 8),
          tokenA.toBuffer(),
          tokenB.toBuffer()
        ],
        program.programId
      );
      poolPda = poolPdaKey;

      console.log('Pool PDA:', poolPda.toString());

      // Derive token accounts
      const [poolTokenAKey] = await PublicKey.findProgramAddress(
        [Buffer.from('pool_token_a'), poolPda.toBuffer()],
        program.programId
      );
      poolTokenA = poolTokenAKey;

      const [poolTokenBKey] = await PublicKey.findProgramAddress(
        [Buffer.from('pool_token_b'), poolPda.toBuffer()],
        program.programId
      );
      poolTokenB = poolTokenBKey;

      const [poolLpTokenKey] = await PublicKey.findProgramAddress(
        [Buffer.from('pool_lp_token'), poolPda.toBuffer()],
        program.programId
      );
      poolLpToken = poolLpTokenKey;

      try {
        await program.methods
          .initialize(new anchor.BN(SEED), FEE_RATE)
          .accounts({
            authority: authority.publicKey,
            tokenA: tokenA,
            tokenB: tokenB,
            pool: poolPda,
            poolTokenA: poolTokenA,
            poolTokenB: poolTokenB,
            poolLpToken: poolLpToken,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([authority])
          .rpc();

        console.log('Pool initialized successfully');
      } catch (e) {
        console.error('Initialize error:', e);
        throw e;
      }
    });
  });

  describe('Add Liquidity', () => {
    it('Add initial liquidity', async () => {
      const amountA = new anchor.BN(100000000); // 100 million
      const amountB = new anchor.BN(50000000);  // 50 million

      try {
        await program.methods
          .addLiquidity(amountA, amountB)
          .accounts({
            authority: authority.publicKey,
            tokenA: tokenA,
            tokenB: tokenB,
            pool: poolPda,
            poolTokenA: poolTokenA,
            poolTokenB: poolTokenB,
            poolLpToken: poolLpToken,
            authorityTokenA: authorityTokenA.address,
            authorityTokenB: authorityTokenB.address,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([authority])
          .rpc();

        console.log('Initial liquidity added');
      } catch (e) {
        console.error('Add liquidity error:', e);
        throw e;
      }
    });

    it('Add more liquidity proportionally', async () => {
      // Add more liquidity in same proportion
      const amountA = new anchor.BN(50000000); // 50 million
      const amountB = new anchor.BN(25000000); // 25 million

      try {
        await program.methods
          .addLiquidity(amountA, amountB)
          .accounts({
            authority: authority.publicKey,
            tokenA: tokenA,
            tokenB: tokenB,
            pool: poolPda,
            poolTokenA: poolTokenA,
            poolTokenB: poolTokenB,
            poolLpToken: poolLpToken,
            authorityTokenA: authorityTokenA.address,
            authorityTokenB: authorityTokenB.address,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([authority])
          .rpc();

        console.log('Additional liquidity added');
      } catch (e) {
        console.error('Add liquidity error:', e);
        throw e;
      }
    });
  });

  describe('Swap', () => {
    it('Swap TokenA for TokenB', async () => {
      const user = Keypair.generate();
      
      // Airdrop to user
      const airdropSig = await provider.connection.requestAirdrop(
        user.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      // Create user token accounts
      const userTokenA = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user,
        tokenA,
        user.publicKey
      );

      const userTokenB = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user,
        tokenB,
        user.publicKey
      );

      // Transfer some tokenA to user
      await transfer(
        provider.connection,
        authority,
        authorityTokenA.address,
        userTokenA.address,
        authority,
        10000000 // 10 million
      );

      const amountIn = new anchor.BN(1000000); // 1 million
      const minAmountOut = new anchor.BN(400000); // Minimum 0.4 million expected

      try {
        const tx = await program.methods
          .swap(amountIn, minAmountOut)
          .accounts({
            user: user.publicKey,
            inputToken: userTokenA.address,
            outputToken: userTokenB.address,
            pool: poolPda,
            poolTokenA: poolTokenA,
            poolTokenB: poolTokenB,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();

        console.log('Swap TokenA -> TokenB successful, tx:', tx);
      } catch (e) {
        console.error('Swap error:', e);
        throw e;
      }
    });

    it('Swap TokenB for TokenA', async () => {
      const user = Keypair.generate();
      
      // Airdrop to user
      const airdropSig = await provider.connection.requestAirdrop(
        user.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      // Create user token accounts
      const userTokenA = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user,
        tokenA,
        user.publicKey
      );

      const userTokenB = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user,
        tokenB,
        user.publicKey
      );

      // Transfer some tokenB to user
      await transfer(
        provider.connection,
        authority,
        authorityTokenB.address,
        userTokenB.address,
        authority,
        10000000 // 10 million
      );

      const amountIn = new anchor.BN(1000000); // 1 million
      const minAmountOut = new anchor.BN(1800000); // Minimum 1.8 million expected

      try {
        const tx = await program.methods
          .swap(amountIn, minAmountOut)
          .accounts({
            user: user.publicKey,
            inputToken: userTokenB.address,
            outputToken: userTokenA.address,
            pool: poolPda,
            poolTokenA: poolTokenA,
            poolTokenB: poolTokenB,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();

        console.log('Swap TokenB -> TokenA successful, tx:', tx);
      } catch (e) {
        console.error('Swap error:', e);
        throw e;
      }
    });
  });

  describe('Remove Liquidity', () => {
    it('Remove liquidity', async () => {
      // Get pool info to calculate LP tokens to burn
      const poolAccount = await program.account.ammPool.fetch(poolPda);
      const lpSupply = poolAccount.lpSupply;
      const reserveA = poolAccount.reserveA;
      const reserveB = poolAccount.reserveB;

      // Burn 10% of LP tokens
      const lpToBurn = lpSupply.div(new anchor.BN(10));

      console.log(`Burning ${lpToBurn.toString()} LP tokens`);
      console.log(`Expected return: ${reserveA.div(new anchor.BN(10)).toString()} TokenA, ${reserveB.div(new anchor.BN(10)).toString()} TokenB`);

      try {
        await program.methods
          .removeLiquidity(lpToBurn)
          .accounts({
            authority: authority.publicKey,
            tokenA: tokenA,
            tokenB: tokenB,
            pool: poolPda,
            poolTokenA: poolTokenA,
            poolTokenB: poolTokenB,
            poolLpToken: poolLpToken,
            authorityTokenA: authorityTokenA.address,
            authorityTokenB: authorityTokenB.address,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([authority])
          .rpc();

        console.log('Liquidity removed successfully');
      } catch (e) {
        console.error('Remove liquidity error:', e);
        throw e;
      }
    });
  });

  describe('Edge Cases', () => {
    it('Should fail with zero swap amount', async () => {
      const user = Keypair.generate();
      
      // Airdrop to user
      const airdropSig = await provider.connection.requestAirdrop(
        user.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      const userTokenA = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user,
        tokenA,
        user.publicKey
      );

      const userTokenB = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user,
        tokenB,
        user.publicKey
      );

      try {
        await program.methods
          .swap(new anchor.BN(0), new anchor.BN(1))
          .accounts({
            user: user.publicKey,
            inputToken: userTokenA.address,
            outputToken: userTokenB.address,
            pool: poolPda,
            poolTokenA: poolTokenA,
            poolTokenB: poolTokenB,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();
        
        assert.fail('Should have thrown an error');
      } catch (e) {
        console.log('Expected error for zero swap:', e.message);
        assert(e.message.includes('InvalidAmount') || e.message.includes('0'));
      }
    });

    it('Should fail with excessive slippage', async () => {
      const user = Keypair.generate();
      
      const airdropSig = await provider.connection.requestAirdrop(
        user.publicKey,
        anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      const userTokenA = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user,
        tokenA,
        user.publicKey
      );

      const userTokenB = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user,
        tokenB,
        user.publicKey
      );

      await transfer(
        provider.connection,
        authority,
        authorityTokenA.address,
        userTokenA.address,
        authority,
        1000000
      );

      try {
        // Set extremely low min amount out (should fail)
        await program.methods
          .swap(new anchor.BN(1000000), new anchor.BN(999999999))
          .accounts({
            user: user.publicKey,
            inputToken: userTokenA.address,
            outputToken: userTokenB.address,
            pool: poolPda,
            poolTokenA: poolTokenA,
            poolTokenB: poolTokenB,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user])
          .rpc();
        
        assert.fail('Should have thrown slippage error');
      } catch (e) {
        console.log('Expected slippage error:', e.message);
        assert(e.message.includes('Slippage') || e.message.includes('0x'));
      }
    });
  });
});

// Helper functions for AMM math in TypeScript
export function calculateSwapOutput(
  amountIn: number,
  reserveIn: number,
  reserveOut: number,
  feeRate: number = 3,
  feeDenominator: number = 1000
): number {
  const fee = Math.floor(amountIn * feeRate / feeDenominator);
  const amountInAfterFee = amountIn - fee;
  return Math.floor(reserveOut * amountInAfterFee / (reserveIn + amountInAfterFee));
}

export function calculateSwapInput(
  amountOut: number,
  reserveIn: number,
  reserveOut: number,
  feeRate: number = 3,
  feeDenominator: number = 1000
): number {
  const dx = Math.floor(reserveIn * amountOut / (reserveOut - amountOut));
  return Math.floor(dx * feeDenominator / (feeDenominator - feeRate));
}

export function calculateLpTokens(
  amountA: number,
  amountB: number,
  reserveA: number,
  reserveB: number,
  totalLp: number
): number {
  if (totalLp === 0) {
    return Math.floor(Math.sqrt(amountA * amountB));
  }
  const lpA = Math.floor(amountA * totalLp / reserveA);
  const lpB = Math.floor(amountB * totalLp / reserveB);
  return Math.min(lpA, lpB);
}

export function calculateLpBurn(
  lpTokens: number,
  totalLp: number,
  reserveA: number,
  reserveB: number
): [number, number] {
  return [
    Math.floor(lpTokens * reserveA / totalLp),
    Math.floor(lpTokens * reserveB / totalLp)
  ];
}
