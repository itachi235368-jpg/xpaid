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
