'use client';

import React from 'react';
import { Users, Globe, Radio, Shield, Clock } from '@/components/Icons';
import { PeerInfo } from '@/types/zcash';

interface PeerMapProps {
  peers?: PeerInfo[];
  peerCount: number;
}

export const PeerMap: React.FC<PeerMapProps> = ({ peers = [], peerCount }) => {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Globe className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Active Peer Network Mesh</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Live Zcash nodes connected to your node via RPC method <code className="text-amber-400 font-mono">getpeerinfo</code>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">
              {peerCount} Connected Peers
            </span>
          </div>
        </div>
      </div>

      {/* Peer Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 overflow-hidden shadow-xl">
        <div className="border-b border-zinc-800/80 bg-zinc-900/60 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            P2P Connection Topology
          </h3>
          <span className="text-[11px] text-zinc-500">Auto-polled via Zebra RPC</span>
        </div>

        {peers.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No peer details reported yet or node is discovering peers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-zinc-800/60 bg-zinc-900/40 text-[11px] text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Peer Address</th>
                  <th className="px-6 py-3">Client Subversion</th>
                  <th className="px-6 py-3">Direction</th>
                  <th className="px-6 py-3">Protocol Version</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {peers.map((peer, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-amber-400/90">{peer.addr}</td>
                    <td className="px-6 py-3.5 text-zinc-200">{peer.subver || '/Zebra/'}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                          peer.inbound
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}
                      >
                        {peer.inbound ? 'INBOUND' : 'OUTBOUND'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-zinc-400">{peer.version}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-sans text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Connected
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
