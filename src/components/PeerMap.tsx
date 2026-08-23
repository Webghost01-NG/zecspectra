'use client';

import React from 'react';
import { Users, Globe, Shield, Activity, Cpu } from '@/components/Icons';
import { PeerInfo } from '@/types/zcash';

interface PeerMapProps {
  peers?: PeerInfo[];
  peerCount: number;
}

export const PeerMap: React.FC<PeerMapProps> = ({ peers = [], peerCount }) => {
  const safePeers = Array.isArray(peers) ? peers : [];

  return (
    <div className="rounded-2xl border border-zcash-border bg-zcash-card p-6 shadow-xl backdrop-blur-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zcash-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Live Zcash Peer Network Mesh
            </h3>
            <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/30 uppercase">
              RPC: getpeerinfo
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Active peer connections maintaining consensus across the global Zcash P2P network.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-zcash-border bg-zcash-navy px-4 py-2 text-xs font-mono">
          <Globe className="h-4 w-4 text-zcash-gold" />
          <span className="text-zinc-300">Active Peers:</span>
          <span className="font-bold text-zcash-gold">{peerCount}</span>
        </div>
      </div>

      {safePeers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zcash-border p-12 text-center text-zinc-500">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-40 text-zcash-gold" />
          <p className="text-xs font-semibold text-zinc-400">Discovering connected peers on Zcash P2P network...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {safePeers.map((peer, idx) => (
            <div
              key={peer.addr || idx}
              className="flex flex-col justify-between rounded-xl border border-zcash-border/80 bg-zcash-navy/80 p-4 transition-all hover:border-zcash-gold/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="truncate">
                  <span className="text-xs font-mono font-bold text-white truncate block">
                    {peer.addr}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block truncate">
                    {peer.subver || 'Zcash P2P Node'}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                    peer.inbound
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {peer.inbound ? 'Inbound' : 'Outbound'}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zcash-border/60 pt-2 text-[10px] font-mono text-zinc-400">
                <span>Peer #{idx + 1}</span>
                <span>Ping: {peer.pingtime ? `${Math.round(peer.pingtime * 1000)}ms` : 'Active'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
