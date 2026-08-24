'use client';

import React from 'react';
import { Layers, Zap, Hash, Database, Users, Cpu, ShieldCheck, Clock, AlertCircle } from '@/components/Icons';
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
        <p className="text-xs text-zinc-500 mt-1">Attempting node RPC, then public indexer fallback.</p>
      </div>
    );
  }

  if (!telemetry || telemetry.dataSource === 'none') {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-8 text-center space-y-3">
        <AlertCircle className="h-8 w-8 mx-auto text-rose-400" />
        <h3 className="text-sm font-bold text-rose-300">Node Disconnected</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          No Zcash node or indexer could be reached. To display live data, configure a node endpoint 
          in your <code className="text-zinc-300 bg-zinc-800 px-1 rounded">.env</code> file or ensure your local Zebra/zcashd node is running.
        </p>
        <div className="inline-block rounded-lg border border-zcash-border bg-zcash-navy px-3 py-2 mt-2">
          <code className="text-[11px] text-zinc-300 font-mono">
            ZCASH_MAINNET_RPC=http://127.0.0.1:8232
          </code>
        </div>
      </div>
    );
  }

  const isIndexer = telemetry.dataSource === 'indexer';
  const syncPercent = (telemetry.verificationProgress * 100).toFixed(4);
  const formattedSolps = telemetry.solps > 0 ? telemetry.solps.toLocaleString() : 'N/A';

  const formatDifficulty = (diff: number) => {
    if (!diff || diff === 0) return 'N/A';
    if (diff > 1e12) {
      return `${(diff / 1e34).toFixed(2)} × 10³⁴`;
    }
    return diff.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const cards = [
    {
      title: 'Current Block Height',
      value: telemetry.blockHeight > 0 ? `#${telemetry.blockHeight.toLocaleString()}` : 'N/A',
      subValue: telemetry.estimatedHeight > 0 ? `Est. tip: ~${telemetry.estimatedHeight.toLocaleString()}` : '',
      icon: Layers,
      color: 'text-zcash-gold',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-zcash-gold/30',
    },
    {
      title: 'Network Sol/s (Hashrate)',
      value: formattedSolps,
      subValue: telemetry.solps > 0 ? 'Equihash 200,9' : 'Requires direct node connection',
      icon: Zap,
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-500/10 via-yellow-500/5 to-transparent',
      borderColor: 'border-yellow-500/30',
    },
    {
      title: 'Chain Difficulty',
      value: formatDifficulty(telemetry.difficulty),
      subValue: telemetry.difficulty > 0 ? 'Current PoW Target' : 'Requires direct node connection',
      icon: Hash,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Mempool Status',
      value: `${telemetry.mempool.size} TXs`,
      subValue: telemetry.mempool.bytes > 0 ? `${(telemetry.mempool.bytes / 1024).toFixed(2)} KB in queue` : 'Mempool data',
      icon: Database,
      color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Connected Peers',
      value: telemetry.peerCount > 0 ? `${telemetry.peerCount} Active` : isIndexer ? `${telemetry.peerCount} (network nodes)` : 'N/A',
      subValue: isIndexer ? 'Via indexer — connect node for peer details' : 'Zcash P2P Mesh',
      icon: Users,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Sync Progress',
      value: telemetry.verificationProgress > 0 ? `${syncPercent}%` : 'N/A',
      subValue: telemetry.subversion || (isIndexer ? 'Requires direct node' : ''),
      icon: ShieldCheck,
      color: 'text-zcash-shield',
      bgGradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      borderColor: 'border-zcash-shield/30',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Data Source Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-zcash-border bg-zcash-card p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            isIndexer ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-zcash-gold/15 border-zcash-gold/30 text-zcash-gold'
          }`}>
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">
                {isIndexer ? 'Indexer Data Feed' : 'Live Node Telemetry Feed'}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                isIndexer
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  isIndexer ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                }`} />
                {isIndexer ? 'Blockchair Indexer' : `${telemetry.network === 'test' ? 'Testnet' : 'Mainnet'} Node Live`}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isIndexer ? (
                <>Source: <span className="font-mono text-zinc-300">api.blockchair.com/zcash</span> — Connect a node for full RPC data</>
              ) : (
                <>Block Hash: <span className="font-mono text-zinc-300 break-all">{telemetry.bestBlockHash || 'Fetching...'}</span></>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Clock className="h-4 w-4 text-zcash-gold" />
          <span>Updated: {new Date(telemetry.updatedAt).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.bgGradient} bg-zcash-card p-5 shadow-xl backdrop-blur-md transition-all hover:border-zcash-gold/50`}
            >
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
                <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                  <span>{card.subValue}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
