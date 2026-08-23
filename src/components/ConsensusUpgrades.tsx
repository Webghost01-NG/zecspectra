'use client';

import React from 'react';
import { GitBranch, CheckCircle2, Clock, ShieldAlert } from '@/components/Icons';
import { NetworkUpgrade } from '@/types/zcash';

interface ConsensusUpgradesProps {
  upgrades?: Record<string, NetworkUpgrade>;
  currentHeight: number;
}

export const ConsensusUpgrades: React.FC<ConsensusUpgradesProps> = ({ upgrades = {}, currentHeight }) => {
  const upgradeEntries = Object.entries(upgrades);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Network Consensus Upgrades</h3>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
              Protocol Activations
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Tracking activation heights for Zcash Network Upgrades (NU) and consensus rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {upgradeEntries.map(([branchId, upg]) => {
          const isActivated = currentHeight >= upg.activationheight;
          const blocksRemaining = upg.activationheight - currentHeight;

          return (
            <div
              key={branchId}
              className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                isActivated
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-zinc-800 bg-zinc-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{upg.name}</span>
                  {isActivated ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                  <GitBranch className="h-2.5 w-2.5" />
                  <span>0x{branchId}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800/60">
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="text-zinc-400">Activation:</span>
                  <span className="font-mono font-medium text-zinc-200">
                    {upg.activationheight.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                      isActivated
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {isActivated ? 'Active' : `In ${blocksRemaining.toLocaleString()} blks`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
