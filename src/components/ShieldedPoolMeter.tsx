'use client';

import React from 'react';
import { Shield, Lock, EyeOff, Sparkles, Box } from '@/components/Icons';
import { ValuePool } from '@/types/zcash';

interface ShieldedPoolMeterProps {
  valuePools?: ValuePool[];
}

export const ShieldedPoolMeter: React.FC<ShieldedPoolMeterProps> = ({ valuePools = [] }) => {
  const getPoolMeta = (id: string) => {
    switch (id.toLowerCase()) {
      case 'transparent':
        return {
          name: 'Transparent Pool',
          desc: 't-addresses (public unshielded balances)',
          icon: Box,
          color: 'text-zcash-gold',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          barColor: 'bg-zcash-gold',
        };
      case 'sprout':
        return {
          name: 'Sprout Pool (Legacy ZK)',
          desc: 'Original 2016 zk-SNARKs (Groth16/BCTV14)',
          icon: EyeOff,
          color: 'text-zinc-400',
          bgColor: 'bg-zinc-500/10',
          borderColor: 'border-zinc-500/30',
          barColor: 'bg-zinc-400',
        };
      case 'sapling':
        return {
          name: 'Sapling Pool',
          desc: 'Fast zk-SNARKs (BLS12-381 curve, Groth16)',
          icon: Lock,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          barColor: 'bg-blue-500',
        };
      case 'orchard':
        return {
          name: 'Orchard Pool (Halo 2)',
          desc: 'Trustless recursive zero-knowledge (No trusted setup)',
          icon: Sparkles,
          color: 'text-zcash-shield',
          bgColor: 'bg-cyan-500/10',
          borderColor: 'border-cyan-500/30',
          barColor: 'bg-zcash-shield',
        };
      case 'lockbox':
        return {
          name: 'Lockbox Pool',
          desc: 'Deferred funding pool for Zcash ecosystem',
          icon: Shield,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30',
          barColor: 'bg-purple-400',
        };
      default:
        return {
          name: `${id.charAt(0).toUpperCase() + id.slice(1)} Pool`,
          desc: 'Consensus value pool',
          icon: Shield,
          color: 'text-zinc-300',
          bgColor: 'bg-zinc-800/40',
          borderColor: 'border-zinc-700',
          barColor: 'bg-zinc-500',
        };
    }
  };

  const totalValue = valuePools.reduce((acc, p) => acc + (p.chainValue || 0), 0) || 1;

  return (
    <div className="rounded-2xl border border-zcash-border bg-zcash-card p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Zcash Shielded & Transparent Pool Distribution
            </h3>
            <span className="rounded-md bg-zcash-gold/15 px-2 py-0.5 text-[10px] font-bold text-zcash-gold border border-zcash-gold/30 uppercase">
              RPC: getblockchaininfo
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time breakdown of circulating ZEC across zero-knowledge proving systems.
          </p>
        </div>
      </div>

      {/* Value Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {valuePools.map((pool) => {
          const meta = getPoolMeta(pool.id);
          const Icon = meta.icon;
          const percentage = totalValue > 0 ? ((pool.chainValue / totalValue) * 100).toFixed(2) : '0.00';

          return (
            <div
              key={pool.id}
              className={`flex flex-col justify-between rounded-xl border ${meta.borderColor} ${meta.bgColor} p-4 transition-all hover:border-zcash-gold/50`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">{meta.name}</span>
                  <div className={`p-1.5 rounded-lg border border-zcash-border bg-zcash-navy ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">{meta.desc}</p>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-extrabold text-white font-mono">
                    {pool.chainValue ? pool.chainValue.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0.00'}{' '}
                    <span className="text-xs font-normal text-zinc-400">ZEC</span>
                  </span>
                  <span className="text-xs font-bold text-zinc-300">{percentage}%</span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zcash-navy">
                  <div
                    className={`h-full rounded-full ${meta.barColor} transition-all duration-500`}
                    style={{ width: `${Math.max(parseFloat(percentage), pool.chainValue > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
