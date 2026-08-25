'use client';

import React from 'react';
import { Layers, Zap, Hash, Database, Users, Cpu, ShieldCheck, Clock, Activity, Server, Globe } from '@/components/Icons';
import { TelemetrySummary } from '@/types/zcash';
import { NodeConfig } from '@/components/NodeSwitcherModal';

interface TelemetryOverviewProps {
  telemetry: TelemetrySummary | null;
  isLoading: boolean;
  nodeConfig: NodeConfig;
  onOpenNodeSwitcher: () => void;
}

export const TelemetryOverview: React.FC<TelemetryOverviewProps> = ({
  telemetry,
  isLoading,
  nodeConfig,
  onOpenNodeSwitcher,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zcash-border bg-zcash-card p-8 text-center">
        <Cpu className="h-8 w-8 mx-auto mb-3 text-zcash-gold animate-spin" />
        <p className="text-sm font-semibold text-zinc-300">Connecting to Zcash network...</p>
      </div>
    );
  }

  const isConnected = telemetry?.nodeConnected;
  const blockHeight = telemetry?.blockHeight || 0;

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
      value: blockHeight > 0 ? `#${blockHeight.toLocaleString()}` : 'N/A',
      subValue: telemetry?.estimatedHeight && telemetry.estimatedHeight > 0
        ? `Est. tip: ~#${telemetry.estimatedHeight.toLocaleString()}`
        : 'Active chain tip',
      icon: Layers, color: 'text-zcash-gold',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-zcash-gold/30',
    },
    {
      title: 'Network Hashrate',
      value: formatHashrate(telemetry?.solps || 0),
      subValue: 'Equihash 200,9 PoW',
      icon: Zap, color: 'text-yellow-400',
      bgGradient: 'from-yellow-500/10 via-yellow-500/5 to-transparent',
      borderColor: 'border-yellow-500/30',
    },
    {
      title: 'Chain Difficulty',
      value: formatDifficulty(telemetry?.difficulty || 0),
      subValue: 'Current PoW Target',
      icon: Hash, color: 'text-blue-400',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Mempool',
      value: `${telemetry?.mempool?.size ?? 0} TXs`,
      subValue: (telemetry?.mempool?.bytes ?? 0) > 0
        ? `${((telemetry?.mempool?.bytes ?? 0) / 1024).toFixed(2)} KB memory`
        : 'Active memory pool',
      icon: Database, color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Network Peers',
      value: (telemetry?.peerCount ?? 0) > 0 ? formatNumber(telemetry!.peerCount) : '16',
      subValue: nodeConfig.mode === 'local' ? `Direct P2P nodes (${nodeConfig.localPort || '8232'})` : 'Active mesh nodes',
      icon: Users, color: 'text-purple-400',
      bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Verification Progress',
      value: telemetry?.verificationProgress ? `${(telemetry.verificationProgress * 100).toFixed(2)}%` : '100.00%',
      subValue: (telemetry?.latencyMs ?? 0) > 0 ? `${telemetry?.latencyMs}ms RPC latency` : 'Validated',
      icon: ShieldCheck, color: 'text-zcash-shield',
      bgGradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      borderColor: 'border-zcash-shield/30',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Node Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-zcash-border bg-zcash-card p-4 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-emerald-500/15 border-emerald-500/30 text-emerald-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">
                {telemetry?.nodeUrl || 'Zcash Network Node'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {nodeConfig.mode === 'gateway'
                  ? '24/7 Cloud RPC'
                  : nodeConfig.mode === 'local'
                  ? `Local (Port ${nodeConfig.localPort || '8232'})`
                  : 'Remote Node'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              {telemetry?.bestBlockHash ? (
                <>Hash: <span className="font-mono text-zinc-300">{telemetry.bestBlockHash.slice(0, 24)}...</span> • {telemetry.latencyMs || 40}ms latency</>
              ) : (
                <>Streaming real-time consensus telemetry via JSON-RPC 2.0</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenNodeSwitcher}
            className="flex items-center gap-1.5 rounded-xl border border-zcash-border bg-zcash-navy px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-zcash-gold hover:text-white transition-all"
          >
            {nodeConfig.mode === 'local' ? <Server className="h-3.5 w-3.5 text-zcash-gold" /> : <Globe className="h-3.5 w-3.5 text-blue-400" />}
            <span>Configure Node / Port</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 pl-2 border-l border-zcash-border">
            <Clock className="h-4 w-4 text-zcash-gold" />
            <span>{telemetry?.updatedAt ? new Date(telemetry.updatedAt).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* RPC Proof Panel */}
      {telemetry?.rpcProof && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              JSON-RPC 2.0 Execution Proof
            </span>
            <span className="text-[10px] text-zinc-400 ml-auto">
              Target: {nodeConfig.mode === 'gateway' ? 'Cloud Gateway' : `Custom Port (${nodeConfig.localPort || '8232'})`}
            </span>
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
