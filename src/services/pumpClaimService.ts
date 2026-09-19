import { VersionedTransaction, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  canonicalPumpPoolPda,
  createFeeSharingConfigInstruction,
  updateFeeSharesInstruction,
} from './pumpFeeInstructions';

export interface PumpClaimInfo {
  publicKey: string;
  mint: string;
  pumpBalance: number;
  pumpSwapBalance: number;
  totalClaimable: number;
  graduated: boolean;
  hasFeeSharing: boolean;
  quoteMint: string;
  isNativeQuote: boolean;
  shareholders: Array<{
    address: string;
    bps: number;
  }>;
}

/**
 * Check claimable creator fee balance directly on Pump.fun via pumpdev.io
 */
export async function checkPumpClaimBalance(
  publicKey: string,
  mint: string
): Promise<PumpClaimInfo | null> {
  try {
    const res = await fetch(
      `https://pumpdev.io/api/claim-account?publicKey=${encodeURIComponent(publicKey)}&mint=${encodeURIComponent(mint)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Failed to check Pump claim balance:', err);
    return null;
  }
}

/**
 * Build and sign claim transaction to withdraw accumulated creator fees from Pump.fun
 */
export async function claimPumpCreatorFees(
  walletProvider: any,
  creatorPublicKey: string,
  mint: string,
  rpcUrl = 'https://api.mainnet-beta.solana.com'
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!walletProvider?.signAndSendTransaction && !walletProvider?.signTransaction) {
      throw new Error('Solana wallet not connected. Please connect your Phantom or Solflare wallet.');
    }

    // Request the claim transaction from pumpdev.io
    const response = await fetch('https://pumpdev.io/api/claim-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey: creatorPublicKey,
        mint: mint,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Pump claim API error: ${errText || response.statusText}`);
    }

    const txBytes = await response.arrayBuffer();
    const transaction = VersionedTransaction.deserialize(new Uint8Array(txBytes));

    const connection = new Connection(rpcUrl, 'confirmed');

    let txHash: string;
    if (walletProvider.signAndSendTransaction) {
      const res = await walletProvider.signAndSendTransaction(transaction);
      txHash = typeof res === 'string' ? res : res.signature;
    } else {
      const signed = await walletProvider.signTransaction(transaction);
      txHash = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
    }

    return { success: true, txHash };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to claim fees from Pump.fun' };
  }
}

/**
 * Configure on-chain fee sharing using Pump.fun's official PumpFees program
 * (pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ)
 * This assigns 10,000 basis points (100%) of all trading fees directly to our Protocol Treasury wallet!
 */
export async function configurePumpFeeSharingOnChain(
  walletProvider: any,
  creatorAddress: string,
  mintAddress: string,
  treasuryAddress: string,
  rpcUrl = 'https://api.mainnet-beta.solana.com',
  onStatusUpdate?: (status: string) => void
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!walletProvider) {
      throw new Error('Solana wallet provider not available. Connect Phantom or Solflare.');
    }

    onStatusUpdate?.('Initializing PumpFees protocol connection...');
    const connection = new Connection(rpcUrl, 'confirmed');

    const creator = new PublicKey(creatorAddress);
    const mint = new PublicKey(mintAddress);
    const treasury = new PublicKey(treasuryAddress);
    const pool = canonicalPumpPoolPda(mint);

    onStatusUpdate?.('Building on-chain fee sharing instructions (10,000 BPS to Treasury)...');
    const ix1 = createFeeSharingConfigInstruction(creator, mint, pool);
    const ix2 = updateFeeSharesInstruction(
      creator,
      mint,
      [{ address: treasury, shareBps: 10000 }],
      [creator]
    );

    const tx = new Transaction().add(ix1, ix2);
    tx.feePayer = creator;
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;

    onStatusUpdate?.('Awaiting signature in wallet to bind 100% fees to Treasury...');
    let txHash: string;
    if (walletProvider.signAndSendTransaction) {
      const res = await walletProvider.signAndSendTransaction(tx);
      txHash = typeof res === 'string' ? res : res.signature;
    } else {
      const signed = await walletProvider.signTransaction(tx);
      txHash = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
    }

    onStatusUpdate?.(`Confirming on-chain fee binding (${txHash.slice(0, 8)}...)...`);
    await connection.confirmTransaction(
      { signature: txHash, blockhash, lastValidBlockHeight },
      'confirmed'
    );

    onStatusUpdate?.('Fee sharing successfully bound to Protocol Treasury on-chain!');
    return { success: true, txHash };
  } catch (err: any) {
    console.error('Error configuring on-chain fee sharing:', err);
    return {
      success: false,
      error: err?.message || 'Failed to configure fee sharing on-chain.',
    };
  }
}

/**
 * Transfer SOL directly from creator wallet to Protocol Treasury
 */
export async function transferSolToTreasury(
  walletProvider: any,
  senderAddress: string,
  treasuryAddress: string,
  amountSol: number,
  rpcUrl = 'https://api.mainnet-beta.solana.com'
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!walletProvider) {
      throw new Error('Wallet provider not detected');
    }

    const connection = new Connection(rpcUrl, 'confirmed');
    const sender = new PublicKey(senderAddress);
    const treasury = new PublicKey(treasuryAddress);

    const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
    if (lamports <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: treasury,
        lamports,
      })
    );

    tx.feePayer = sender;
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;

    let txHash: string;
    if (walletProvider.signAndSendTransaction) {
      const res = await walletProvider.signAndSendTransaction(tx);
      txHash = typeof res === 'string' ? res : res.signature;
    } else {
      const signed = await walletProvider.signTransaction(tx);
      txHash = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
    }

    await connection.confirmTransaction(
      { signature: txHash, blockhash, lastValidBlockHeight },
      'confirmed'
    );

    return { success: true, txHash };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to transfer SOL to treasury' };
  }
}

/**
 * Combined Action: Claim creator fees from Pump.fun and sweep them into our Protocol Treasury
 */
export async function claimAndSweepPumpFees(
  walletProvider: any,
  creatorPublicKey: string,
  mint: string,
  treasuryAddress: string,
  amountSolToSweep?: number,
  rpcUrl = 'https://api.mainnet-beta.solana.com',
  onStatusUpdate?: (status: string) => void
): Promise<{ success: boolean; claimTx?: string; sweepTx?: string; error?: string }> {
  try {
    onStatusUpdate?.('Claiming creator fees from Pump.fun bonding curve...');
    const claimRes = await claimPumpCreatorFees(walletProvider, creatorPublicKey, mint, rpcUrl);
    if (!claimRes.success || !claimRes.txHash) {
      throw new Error(claimRes.error || 'Failed to claim fees from Pump.fun');
    }

    onStatusUpdate?.(`Fees claimed on Pump.fun (Tx: ${claimRes.txHash.slice(0, 8)}...). Sweeping to Protocol Treasury...`);

    let sweepTx: string | undefined;
    if (amountSolToSweep && amountSolToSweep > 0.001) {
      // Leave a tiny fraction (0.001 SOL) for wallet rent/gas
      const safeAmount = Math.max(0.0005, amountSolToSweep - 0.001);
      const sweepRes = await transferSolToTreasury(
        walletProvider,
        creatorPublicKey,
        treasuryAddress,
        safeAmount,
        rpcUrl
      );
      if (sweepRes.success && sweepRes.txHash) {
        sweepTx = sweepRes.txHash;
      }
    }

    onStatusUpdate?.('Fee claim & sweep completed successfully!');
    return {
      success: true,
      claimTx: claimRes.txHash,
      sweepTx,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to complete claim & sweep workflow',
    };
  }
}

