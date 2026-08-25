'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { TelemetryOverview } from '@/components/TelemetryOverview';
import { ShieldedPoolMeter } from '@/components/ShieldedPoolMeter';
import { ConsensusUpgrades } from '@/components/ConsensusUpgrades';
import { LiveTxStreamer } from '@/components/LiveTxStreamer';
import { RpcPlayground } from '@/components/RpcPlayground';
import { BlockExplorerLite } from '@/components/BlockExplorerLite';
import { ZcashPowerTools } from '@/components/ZcashPowerTools';
import { NodeSwitcherModal, NodeConfig, DEFAULT_NODE_CONFIG } from '@/components/NodeSwitcherModal';
import { TelemetrySummary } from '@/types/zcash';
import { Sparkles, Cpu, Zap, Server } from '@/components/Icons';

export default function Home() {
  const [telemetry, setTelemetry] = useState<TelemetrySummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [nodeConfig, setNodeConfig] = useState<NodeConfig>(DEFAULT_NODE_CONFIG);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'streamer' | 'rpc' | 'explorer' | 'tools'>('dashboard');

  // Load saved node config from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zecspectra_node_config');
      if (saved) {
        setNodeConfig(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleSaveConfig = (newConfig: NodeConfig) => {
    setNodeConfig(newConfig);
    try {
      localStorage.setItem('zecspectra_node_config', JSON.stringify(newConfig));
    } catch {}
  };

  const fetchTelemetry = useCallback(async () => {
    try {
      const customUrl = nodeConfig.mode === 'local'
        ? `http://${nodeConfig.localHost || '127.0.0.1'}:${nodeConfig.localPort || '8232'}`
        : nodeConfig.customUrl;

      const res = await fetch(`/api/telemetry?network=${network}&nodeMode=${nodeConfig.mode}&customUrl=${encodeURIComponent(customUrl || '')}`);
      if (res.ok) {
        const data: TelemetrySummary = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error('Telemetry fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [network, nodeConfig]);

  useEffect(() => {
    setIsLoading(true);
    fetchTelemetry();
  }, [fetchTelemetry]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTelemetry]);

  const targetEndpointLabel = nodeConfig.mode === 'gateway'
    ? '24/7 Cloud RPC Gateway'
    : nodeConfig.mode === 'local'
    ? `Local Node (Port ${nodeConfig.localPort || '8232'})`
    : 'Custom Remote RPC';

  return (
    <div className="min-h-screen bg-zcash-dark text-zinc-100 selection:bg-zcash-gold selection:text-zcash-dark">
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
        nodeConfig={nodeConfig}
        onOpenNodeSwitcher={() => setIsNodeModalOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-zcash-border bg-gradient-to-b from-zcash-card/90 via-zcash-dark/90 to-zcash-dark p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-zcash-gold/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zcash-gold/30 bg-zcash-gold/10 px-3.5 py-1 text-xs font-bold text-zcash-gold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Zcash Mini Build Challenge</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Network Telemetry <span className="bg-gradient-to-r from-zcash-gold via-yellow-300 to-amber-500 bg-clip-text text-transparent">Dashboard</span>
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Interacting directly with the Zcash network over JSON-RPC 2.0. Connected to <strong className="text-zinc-200">{targetEndpointLabel}</strong> with live block verification, value pool audits, and full RPC tooling.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsNodeModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-zcash-gold/30 bg-zcash-gold/10 px-4 py-2.5 text-xs font-bold text-zcash-gold hover:bg-zcash-gold/20 transition-all shadow-sm"
              >
                <Server className="h-4 w-4" />
                <span>Switch / Configure Node</span>
              </button>

              <button
                onClick={() => setActiveTab('rpc')}
                className="flex items-center gap-2 rounded-xl border border-zcash-border bg-zcash-navy px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <Cpu className="h-4 w-4 text-zcash-gold" />
                <span>RPC Studio</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <TelemetryOverview
              telemetry={telemetry}
              isLoading={isLoading}
              nodeConfig={nodeConfig}
              onOpenNodeSwitcher={() => setIsNodeModalOpen(true)}
            />
            <LiveTxStreamer network={network} nodeMode={nodeConfig.mode} />
            {telemetry?.valuePools && telemetry.valuePools.length > 0 && (
              <ShieldedPoolMeter valuePools={telemetry.valuePools} />
            )}
            {telemetry?.upgrades && Object.keys(telemetry.upgrades).length > 0 && (
              <ConsensusUpgrades upgrades={telemetry.upgrades} currentHeight={telemetry?.blockHeight || 0} />
            )}
          </div>
        )}

        {activeTab === 'streamer' && (
          <LiveTxStreamer network={network} nodeMode={nodeConfig.mode} />
        )}

        {activeTab === 'tools' && (
          <ZcashPowerTools />
        )}

        {activeTab === 'rpc' && (
          <RpcPlayground network={network} nodeMode={nodeConfig.mode} />
        )}

        {activeTab === 'explorer' && (
          <BlockExplorerLite
            currentHeight={telemetry?.blockHeight || 0}
            network={network}
            nodeMode={nodeConfig.mode}
          />
        )}

        {/* Footer — RPC Methods Reference */}
        <section className="mt-12 rounded-2xl border border-zcash-border bg-zcash-card p-6 text-xs text-zinc-400 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zcash-border pb-4 mb-4">
            <div>
              <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px]">
                Verified JSON-RPC 2.0 Methods
              </h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Target endpoint: <span className="text-zinc-300 font-mono">{targetEndpointLabel}</span>
              </p>
            </div>
            <span className="rounded px-2.5 py-1 text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              Active Connection
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 font-mono text-[11px]">
            {[
              { method: 'getblockchaininfo', desc: 'Height, Diff, Pools' },
              { method: 'getpeerinfo', desc: 'Active P2P mesh' },
              { method: 'getmempoolinfo', desc: 'Tx count & size' },
              { method: 'getnetworksolps', desc: 'Equihash Sol/s' },
              { method: 'getblock', desc: 'Header & TXs' },
              { method: 'getblockhash', desc: 'Height lookup' },
            ].map(({ method, desc }, idx) => (
              <div key={method} className="p-2.5 rounded-xl bg-zcash-navy border border-zcash-border text-zinc-300">
                <div className="text-zcash-gold font-bold">{idx + 1}. {method}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Node Switcher Modal */}
      <NodeSwitcherModal
        isOpen={isNodeModalOpen}
        onClose={() => setIsNodeModalOpen(false)}
        currentConfig={nodeConfig}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
