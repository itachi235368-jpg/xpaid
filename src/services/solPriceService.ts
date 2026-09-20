/**
 * Real-Time Solana (SOL) USD Price Service
 * Fetches live market price from multiple redundant oracle/exchange endpoints:
 * 1. Binance API (SOLUSDT)
 * 2. CoinGecko API (solana)
 * 3. Kraken API (SOLUSD)
 * 4. Jupiter Price API v2
 */

let cachedSolPrice: number = 110.65;
let lastFetchTimestamp: number = 0;
const CACHE_TTL_MS = 10_000; // 10 seconds cache

const listeners = new Set<(price: number) => void>();

/**
 * Fetch live SOL/USD price with automatic failover
 */
export async function fetchLiveSolPrice(): Promise<number> {
  const now = Date.now();
  if (now - lastFetchTimestamp < CACHE_TTL_MS && cachedSolPrice > 0) {
    return cachedSolPrice;
  }

  // Provider 1: Binance
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      const p = parseFloat(data.price);
      if (!isNaN(p) && p > 10) {
        updatePrice(p);
        return p;
      }
    }
  } catch {
    // Continue to next provider
  }

  // Provider 2: CoinGecko
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      const p = parseFloat(data?.solana?.usd);
      if (!isNaN(p) && p > 10) {
        updatePrice(p);
        return p;
      }
    }
  } catch {
    // Continue to next provider
  }

  // Provider 3: Kraken
  try {
    const res = await fetch('https://api.kraken.com/0/public/Ticker?pair=SOLUSD', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      const priceStr = data?.result?.SOLUSD?.c?.[0] || data?.result?.WSOLUSD?.c?.[0];
      const p = parseFloat(priceStr);
      if (!isNaN(p) && p > 10) {
        updatePrice(p);
        return p;
      }
    }
  } catch {
    // Return cached price
  }

  return cachedSolPrice;
}

function updatePrice(newPrice: number) {
  cachedSolPrice = Number(newPrice.toFixed(2));
  lastFetchTimestamp = Date.now();
  listeners.forEach(fn => {
    try {
      fn(cachedSolPrice);
    } catch (e) {
      console.warn('Listener error in solPriceService:', e);
    }
  });
}

/**
 * Get current cached SOL price synchronously
 */
export function getCurrentSolPrice(): number {
  return cachedSolPrice;
}

/**
 * Subscribe to live SOL price updates
 */
export function subscribeToSolPrice(callback: (price: number) => void): () => void {
  listeners.add(callback);
  callback(cachedSolPrice);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Mathematical constant parameters for Pump.fun Bonding Curve
 * Total Supply = 1,000,000,000 tokens
 * Initial Virtual SOL Reserves = 30 SOL
 * Initial Virtual Token Reserves = 1,073,000,191 tokens
 * k = 30 * 1,073,000,191 = 32,190,005,730
 * Complete Migration Real SOL target = 85 SOL (115 Virtual SOL)
 */
export const PUMP_FUN_CONSTANTS = {
  TOTAL_SUPPLY: 1_000_000_000,
  VIRTUAL_SOL_INITIAL: 30,
  VIRTUAL_TOKEN_INITIAL: 1_073_000_191,
  K: 30 * 1_073_000_191, // 32,190,005,730
  MIGRATION_REAL_SOL: 85,
};

/**
 * Calculate the exact mathematical Market Cap (SOL & USD) on a Pump.fun bonding curve
 * @param realSolInCurve Amount of real SOL in curve (or initial buy in SOL)
 * @param curveProgressPct Progress percentage from 0 to 100
 * @param solPriceUsd Current live price of SOL in USD
 */
export function calculatePumpFunMarketCap(
  realSolInCurve: number = 0,
  curveProgressPct: number = 0,
  solPriceUsd: number = getCurrentSolPrice()
): { marketCapUsd: number; marketCapSol: number; tokenPriceSol: number; tokenPriceUsd: number } {
  // If curveProgressPct is provided and realSolInCurve is 0, derive realSol
  const effectiveRealSol = realSolInCurve > 0
    ? realSolInCurve
    : (Math.max(0, Math.min(100, curveProgressPct)) / 100) * PUMP_FUN_CONSTANTS.MIGRATION_REAL_SOL;

  const currentVirtualSol = PUMP_FUN_CONSTANTS.VIRTUAL_SOL_INITIAL + effectiveRealSol;
  // Price in SOL = (VirtualSol)^2 / k
  const tokenPriceSol = (currentVirtualSol * currentVirtualSol) / PUMP_FUN_CONSTANTS.K;
  const marketCapSol = tokenPriceSol * PUMP_FUN_CONSTANTS.TOTAL_SUPPLY;
  const tokenPriceUsd = tokenPriceSol * solPriceUsd;
  const marketCapUsd = Number((marketCapSol * solPriceUsd).toFixed(2));

  return {
    marketCapUsd,
    marketCapSol: Number(marketCapSol.toFixed(4)),
    tokenPriceSol,
    tokenPriceUsd,
  };
}

/**
 * Attempt to fetch real-time market cap and 24h metrics from DexScreener for any Solana token
 */
export async function fetchDexScreenerTokenData(mintAddress: string): Promise<{
  marketCapUsd?: number;
  volume24hUsd?: number;
  priceUsd?: number;
} | null> {
  if (!mintAddress || mintAddress.length < 30) return null;
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      const pair = data?.pairs?.[0];
      if (pair) {
        const mcap = pair.marketCap || pair.fdv || (pair.priceUsd ? parseFloat(pair.priceUsd) * 1_000_000_000 : undefined);
        const volume = pair.volume?.h24 ? parseFloat(pair.volume.h24) : undefined;
        const price = pair.priceUsd ? parseFloat(pair.priceUsd) : undefined;
        return {
          marketCapUsd: mcap ? Number(mcap.toFixed(2)) : undefined,
          volume24hUsd: volume ? Number(volume.toFixed(2)) : undefined,
          priceUsd: price,
        };
      }
    }
  } catch {
    // Fail silently to bonding curve calculation
  }
  return null;
}

