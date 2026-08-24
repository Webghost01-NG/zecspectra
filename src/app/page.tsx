'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { TelemetryOverview } from '@/components/TelemetryOverview';
import { ShieldedPoolMeter } from '@/components/ShieldedPoolMeter';
import { ConsensusUpgrades } from '@/components/ConsensusUpgrades';
import { LiveTxStreamer } from '@/components/LiveTxStreamer';
import { RpcPlayground } from '@/components/RpcPlayground';
import { BlockExplorerLite } from '@/components/BlockExplorerLite';
import { PeerMap } from '@/components/PeerMap';
import { ZcashPowerTools } from '@/components/ZcashPowerTools';
import { ConnectNodeModal } from '@/components/ConnectNodeModal';
import { TelemetrySummary } from '@/types/zcash';
import { Sparkles, Terminal, ArrowRight, Zap, Cpu } from '@/components/Icons';

export default function Home() {
  const [telemetry, setTelemetry] = useState<TelemetrySummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [customNodeUrl, setCustomNodeUrl] = useState<string>('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'streamer' | 'rpc' | 'explorer' | 'tools' | 'peers'>('dashboard');

  const fetchTelemetry = useCallback(async () => {
    try {
      const url = customNodeUrl 
        ? `/api/telemetry?rpcUrl=${encodeURIComponent(customNodeUrl)}&network=${network}`
        : `/api/telemetry?network=${network}`;
      const res = await fetch(url);
      if (res.ok) {
        const data: TelemetrySummary = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error('Failed to fetch Zcash telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  }, [network, customNodeUrl]);

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

  const handleSaveNode = (url: string) => {
    setCustomNodeUrl(url);
  };

  return (
    <div className="min-h-screen bg-zcash-dark text-zinc-100 selection:bg-zcash-gold selection:text-zcash-dark">
      {/* Top Navbar */}
      <Navbar
        telemetry={telemetry}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoading={isLoading}
        onRefresh={fetchTelemetry}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        network={network}
        setNetwork={setNetwork}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
      />

      {/* Connect Custom Node Modal */}
      <ConnectNodeModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        currentNodeUrl={customNodeUrl}
        onSaveNode={handleSaveNode}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-zcash-border bg-gradient-to-b from-zcash-card/90 via-zcash-dark/90 to-zcash-dark p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-zcash-gold/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-zcash-shield/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zcash-gold/30 bg-zcash-gold/10 px-3.5 py-1 text-xs font-bold text-zcash-gold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Zcash Mini Build Challenge &bull; Next-Gen Telemetry & Node Cockpit</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Zero-Knowledge Telemetry & <span className="bg-gradient-to-r from-zcash-gold via-yellow-300 to-amber-500 bg-clip-text text-transparent">Power Tools</span>
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                A high-performance developer cockpit wired directly to Zcash network nodes. Inspect transparent & shielded pools (<span className="text-zinc-200 font-semibold">Sprout</span>, <span className="text-zinc-200 font-semibold">Sapling</span>, <span className="text-zinc-200 font-semibold">Orchard/Halo 2</span>), decode Unified Addresses (ZIP-316), estimate ZIP-317 fees, and dissect live on-chain blocks.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-zcash-gold px-4 py-2.5 text-xs font-bold text-zcash-dark shadow-lg shadow-zcash-gold/20 hover:bg-zcash-goldHover transition-all"
              >
                <Terminal className="h-4 w-4" />
                <span>Connect Custom Node</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className="flex items-center gap-2 rounded-xl border border-zcash-border bg-zcash-navy px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <Cpu className="h-4 w-4 text-zcash-gold" />
                <span>UA Tools</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <TelemetryOverview telemetry={telemetry} isLoading={isLoading} />
            <LiveTxStreamer />
            <ShieldedPoolMeter valuePools={telemetry?.valuePools} />
            <ConsensusUpgrades upgrades={telemetry?.upgrades} currentHeight={telemetry?.blockHeight || 0} />
          </div>
        )}

        {activeTab === 'streamer' && (
          <div className="space-y-8">
            <LiveTxStreamer />
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-8">
            <ZcashPowerTools />
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
        <section className="mt-12 rounded-2xl border border-zcash-border bg-zcash-card p-6 text-xs text-zinc-400 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zcash-border pb-4 mb-4">
            <div>
              <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px]">
                Zcash Mini Build Challenge &bull; Verified RPC Integration (6+ Methods)
              </h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Every metric displayed on this page is retrieved live from connected Zcash nodes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                100% Live Node Data
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 font-mono text-[11px]">
            <div className="p-2.5 rounded-xl bg-zcash-navy border border-zcash-border text-zinc-300">
              <div className="text-zcash-gold font-bold">1. getblockchaininfo</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Height, Diff, Pools</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zcash-navy border border-zcash-border text-zinc-300">
              <div className="text-zcash-gold font-bold">2. getpeerinfo</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Active P2P mesh</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zcash-navy border border-zcash-border text-zinc-300">
              <div className="text-zcash-gold font-bold">3. getmempoolinfo</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Tx count & size</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zcash-navy border border-zcash-border text-zinc-300">
              <div className="text-zcash-gold font-bold">4. getnetworksolps</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Equihash Sol/s</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zcash-navy border border-zcash-border text-zinc-300">
              <div className="text-zcash-gold font-bold">5. getblock</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Header & TXs</div>
            </div>
            <div className="p-2.5 rounded-xl bg-zcash-navy border border-zcash-border text-zinc-300">
              <div className="text-zcash-gold font-bold">6. getblockhash</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">Height lookup</div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
