import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Lending } from '../target/types/lending';
import { PublicKey, Keypair } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { expect } from 'chai';

describe('lending', () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.Lending as Program<Lending>;
  
  // Test accounts
  let authority: Keypair;
  let user: Keypair;
  let collateralMint: Token;
  let debtMint: Token;
  let userCollateralToken: PublicKey;
  let userDebtToken: PublicKey;
  
  // PDAs
  let lendingPoolPda: PublicKey;
  let collateralVaultPda: PublicKey;
  let debtVaultPda: PublicKey;
  let obligationPda: PublicKey;

  before(async () => {
    authority = Keypair.generate();
    user = Keypair.generate();

    // Airdrop SOL
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(authority.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL)
    );

    // Create collateral mint
    collateralMint = await Token.createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      9,
      TOKEN_PROGRAM_ID
    );

    // Create debt mint
    debtMint = await Token.createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      9,
      TOKEN_PROGRAM_ID
    );

    // Create token accounts
    userCollateralToken = await collateralMint.createAssociatedTokenAccount(user.publicKey);
    userDebtToken = await debtMint.createAssociatedTokenAccount(user.publicKey);

    // Mint tokens to user
    await collateralMint.mintTo(userCollateralToken, authority, [], 1000);
    await debtMint.mintTo(userDebtToken, authority, [], 1000);

    // Find PDAs
    [lendingPoolPda] = await PublicKey.findProgramAddress(
      [Buffer.from('lending_pool'), authority.publicKey.toBuffer()],
      program.programId
    );

    [collateralVaultPda] = await PublicKey.findProgramAddress(
      [Buffer.from('collateral_vault'), authority.publicKey.toBuffer()],
      program.programId
    );

    [debtVaultPda] = await PublicKey.findProgramAddress(
      [Buffer.from('debt_vault'), authority.publicKey.toBuffer()],
      program.programId
    );

    [obligationPda] = await PublicKey.findProgramAddress(
      [Buffer.from('obligation'), user.publicKey.toBuffer()],
      program.programId
    );
  });

  it('Initialize lending pool', async () => {
    const tx = await program.rpc.initialize(
      new anchor.BN(1), // bump
      {
        accounts: {
          lendingPool: lendingPoolPda,
          collateralVault: collateralVaultPda,
          debtVault: debtVaultPda,
          authority: authority.publicKey,
          collateralMint: collateralMint.publicKey,
          debtMint: debtMint.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [authority],
      }
    );

    console.log('Initialize transaction signature:', tx);

    // Verify pool state
    const poolAccount = await program.account.lendingPool.fetch(lendingPoolPda);
    expect(poolAccount.authority.toString()).to.equal(authority.publicKey.toString());
    expect(poolAccount.collateralRatio).to.equal(15000);
    expect(poolAccount.interestRate).to.equal(500);
  });

  it('Init obligation', async () => {
    const tx = await program.rpc.initObligation(
      new anchor.BN(1), // bump
      {
        accounts: {
          obligation: obligationPda,
          lendingPool: lendingPoolPda,
          owner: user.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [user],
      }
    );

    console.log('Init obligation transaction signature:', tx);

    // Verify obligation state
    const obligationAccount = await program.account.obligation.fetch(obligationPda);
    expect(obligationAccount.owner.toString()).to.equal(user.publicKey.toString());
    expect(obligationAccount.deposited.toNumber()).to.equal(0);
    expect(obligationAccount.borrowed.toNumber()).to.equal(0);
  });

  it('Deposit collateral', async () => {
    const amount = new anchor.BN(100);

    const tx = await program.rpc.deposit(amount, {
      accounts: {
        obligation: obligationPda,
        userCollateral: userCollateralToken,
        collateralVault: collateralVaultPda,
        lendingPool: lendingPoolPda,
        owner: user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user],
    });

    console.log('Deposit transaction signature:', tx);

    // Verify obligation state
    const obligationAccount = await program.account.obligation.fetch(obligationPda);
    expect(obligationAccount.deposited.toNumber()).to.equal(100);

    // Verify pool state
    const poolAccount = await program.account.lendingPool.fetch(lendingPoolPda);
    expect(poolAccount.totalCollateral.toNumber()).to.equal(100);
  });

  it('Borrow debt tokens', async () => {
    const amount = new anchor.BN(50); // 50% of 100 collateral = 50

    const tx = await program.rpc.borrow(amount, {
      accounts: {
        obligation: obligationPda,
        debtVault: debtVaultPda,
        userDebt: userDebtToken,
        lendingPool: lendingPoolPda,
        owner: user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user],
    });

    console.log('Borrow transaction signature:', tx);

    // Verify obligation state
    const obligationAccount = await program.account.obligation.fetch(obligationPda);
    expect(obligationAccount.borrowed.toNumber()).to.equal(50);

    // Verify pool state
    const poolAccount = await program.account.lendingPool.fetch(lendingPoolPda);
    expect(poolAccount.totalDebt.toNumber()).to.equal(50);
  });

  it('Repay debt tokens', async () => {
    const amount = new anchor.BN(30);

    const tx = await program.rpc.repay(amount, {
      accounts: {
        obligation: obligationPda,
        debtVault: debtVaultPda,
        userDebt: userDebtToken,
        lendingPool: lendingPoolPda,
        owner: user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user],
    });

    console.log('Repay transaction signature:', tx);

    // Verify obligation state
    const obligationAccount = await program.account.obligation.fetch(obligationPda);
    expect(obligationAccount.borrowed.toNumber()).to.equal(20); // 50 - 30 = 20

    // Verify pool state
    const poolAccount = await program.account.lendingPool.fetch(lendingPoolPda);
    expect(poolAccount.totalDebt.toNumber()).to.equal(20);
  });
});
