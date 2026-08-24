'use client';

import React, { useState } from 'react';
import { Terminal, Play, Copy, Check, Clock, Sparkles, RefreshCw, AlertCircle } from '@/components/Icons';
import { RpcResponse } from '@/types/zcash';

const PRESET_METHODS = [
  {
    name: 'getblockchaininfo',
    desc: 'Full state: height, difficulty, valuePools & consensus upgrades',
    params: '[]',
  },
  {
    name: 'getpeerinfo',
    desc: 'List connected P2P nodes, IPs, subversion & latency',
    params: '[]',
  },
  {
    name: 'getmempoolinfo',
    desc: 'Unconfirmed transaction pool size, memory bytes & usage',
    params: '[]',
  },
  {
    name: 'getnetworksolps',
    desc: 'Equihash Proof-of-Work solutions per second (Hashrate)',
    params: '[]',
  },
  {
    name: 'getdeprecationinfo',
    desc: 'Node software version and sunset deprecation height',
    params: '[]',
  },
  {
    name: 'getblockcount',
    desc: 'Current block count of the longest chain',
    params: '[]',
  },
  {
    name: 'getbestblockhash',
    desc: 'Hash of the best block at the top of the chain',
    params: '[]',
  },
  {
    name: 'getblock',
    desc: 'Detailed block header and transaction data',
    params: '["000393fe014f5ff5de7c9f0aa669ee074c9a7743a6bdc1d1686149b4b36090d8", 1]',
  },
];

export const RpcPlayground: React.FC<{ network?: 'mainnet' | 'testnet' }> = ({ network = 'mainnet' }) => {
  const [method, setMethod] = useState<string>('getblockchaininfo');
  const [paramsInput, setParamsInput] = useState<string>('[]');
  const [response, setResponse] = useState<RpcResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const executeRpc = async (overrideMethod?: string, overrideParams?: string) => {
    const targetMethod = overrideMethod || method;
    const targetParamsStr = overrideParams || paramsInput;

    let parsedParams: any[] = [];
    try {
      if (targetParamsStr.trim()) {
        parsedParams = JSON.parse(targetParamsStr);
        if (!Array.isArray(parsedParams)) {
          parsedParams = [parsedParams];
        }
      }
    } catch (e) {
      alert('Invalid JSON in parameters array. Must be a valid JSON array like [] or [1000].');
      return;
    }

    setIsLoading(true);
    const start = performance.now();

    try {
      const res = await fetch('/api/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: targetMethod,
          params: parsedParams,
          network,
        }),
      });

      const data = await res.json();
      setResponse(data);
      setExecutionTime(Math.round(performance.now() - start));
    } catch (err: any) {
      setResponse({
        jsonrpc: '2.0',
        id: 'error',
        error: { code: -1, message: err.message },
      });
      setExecutionTime(Math.round(performance.now() - start));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_METHODS[0]) => {
    setMethod(preset.name);
    setParamsInput(preset.params);
    executeRpc(preset.name, preset.params);
  };

  const copyToClipboard = (text: string, isCurl: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isCurl) {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const generateCurl = () => {
    const params = paramsInput.trim() || '[]';
    return `curl -X POST http://127.0.0.1:18232 \\\n  -H "Content-Type: application/json" \\\n  -d '{"jsonrpc":"2.0","id":"zecspectra","method":"${method}","params":${params}}'`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Terminal className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Interactive Zcash RPC Studio</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Directly execute raw JSON-RPC 2.0 queries against your node with live latency benchmarking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(generateCurl(), true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-850 bg-zinc-900/80 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
          >
            {copiedCurl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy cURL</span>
          </button>
        </div>
      </div>

      {/* Preset Library Buttons */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
          Pre-Configured Zcash RPC Library
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {PRESET_METHODS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleSelectPreset(preset)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                method === preset.name
                  ? 'border-amber-500/50 bg-amber-500/10 text-white shadow-sm'
                  : 'border-zinc-800/80 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-400">{preset.name}</span>
                <Sparkles className="h-3 w-3 text-zinc-500" />
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-tight">{preset.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Command Editor & Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Input Console */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white mb-4">Request Parameters</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">RPC Method</label>
                <div className="relative">
                  <input
                    type="text"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    placeholder="e.g. getblockchaininfo"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">
                  Parameters <span className="text-zinc-500 text-[11px]">(JSON Array)</span>
                </label>
                <textarea
                  rows={4}
                  value={paramsInput}
                  onChange={(e) => setParamsInput(e.target.value)}
                  placeholder="[] or [1000]"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-xs font-mono text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                onClick={() => executeRpc()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Executing RPC...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Execute JSON-RPC Call</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Console */}
        <div className="lg:col-span-7">
          <div className="flex flex-col h-full rounded-2xl border border-zinc-800 bg-zinc-950/70 overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-zinc-400 ml-2">JSON-RPC 2.0 Response</span>
              </div>

              <div className="flex items-center gap-3">
                {executionTime !== null && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                    <Clock className="h-3 w-3 text-amber-400" />
                    {executionTime}ms
                  </span>
                )}
                {response && (
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-all"
                  >
                    {copiedResponse ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 p-4 bg-zinc-950 font-mono text-xs overflow-auto max-h-[450px]">
              {response ? (
                <pre className="text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
                  <Terminal className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-xs">Select a preset or click "Execute" to run an RPC query.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
