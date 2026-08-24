'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Zap, Copy, Check, Shield, Activity, EyeOff, Layers, AlertCircle } from '@/components/Icons';

interface ConfirmedTxItem {
  txid: string;
  height: number;
  blockHash: string;
  time: string;
  isCoinbase: boolean;
}

interface LiveTxStreamerProps {
  network?: 'mainnet' | 'testnet';
}

export const LiveTxStreamer: React.FC<LiveTxStreamerProps> = ({ network = 'mainnet' }) => {
  const [isListening, setIsListening] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<ConfirmedTxItem[]>([]);
  const [blockHeight, setBlockHeight] = useState<number>(0);
  const [bestHash, setBestHash] = useState<string>('');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);
  const [txCount, setTxCount] = useState<number>(0);
  const [dataSource, setDataSource] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchConfirmedStream = async () => {
    try {
      const res = await fetch(`/api/tx-stream?network=${network}`);
      if (res.ok) {
        const data = await res.json();
        setDataSource(data.source || 'unknown');
        if (data.error) {
          setError(data.error);
          setTransactions([]);
        } else if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
          setBlockHeight(data.blockHeight || 0);
          setBestHash(data.bestHash || '');
          setTxCount(data.txCount || data.transactions.length);
          setError('');
        }
      }
    } catch (e) {
      setError('Failed to reach transaction stream endpoint.');
    }
  };

  useEffect(() => {
    fetchConfirmedStream();
    if (!isListening) return;
    const interval = setInterval(fetchConfirmedStream, 4000);
    return () => clearInterval(interval);
  }, [isListening, network]);

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
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zcash-gold/15 text-zcash-gold border border-zcash-gold/30">
              <Activity className="h-4 w-4 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Confirmed Transaction Listener
            </h3>
            {dataSource && dataSource !== 'none' && (
              <span className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                dataSource === 'node'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {dataSource === 'node' ? 'Node RPC' : 'Blockchair Indexer'}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {blockHeight > 0
              ? <>Transactions from latest confirmed block <span className="font-mono text-zinc-200">#{blockHeight}</span>.</>
              : 'Waiting for block data...'
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          {blockHeight > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-zcash-border bg-zcash-navy px-3.5 py-1.5 text-xs font-mono text-zinc-300">
              <Layers className="h-3.5 w-3.5 text-zcash-gold" />
              <span>Block #{blockHeight}</span>
              <span className="text-zcash-gold font-bold">({txCount} TXs)</span>
            </div>
          )}
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

      {/* Content */}
      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 text-center space-y-2">
          <AlertCircle className="h-6 w-6 mx-auto text-rose-400" />
          <p className="text-xs text-zinc-400">{error}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zcash-border p-12 text-center text-zinc-500">
          <Zap className="h-8 w-8 mx-auto mb-2 opacity-40 text-zcash-gold" />
          <p className="text-xs font-semibold text-zinc-400">Waiting for confirmed block transactions...</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3">
            <span>Transaction Hash</span>
            <span>Block Height</span>
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
                    className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                    title="Copy Transaction Hash"
                  >
                    {copiedTx === tx.txid ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {tx.isCoinbase && (
                    <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      <Shield className="h-3 w-3" />
                      Coinbase
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-zinc-300">
                    #{tx.height}
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
