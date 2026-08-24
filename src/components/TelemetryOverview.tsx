'use client';

import React from 'react';
import { Layers, Zap, Hash, Database, Users, Cpu, ShieldCheck, Clock, AlertCircle, Activity } from '@/components/Icons';
import { TelemetrySummary } from '@/types/zcash';

interface TelemetryOverviewProps {
  telemetry: TelemetrySummary | null;
  isLoading: boolean;
}

export const TelemetryOverview: React.FC<TelemetryOverviewProps> = ({ telemetry, isLoading }) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zcash-border bg-zcash-card p-8 text-center">
        <Cpu className="h-8 w-8 mx-auto mb-3 text-zcash-gold animate-spin" />
        <p className="text-sm font-semibold text-zinc-300">Connecting to Zcash network...</p>
      </div>
    );
  }

  if (!telemetry || telemetry.dataSource === 'none') {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-8 text-center space-y-3">
        <AlertCircle className="h-8 w-8 mx-auto text-rose-400" />
        <h3 className="text-sm font-bold text-rose-300">Node Disconnected</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          No Zcash node or indexer could be reached. Configure <code className="text-zinc-300 bg-zinc-800 px-1 rounded">ZCASH_MAINNET_RPC</code> in your environment.
        </p>
      </div>
    );
  }

  const isNode = telemetry.dataSource === 'node';
  const isIndexer = telemetry.dataSource === 'indexer';

  const formatNumber = (n: number): string => {
    if (!n || n === 0) return 'N/A';
    return n.toLocaleString();
  };

  const formatDifficulty = (diff: number) => {
    if (!diff || diff === 0) return 'N/A';
    if (diff > 1e30) return `${(diff / 1e34).toFixed(2)} × 10³⁴`;
    return diff.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const formatHashrate = (solps: number) => {
    if (!solps || solps === 0) return 'N/A';
    if (typeof solps === 'string') solps = Number(solps);
    if (solps >= 1e9) return `${(solps / 1e9).toFixed(2)} GH/s`;
    if (solps >= 1e6) return `${(solps / 1e6).toFixed(2)} MH/s`;
    if (solps >= 1e3) return `${(solps / 1e3).toFixed(2)} KH/s`;
    return `${solps.toLocaleString()} Sol/s`;
  };

  const cards = [
    {
      title: 'Block Height',
      value: telemetry.blockHeight > 0 ? `#${telemetry.blockHeight.toLocaleString()}` : 'N/A',
      subValue: isIndexer ? 'Source: Blockchair Indexer' : (telemetry.estimatedHeight > 0 ? `Est. tip: ~${telemetry.estimatedHeight.toLocaleString()}` : ''),
      icon: Layers, color: 'text-zcash-gold',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-zcash-gold/30',
    },
    {
      title: 'Network Hashrate',
      value: formatHashrate(telemetry.solps),
      subValue: telemetry.solps > 0 ? 'Equihash 200,9' : (isIndexer ? 'Source: Blockchair' : 'Requires synced node'),
      icon: Zap, color: 'text-yellow-400',
      bgGradient: 'from-yellow-500/10 via-yellow-500/5 to-transparent',
      borderColor: 'border-yellow-500/30',
    },
    {
      title: 'Chain Difficulty',
      value: formatDifficulty(telemetry.difficulty),
      subValue: telemetry.difficulty > 0 ? (isIndexer ? 'Source: Blockchair' : 'Current PoW Target') : '',
      icon: Hash, color: 'text-blue-400',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Mempool',
      value: `${telemetry.mempool.size} TXs`,
      subValue: telemetry.mempool.bytes > 0 ? `${(telemetry.mempool.bytes / 1024).toFixed(2)} KB` : (isIndexer ? 'Source: Blockchair' : ''),
      icon: Database, color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Network Peers',
      value: telemetry.peerCount > 0 ? formatNumber(telemetry.peerCount) : 'N/A',
      subValue: isNode ? 'Direct P2P connections' : (isIndexer ? 'Network nodes (Blockchair)' : ''),
      icon: Users, color: 'text-purple-400',
      bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Sync Progress',
      value: isNode ? `${(telemetry.verificationProgress * 100).toFixed(2)}%` : 'N/A',
      subValue: isNode ? (telemetry.latencyMs > 0 ? `${telemetry.latencyMs}ms latency` : '') : 'Requires direct node',
      icon: ShieldCheck, color: 'text-zcash-shield',
      bgGradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      borderColor: 'border-zcash-shield/30',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Data Source Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-zcash-border bg-zcash-card p-4 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            isNode ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
          }`}>
            <Cpu className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">
                {isNode ? 'Zcash Node Connected' : 'Indexer Data Feed'}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                isNode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isNode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isNode ? `${telemetry.network === 'test' ? 'Testnet' : 'Mainnet'} Node` : 'Blockchair API'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              {isNode
                ? <>Hash: <span className="font-mono text-zinc-300">{telemetry.bestBlockHash.slice(0, 24)}...</span> • {telemetry.latencyMs}ms</>
                : <>Source: <span className="font-mono text-zinc-300">api.blockchair.com/zcash</span></>
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 shrink-0">
          <Clock className="h-4 w-4 text-zcash-gold" />
          <span>{new Date(telemetry.updatedAt).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* RPC Proof Panel — only when node is connected */}
      {isNode && telemetry.rpcProof && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">RPC Connection Proof</span>
            <span className="text-[10px] text-zinc-400 ml-auto">Source: Zebra/zcashd JSON-RPC 2.0</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(telemetry.rpcProof).map(([method, info]) => (
              <div key={method} className="rounded-lg border border-emerald-500/15 bg-zcash-navy p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${info.success ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span className="text-[11px] font-mono font-bold text-zinc-200">{method}</span>
                </div>
                <span className="text-[10px] text-zinc-400">
                  {info.success ? `✓ ${info.latencyMs}ms` : '✗ Failed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`relative overflow-hidden rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.bgGradient} bg-zcash-card p-5 shadow-xl backdrop-blur-md transition-all hover:border-zcash-gold/50`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{card.title}</p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-white">{card.value}</p>
                </div>
                <div className={`rounded-xl border border-zcash-border bg-zcash-navy p-2.5 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              {card.subValue && (
                <div className="mt-3 text-xs text-zinc-400 font-medium">{card.subValue}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
