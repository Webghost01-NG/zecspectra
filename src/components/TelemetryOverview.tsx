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

  const cards = [
    {
      title: 'Current Block Height',
      value: telemetry.blockHeight.toLocaleString(),
      subValue: `Target Tip: ~${telemetry.estimatedHeight.toLocaleString()}`,
      icon: Layers,
      color: 'text-amber-400',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Network Sol/s (Hashrate)',
      value: formattedSolps,
      subValue: 'Equihash 200,9 Algorithm',
      icon: Zap,
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-500/10 via-yellow-500/5 to-transparent',
      borderColor: 'border-yellow-500/20',
    },
    {
      title: 'Chain Difficulty',
      value: Number(telemetry.difficulty).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      subValue: 'PoW Difficulty Target',
      icon: Hash,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Mempool Status',
      value: `${telemetry.mempool.size} TXs`,
      subValue: `${(telemetry.mempool.bytes / 1024).toFixed(2)} KB in queue`,
      icon: Database,
      color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Connected Peers',
      value: `${telemetry.peerCount} Active`,
      subValue: 'Zcash P2P Mesh',
      icon: Users,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Verification Progress',
      value: `${syncPercent}%`,
      subValue: `${telemetry.subversion}`,
      icon: ShieldCheck,
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      borderColor: 'border-cyan-500/20',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Sync Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Live Node Telemetry Feed</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live RPC
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Latest Block Hash: <span className="font-mono text-zinc-300 break-all">{telemetry.bestBlockHash || 'Fetching...'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Clock className="h-3.5 w-3.5" />
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
              className={`relative overflow-hidden rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.bgGradient} bg-zinc-950/70 p-5 shadow-lg backdrop-blur-md transition-all hover:border-zinc-700 hover:shadow-xl`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-400">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-white">{card.value}</p>
                </div>
                <div className={`rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
                <span>{card.subValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
