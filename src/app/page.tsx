'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { TelemetryOverview } from '@/components/TelemetryOverview';
import { ShieldedPoolMeter } from '@/components/ShieldedPoolMeter';
import { ConsensusUpgrades } from '@/components/ConsensusUpgrades';
import { RpcPlayground } from '@/components/RpcPlayground';
import { BlockExplorerLite } from '@/components/BlockExplorerLite';
import { PeerMap } from '@/components/PeerMap';
import { TelemetrySummary } from '@/types/zcash';
import { Shield, Sparkles, Terminal, Activity, Layers, ArrowRight } from '@/components/Icons';

export default function Home() {
  const [telemetry, setTelemetry] = useState<TelemetrySummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rpc' | 'explorer' | 'peers'>('dashboard');

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/api/telemetry');
      if (res.ok) {
        const data: TelemetrySummary = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error('Failed to fetch Zcash telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTelemetry]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-zinc-950">
      {/* Top Navbar */}
      <Navbar
        telemetry={telemetry}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoading={isLoading}
        onRefresh={fetchTelemetry}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Hero Banner / Quick Info */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 via-zinc-950/80 to-zinc-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Zcash Mini Build Challenge &bull; Next-Gen Protocol Suite</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Zero-Knowledge Telemetry & <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">RPC Studio</span>
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                A high-performance developer cockpit directly wired to a live Zcash Zebra node. Inspect transparent & shielded pools (<span className="text-zinc-300">Sprout</span>, <span className="text-zinc-300">Sapling</span>, <span className="text-zinc-300">Orchard/Halo 2</span>), benchmark raw JSON-RPC 2.0 calls, and dissect blocks in real-time.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('rpc')}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
              >
                <Terminal className="h-4 w-4" />
                <span>Launch RPC Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('explorer')}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <Layers className="h-4 w-4" />
                <span>Dissect Blocks</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <TelemetryOverview telemetry={telemetry} isLoading={isLoading} />
            <ShieldedPoolMeter valuePools={telemetry?.valuePools} />
            <ConsensusUpgrades upgrades={telemetry?.upgrades} currentHeight={telemetry?.blockHeight || 0} />
          </div>
        )}

        {activeTab === 'rpc' && (
          <div className="space-y-8">
            <RpcPlayground />
          </div>
        )}

        {activeTab === 'explorer' && (
          <div className="space-y-8">
            <BlockExplorerLite currentHeight={telemetry?.blockHeight || 0} />
          </div>
        )}

        {activeTab === 'peers' && (
          <div className="space-y-8">
            <PeerMap peers={telemetry?.peers} peerCount={telemetry?.peerCount || 0} />
          </div>
        )}

        {/* Hackathon Submission & RPC Methods Footer Reference */}
        <section className="mt-12 rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 text-xs text-zinc-400">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 mb-4">
            <div>
              <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px]">
                Zcash Mini Build Challenge &bull; Verified RPC Integration (6+ Methods)
              </h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Every metric displayed on this page is retrieved live from the connected Zcash Zebra node.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                100% Live Node Data
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-[11px]">
            <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800/60 text-zinc-300">
              <div className="text-amber-400 font-bold">1. getblockchaininfo</div>
              <div className="text-[10px] text-zinc-500">Height, Diff, Pools</div>
            </div>
            <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800/60 text-zinc-300">
              <div className="text-amber-400 font-bold">2. getpeerinfo</div>
              <div className="text-[10px] text-zinc-500">Active P2P mesh</div>
            </div>
            <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800/60 text-zinc-300">
              <div className="text-amber-400 font-bold">3. getmempoolinfo</div>
              <div className="text-[10px] text-zinc-500">Tx count & size</div>
            </div>
            <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800/60 text-zinc-300">
              <div className="text-amber-400 font-bold">4. getnetworksolps</div>
              <div className="text-[10px] text-zinc-500">Equihash Sol/s</div>
            </div>
            <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800/60 text-zinc-300">
              <div className="text-amber-400 font-bold">5. getblock</div>
              <div className="text-[10px] text-zinc-500">Header & TXs</div>
            </div>
            <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800/60 text-zinc-300">
              <div className="text-amber-400 font-bold">6. getblockhash</div>
              <div className="text-[10px] text-zinc-500">Height lookup</div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
