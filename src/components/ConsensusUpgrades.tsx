'use client';

import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, ShieldCheck } from '@/components/Icons';
import { NetworkUpgrade } from '@/types/zcash';

interface ConsensusUpgradesProps {
  upgrades?: Record<string, NetworkUpgrade>;
  currentHeight: number;
}

const DEFAULT_UPGRADES: Record<string, NetworkUpgrade> = {
  '5ba81b19': { name: 'Overwinter', activationheight: 347500, status: 'active' },
  '76b809bb': { name: 'Sapling', activationheight: 419200, status: 'active' },
  '2bb40e60': { name: 'Blossom', activationheight: 653600, status: 'active' },
  'f5b9230b': { name: 'Heartwood', activationheight: 903000, status: 'active' },
  'e9ff75a6': { name: 'Canopy', activationheight: 1046400, status: 'active' },
  'c2d6d0b4': { name: 'NU5', activationheight: 1687104, status: 'active' },
  'c8e71055': { name: 'NU6', activationheight: 2726400, status: 'active' },
  '4e4a055d': { name: 'NU6.3', activationheight: 3428143, status: 'active' },
  'ironwood': { name: 'Ironwood', activationheight: 0, status: 'pending' },
};

export const ConsensusUpgrades: React.FC<ConsensusUpgradesProps> = ({ upgrades = {}, currentHeight }) => {
  const safeUpgrades = upgrades && typeof upgrades === 'object' ? upgrades : {};
  const sourceUpgrades = Object.keys(safeUpgrades).length > 0 ? safeUpgrades : DEFAULT_UPGRADES;

  // Ensure NU6.3 and Ironwood are included if missing from node data
  const displayUpgrades: Record<string, NetworkUpgrade> = { ...sourceUpgrades };
  if (!Object.values(displayUpgrades).some((u) => u.name?.toLowerCase().includes('nu6.3'))) {
    displayUpgrades['4e4a055d'] = { name: 'NU6.3', activationheight: 3428143, status: currentHeight >= 3428143 ? 'active' : 'pending' };
  }
  if (!Object.values(displayUpgrades).some((u) => u.name?.toLowerCase().includes('ironwood'))) {
    displayUpgrades['ironwood'] = { name: 'Ironwood', activationheight: 0, status: 'pending' };
  }

  const upgradeList = Object.entries(displayUpgrades).map(([id, info]) => {
    const isPending = info.status === 'pending' || info.activationheight === 0 || (info.activationheight > 0 && currentHeight < info.activationheight);
    const isActivated = !isPending && (info.status === 'active' || (info.activationheight > 0 && currentHeight >= info.activationheight));
    return {
      id,
      name: info.name,
      activationHeight: info.activationheight,
      status: isActivated ? 'active' : 'pending',
    };
  });

  return (
    <div className="rounded-2xl border border-zcash-border bg-zcash-card p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Zcash Network Upgrade Activation Status
            </h3>
            <span className="rounded-md bg-zcash-gold/15 px-2 py-0.5 text-[10px] font-bold text-zcash-gold border border-zcash-gold/30 uppercase">
              Consensus Rules
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Tracking activation milestones across Zcash Network Upgrades (Overwinter, Sapling, Blossom, Heartwood, Canopy, NU5, NU6, NU6.3, Ironwood).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {upgradeList.map((upgrade) => (
          <div
            key={upgrade.id}
            className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
              upgrade.status === 'active'
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-amber-500/30 bg-amber-500/5'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{upgrade.name}</span>
                {upgrade.status === 'active' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                )}
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-2">
                {upgrade.activationHeight > 0
                  ? `Block #${upgrade.activationHeight.toLocaleString()}`
                  : 'Pending (Height TBD)'}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-zcash-border/60 pt-2.5">
              <span className="text-[10px] font-mono text-zinc-500">{upgrade.id}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  upgrade.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {upgrade.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

