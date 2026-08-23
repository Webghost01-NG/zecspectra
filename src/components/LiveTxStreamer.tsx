'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Zap, Copy, Check, Shield, Database, Activity, EyeOff, Layers } from '@/components/Icons';

interface ConfirmedTxItem {
  txid: string;
  height: number;
  blockHash: string;
  time: string;
  isCoinbase: boolean;
  type: 'coinbase' | 'shielded' | 'transparent';
}

export const LiveTxStreamer: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<ConfirmedTxItem[]>([]);
  const [blockHeight, setBlockHeight] = useState<number>(0);
  const [bestHash, setBestHash] = useState<string>('');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);
  const [txCount, setTxCount] = useState<number>(0);

  const fetchConfirmedStream = async () => {
    try {
      const res = await fetch('/api/tx-stream');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
          setBlockHeight(data.blockHeight || 0);
          setBestHash(data.bestHash || '');
          setTxCount(data.txCount || data.transactions.length);
        }
      }
    } catch (e) {
      console.error('Failed to poll confirmed block transaction stream:', e);
    }
  };

  useEffect(() => {
    fetchConfirmedStream();
    if (!isListening) return;

    const interval = setInterval(() => {
      fetchConfirmedStream();
    }, 4000);

    return () => clearInterval(interval);
  }, [isListening]);

  const copyTx = (txid: string) => {
    navigator.clipboard.writeText(txid);
    setCopiedTx(txid);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-zcash-border bg-zcash-card p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zcash-border/80 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zcash-gold/15 text-zcash-gold border border-zcash-gold/30">
              <Activity className="h-4 w-4 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Zcash Mainnet Confirmed Transaction Listener
            </h3>
            <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              Confirmed Block Stream
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time listener pulling confirmed mainnet transactions directly from the latest mined block (<span className="font-mono text-zinc-200">#{blockHeight}</span>).
          </p>
        </div>

        {/* Stream Toggle & Block Height Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-zcash-border bg-zcash-navy px-3.5 py-1.5 text-xs font-mono text-zinc-300">
            <Layers className="h-3.5 w-3.5 text-zcash-gold" />
            <span>Block #{blockHeight}</span>
            <span className="text-zcash-gold font-bold">({txCount} TXs)</span>
          </div>

          <button
            onClick={() => setIsListening(!isListening)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isListening
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-zcash-border bg-zcash-navy text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Radio className={`h-3.5 w-3.5 ${isListening ? 'animate-ping text-emerald-400' : ''}`} />
            <span>{isListening ? 'Streaming (4s)' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Transaction Feed */}
      {transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zcash-border p-12 text-center text-zinc-500">
          <Zap className="h-8 w-8 mx-auto mb-2 opacity-40 text-zcash-gold" />
          <p className="text-xs font-semibold text-zinc-400">Polling confirmed block transactions...</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3">
            <span>Confirmed Transaction Hash</span>
            <div className="flex items-center gap-6">
              <span>Status / Type</span>
              <span>Block Height</span>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {transactions.map((tx, idx) => (
              <div
                key={tx.txid}
                className="flex items-center justify-between rounded-xl border border-zcash-border/80 bg-zcash-navy/80 p-3 text-xs font-mono transition-all hover:border-zcash-gold/50"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zcash-gold/10 text-zcash-gold">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-zcash-gold font-bold truncate max-w-xs md:max-w-md">
                    {tx.txid}
                  </span>
                  <button
                    onClick={() => copyTx(tx.txid)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Copy Transaction Hash"
                  >
                    {copiedTx === tx.txid ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      tx.isCoinbase
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        : tx.type === 'shielded'
                        ? 'bg-cyan-500/15 text-zcash-shield border border-cyan-500/30'
                        : 'bg-amber-500/15 text-zcash-gold border border-amber-500/30'
                    }`}
                  >
                    {tx.isCoinbase ? (
                      <>
                        <Shield className="h-3 w-3" />
                        Coinbase Reward
                      </>
                    ) : tx.type === 'shielded' ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Shielded (Orchard/Sapling)
                      </>
                    ) : (
                      <>
                        <Shield className="h-3 w-3" />
                        Transparent Transfer
                      </>
                    )}
                  </span>

                  <span className="text-[11px] font-bold text-zinc-300">
                    Block #{tx.height}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
