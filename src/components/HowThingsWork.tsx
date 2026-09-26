import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Coins,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Send,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sparkles,
  DollarSign,
  Layers,
  Clock,
  Shuffle
} from 'lucide-react';
import { TreasuryConfig } from '../types';
import { fetchLiveSolPrice, subscribeToSolPrice, getCurrentSolPrice } from '../services/solPriceService';

interface HowThingsWorkProps {
  treasuryConfig: TreasuryConfig;
  onNavigateToLaunch: () => void;
  onNavigateToFees: () => void;
  onNavigateToPayouts: () => void;
}

export const HowThingsWork: React.FC<HowThingsWorkProps> = ({
  treasuryConfig,
  onNavigateToLaunch,
  onNavigateToFees,
  onNavigateToPayouts
}) => {
  const [solPrice, setSolPrice] = useState<number>(() => getCurrentSolPrice());

  useEffect(() => {
    fetchLiveSolPrice().then(p => {
      if (p > 0) setSolPrice(p);
    });
    const unsub = subscribeToSolPrice(p => {
      if (p > 0) setSolPrice(p);
    });
    return () => unsub();
  }, []);

  // Interactive Simulator state
  const [simStep, setSimStep] = useState<number>(0);
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simHandle, setSimHandle] = useState<string>('@elonmusk');
  const [simTokenSymbol, setSimTokenSymbol] = useState<string>('GIGA');
  const [simTradeAmountSol, setSimTradeAmountSol] = useState<number>(5.0);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  const runSimulation = () => {
    setSimRunning(true);
    setSimStep(1);
    setSimLogs([
      `[T+0.0s] 🟢 Trade executed: 5.0 SOL buy on Pump.fun bonding curve for $${simTokenSymbol}.`
    ]);

    setTimeout(() => {
      setSimStep(2);
      const feeSol = (simTradeAmountSol * 0.01).toFixed(3);
      setSimLogs(prev => [
        ...prev,
        `[T+0.8s] ⚡ 1% Trading Royalty generated: +${feeSol} SOL ($${(Number(feeSol) * solPrice).toFixed(2)} USD @ $${solPrice.toFixed(2)}/SOL).`
      ]);
    }, 1000);

    setTimeout(() => {
      setSimStep(3);
      setSimLogs(prev => [
        ...prev,
        `[T+1.8s] 🏦 Protocol Webhook triggered: Fee routed directly to Protocol Treasury (${treasuryConfig.solanaTreasuryAddress.slice(0, 4)}...${treasuryConfig.solanaTreasuryAddress.slice(-4)}).`
      ]);
    }, 2200);

    setTimeout(() => {
      setSimStep(4);
      const xUserUsd = ((simTradeAmountSol * 0.01 * solPrice) * 0.95).toFixed(2);
      setSimLogs(prev => [
        ...prev,
        `[T+3.0s] 💰 𝕏 Money API called: $${xUserUsd} USD (95%) auto-deposited directly to 𝕏 User ${simHandle} with zero claim needed! (Token creator gets 0%).`
      ]);
      setSimRunning(false);
    }, 3500);
  };

  const resetSimulation = () => {
    setSimStep(0);
    setSimRunning(false);
    setSimLogs([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white p-8 sm:p-10 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            Zero-Friction Tokenomics Architecture
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            How Tipped Bridges Pump.fun Fees Directly to 𝕏 Users
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Tipped allows anyone to launch a Solana meme token on Pump.fun, and automatically route 95% of trading fees into real USD deposits for any designated 𝕏 User—<strong className="text-emerald-400 font-semibold">we pay the 𝕏 User, not the token creator</strong>.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToLaunch}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              Launch a Token Now
            </button>
            <button
              onClick={onNavigateToFees}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm rounded-xl transition-all border border-zinc-700 flex items-center gap-2"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              View Live Fee Collector
            </button>
          </div>
        </div>
      </div>

      {/* 4-Step Visual Flow */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            The 4-Step End-to-End Cycle
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            From smart contract deployment to bank-grade USD settlement in the creator's 𝕏 account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs relative flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  1
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Deploy
                </span>
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Token Launch & Social Meta
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Create a token on <strong>Pump.fun (Solana)</strong>. Select any 𝕏 user (e.g., <code className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded">@elonmusk</code>) as the fee beneficiary.
              </p>
              <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <li className="flex items-center gap-1.5">
                  <span className="font-bold text-[10px]">𝕏</span> Auto-synced Twitter profile
                </li>
                <li className="flex items-center gap-1.5">
                  <Send className="w-3 h-3 text-blue-500" /> Embedded Telegram group
                </li>
                <li className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-emerald-600" /> Official project website
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              Metadata uploaded to Pinata IPFS
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs relative flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-700 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-sm flex items-center justify-center border border-amber-200 dark:border-amber-800">
                  2
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Trading
                </span>
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                1% Creator Fee Accrual
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pump.fun bonding curve charges a 1% creator royalty on all buys and sells. These royalties accumulate on-chain in SOL.
              </p>
              <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <li className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-amber-500" /> Every swap contributes
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Automated non-custodial curve
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-500" /> Raydium migration retained
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              Solana Mainnet Bonding Curve
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs relative flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-sm flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  3
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Sweep
                </span>
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                Autonomous Treasury Harvester
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Helius RPC webhooks monitor trading volume and automatically sweep creator fees into the verified protocol treasury wallet.
              </p>
              <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <li className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-blue-500" /> Helius webhook instant triggers
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Protocol Treasury on Solscan
                </li>
                <li className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 text-purple-500" /> Auto-Pilot background daemon
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              Treasury: {treasuryConfig.solanaTreasuryAddress.slice(0, 6)}...{treasuryConfig.solanaTreasuryAddress.slice(-4)}
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs relative flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-700 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-sm flex items-center justify-center border border-purple-200 dark:border-purple-800">
                  4
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  Auto-Disburse
                </span>
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                Kraken ➔ 𝕏 Money USD Payout
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Fees are routed through Kraken Institutional for instant SOL ➔ USD spot conversion and pushed directly to the recipient's 𝕏 handle via 𝕏 Money or FedNow rails. <strong>Zero manual claim needed!</strong>
              </p>
              <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <li className="flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-emerald-600" /> Kraken Spot Auto-Convert (Zero Slippage)
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-blue-500" /> Direct USD in 𝕏 Money or FedNow
                </li>
                <li className="flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3 text-zinc-400" /> Verifiable public proof record
                </li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              Zero-Claim USD Rail
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulator Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full mb-1 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5" />
              Hands-On Simulation
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Try the Flow: Simulate a Live Trade & Payout
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Experience the end-to-end fee routing and instant 𝕏 Money deposit in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runSimulation}
              disabled={simRunning}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              {simRunning ? 'Executing Pipeline...' : 'Run Trade Simulation'}
            </button>
            {simStep > 0 && (
              <button
                onClick={resetSimulation}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Reset simulation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Simulator Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-zinc-100 dark:border-zinc-800 text-xs">
          <div>
            <label className="block text-zinc-500 dark:text-zinc-400 font-semibold mb-1">𝕏 Fee Beneficiary</label>
            <input
              type="text"
              value={simHandle}
              onChange={(e) => setSimHandle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-zinc-800 dark:focus:ring-zinc-600"
              placeholder="@elonmusk"
            />
          </div>
          <div>
            <label className="block text-zinc-500 dark:text-zinc-400 font-semibold mb-1">Meme Token Symbol</label>
            <input
              type="text"
              value={simTokenSymbol}
              onChange={(e) => setSimTokenSymbol(e.target.value.toUpperCase())}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-zinc-800 dark:focus:ring-zinc-600"
              placeholder="GIGA"
            />
          </div>
          <div>
            <label className="block text-zinc-500 dark:text-zinc-400 font-semibold mb-1">Simulated Trade Size</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0.1"
                max="50"
                value={simTradeAmountSol}
                onChange={(e) => setSimTradeAmountSol(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-zinc-800 dark:focus:ring-zinc-600"
              />
              <span className="font-bold text-zinc-600 dark:text-zinc-400 shrink-0">SOL</span>
            </div>
          </div>
        </div>

        {/* Visual Pipeline Progress */}
        <div className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div
              className={`p-3 rounded-xl border transition-all ${
                simStep >= 1
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold mb-1">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  simStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}>1</span>
                Pump.fun Trade
              </div>
              <div className="text-[11px] font-mono">
                {simStep >= 1 ? `${simTradeAmountSol} SOL Buy` : 'Waiting...'}
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                simStep >= 2
                  ? 'bg-amber-50/70 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold mb-1">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  simStep >= 2 ? 'bg-amber-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}>2</span>
                1% Royalty
              </div>
              <div className="text-[11px] font-mono">
                {simStep >= 2 ? `+${(simTradeAmountSol * 0.01).toFixed(3)} SOL` : 'Waiting...'}
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                simStep >= 3
                  ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                  : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold mb-1">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  simStep >= 3 ? 'bg-blue-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}>3</span>
                Treasury Sweep
              </div>
              <div className="text-[11px] font-mono">
                {simStep >= 3 ? 'Verified in Treasury' : 'Waiting...'}
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                simStep >= 4
                  ? 'bg-purple-50/70 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                  : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold mb-1">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  simStep >= 4 ? 'bg-purple-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}>4</span>
                𝕏 Money Deposit
              </div>
              <div className="text-[11px] font-mono">
                {simStep >= 4 ? `$${((simTradeAmountSol * 0.01 * solPrice) * 0.8).toFixed(2)} USD Sent` : 'Waiting...'}
              </div>
            </div>
          </div>

          {/* Execution Log Console */}
          {simLogs.length > 0 && (
            <div className="bg-zinc-950 text-zinc-300 p-4 rounded-xl font-mono text-xs space-y-1.5 border border-zinc-800 mt-4">
              <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2">
                Live Daemon Execution Stream
              </div>
              {simLogs.map((log, i) => (
                <div key={i} className="text-emerald-400 leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature Comparison Table: Traditional vs Tipped */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Why Tipped is Different
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Compare standard meme token creation with Tipped's frictionless 𝕏 Money rail.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase text-[11px]">
                <th className="pb-3 font-semibold">Aspect</th>
                <th className="pb-3 font-semibold text-zinc-500 dark:text-zinc-400">Traditional Meme Platforms</th>
                <th className="pb-3 font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/40 px-4 rounded-t-lg">Tipped Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              <tr>
                <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-100">Beneficiary Onboarding</td>
                <td className="py-3 text-zinc-500 dark:text-zinc-400">Requires Solana Phantom/Solflare wallet, seed phrases, gas fees</td>
                <td className="py-3 font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20 px-4">
                  Zero crypto onboarding. Just their public 𝕏 handle (<code className="text-xs">@handle</code>).
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-100">Fee Claiming Process</td>
                <td className="py-3 text-zinc-500 dark:text-zinc-400">Manual claim, signing contract transactions, paying SOL gas</td>
                <td className="py-3 font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20 px-4">
                  100% Automated. Autonomous sweeper pushes direct USD into 𝕏 Money.
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-100">Payout Currency</td>
                <td className="py-3 text-zinc-500 dark:text-zinc-400">Volatile SOL / SPL tokens requiring off-ramping</td>
                <td className="py-3 font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20 px-4">
                  USD directly usable on 𝕏 Money for creator subscriptions, shopping, or bank cashout.
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-100">Community Links</td>
                <td className="py-3 text-zinc-500 dark:text-zinc-400">Often manual or missing after deployment</td>
                <td className="py-3 font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20 px-4">
                  Standard 𝕏, Telegram, and Website injected into IPFS metadata during launch.
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-zinc-900 dark:text-zinc-100">Transparency</td>
                <td className="py-3 text-zinc-500 dark:text-zinc-400">Private creator wallets or dev dumps</td>
                <td className="py-3 font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20 px-4">
                  Public Solscan treasury ledger + verifiable proof receipts.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Common questions about the Tipped protocol, fees, and 𝕏 Money settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
              Does the 𝕏 creator need to approve or sign anything?
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              No. That is the core innovation of Tipped. You can launch a token honoring any creator (like @elonmusk, @cz_binance, or a favorite artist), and royalties are deposited into their 𝕏 Money balance automatically.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
              Where does the 1% fee come from?
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Pump.fun's Solana smart contracts enforce a 1% creator fee on every trade along the bonding curve. Tipped sets the verified Protocol Treasury as the fee collection authority.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
              How does the 𝕏 handle sync with the Social Links?
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              When launching a token, whatever 𝕏 account is selected as the fee beneficiary automatically fills the 𝕏 (Twitter) link in the Social & Community Links section. You can also customize or reset it at any time.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
              Can the token graduate to Raydium?
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Yes! When the token reaches the 100% bonding curve threshold (~85 SOL market cap), liquidity automatically deposits to Raydium, and continuous fees continue routing through our bridge.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="bg-emerald-600 text-white p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-extrabold">Ready to launch a meme token?</h3>
          <p className="text-emerald-100 text-xs sm:text-sm">
            Launch on Pump.fun, assign an 𝕏 creator, add your social links, and start routing fees in seconds.
          </p>
        </div>
        <button
          onClick={onNavigateToLaunch}
          className="px-6 py-3 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-sm rounded-xl transition-all shadow-md shrink-0 flex items-center gap-2"
        >
          <Rocket className="w-4 h-4 text-emerald-400" />
          Launch Token Now
        </button>
      </div>
    </div>
  );
};
