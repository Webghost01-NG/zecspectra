'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Zap, Search, Activity, Cpu, Layers, Sparkles, Terminal } from '@/components/Icons';

export const ZcashPowerTools: React.FC = () => {
  // Address Classifier State
  const [addressInput, setAddressInput] = useState<string>('u1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
  
  // Fee & Converter State
  const [zecAmount, setZecAmount] = useState<string>('1.5');
  const [zatsAmount, setZatsAmount] = useState<string>('150000000');
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [priceLastUpdated, setPriceLastUpdated] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<boolean>(false);
  const [txActions, setTxActions] = useState<number>(2);

  // Privacy Grader State
  const [inputType, setInputType] = useState<'orchard' | 'sapling' | 'transparent'>('orchard');
  const [outputType, setOutputType] = useState<'orchard' | 'sapling' | 'transparent'>('orchard');

  // Fetch real-time USD price from CoinGecko
  useEffect(() => {
    let isMounted = true;
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=zcash&vs_currencies=usd');
        if (!res.ok) throw new Error('Price fetch failed');
        const data = await res.json();
        if (data?.zcash?.usd && isMounted) {
          setUsdRate(data.zcash.usd);
          setPriceLastUpdated(new Date().toLocaleTimeString());
          setPriceError(false);
        } else if (isMounted) {
          setPriceError(true);
        }
      } catch {
        if (isMounted) {
          setPriceError(true);
        }
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Address classification logic (by prefix only)
  const parseAddress = (addr: string) => {
    const trimmed = addr.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('u1')) {
      return {
        type: 'Unified Address (ZIP-316)',
        privacyLevel: 'Multi-Receiver Container',
        badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        receivers: [
          { name: 'Orchard Receiver', status: 'Potential Receiver (Halo 2)', shielded: true },
          { name: 'Sapling Receiver', status: 'Potential Receiver (Groth16)', shielded: true },
          { name: 'Transparent Receiver', status: 'Potential Fallback', shielded: false },
        ],
        description: 'May contain Orchard, Sapling, and/or Transparent receivers (decode with a wallet to verify)',
      };
    }

    if (trimmed.startsWith('zs1')) {
      return {
        type: 'Sapling Shielded Address (ZIP-32)',
        privacyLevel: 'High Privacy (Groth16)',
        badgeColor: 'border-zcash-gold/30 bg-zcash-gold/10 text-zcash-gold',
        receivers: [
          { name: 'Sapling Receiver', status: 'Active (Groth16)', shielded: true },
        ],
        description: 'Sapling shielded address activated with Network Upgrade 2 (NU2). Fast zk-SNARK zero-knowledge proofs.',
      };
    }

    if (trimmed.startsWith('t1') || trimmed.startsWith('t3')) {
      return {
        type: 'Transparent Address (Legacy)',
        privacyLevel: 'Public (No Zero-Knowledge Privacy)',
        badgeColor: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
        receivers: [
          { name: 'Transparent P2PKH / P2SH', status: 'Publicly Visible', shielded: false },
        ],
        description: 'Bitcoin-compatible transparent address. All transaction amounts, senders, and receivers are public on-chain.',
      };
    }

    if (trimmed.startsWith('zc')) {
      return {
        type: 'Sprout Shielded Address (Legacy)',
        privacyLevel: 'Sprout ZK Pool (PHGR13)',
        badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
        receivers: [
          { name: 'Sprout Receiver', status: 'PHGR13 Proving (Legacy)', shielded: true },
        ],
        description: 'Original Zcash Sprout shielded address from 2016 launch using PHGR13 zero-knowledge proofs (NOT Groth16). Replaced by Sapling and Orchard.',
      };
    }

    return {
      type: 'Custom / Unrecognized Format',
      privacyLevel: 'Unknown Format',
      badgeColor: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-400',
      receivers: [],
      description: 'Please enter a valid Zcash address starting with u1 (Unified), zs1 (Sapling), or t1/t3 (Transparent).',
    };
  };

  const addressInfo = parseAddress(addressInput);

  // Privacy Score Calculation
  const calculatePrivacyScore = () => {
    if (inputType === 'orchard' && outputType === 'orchard') {
      return { score: 100, label: 'Maximum Shielded Privacy (Halo 2)', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    }
    if (inputType === 'sapling' && outputType === 'sapling') {
      return { score: 90, label: 'High Shielded Privacy (Groth16)', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    }
    if (inputType === 'transparent' && (outputType === 'orchard' || outputType === 'sapling')) {
      return { score: 65, label: 'Shielding Action (Funds entering privacy pool)', color: 'text-zcash-gold', bg: 'bg-zcash-gold' };
    }
    if ((inputType === 'orchard' || inputType === 'sapling') && outputType === 'transparent') {
      return { score: 25, label: 'Deshielding Action (Revealing output amount)', color: 'text-amber-500', bg: 'bg-amber-500' };
    }
    return { score: 0, label: 'Completely Public (Transparent Transfer)', color: 'text-rose-400', bg: 'bg-rose-500' };
  };

  const privacyResult = calculatePrivacyScore();

  // ZIP-317 Fee Calculation: Base 10,000 zatoshis + 5,000 per logical action beyond 2
  const zip317FeeZats = Math.max(10000, 10000 + Math.max(0, txActions - 2) * 5000);
  const zip317FeeZec = (zip317FeeZats / 100000000).toFixed(8);

  const handleZecChange = (val: string) => {
    setZecAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setZatsAmount(Math.round(num * 100000000).toString());
    } else {
      setZatsAmount('0');
    }
  };

  const handleZatsChange = (val: string) => {
    setZatsAmount(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setZecAmount((num / 100000000).toFixed(8));
    } else {
      setZecAmount('0');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Address Prefix Classifier */}
      <div className="rounded-2xl border border-zcash-border bg-zcash-card p-6 shadow-xl backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zcash-border pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Address Prefix Classifier
              </h3>
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/30">
                (Unvalidated — classification by prefix only)
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Classify any Zcash address by prefix to identify potential receiver types.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAddressInput('u1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-zcash-border bg-zcash-navy text-zinc-300 hover:text-white hover:border-zcash-gold/40 transition-all"
            >
              Load Sample UA (u1)
            </button>
            <button
              onClick={() => setAddressInput('zs1z7rejlpsa98s2rrrfkwmaxu53e4ue0ulcrw0h4x5g8jl04tak0d3mm47vdtahatqrlkngh9sly')}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-zcash-border bg-zcash-navy text-zinc-300 hover:text-white hover:border-zcash-gold/40 transition-all"
            >
              Load Sapling (zs1)
            </button>
            <button
              onClick={() => setAddressInput('t1Rv4exT7bqhZqi2j7xz8bUHDMxwosrjADU')}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-zcash-border bg-zcash-navy text-zinc-300 hover:text-white hover:border-zcash-gold/40 transition-all"
            >
              Load Transparent (t1)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Enter Zcash Address (Unified, Sapling, Sprout, or Transparent):
            </label>
            <div className="relative">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Paste u1..., zs1..., or t1... address"
                className="w-full rounded-xl border border-zcash-border bg-zcash-navy px-4 py-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:border-zcash-gold focus:outline-none focus:ring-1 focus:ring-zcash-gold"
              />
            </div>
          </div>

          {addressInfo && (
            <div className="rounded-xl border border-zcash-border/80 bg-zcash-navy/90 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zcash-border/60 pb-3">
                <div>
                  <span className="text-xs font-bold text-white">{addressInfo.type}</span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{addressInfo.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold border ${addressInfo.badgeColor}`}>
                  {addressInfo.privacyLevel}
                </span>
              </div>

              {addressInfo.receivers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Receiver Pool Profiles:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {addressInfo.receivers.map((rec, idx) => (
                      <div key={idx} className="rounded-lg border border-zcash-border bg-zcash-dark/80 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Shield className={`h-3.5 w-3.5 ${rec.shielded ? 'text-emerald-400' : 'text-zinc-500'}`} />
                          <span className="text-xs font-bold text-white">{rec.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">{rec.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Privacy Scorer & ZIP-317 Fee Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Privacy Grader */}
        <div className="rounded-2xl border border-zcash-border bg-zcash-card p-6 shadow-xl backdrop-blur-md space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Transaction Privacy Scorer
              </h3>
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                Illustrative Heuristic — Not Authoritative
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Select input & output value pools to evaluate transaction privacy and metadata leakage.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Input Pool (Sender):</label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value as any)}
                className="w-full rounded-xl border border-zcash-border bg-zcash-navy px-3 py-2 text-xs font-semibold text-white focus:border-zcash-gold focus:outline-none"
              >
                <option value="orchard">Orchard (Halo 2 Shielded)</option>
                <option value="sapling">Sapling (Groth16 Shielded)</option>
                <option value="transparent">Transparent (Public Pool)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Output Pool (Receiver):</label>
              <select
                value={outputType}
                onChange={(e) => setOutputType(e.target.value as any)}
                className="w-full rounded-xl border border-zcash-border bg-zcash-navy px-3 py-2 text-xs font-semibold text-white focus:border-zcash-gold focus:outline-none"
              >
                <option value="orchard">Orchard (Halo 2 Shielded)</option>
                <option value="sapling">Sapling (Groth16 Shielded)</option>
                <option value="transparent">Transparent (Public Pool)</option>
              </select>
            </div>
          </div>

          {/* Score Result Gauge */}
          <div className="rounded-xl border border-zcash-border bg-zcash-navy p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Privacy Rating:</span>
              <span className={`text-xl font-black font-mono ${privacyResult.color}`}>
                {privacyResult.score} / 100
              </span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${privacyResult.bg}`}
                style={{ width: `${privacyResult.score}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-300 font-medium pt-1">
              &bull; {privacyResult.label}
            </p>

            <p className="text-[10px] text-zinc-500 italic border-t border-zinc-800/80 pt-2">
              Disclaimer: This score is an illustrative educational heuristic and not an authoritative cryptographic privacy guarantee. Real-world privacy depends on transaction graph topology, amounts, timing, and network-level metadata.
            </p>
          </div>
        </div>

        {/* Converter & ZIP-317 Fee Engine */}
        <div className="rounded-2xl border border-zcash-border bg-zcash-card p-6 shadow-xl backdrop-blur-md space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                ZEC Units & ZIP-317 Fee Estimator
              </h3>
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/30">
                ZIP-317 Standard
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Convert between ZEC, Zatoshis, and fiat valuation, with automatic standard transaction fee calculations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">ZEC Amount:</label>
              <input
                type="text"
                value={zecAmount}
                onChange={(e) => handleZecChange(e.target.value)}
                className="w-full rounded-xl border border-zcash-border bg-zcash-navy px-3 py-2 text-xs font-mono text-white focus:border-zcash-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Zatoshis (1e-8):</label>
              <input
                type="text"
                value={zatsAmount}
                onChange={(e) => handleZatsChange(e.target.value)}
                className="w-full rounded-xl border border-zcash-border bg-zcash-navy px-3 py-2 text-xs font-mono text-white focus:border-zcash-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zcash-border bg-zcash-navy p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-zinc-400">Fiat Value:</span>
                {usdRate !== null && !priceError ? (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    (${usdRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/ZEC{priceLastUpdated ? ` • Last updated: ${priceLastUpdated}` : ''})
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-500/80 font-mono">(Price unavailable)</span>
                )}
              </div>
              <span className="font-bold text-white font-mono">
                {usdRate !== null && !priceError
                  ? `$${(parseFloat(zecAmount || '0') * usdRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                  : 'Price unavailable'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-zcash-border/60 pt-2.5">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">ZIP-317 Fee:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTxActions(Math.max(1, txActions - 1))}
                    className="h-5 w-5 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="text-[10px] font-mono text-zinc-300">{txActions} Actions</span>
                  <button
                    onClick={() => setTxActions(txActions + 1)}
                    className="h-5 w-5 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="font-bold text-zcash-gold text-xs">{zip317FeeZats.toLocaleString()} zats</div>
                <div className="text-[10px] text-zinc-400">({zip317FeeZec} ZEC)</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Halving & NU6 Dev Fund Economics */}
      <div className="rounded-2xl border border-zcash-border bg-zcash-card p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zcash-border pb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Zcash Protocol Economics & Halving Tracker
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Block reward subsidy distribution per ZIP-218 and ZIP-214 and upcoming halving milestones.
            </p>
          </div>
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-bold text-blue-400 border border-blue-500/30">
            Block Subsidy: 1.5625 ZEC
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-3.5 rounded-xl bg-zcash-navy border border-zcash-border">
            <span className="text-[11px] text-zinc-400 block mb-1">Block Subsidy</span>
            <span className="text-lg font-bold font-mono text-white">1.5625 ZEC</span>
            <span className="text-[10px] text-zinc-400 block mt-1">Issued every 75s (~1.25m)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zcash-navy border border-zcash-border">
            <span className="text-[11px] text-zinc-400 block mb-1">Miner Allocation (80%)</span>
            <span className="text-lg font-bold font-mono text-emerald-400">1.25 ZEC</span>
            <span className="text-[10px] text-zinc-400 block mt-1">PoW Equihash Miners</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zcash-navy border border-zcash-border">
            <span className="text-[11px] text-zinc-400 block mb-1">8% Lockbox Stream</span>
            <span className="text-lg font-bold font-mono text-zcash-gold">0.125 ZEC</span>
            <span className="text-[10px] text-zinc-400 block mt-1">ZIP-218 Deferred Fund</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zcash-navy border border-zcash-border">
            <span className="text-[11px] text-zinc-400 block mb-1">12% Dev Fund Stream</span>
            <span className="text-lg font-bold font-mono text-blue-400">0.1875 ZEC</span>
            <span className="text-[10px] text-zinc-400 block mt-1">ZIP-214 Direct Dev Fund</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zcash-navy border border-zcash-border">
            <span className="text-[11px] text-zinc-400 block mb-1">Next Halving Height</span>
            <span className="text-lg font-bold font-mono text-purple-400">4,406,400</span>
            <span className="text-[10px] text-zinc-400 block mt-1">Reward will drop to 0.78125 ZEC</span>
          </div>
        </div>
      </div>

    </div>
  );
};
