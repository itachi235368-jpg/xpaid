import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Buffer } from 'buffer';

export const PUMP_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
export const PUMP_AMM_PROGRAM_ID = new PublicKey('pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA');
export const PUMP_FEE_PROGRAM_ID = new PublicKey('pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ');
export const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
export const NATIVE_MINT = new PublicKey('So11111111111111111111111111111111111111112');

export const CANONICAL_POOL_INDEX = 0;

export function pumpPoolAuthorityPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from('pool-authority'), mint.toBuffer()], PUMP_PROGRAM_ID)[0];
}

export function canonicalPumpPoolPda(mint: PublicKey): PublicKey {
  const indexBuf = Buffer.alloc(2);
  indexBuf.writeUInt16LE(CANONICAL_POOL_INDEX, 0);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('pool'),
      indexBuf,
      pumpPoolAuthorityPda(mint).toBuffer(),
      mint.toBuffer(),
      NATIVE_MINT.toBuffer(),
    ],
    PUMP_AMM_PROGRAM_ID
  )[0];
}

export function feeSharingConfigPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from('sharing-config'), mint.toBuffer()], PUMP_FEE_PROGRAM_ID)[0];
}

export function getAssociatedTokenAddress(mint: PublicKey, owner: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}

export interface Shareholder {
  address: PublicKey;
  shareBps: number;
}

/**
 * Creates the initial fee sharing configuration on PumpFees program.
 */
export function createFeeSharingConfigInstruction(
  creator: PublicKey,
  mint: PublicKey,
  pool: PublicKey
): TransactionInstruction {
  const eventAuthority = PublicKey.findProgramAddressSync([Buffer.from('__event_authority')], PUMP_FEE_PROGRAM_ID)[0];
  const global = PublicKey.findProgramAddressSync([Buffer.from('global')], PUMP_PROGRAM_ID)[0];
  const sharingConfig = PublicKey.findProgramAddressSync([Buffer.from('sharing-config'), mint.toBuffer()], PUMP_FEE_PROGRAM_ID)[0];
  const bondingCurve = PublicKey.findProgramAddressSync([Buffer.from('bonding-curve'), mint.toBuffer()], PUMP_PROGRAM_ID)[0];
  const pumpEventAuthority = PublicKey.findProgramAddressSync([Buffer.from('__event_authority')], PUMP_PROGRAM_ID)[0];
  const ammEventAuthority = PublicKey.findProgramAddressSync([Buffer.from('__event_authority')], PUMP_AMM_PROGRAM_ID)[0];

  const keys = [
    { pubkey: eventAuthority, isSigner: false, isWritable: false },
    { pubkey: PUMP_FEE_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: creator, isSigner: true, isWritable: true },
    { pubkey: global, isSigner: false, isWritable: false },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: sharingConfig, isSigner: false, isWritable: true },
    { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: bondingCurve, isSigner: false, isWritable: true },
    { pubkey: PUMP_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: pumpEventAuthority, isSigner: false, isWritable: false },
    { pubkey: pool, isSigner: false, isWritable: true },
    { pubkey: PUMP_AMM_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ammEventAuthority, isSigner: false, isWritable: false },
  ];

  // 8-byte Anchor discriminator for "create_fee_sharing_config"
  const data = Buffer.from([195, 78, 86, 76, 111, 52, 251, 213]);
  return new TransactionInstruction({ programId: PUMP_FEE_PROGRAM_ID, keys, data });
}

/**
 * Updates fee shares on PumpFees program (e.g. allocating 10,000 BPS to Protocol Treasury).
 */
export function updateFeeSharesInstruction(
  authority: PublicKey,
  mint: PublicKey,
  newShareholders: Shareholder[],
  currentShareholders: PublicKey[] = [authority]
): TransactionInstruction {
  const eventAuthority = PublicKey.findProgramAddressSync([Buffer.from('__event_authority')], PUMP_FEE_PROGRAM_ID)[0];
  const global = PublicKey.findProgramAddressSync([Buffer.from('global')], PUMP_PROGRAM_ID)[0];
  const sharingConfig = PublicKey.findProgramAddressSync([Buffer.from('sharing-config'), mint.toBuffer()], PUMP_FEE_PROGRAM_ID)[0];
  const bondingCurve = PublicKey.findProgramAddressSync([Buffer.from('bonding-curve'), mint.toBuffer()], PUMP_PROGRAM_ID)[0];
  const pumpCreatorVault = PublicKey.findProgramAddressSync([Buffer.from('creator-vault'), sharingConfig.toBuffer()], PUMP_PROGRAM_ID)[0];
  const pumpEventAuthority = PublicKey.findProgramAddressSync([Buffer.from('__event_authority')], PUMP_PROGRAM_ID)[0];
  const ammEventAuthority = PublicKey.findProgramAddressSync([Buffer.from('__event_authority')], PUMP_AMM_PROGRAM_ID)[0];
  const coinCreatorVaultAuthority = PublicKey.findProgramAddressSync([Buffer.from('creator_vault'), sharingConfig.toBuffer()], PUMP_AMM_PROGRAM_ID)[0];
  const coinCreatorVaultAta = getAssociatedTokenAddress(NATIVE_MINT, coinCreatorVaultAuthority);

  const keys = [
    { pubkey: eventAuthority, isSigner: false, isWritable: false },
    { pubkey: PUMP_FEE_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: authority, isSigner: true, isWritable: false },
    { pubkey: global, isSigner: false, isWritable: false },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: sharingConfig, isSigner: false, isWritable: true },
    { pubkey: bondingCurve, isSigner: false, isWritable: false },
    { pubkey: pumpCreatorVault, isSigner: false, isWritable: true },
    { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: PUMP_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: pumpEventAuthority, isSigner: false, isWritable: false },
    { pubkey: PUMP_AMM_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ammEventAuthority, isSigner: false, isWritable: false },
    { pubkey: NATIVE_MINT, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: coinCreatorVaultAuthority, isSigner: false, isWritable: true },
    { pubkey: coinCreatorVaultAta, isSigner: false, isWritable: true },
    ...currentShareholders.map((pubkey) => ({ pubkey, isSigner: false, isWritable: true })),
  ];

  // 8-byte Anchor discriminator for "update_fee_shares" + vector length u32 + (pubkey 32 + u16 bps 2)*len
  const discriminator = [189, 13, 136, 99, 187, 164, 237, 35];
  const data = Buffer.alloc(8 + 4 + newShareholders.length * (32 + 2));
  Buffer.from(discriminator).copy(data, 0);
  data.writeUInt32LE(newShareholders.length, 8);
  let offset = 12;
  for (const sh of newShareholders) {
    sh.address.toBuffer().copy(data, offset);
    offset += 32;
    data.writeUInt16LE(sh.shareBps, offset);
    offset += 2;
  }

  return new TransactionInstruction({ programId: PUMP_FEE_PROGRAM_ID, keys, data });
}
