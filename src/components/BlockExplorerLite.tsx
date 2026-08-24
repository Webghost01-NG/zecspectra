'use client';

import React, { useState } from 'react';
import { Layers, Search, Hash, Clock, FileText, ArrowRight, Shield, Database, Sparkles, CheckCircle2 } from '@/components/Icons';
import { BlockHeader } from '@/types/zcash';

interface BlockExplorerLiteProps {
  currentHeight: number;
  network?: 'mainnet' | 'testnet';
}

export const BlockExplorerLite: React.FC<BlockExplorerLiteProps> = ({ currentHeight, network = 'mainnet' }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [blockData, setBlockData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlock = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/block?query=${encodeURIComponent(query.trim())}&network=${network}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to fetch block');
        setBlockData(null);
      } else {
        setBlockData(data.block);
      }
    } catch (err: any) {
      setError(err.message || 'Block query failed');
      setBlockData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLookup = (height: number) => {
    setSearchQuery(height.toString());
    fetchBlock(height.toString());
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Layers className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Block & Transaction Dissector</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Search any block by height or hash using direct Zcash node RPC (<code className="text-amber-400 font-mono">getblock</code> & <code className="text-amber-400 font-mono">getblockhash</code>).
            </p>
          </div>

          {/* Quick shortcuts */}
          {currentHeight > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Quick view:</span>
              <button
                onClick={() => handleQuickLookup(currentHeight)}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-mono text-amber-400 hover:bg-amber-500/20 transition-all"
              >
                Tip #{currentHeight}
              </button>
              {currentHeight > 10 && (
                <button
                  onClick={() => handleQuickLookup(currentHeight - 10)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:bg-zinc-800 transition-all"
                >
                  #{currentHeight - 10}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchBlock(searchQuery);
          }}
          className="mt-6 flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Block Height (e.g. 400) or 64-char Block Hash..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Fetching...' : 'Inspect Block'}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Block Details Display */}
      {blockData && (
        <div className="space-y-6">
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <span className="text-xs text-zinc-400 font-medium">Height</span>
              <p className="text-xl font-bold font-mono text-white mt-1">#{blockData.height}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <span className="text-xs text-zinc-400 font-medium">Transactions</span>
              <p className="text-xl font-bold font-mono text-amber-400 mt-1">{blockData.tx ? blockData.tx.length : 0} TXs</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <span className="text-xs text-zinc-400 font-medium">Difficulty</span>
              <p className="text-xl font-bold font-mono text-blue-400 mt-1">
                {Number(blockData.difficulty || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <span className="text-xs text-zinc-400 font-medium">Timestamp</span>
              <p className="text-sm font-bold font-mono text-zinc-200 mt-1">
                {blockData.time ? new Date(blockData.time * 1000).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Detailed Fields Table */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 overflow-hidden shadow-xl">
            <div className="border-b border-zinc-800/80 bg-zinc-900/60 px-5 py-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Block Header & Merkle Commitments
              </h3>
            </div>

            <div className="divide-y divide-zinc-800/60 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center px-5 py-3 gap-2">
                <span className="w-44 text-zinc-400 shrink-0">Block Hash:</span>
                <span className="text-amber-300 break-all">{blockData.hash}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center px-5 py-3 gap-2">
                <span className="w-44 text-zinc-400 shrink-0">Merkle Root:</span>
                <span className="text-zinc-300 break-all">{blockData.merkleroot}</span>
              </div>
              {blockData.previousblockhash && (
                <div className="flex flex-col sm:flex-row sm:items-center px-5 py-3 gap-2">
                  <span className="w-44 text-zinc-400 shrink-0">Previous Block:</span>
                  <span
                    onClick={() => fetchBlock(blockData.previousblockhash)}
                    className="text-amber-400/90 hover:underline cursor-pointer break-all"
                  >
                    {blockData.previousblockhash}
                  </span>
                </div>
              )}
              {blockData.nextblockhash && (
                <div className="flex flex-col sm:flex-row sm:items-center px-5 py-3 gap-2">
                  <span className="w-44 text-zinc-400 shrink-0">Next Block:</span>
                  <span
                    onClick={() => fetchBlock(blockData.nextblockhash)}
                    className="text-amber-400/90 hover:underline cursor-pointer break-all"
                  >
                    {blockData.nextblockhash}
                  </span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center px-5 py-3 gap-2">
                <span className="w-44 text-zinc-400 shrink-0">Difficulty Bits / Nonce:</span>
                <span className="text-zinc-300">
                  Bits: {blockData.bits} | Nonce: {blockData.nonce}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center px-5 py-3 gap-2">
                <span className="w-44 text-zinc-400 shrink-0">Chainwork:</span>
                <span className="text-zinc-300 break-all">{blockData.chainwork}</span>
              </div>
            </div>
          </div>

          {/* Raw Transactions in Block */}
          {blockData.tx && blockData.tx.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                Transactions ({blockData.tx.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
                {blockData.tx.map((txid: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 text-zinc-300"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-zinc-500 font-semibold">#{idx}</span>
                      <span className="truncate text-amber-300/80">{txid}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                      {idx === 0 ? 'Coinbase' : 'Transfer'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
