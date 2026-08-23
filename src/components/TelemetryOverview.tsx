'use client';

import React from 'react';
import { Layers, Zap, Hash, Database, Users, Cpu, ShieldCheck, Clock } from '@/components/Icons';
import { TelemetrySummary } from '@/types/zcash';

interface TelemetryOverviewProps {
  telemetry: TelemetrySummary | null;
  isLoading: boolean;
}

export const TelemetryOverview: React.FC<TelemetryOverviewProps> = ({ telemetry, isLoading }) => {
  if (!telemetry) return null;

  const syncPercent = (telemetry.verificationProgress * 100).toFixed(4);
  const formattedSolps = telemetry.solps > 0 ? telemetry.solps.toLocaleString() : 'Active (Equihash)';

  // Format Chain Difficulty cleanly so large scientific targets never overflow cards
  const formatDifficulty = (diff: number) => {
    if (!diff || diff === 0) return '0.00';
    if (diff > 1e12) {
      return `${(diff / 1e34).toFixed(2)} × 10³⁴`;
    }
    return diff.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const cards = [
    {
      title: 'Current Block Height',
      value: telemetry.blockHeight > 0 ? `#${telemetry.blockHeight.toLocaleString()}` : '#0 (Syncing Mesh)',
      subValue: telemetry.estimatedHeight > 0 ? `Target Tip: ~${telemetry.estimatedHeight.toLocaleString()}` : 'Connecting to Mainnet Peers...',
      icon: Layers,
      color: 'text-zcash-gold',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-zcash-gold/30',
    },
    {
      title: 'Network Sol/s (Hashrate)',
      value: formattedSolps,
      subValue: 'Equihash 200,9 Engine',
      icon: Zap,
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-500/10 via-yellow-500/5 to-transparent',
      borderColor: 'border-yellow-500/30',
    },
    {
      title: 'Chain Difficulty',
      value: formatDifficulty(telemetry.difficulty),
      subValue: telemetry.difficulty > 1e12 ? 'Mainnet Genesis PoW Target' : 'Current Mainnet PoW Target',
      icon: Hash,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Mempool Status',
      value: `${telemetry.mempool.size} TXs`,
      subValue: `${(telemetry.mempool.bytes / 1024).toFixed(2)} KB in queue`,
      icon: Database,
      color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Connected Peers',
      value: telemetry.peerCount > 0 ? `${telemetry.peerCount} Active` : 'Discovering Peers...',
      subValue: 'Zcash P2P Mesh',
      icon: Users,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Verification Progress',
      value: `${syncPercent}%`,
      subValue: `${telemetry.subversion}`,
      icon: ShieldCheck,
      color: 'text-zcash-shield',
      bgGradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      borderColor: 'border-zcash-shield/30',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Sync Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-zcash-border bg-zcash-card p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zcash-gold/15 border border-zcash-gold/30 text-zcash-gold">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Live Node Telemetry Feed</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Mainnet Node Live
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Latest Block Hash: <span className="font-mono text-zinc-300 break-all">{telemetry.bestBlockHash || 'Fetching Genesis...'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Clock className="h-4 w-4 text-zcash-gold" />
          <span>Last sync: {new Date(telemetry.updatedAt).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
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
              <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                <span>{card.subValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
